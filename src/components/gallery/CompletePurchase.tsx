import { useState, useEffect, useCallback, useRef, type ChangeEvent } from 'react';
import { createPublicClient, custom, parseAbi, type Address } from 'viem';
import { useWallet } from '../../wallet/WalletContext.tsx';
import { executeCompletePurchase, type PurchaseAuthorization } from '../../services/completePurchase.ts';
import { COMPLETE_CONTRACT } from '../../services/completePackageProtocol.ts';
import {
  fetchFromOfficialApi,
  verifyAuthorizationPipeline,
  readAuthorizationFile,
  exportAuthorizationArtifactJson,
  discoverOnChainAuthorization,
  type VerificationDetails,
  type OnChainVerificationState,
  type AuthorizationArtifact,
} from '../../services/authorization/authorizationProvider.ts';

interface CompletePurchaseProps {
  onAcquired?: (transactionHash: string) => void;
}

const packageAbi = parseAbi([
  'function completePackageTokenId() view returns(uint256)',
  'function ownerOf(uint256) view returns(address)',
  'function nonces(address) view returns(uint256)',
  'function artistSigner() view returns(address)',
]);

export function CompletePurchase({ onAcquired }: CompletePurchaseProps = {}) {
  const { address, provider } = useWallet();
  const [authStatus, setAuthStatus] = useState<
    | 'checking'
    | 'not_anchored'
    | 'pending_confirmation'
    | 'ready'
    | 'expired'
    | 'acquired_owned'
    | 'acquired_other'
    | 'error'
  >('checking');
  const [authorization, setAuthorization] = useState<PurchaseAuthorization | null>(null);
  const [activeArtifact, setActiveArtifact] = useState<AuthorizationArtifact | null>(null);
  const [actionState, setActionState] = useState<'idle' | 'sending' | 'complete' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Optional manual inspection drawer
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [verificationDetails, setVerificationDetails] = useState<VerificationDetails | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const actionStateRef = useRef(actionState);
  actionStateRef.current = actionState;
  const authStatusRef = useRef(authStatus);
  authStatusRef.current = authStatus;

  const getOnChainState = useCallback(async (): Promise<OnChainVerificationState | undefined> => {
    if (!provider || !address) return undefined;
    try {
      const client = createPublicClient({ transport: custom(provider) });
      const [contractNonce, artistSigner, block] = await Promise.all([
        client.readContract({
          address: COMPLETE_CONTRACT,
          abi: packageAbi,
          functionName: 'nonces',
          args: [address as Address],
        }),
        client.readContract({
          address: COMPLETE_CONTRACT,
          abi: packageAbi,
          functionName: 'artistSigner',
        }),
        client.getBlock(),
      ]);
      return {
        contractNonce,
        artistSigner,
        blockTimestamp: block.timestamp,
      };
    } catch {
      return undefined;
    }
  }, [provider, address]);

  const checkAuthorization = useCallback(
    async (isMounted = true) => {
      if (!address) {
        if (isMounted) {
          setAuthStatus('not_anchored');
          setAuthorization(null);
          setActiveArtifact(null);
          setVerificationDetails(null);
        }
        return;
      }

      // 1. Check canonical on-chain contract state first
      if (provider) {
        try {
          const client = createPublicClient({ transport: custom(provider) });
          const packageId = await client.readContract({
            address: COMPLETE_CONTRACT,
            abi: packageAbi,
            functionName: 'completePackageTokenId',
          });
          if (packageId === 5n) {
            try {
              const owner5 = await client.readContract({
                address: COMPLETE_CONTRACT,
                abi: packageAbi,
                functionName: 'ownerOf',
                args: [5n],
              });
              if (!isMounted) return;
              if (typeof owner5 === 'string' && owner5.toLowerCase() === address.toLowerCase()) {
                setAuthStatus('acquired_owned');
                setAuthorization(null);
                setActiveArtifact(null);
                return;
              } else {
                setAuthStatus('acquired_other');
                setAuthorization(null);
                setActiveArtifact(null);
                return;
              }
            } catch {
              // ownerOf query failed
            }
          }
        } catch {
          // RPC check failed, continue to authorization query
        }
      }

      // 2. Autonomous On-Chain Discovery via Base JSON-RPC (eth_getLogs topic filter)
      if (provider) {
        try {
          const onChainState = await getOnChainState();
          const discovery = await discoverOnChainAuthorization(provider, address as Address, {
            onChainState,
          });

          if (!isMounted) return;

          if (discovery.state === 'ON_CHAIN_CONFIRMED' && discovery.artifact) {
            setAuthorization({
              message: discovery.artifact.message,
              signature: discovery.artifact.signature,
            });
            setActiveArtifact(discovery.artifact);
            setVerificationDetails(discovery.verification?.details ?? null);
            setVerificationError(null);
            setAuthStatus('ready');
            setMessage('Authorization confirmed on Base. Ready for acquisition.');
            return;
          }

          if (discovery.state === 'PENDING_CONFIRMATION') {
            setAuthStatus('pending_confirmation');
            setAuthorization(null);
            setActiveArtifact(discovery.artifact ?? null);
            setMessage(discovery.message);
            return;
          }
        } catch {
          // On-chain discovery RPC error, fallback to advisory API query
        }
      }

      // 3. Optional Advisory Query (Non-trusted Web2 convenience only)
      try {
        const apiResult = await fetchFromOfficialApi(address as Address);
        if (!isMounted) return;

        if (apiResult.status === 'ISSUED' && apiResult.artifact) {
          const onChainState = await getOnChainState();
          const verified = await verifyAuthorizationPipeline(apiResult.artifact, {
            connectedWallet: address as Address,
            onChainState,
            source: 'official_api',
          });

          if (verified.success && verified.artifact) {
            // Artifact signed by artist but not yet anchored on-chain with sufficient confirmation
            setAuthStatus('pending_confirmation');
            setAuthorization(null);
            setActiveArtifact(verified.artifact);
            setMessage('Authorization signed — waiting for on-chain confirmation.');
            return;
          }
        }
      } catch {
        // Advisory API unreachable
      }

      if (isMounted) {
        setAuthStatus('not_anchored');
        setAuthorization(null);
        setActiveArtifact(null);
        setMessage('No on-chain authorization found for this wallet.');
      }
    },
    [address, provider, getOnChainState]
  );

  useEffect(() => {
    let mounted = true;
    setAuthStatus('checking');
    setMessage('');
    setActionState('idle');
    void checkAuthorization(true);
    const interval = window.setInterval(() => {
      if (
        mounted &&
        actionStateRef.current === 'idle' &&
        authStatusRef.current !== 'ready' &&
        authStatusRef.current !== 'expired' &&
        authStatusRef.current !== 'acquired_owned' &&
        authStatusRef.current !== 'acquired_other'
      ) {
        void checkAuthorization(true);
      }
    }, 6000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [address, provider, checkAuthorization]);

  // Handle local file loading (never transmits to server)
  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setMessage('Reading local authorization file…');
      const text = await readAuthorizationFile(file);
      await processRawAuthorization(text, 'local_file');
    } catch (err) {
      setVerificationError(err instanceof Error ? err.message : 'Failed to read file');
      setMessage('Error reading authorization file.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle manual JSON paste (never transmits to server)
  const handlePasteVerify = async () => {
    if (!manualInput.trim()) {
      setVerificationError('Please enter or paste authorization JSON.');
      return;
    }
    await processRawAuthorization(manualInput.trim(), 'manual_json');
  };

  const processRawAuthorization = async (
    rawText: string,
    source: 'local_file' | 'manual_json'
  ) => {
    if (!address) {
      setVerificationError('Connect your wallet first to verify this authorization.');
      setMessage('Wallet not connected.');
      return;
    }

    setMessage('Verifying cryptographic signature and contract state locally…');
    const onChainState = await getOnChainState();
    const result = await verifyAuthorizationPipeline(rawText, {
      connectedWallet: address as Address,
      onChainState,
      source,
    });

    setVerificationDetails(result.details);

    if (result.success && result.artifact) {
      setAuthorization({
        message: result.artifact.message,
        signature: result.artifact.signature,
      });
      setActiveArtifact(result.artifact);
      setAuthStatus('ready');
      setVerificationError(null);
      setMessage('Offline authorization verified successfully against Base state and Artist signature.');
    } else {
      setAuthorization(null);
      setActiveArtifact(null);
      setVerificationError(`[Step: ${result.step}] ${result.error}`);
      setAuthStatus(result.step === 'deadline' ? 'expired' : 'error');
      setMessage(`Authorization rejected at step "${result.step}": ${result.error}`);
    }
  };

  const handleExportArtifact = () => {
    if (!activeArtifact) return;
    try {
      const json = exportAuthorizationArtifactJson(activeArtifact);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hien-sinh-authorization-${address?.slice(0, 8)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setMessage(`Failed to export artifact: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const acquire = async () => {
    if (!address || !provider) {
      setActionState('error');
      setMessage('Connect the confirmed wallet to continue.');
      return;
    }
    if (!authorization || authStatus !== 'ready') {
      setActionState('error');
      setMessage(
        authStatus === 'expired'
          ? 'This acquisition authorization has expired.'
          : 'The acquisition authorization is not ready for this wallet.'
      );
      return;
    }
    setActionState('sending');
    setMessage('Review the transaction in your wallet.');
    try {
      const receipt = await executeCompletePurchase(
        provider,
        authorization,
        () => setMessage('Transaction submitted. Waiting for Base confirmation…')
      );
      setActionState('complete');
      setAuthStatus('acquired_owned');
      setMessage(`Package 05 was acquired in transaction ${receipt.transactionHash}.`);
      onAcquired?.(receipt.transactionHash);
    } catch (error) {
      setActionState('error');
      setMessage(error instanceof Error ? error.message : 'The acquisition could not be completed.');
    }
  };

  const busy = authStatus === 'checking' || actionState === 'sending';
  const readyToAcquire = authStatus === 'ready' && actionState !== 'sending' && actionState !== 'complete';

  return (
    <section aria-label="Purchase Package 05" style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <span className="t-mono-tag" style={{ color: 'var(--g-text-accent)', letterSpacing: '0.18em', fontSize: '0.62rem', display: 'block' }}>
            PACKAGE 05
          </span>
          <span className="t-mono-tag frame-readable-copy" style={{ fontSize: '0.55rem', opacity: 0.65, marginTop: 4, display: 'block' }}>
            Frame 05 + The Painting (Token 0)
          </span>
        </div>
        <span className="t-mono-label" style={{ color: 'var(--g-text-accent)', fontSize: '0.85rem', letterSpacing: '0.1em' }}>
          4.29 ETH
        </span>
      </div>

      {authStatus === 'not_anchored' && actionState === 'idle' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '16px 20px',
          background: 'rgba(218,172,98,0.04)',
          border: '1px dashed rgba(218,172,98,0.20)',
          marginBottom: 14,
        }}>
          <span
            className="t-mono-tag"
            style={{ color: 'var(--g-text-accent)', fontSize: '0.58rem', letterSpacing: '0.18em' }}
          >
            NO ON-CHAIN AUTHORIZATION FOUND
          </span>
          <span
            className="t-mono-tag frame-readable-copy"
            style={{ fontSize: '0.52rem', opacity: 0.7, textAlign: 'center' }}
          >
            No on-chain authorization was discovered on Base for this wallet. The blockchain is the autonomous rendezvous layer.
          </span>
        </div>
      )}

      {authStatus === 'pending_confirmation' && actionState === 'idle' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '16px 20px',
          background: 'rgba(218,172,98,0.08)',
          border: '1px solid rgba(218,172,98,0.35)',
          marginBottom: 14,
        }}>
          <span
            className="t-mono-tag"
            style={{ color: 'var(--g-text-accent)', fontSize: '0.58rem', letterSpacing: '0.18em' }}
          >
            AUTHORIZATION SIGNED — WAITING FOR ON-CHAIN CONFIRMATION
          </span>
          <span
            className="t-mono-tag frame-readable-copy"
            style={{ fontSize: '0.52rem', opacity: 0.8, textAlign: 'center' }}
          >
            {message || 'Artist signature verified. Waiting for operational block confirmation depth on Base.'}
          </span>
        </div>
      )}

      {authStatus === 'expired' && actionState === 'idle' && (
        <div style={{ marginBottom: 14 }}>
          <p className="t-mono-tag frame-readable-copy" style={{ fontSize: '.58rem', lineHeight: 1.6, color: 'rgba(225,160,142,.90)' }}>
            The 7-day acquisition window for this encounter has expired. Acquisition is closed.
          </p>
        </div>
      )}

      {authStatus === 'acquired_owned' && actionState === 'idle' && (
        <div style={{ marginBottom: 14 }}>
          <p className="t-mono-tag frame-readable-copy" style={{ fontSize: '.58rem', lineHeight: 1.6, color: 'var(--g-text-accent)' }}>
            You hold Package 05 (Painting and Frame 05). Retrieve your materials in the Dossier.
          </p>
        </div>
      )}

      {authStatus === 'acquired_other' && actionState === 'idle' && (
        <div style={{ marginBottom: 14 }}>
          <p className="t-mono-tag frame-readable-copy" style={{ fontSize: '.58rem', lineHeight: 1.6, color: 'rgba(237,236,234,.60)' }}>
            Package 05 has already been acquired by another bearer.
          </p>
        </div>
      )}

      {/* Primary Acquisition Action Button */}
      <button
        type="button"
        disabled={!readyToAcquire}
        className="t-mono-label"
        style={{
          width: '100%',
          padding: '15px 16px',
          border: readyToAcquire
            ? '1px solid rgba(218,172,98,.52)'
            : '1px solid rgba(232,235,238,.08)',
          background: readyToAcquire
            ? 'linear-gradient(135deg, rgba(218,172,98,.27), rgba(218,172,98,.10))'
            : 'rgba(232,235,238,.03)',
          color: readyToAcquire ? 'var(--g-text-primary)' : 'rgba(237,236,234,.30)',
          cursor: readyToAcquire ? 'pointer' : busy ? 'wait' : 'not-allowed',
          opacity: readyToAcquire ? 1 : 0.65,
          letterSpacing: '.16em',
          fontSize: '.59rem',
        }}
        onClick={() => void acquire()}
      >
        {actionState === 'sending'
          ? 'PROCESSING ACQUISITION…'
          : authStatus === 'checking'
          ? 'CHECKING ON-CHAIN STATE…'
          : authStatus === 'pending_confirmation'
          ? 'CONFIRMING ON-CHAIN…'
          : authStatus === 'acquired_owned'
          ? 'PACKAGE 05 ACQUIRED'
          : authStatus === 'acquired_other'
          ? 'PACKAGE 05 ALREADY ACQUIRED'
          : authStatus === 'expired'
          ? 'ACQUISITION WINDOW EXPIRED'
          : authStatus === 'not_anchored'
          ? 'AWAITING ON-CHAIN AUTHORIZATION'
          : actionState === 'complete'
          ? 'PACKAGE 05 ACQUIRED'
          : 'ACQUIRE COMPLETE PACKAGE (4.29 ETH)'}
      </button>

      {/* Verified Artifact Actions & Forensics */}
      {activeArtifact && authStatus === 'ready' && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
          <button
            type="button"
            onClick={handleExportArtifact}
            className="t-mono-tag"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--g-text-accent)',
              fontSize: '0.52rem',
              letterSpacing: '0.12em',
              opacity: 0.8,
              padding: 0,
            }}
          >
            [ EXPORT SIGNED ARTIFACT (.JSON) ]
          </button>
        </div>
      )}

      {/* Advanced Inspection & Manual Verification Drawer */}
      <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(232,235,238,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span className="t-mono-tag" style={{ fontSize: '0.55rem', letterSpacing: '0.14em', opacity: 0.6 }}>
            CRYPTOGRAPHIC & PROVENANCE INSPECTOR
          </span>
          <button
            type="button"
            onClick={() => setShowAdvanced(prev => !prev)}
            className="t-mono-tag"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--g-text-accent)',
              fontSize: '0.55rem',
              letterSpacing: '0.1em',
              padding: 0,
            }}
          >
            {showAdvanced ? '[ HIDE INSPECTOR ]' : '[ INSPECT EVIDENCE ]'}
          </button>
        </div>

        {showAdvanced && (
          <div style={{
            background: 'rgba(232,235,238,0.02)',
            border: '1px solid rgba(232,235,238,0.08)',
            padding: '14px',
            marginBottom: 12,
          }}>
            <p className="t-mono-tag frame-readable-copy" style={{ fontSize: '0.53rem', lineHeight: 1.5, opacity: 0.65, marginBottom: 12 }}>
              Cryptographic verification executes 100% locally in browser RAM. Standard JSON-RPC topic queries fetch the anchor directly from Base without any Web2 server dependency.
            </p>

            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json,application/json"
                style={{ display: 'none' }}
                onChange={e => void handleFileUpload(e)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="t-mono-label"
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  background: 'rgba(218,172,98,0.08)',
                  border: '1px solid rgba(218,172,98,0.3)',
                  color: 'var(--g-text-accent)',
                  fontSize: '0.54rem',
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                }}
              >
                LOAD LOCAL FILE (.JSON)
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <textarea
                value={manualInput}
                onChange={e => setManualInput(e.target.value)}
                placeholder="Or paste authorization JSON payload for local inspection…"
                rows={3}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(232,235,238,0.12)',
                  color: 'var(--g-text-primary)',
                  fontFamily: 'monospace',
                  fontSize: '0.54rem',
                  padding: '8px',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => void handlePasteVerify()}
                className="t-mono-label"
                style={{
                  padding: '7px 12px',
                  background: 'rgba(232,235,238,0.06)',
                  border: '1px solid rgba(232,235,238,0.18)',
                  color: 'rgba(237,236,234,0.85)',
                  fontSize: '0.52rem',
                  letterSpacing: '0.12em',
                  cursor: 'pointer',
                  alignSelf: 'flex-end',
                }}
              >
                VERIFY LOCALLY IN RAM
              </button>
            </div>

            {/* Cryptographic Verification Details Panel */}
            {verificationDetails && (
              <div style={{
                marginTop: 12,
                padding: '10px 12px',
                background: 'rgba(0,0,0,0.4)',
                border: authStatus === 'ready'
                  ? '1px solid rgba(218,172,98,0.35)'
                  : '1px solid rgba(225,160,142,0.35)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span className="t-mono-tag" style={{ fontSize: '0.52rem', color: authStatus === 'ready' ? 'var(--g-text-accent)' : 'rgba(225,160,142,0.9)' }}>
                    {authStatus === 'ready' ? 'RAM VALIDATION: ELIGIBLE' : 'VALIDATION REJECTED'}
                  </span>
                  <span className="t-mono-tag" style={{ fontSize: '0.50rem', opacity: 0.5 }}>
                    SOURCE: {verificationDetails.source?.toUpperCase()}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 10px', fontSize: '0.51rem', fontFamily: 'monospace' }}>
                  <span style={{ opacity: 0.5 }}>Bearer:</span>
                  <span style={{ color: verificationDetails.designatedBearer?.toLowerCase() === address?.toLowerCase() ? 'var(--g-text-accent)' : 'rgba(225,160,142,0.9)' }}>
                    {verificationDetails.designatedBearer ? `${verificationDetails.designatedBearer.slice(0, 8)}…${verificationDetails.designatedBearer.slice(-6)}` : 'N/A'}
                    {verificationDetails.designatedBearer?.toLowerCase() === address?.toLowerCase() ? ' (MATCH)' : ' (MISMATCH)'}
                  </span>
                  <span style={{ opacity: 0.5 }}>Nonce:</span>
                  <span>
                    {verificationDetails.nonce?.toString()}
                    {verificationDetails.contractNonce !== undefined && ` (on-chain: ${verificationDetails.contractNonce.toString()})`}
                  </span>
                  <span style={{ opacity: 0.5 }}>Deadline:</span>
                  <span style={{ color: verificationDetails.isExpired ? 'rgba(225,160,142,0.9)' : 'inherit' }}>
                    {verificationDetails.deadline ? new Date(Number(verificationDetails.deadline) * 1000).toLocaleString() : 'N/A'}
                    {verificationDetails.isExpired ? ' [EXPIRED]' : ' [ACTIVE]'}
                  </span>
                </div>
              </div>
            )}

            {verificationError && (
              <p
                role="alert"
                className="t-mono-tag frame-readable-copy"
                style={{
                  marginTop: 8,
                  fontSize: '0.52rem',
                  lineHeight: 1.4,
                  color: 'rgba(225,160,142,0.95)',
                }}
              >
                {verificationError}
              </p>
            )}
          </div>
        )}
      </div>

      {message && (
        <p
          role="status"
          className="t-mono-tag frame-readable-copy"
          style={{
            margin: '12px 0 0',
            fontSize: '.59rem',
            color: actionState === 'error' ? 'rgba(225,160,142,.9)' : 'rgba(237,236,234,.70)',
          }}
        >
          {message}
        </p>
      )}
    </section>
  );
}

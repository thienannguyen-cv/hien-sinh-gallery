import { useState, useEffect, useCallback, useRef } from 'react';
import { createPublicClient, custom, parseAbi } from 'viem';
import { useWallet } from '../../wallet/WalletContext.tsx';
import { executeCompletePurchase, parsePurchaseAuthorization, type PurchaseAuthorization } from '../../services/completePurchase.ts';
import { COMPLETE_CONTRACT } from '../../services/completePackageProtocol.ts';

interface CompletePurchaseProps {
  onAcquired?: (transactionHash: string) => void;
}

const packageAbi = parseAbi([
  'function completePackageTokenId() view returns(uint256)',
  'function ownerOf(uint256) view returns(address)',
]);

/** The buyer never imports raw JSON. A matching authorization is fetched only
 * when acquisition is requested, then verified again against Base. */
export function CompletePurchase({ onAcquired }: CompletePurchaseProps = {}) {
  const { address, provider } = useWallet();
  const [authStatus, setAuthStatus] = useState<'checking'|'not_issued'|'ready'|'expired'|'acquired_owned'|'acquired_other'|'error'>('checking');
  const [authorization, setAuthorization] = useState<PurchaseAuthorization | null>(null);
  const [actionState, setActionState] = useState<'idle'|'sending'|'complete'|'error'>('idle');
  const [message, setMessage] = useState('');

  const actionStateRef = useRef(actionState);
  actionStateRef.current = actionState;
  const authStatusRef = useRef(authStatus);
  authStatusRef.current = authStatus;

  const checkAuthorization = useCallback(async (isMounted = true) => {
    if (!address) {
      if (isMounted) {
        setAuthStatus('not_issued');
        setAuthorization(null);
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
              return;
            } else {
              setAuthStatus('acquired_other');
              setAuthorization(null);
              return;
            }
          } catch {
            // ownerOf query failed
          }
        }
      } catch {
        // RPC check failed, continue to backend authorization query
      }
    }

    // 2. Query verified acquisition authorization
    try {
      const response = await fetch('/api/acquisition-authorization', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'get', walletAddress: address }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error('The authorization service is unavailable.');
      if (!isMounted) return;
      if (result.status === 'ISSUED') {
        const parsed = parsePurchaseAuthorization(JSON.stringify(result.authorization));
        const nowSec = BigInt(Math.floor(Date.now() / 1000));
        if (parsed.message.deadline < nowSec) {
          setAuthorization(parsed);
          setAuthStatus('expired');
        } else {
          setAuthorization(parsed);
          setAuthStatus('ready');
        }
      } else {
        setAuthorization(null);
        setAuthStatus('not_issued');
      }
    } catch {
      if (isMounted) {
        setAuthStatus('not_issued');
        setAuthorization(null);
      }
    }
  }, [address, provider]);

  useEffect(() => {
    let mounted = true;
    setAuthStatus('checking');
    setMessage('');
    setActionState('idle');
    void checkAuthorization(true);
    const interval = window.setInterval(() => {
      if (mounted && actionStateRef.current === 'idle' && authStatusRef.current !== 'ready' && authStatusRef.current !== 'expired' && authStatusRef.current !== 'acquired_owned' && authStatusRef.current !== 'acquired_other') {
        void checkAuthorization(true);
      }
    }, 8000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [address, provider, checkAuthorization]);

  const acquire = async () => {
    if (!address || !provider) {
      setActionState('error');
      setMessage('Connect the confirmed wallet to continue.');
      return;
    }
    if (!authorization || authStatus !== 'ready') {
      setActionState('error');
      setMessage(authStatus === 'expired' ? 'This acquisition authorization has expired.' : 'The acquisition authorization is not ready for this wallet.');
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
      {authStatus === 'not_issued' && actionState === 'idle' && (
        <div style={{ marginBottom: 14 }}>
          <p className="t-mono-tag frame-readable-copy" style={{ fontSize: '.58rem', lineHeight: 1.6, color: 'rgba(237,236,234,.70)' }}>
            The Artist has confirmed this encounter. Acquisition authorization is being prepared for this wallet.
          </p>
        </div>
      )}
      {authStatus === 'expired' && actionState === 'idle' && (
        <div style={{ marginBottom: 14 }}>
          <p className="t-mono-tag frame-readable-copy" style={{ fontSize: '.58rem', lineHeight: 1.6, color: 'rgba(225,160,142,.90)' }}>
            The 7-day acquisition window for this confirmed encounter has expired. Acquisition is closed.
          </p>
        </div>
      )}
      {authStatus === 'acquired_owned' && actionState === 'idle' && (
        <div style={{ marginBottom: 14 }}>
          <p className="t-mono-tag frame-readable-copy" style={{ fontSize: '.58rem', lineHeight: 1.6, color: 'var(--g-text-accent)' }}>
            You currently hold Package 05 (Painting and Frame 05). Retrieve your materials in the Dossier.
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
          ? 'CHECKING AUTHORIZATION…'
          : authStatus === 'acquired_owned'
          ? 'PACKAGE 05 OWNED'
          : authStatus === 'acquired_other'
          ? 'PACKAGE 05 ALREADY ACQUIRED'
          : authStatus === 'expired'
          ? 'AUTHORIZATION EXPIRED · CLOSED'
          : authStatus === 'not_issued'
          ? 'AUTHORIZATION PENDING'
          : actionState === 'complete'
          ? 'PACKAGE 05 ACQUIRED'
          : 'ACQUIRE PACKAGE 05 · 4.29 ETH'}
      </button>

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


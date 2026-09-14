import { useEffect, useState } from 'react';
import { useWallet } from '../../wallet/WalletContext';
import { PackageDownloads } from './PackageDownloads';
import { resolveOwnedTokens, ARCHIVE_CHAIN_ID, type OwnedToken } from '../../services/archiveRetrieval';
import { ArrowLeft } from '@phosphor-icons/react';

export function MaterialsPage() {
  const { address, chainId, provider, connect, error: walletError } = useWallet();
  const [ownedTokens, setOwnedTokens] = useState<OwnedToken[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!address || !provider) {
      setOwnedTokens(null);
      setLoading(false);
      setQueryError(null);
      return;
    }

    const isBaseChain = chainId === ARCHIVE_CHAIN_ID || chainId === 8453;
    if (!isBaseChain) {
      setOwnedTokens(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setQueryError(null);

    resolveOwnedTokens(provider, address)
      .then(tokens => {
        if (active) {
          setOwnedTokens(tokens);
          setLoading(false);
        }
      })
      .catch(err => {
        if (active) {
          console.error('[MaterialsPage] Failed to resolve owned tokens:', err);
          setQueryError('Unable to query on-chain token custody. Please ensure you are connected to Base network.');
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [address, chainId, provider]);

  const wrongChain = Boolean(address && chainId !== ARCHIVE_CHAIN_ID && chainId !== 8453);

  return (
    <main style={{ minHeight: '100dvh', overflowY: 'auto', background: 'var(--g-bg, #080a0d)', color: 'var(--g-text-primary, #edecea)', padding: 'clamp(24px, 6vw, 72px)', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', lineHeight: 1.7 }}>
        <a href="/gallery" className="information-room__crosslink" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={14} weight="light" aria-hidden="true" />
          <span>RETURN TO GALLERY</span>
        </a>
        <h1 className="t-gallery-subtitle" style={{ marginTop: 32, letterSpacing: '0.12em' }}>YOUR HIỆN SINH MATERIALS</h1>
        <p style={{ color: 'rgba(237, 236, 234, 0.7)', fontSize: '0.9rem', margin: '16px 0 24px' }}>
          Current token holders can retrieve their materials here, including after an on-chain transfer.
          A Curator encounter or Three Brushstrokes submission is not required for material retrieval.
        </p>

        {!address ? (
          <div style={{ padding: '24px', background: 'rgba(15, 18, 22, 0.7)', border: '1px solid rgba(232, 235, 238, 0.1)', marginTop: 24 }}>
            <p style={{ margin: '0 0 16px', color: 'rgba(237, 236, 234, 0.85)' }}>
              Connect your wallet to inspect held tokens and retrieve authorized materials.
            </p>
            <button
              type="button"
              className="information-room__crosslink"
              onClick={() => void connect()}
              style={{ display: 'inline-block', cursor: 'pointer' }}
            >
              CONNECT WALLET TO RETRIEVE
            </button>
            {walletError && <p role="status" style={{ color: '#e57373', marginTop: 12 }}>{walletError}</p>}
          </div>
        ) : wrongChain ? (
          <div style={{ padding: '24px', background: 'rgba(15, 18, 22, 0.7)', border: '1px solid rgba(218, 172, 98, 0.25)', marginTop: 24 }}>
            <p role="status" style={{ margin: 0, color: 'var(--g-text-accent)' }}>
              Select Base (Chain ID 8453) in your wallet to verify token custody and retrieve materials.
            </p>
          </div>
        ) : loading ? (
          <div style={{ padding: '24px', background: 'rgba(15, 18, 22, 0.7)', border: '1px solid rgba(232, 235, 238, 0.1)', marginTop: 24 }}>
            <p style={{ margin: 0, color: 'rgba(237, 236, 234, 0.6)' }}>
              Verifying token custody on Base…
            </p>
          </div>
        ) : queryError ? (
          <div style={{ padding: '24px', background: 'rgba(15, 18, 22, 0.7)', border: '1px solid rgba(232, 235, 238, 0.1)', marginTop: 24 }}>
            <p role="status" style={{ margin: 0, color: '#e57373' }}>
              {queryError}
            </p>
          </div>
        ) : ownedTokens && ownedTokens.length === 0 ? (
          <div style={{ padding: '24px', background: 'rgba(15, 18, 22, 0.7)', border: '1px solid rgba(232, 235, 238, 0.1)', marginTop: 24 }}>
            <h3 className="t-mono-label" style={{ margin: '0 0 8px', color: 'rgba(237, 236, 234, 0.9)' }}>
              NO TOKENS FOUND
            </h3>
            <p style={{ margin: 0, color: 'rgba(237, 236, 234, 0.6)', fontSize: '0.85rem' }}>
              No Hiện Sinh tokens were found for connected wallet <code style={{ color: 'var(--g-text-accent)' }}>{address.slice(0, 6)}…{address.slice(-4)}</code>.
              If you recently completed an acquisition or transfer, verify you are using the correct account.
            </p>
          </div>
        ) : (
          <div style={{ marginTop: 24 }}>
            <p className="t-mono-tag" style={{ color: 'var(--g-text-accent)', marginBottom: 16 }}>
              HELD TOKENS ({ownedTokens?.length || 0})
            </p>
            {ownedTokens?.map(token => (
              <PackageDownloads
                key={token.tokenId}
                standaloneTokenId={token.tokenId}
                tokenLabel={token.label}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

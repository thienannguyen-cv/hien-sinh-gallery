import { useEffect, useRef, useState } from 'react';
import { useWallet } from '../../wallet/WalletContext';
import { retrievePackage, ARCHIVE_CHAIN_ID, type RetrievalStage } from '../../services/archiveRetrieval';

const progress: Record<RetrievalStage, string> = {
  'verifying-ownership': 'Verifying on-chain token ownership on Base…',
  downloading: 'Downloading and checking the file…',
  verified: 'File verified. Your download is ready.',
};

export interface PackageDownloadsProps {
  frameId?: number;
  includePainting?: boolean;
  standaloneTokenId?: number;
  tokenLabel?: string;
}

export function PackageDownloads({
  frameId = 5,
  includePainting = false,
  standaloneTokenId,
  tokenLabel,
}: PackageDownloadsProps) {
  const { address, chainId, provider, connect, error: walletError } = useWallet();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const active = useRef<AbortController | null>(null);

  useEffect(() => {
    active.current?.abort();
    setBusy(false);
    setNotice('');
    return () => { active.current?.abort(); };
  }, [address, chainId, provider, frameId, standaloneTokenId]);

  async function download(tokenId: number) {
    if (!address || !provider) { await connect(); return; }
    if (active.current && !active.current.signal.aborted) return;
    const controller = new AbortController();
    active.current = controller;
    setBusy(true);
    setNotice('');
    try {
      const result = await retrievePackage({
        provider, address, tokenId, assetType: tokenId === 0 ? 'H_PAINTING_PACKAGE' : 'H_FRAME_PACKAGE',
        origin: window.location.origin, signal: controller.signal,
        stage: stage => { if (!controller.signal.aborted) setNotice(progress[stage]); },
      });
      controller.signal.throwIfAborted();
      const url = URL.createObjectURL(result.blob);
      const link = document.createElement('a');
      link.href = url; link.download = result.filename;
      document.body.appendChild(link); link.click(); link.remove();
      // Retain the in-memory blob long enough for the browser's download handoff.
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      if (!controller.signal.aborted) setNotice(error instanceof Error ? error.message : 'The download was not completed. Please try again.');
    } finally {
      if (active.current === controller) { active.current = null; setBusy(false); }
    }
  }

  const wrongChain = Boolean(address && chainId !== ARCHIVE_CHAIN_ID && chainId !== 8453);

  if (standaloneTokenId !== undefined) {
    const label = tokenLabel || (standaloneTokenId === 0 ? 'PAINTING' : `FRAME ${String(standaloneTokenId).padStart(2, '0')}`);
    return (
      <div style={{
        padding: '18px 20px',
        background: 'rgba(15, 18, 22, 0.75)',
        border: '1px solid rgba(232, 235, 238, 0.12)',
        marginBottom: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="t-mono-label" style={{ color: 'var(--g-text-accent)', fontSize: '0.8rem' }}>
            {label}
          </span>
          <span className="t-mono-tag" style={{ color: 'rgba(237,236,234,0.5)', fontSize: '0.7rem' }}>
            TOKEN #{standaloneTokenId}
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <button
            type="button"
            className="information-room__crosslink"
            disabled={busy || wrongChain}
            onClick={() => void download(standaloneTokenId)}
            style={{ cursor: busy || wrongChain ? 'not-allowed' : 'pointer' }}
          >
            DOWNLOAD {label}
          </button>
        </div>
        {notice && <p role="status" aria-live="polite" style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(237,236,234,0.85)' }}>{notice}</p>}
      </div>
    );
  }

  return (
    <section aria-label="Your package downloads" style={{ borderTop: '1px solid rgba(232,235,238,0.15)', marginTop: 24, paddingTop: 20 }}>
      <h3 className="t-mono-label">YOUR MATERIALS</h3>
      <p className="t-body-text" style={{ margin: '12px 0', lineHeight: 1.6 }}>
        Retrieve the materials for the token you currently hold on Base.
        {includePainting ? ' Frame and Painting materials are separate downloads; each requires on-chain custody of its own token.' : ''}
      </p>
      {wrongChain && <p role="status">Select Base in your wallet to retrieve your materials.</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <button type="button" className="information-room__crosslink" disabled={busy || wrongChain} onClick={() => void download(frameId)}>
          {address ? `DOWNLOAD FRAME ${String(frameId).padStart(2, '0')}` : 'CONNECT WALLET TO RETRIEVE'}
        </button>
        {includePainting && address && <button type="button" className="information-room__crosslink" disabled={busy || wrongChain} onClick={() => void download(0)}>
          DOWNLOAD PAINTING
        </button>}
      </div>
      {notice && <p role="status" aria-live="polite" style={{ marginTop: 12, lineHeight: 1.6 }}>{notice}</p>}
      {!address && walletError && <p role="status">{walletError}</p>}
    </section>
  );
}

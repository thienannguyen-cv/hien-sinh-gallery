import { useState, useEffect, useCallback, useRef } from 'react';
import { useWallet } from '../../wallet/WalletContext.tsx';
import {
  executeFramePurchase,
  checkFrameStatus,
  COMPLETE_PACKAGE_FRAME_ID,
  ARTIST_GENESIS_FRAME_ID,
} from '../../services/framePurchase.ts';

interface FramePurchaseProps {
  frameId: number;
  onAcquired?: (transactionHash: string) => void;
}

export function FramePurchase({ frameId, onAcquired }: FramePurchaseProps) {
  const { address, provider } = useWallet();
  const [frameStatus, setFrameStatus] = useState<'checking' | 'available' | 'minted' | 'not_started' | 'reserved' | 'error'>('checking');
  const [ownerAddress, setOwnerAddress] = useState<string | null>(null);
  const [actionState, setActionState] = useState<'idle' | 'sending' | 'complete' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const actionStateRef = useRef(actionState);
  actionStateRef.current = actionState;

  const checkAvailability = useCallback(async (isMounted = true) => {
    if (frameId === COMPLETE_PACKAGE_FRAME_ID || frameId === ARTIST_GENESIS_FRAME_ID) {
      if (isMounted) setFrameStatus('reserved');
      return;
    }
    if (!provider) {
      if (isMounted) {
        setFrameStatus('available');
        setOwnerAddress(null);
      }
      return;
    }
    try {
      const status = await checkFrameStatus(provider, frameId);
      if (!isMounted) return;
      if (status.isMinted) {
        setFrameStatus('minted');
        setOwnerAddress(status.owner);
      } else if (!status.mintStarted) {
        setFrameStatus('not_started');
        setOwnerAddress(null);
      } else {
        setFrameStatus('available');
        setOwnerAddress(null);
      }
    } catch {
      if (isMounted) {
        setFrameStatus('available');
        setOwnerAddress(null);
      }
    }
  }, [provider, frameId]);

  useEffect(() => {
    let mounted = true;
    setFrameStatus('checking');
    setMessage('');
    setActionState('idle');
    void checkAvailability(true);
    const interval = window.setInterval(() => {
      if (mounted && actionStateRef.current === 'idle') {
        void checkAvailability(true);
      }
    }, 10000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [provider, frameId, checkAvailability]);

  const acquire = async () => {
    if (!address || !provider) {
      setActionState('error');
      setMessage('Connect your wallet to acquire this Frame.');
      return;
    }
    if (frameStatus !== 'available') {
      setActionState('error');
      setMessage('This Frame is not currently available for acquisition.');
      return;
    }
    setActionState('sending');
    setMessage('Review the transaction in your wallet.');
    try {
      const receipt = await executeFramePurchase(
        provider,
        frameId,
        () => setMessage('Transaction submitted. Waiting for Base confirmation…')
      );
      setActionState('complete');
      setFrameStatus('minted');
      setMessage(`Frame ${String(frameId).padStart(2, '0')} was acquired in transaction ${receipt.transactionHash}.`);
      onAcquired?.(receipt.transactionHash);
    } catch (error) {
      setActionState('error');
      setMessage(error instanceof Error ? error.message : 'The acquisition could not be completed.');
    }
  };

  const busy = frameStatus === 'checking' || actionState === 'sending';
  const readyToAcquire = Boolean(address && frameStatus === 'available' && actionState !== 'sending' && actionState !== 'complete');

  const paddedId = String(frameId).padStart(2, '0');

  return (
    <section aria-label={`Purchase Frame ${paddedId}`} style={{ marginTop: 16 }}>
      <button
        type="button"
        disabled={!readyToAcquire}
        className="t-mono-label"
        style={{
          width: '100%',
          padding: '14px 16px',
          border: readyToAcquire
            ? '1px solid rgba(218,172,98,.52)'
            : '1px solid rgba(232,235,238,.08)',
          background: readyToAcquire
            ? 'linear-gradient(135deg, rgba(218,172,98,.22), rgba(218,172,98,.08))'
            : 'rgba(232,235,238,.03)',
          color: readyToAcquire ? 'var(--g-text-primary)' : 'rgba(237,236,234,.30)',
          cursor: readyToAcquire ? 'pointer' : busy ? 'wait' : 'not-allowed',
          opacity: readyToAcquire ? 1 : 0.65,
          letterSpacing: '.16em',
          fontSize: '.59rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
        onClick={() => void acquire()}
      >
        {actionState === 'sending'
          ? 'PROCESSING ACQUISITION…'
          : actionState === 'complete'
          ? `FRAME ${paddedId} ACQUIRED`
          : frameStatus === 'checking'
          ? 'CHECKING AVAILABILITY…'
          : frameStatus === 'minted'
          ? (address && ownerAddress && ownerAddress.toLowerCase() === address.toLowerCase()
              ? `FRAME ${paddedId} OWNED`
              : `FRAME ${paddedId} ALREADY MINTED`)
          : frameStatus === 'not_started'
          ? 'MINTING OPENS SOON'
          : frameStatus === 'reserved'
          ? 'FRAME RESERVED'
          : !address
          ? 'CONNECT WALLET TO ACQUIRE'
          : `ACQUIRE FRAME ${paddedId} · 0.081 ETH`}
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

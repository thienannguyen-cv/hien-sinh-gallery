/**
 * WalletStatusBar — Minimal access indicator
 *
 * Replaces DevAccessBar. Shows current access ring,
 * wallet connection state, and DEVMODE badge if active.
 * Positioned bottom-right, extremely minimal.
 */

import React from 'react';
import { GlassHint } from './GlassHint';

interface WalletStatusBarProps {
  currentRing: 0 | 1 | 2;
  walletAddress?: string;
  isConnecting?: boolean;
  onConnect?: () => void;
}

const RING_LABELS = {
  0: 'THRESHOLD',
  1: 'ATELIER',
  2: 'SANCTUM',
} as const;

const RING_HINTS: Record<0 | 1 | 2, string> = {
  0: 'The entrance hall. Speak with the Curator to learn about the practice.',
  1: 'The atelier of 9 canonical frames. Connect your wallet to reveal your holdings.',
  2: 'The inner sanctum. A private chamber for contemplation with a single work.',
};

export const WalletStatusBar: React.FC<WalletStatusBarProps> = ({
  currentRing,
  walletAddress,
  isConnecting,
  onConnect,
}) => {
  const shortened = walletAddress
    ? `${walletAddress.slice(0, 5)}···${walletAddress.slice(-4)}`
    : null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 28,
        zIndex: 90,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 6,
        pointerEvents: 'none',
      }}
    >
      {/* Ring dots indicator with hint */}
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        {([0, 1, 2] as const).map(ring => (
          <div
            key={ring}
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: ring === currentRing
                ? 'rgba(218,172,98,0.7)'
                : 'rgba(232,235,238,0.15)',
              transition: 'background 0.4s ease',
            }}
          />
        ))}
        <span style={{ marginLeft: 4 }}>
          <GlassHint
            hint={RING_HINTS[currentRing]}
            position="left"
            size={12}
          />
        </span>
      </div>

      {/* Ring label */}
      <span className="t-mono-tag" style={{ opacity: 0.20 }}>
        {RING_LABELS[currentRing]}
      </span>

      {/* Wallet */}
      {shortened ? (
        <span className="t-mono-tag" style={{ opacity: 0.22 }}>
          {shortened}
        </span>
      ) : onConnect ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={onConnect}
            className="t-mono-tag"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(237,236,234,0.22)',
              padding: 0,
              pointerEvents: 'all',
              transition: 'color 0.3s ease',
              letterSpacing: '0.2em',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(218,172,98,0.5)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(237,236,234,0.22)')}
          >
            {isConnecting ? '···' : 'REVEAL'}
          </button>
          <GlassHint
            hint="Connect your Web3 wallet (e.g. MetaMask) to verify your Frame holdings on the Base network."
            position="top"
            align="end"
            size={12}
          />
        </div>
      ) : null}
    </div>
  );
};

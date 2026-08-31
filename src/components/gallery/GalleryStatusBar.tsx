/**
 * GalleryStatusBar — spatial state only.
 *
 * This component deliberately has no wallet, token, contract, or transaction
 * semantics. Those states must come from a separately implemented and verified
 * on-chain adapter; until that adapter exists, the gallery remains fail-closed.
 */

import React from 'react';
import { GlassHint } from './GlassHint';

interface GalleryStatusBarProps {
  currentRing: 0 | 1 | 2;
}

const RING_LABELS = {
  0: 'THRESHOLD',
  1: 'ATELIER',
  2: 'SANCTUM',
} as const;

const RING_HINTS: Record<0 | 1 | 2, string> = {
  0: 'The three marks locate you within the gallery. The illuminated mark is the Threshold.',
  1: 'The three marks locate you within the gallery. The illuminated mark is the Atelier.',
  2: 'The three marks locate you within the gallery. The illuminated mark is the Sanctum.',
};

export const GalleryStatusBar: React.FC<GalleryStatusBarProps> = ({
  currentRing,
}) => {
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
          <GlassHint hint={RING_HINTS[currentRing]} position="top" align="end" size={14} />
        </span>
      </div>

      <span className="t-mono-tag" style={{ opacity: 0.20 }}>
        {RING_LABELS[currentRing]}
      </span>
    </div>
  );
};

/**
 * ArtworkGlow — Chromatic Field
 * 
 * Represents the artwork's presence through abstract color only.
 * No actual image is served. The glow is derived from ambient
 * palette association only — technically irreversible.
 *
 * The viewer perceives warm light filtering through frosted glass,
 * suggesting a presence without revealing its form.
 */

import React from 'react';

export const ArtworkGlow: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Primary warm source — center-right, like light from a hidden canvas */}
      <div style={{
        position: 'absolute',
        top: '15%',
        right: '8%',
        width: '55%',
        height: '70%',
        background: 'radial-gradient(ellipse at 60% 45%, rgba(218,172,98,0.10) 0%, rgba(196,148,72,0.04) 40%, transparent 70%)',
        filter: 'blur(40px)',
      }} />

      {/* Secondary warm source — upper left, reflected light */}
      <div style={{
        position: 'absolute',
        top: '0%',
        left: '5%',
        width: '45%',
        height: '50%',
        background: 'radial-gradient(ellipse at 35% 30%, rgba(240,200,130,0.055) 0%, transparent 65%)',
        filter: 'blur(55px)',
      }} />

      {/* Cool ambient — floor reflection */}
      <div style={{
        position: 'absolute',
        bottom: '0%',
        left: '20%',
        right: '20%',
        height: '35%',
        background: 'radial-gradient(ellipse at 50% 80%, rgba(150,165,185,0.04) 0%, transparent 70%)',
        filter: 'blur(50px)',
      }} />

      {/* Frosted glass partition — the barrier between viewer and artwork */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '5%',
        bottom: '10%',
        width: '38%',
        background: `
          linear-gradient(
            to right,
            transparent 0%,
            rgba(232,235,238,0.012) 20%,
            rgba(232,235,238,0.028) 50%,
            rgba(232,235,238,0.018) 80%,
            transparent 100%
          )
        `,
        backdropFilter: 'blur(2px)',
        borderLeft: '1px solid rgba(232,235,238,0.05)',
        borderRight: '1px solid rgba(232,235,238,0.03)',
      }} />
    </div>
  );
};

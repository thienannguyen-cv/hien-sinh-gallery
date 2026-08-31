/**
 * PublicEncounterRepresentation — one non-canonical presentation boundary.
 *
 * This is the shared public encounter field. It is neither a preview of the
 * Painting nor a substitute for the nine individual Frame symbols. No
 * canonical Painting bytes are served here.
 */

import React from 'react';

export const PublicEncounterRepresentation: React.FC = () => {
  return (
    <div
      aria-label="Public Encounter Representation"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        background: '#060708',
      }}
    >
      <div style={{
        position: 'absolute',
        top: '15%',
        right: '8%',
        width: '55%',
        height: '70%',
        background: 'radial-gradient(ellipse at 60% 45%, rgba(218,172,98,0.118) 0%, rgba(196,148,72,0.045) 40%, transparent 70%)',
        filter: 'blur(40px)',
      }} />
      <div style={{
        position: 'absolute',
        top: 0,
        left: '5%',
        width: '45%',
        height: '50%',
        background: 'radial-gradient(ellipse at 35% 30%, rgba(240,200,130,0.062) 0%, transparent 65%)',
        filter: 'blur(55px)',
      }} />
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: '20%',
        right: '20%',
        height: '35%',
        background: 'radial-gradient(ellipse at 50% 80%, rgba(150,165,185,0.04) 0%, transparent 70%)',
        filter: 'blur(50px)',
      }} />
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '5%',
        bottom: '10%',
        width: '38%',
        background: 'linear-gradient(to right, transparent 0%, rgba(232,235,238,0.012) 20%, rgba(232,235,238,0.034) 50%, rgba(232,235,238,0.018) 80%, transparent 100%)',
        backdropFilter: 'blur(2px)',
        borderLeft: '1px solid rgba(232,235,238,0.05)',
        borderRight: '1px solid rgba(232,235,238,0.03)',
      }} />
    </div>
  );
};

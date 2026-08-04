'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArchiveCuratorTerminal } from './ArchiveCuratorTerminal';
import { GlassHint } from './GlassHint';
import { FrameArtwork } from './FrameArtwork';

interface SanctumGalleryProps {
  frameId: number;
}

export const SanctumGallery: React.FC<SanctumGalleryProps> = ({ frameId }) => {
  const [showTerminal, setShowTerminal] = useState(false);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Central Frame Focus */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: '70vw',
          maxWidth: 1200,
          aspectRatio: '1.6 / 1',
          border: '1px solid rgba(232,235,238,0.12)',
          boxShadow: '0 0 120px rgba(212, 175, 55, 0.08), 0 0 40px rgba(255, 255, 255, 0.03), inset 0 0 80px rgba(0,0,0,0.8)',
          background: 'linear-gradient(135deg, rgba(218,172,98,0.06) 0%, rgba(150,165,185,0.02) 100%)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Generative Digital Artwork Composition */}
        <FrameArtwork frameId={frameId} isSanctum />

        {/* Subtle Frosted Membrane / Vignette Spotlight */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, rgba(218,172,98,0.05) 0%, transparent 60%)',
          filter: 'blur(20px)',
          pointerEvents: 'none',
        }} />
        
        <span className="t-mono-tag" style={{ position: 'relative', zIndex: 2, opacity: 0.25, letterSpacing: '0.4em', fontSize: '0.8rem' }}>
          {frameId === 5 ? 'ARCHIVE ZERO — SOLE STEWARDSHIP' : `FRAME ${frameId.toString().padStart(2, '0')} — ISOLATED PRESENCE`}
        </span>
      </motion.div>

      {/* Archive Curator Hint (Glass Panel) */}
      <AnimatePresence>
        {!showTerminal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              position: 'absolute',
              bottom: 48,
              left: 48, // Moved to left to prevent collision with WalletStatusBar on right
              textAlign: 'left',
              zIndex: 20,
            }}
          >
            <div className="t-mono-tag" style={{ opacity: 0.18, marginBottom: 12 }}>
              ARCHIVE CURATOR
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={() => setShowTerminal(true)}
                className="t-mono-label"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(232,235,238,0.1)',
                  backdropFilter: 'blur(8px)',
                  color: 'rgba(218,172,98,0.4)',
                  padding: '12px 24px',
                  cursor: 'pointer',
                  transition: 'all 0.4s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(218,172,98,0.3)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(218,172,98,0.05)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(232,235,238,0.1)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.02)';
                }}
              >
                INITIATE DIALOGUE
              </button>
              <GlassHint
                hint="Open a conversation with the Archive Curator — an AI guide to this work's conceptual foundations."
                position="top"
                size={12}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Archive Curator Terminal */}
      <AnimatePresence>
        {showTerminal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(6,7,8,0.85)',
              backdropFilter: 'blur(12px)',
              zIndex: 50,
            }}
          >
            <ArchiveCuratorTerminal onClose={() => setShowTerminal(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

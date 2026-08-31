import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArchiveCuratorTerminal } from './ArchiveCuratorTerminal';
import { GlassHint } from './GlassHint';
import { FrameSymbol } from './FrameSymbol';
import { RitualSpinner } from './RitualSpinner';
import { useRegisterOverlay } from '../../context/OverlayContext';
import { HIEN_SINH_CONTRACT } from '../../generated/contract/hienSinhInterface';
import { IntersectionEnvironment } from './IntersectionEnvironment';

interface SanctumGalleryProps {
  frameId: number;
  imageUrl?: string;
  loading?: boolean;
  localPresentation?: boolean;
}

export const SanctumGallery: React.FC<SanctumGalleryProps> = ({ frameId, imageUrl: propImageUrl, loading = false, localPresentation = false }) => {
  const [showTerminal, setShowTerminal] = useState(false);
  const activeImageUrl = propImageUrl;
  const isImageLoading = loading;

  useRegisterOverlay(showTerminal, 'sanctum-curator-terminal');

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
        className="sanctum-frame"
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
        {/* Canonical bytes appear only through a verified archive-delivery URL. */}
        {isImageLoading ? (
          <RitualSpinner message="RELATIONAL TRANSMISSION IN PROGRESS" />
        ) : activeImageUrl ? (
          <img
            src={activeImageUrl}
            alt="Canonical Painting"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              position: 'relative',
              zIndex: 1,
              animation: 'glassHintFadeIn 1s ease forwards',
            }}
          />
        ) : localPresentation ? (
          <FrameSymbol frameId={frameId} />
        ) : (
          <div className="t-mono-tag" style={{ opacity: 0.28 }}>
            CANONICAL ARCHIVE PRESENTATION UNAVAILABLE
          </div>
        )}

        {/* Subtle Frosted Membrane / Vignette Spotlight */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, rgba(218,172,98,0.05) 0%, transparent 60%)',
          filter: 'blur(20px)',
          pointerEvents: 'none',
        }} />
        
        <span className="t-mono-tag" style={{ position: 'relative', zIndex: 2, opacity: 0.25, letterSpacing: '0.4em', fontSize: '0.8rem' }}>
          FRAME {frameId.toString().padStart(2, '0')} / {String(HIEN_SINH_CONTRACT.constants.maxSupply).padStart(2, '0')} · DESIGNATED STEWARDSHIP ARCHIVE
        </span>
      </motion.div>

      {/* Frame Curator Hint (Glass Panel) */}
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
              left: 48, // Kept clear of the spatial status indicator on the right.
              textAlign: 'left',
              zIndex: 20,
            }}
          >
            <div className="t-mono-tag" style={{ opacity: 0.18, marginBottom: 12 }}>
              FRAME CURATOR
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
                OPEN CURATOR SESSION
              </button>
              <GlassHint
                hint="The Complete Curator can work with the Frame practice and the canonical Painting archive. Opening a session is optional."
                position="top"
                size={14}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Frame Curator Terminal & Intersection Space */}
      <AnimatePresence>
        {showTerminal && (
          <motion.div
            key="sanctum-terminal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 2000,
            }}
          >
            <IntersectionEnvironment role="STEWARD" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'absolute',
                inset: '5vh 5vw',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <ArchiveCuratorTerminal
                onClose={() => setShowTerminal(false)}
                role="STEWARD"
                frameId="05"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

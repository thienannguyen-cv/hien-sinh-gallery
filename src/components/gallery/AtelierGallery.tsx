'use client';
/**
 * AtelierGallery — Ring 01
 *
 * Nine canonical frames presented in a gallery arrangement:
 * one Complete frame occupying the center — larger, distinguished —
 * surrounded by eight numbered Frames.
 *
 * Frames belonging to the connected wallet are shown clearly.
 * Frames not owned show as frosted silhouettes.
 *
 * The Archive Curator desk is positioned in the lower-right,
 * distinct from the Monolithic Curator at the Threshold.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DEVMODE } from '../../lib/devMode';
import { GlassHint } from './GlassHint';
import { FrameArtwork } from './FrameArtwork';

interface Frame {
  id: number;
  title: string;
  edition: string;
  price: string;
  isComplete?: boolean;
}

const FRAMES: Frame[] = [
  { id: 1, title: 'Encounter — First Light',      edition: 'Frame 01 / 09', price: '0.081 ETH' },
  { id: 2, title: 'Encounter — The Threshold',   edition: 'Frame 02 / 09', price: '0.081 ETH' },
  { id: 3, title: 'Encounter — Surface',          edition: 'Frame 03 / 09', price: '0.081 ETH' },
  { id: 4, title: 'Encounter — Immersion',        edition: 'Frame 04 / 09', price: '0.081 ETH' },
  { id: 5, title: 'Complete Archive',             edition: 'Complete 1/1 — Designated Steward', price: 'By Accession', isComplete: true },
  { id: 6, title: 'Encounter — The Question',    edition: 'Frame 05 / 09', price: '0.081 ETH' },
  { id: 7, title: 'Encounter — Silence',          edition: 'Frame 06 / 09', price: '0.081 ETH' },
  { id: 8, title: 'Encounter — Return',           edition: 'Frame 07 / 09', price: '0.081 ETH' },
  { id: 9, title: 'Encounter — Remainder',        edition: 'Frame 08 / 09', price: '0.081 ETH' },
];

interface AtelierGalleryProps {
  ownedFrameIds?: number[];   // Frame IDs owned by connected wallet
  isConnected?: boolean;
  onConnectWallet?: () => void;
  onDescend?: (frameId: number) => void;
}

export const AtelierGallery: React.FC<AtelierGalleryProps> = ({
  ownedFrameIds = [],
  isConnected = false,
  onConnectWallet,
  onDescend,
}) => {
  const isOwned = (frameId: number) => ownedFrameIds.includes(frameId);

  const [visitedFrames, setVisitedFrames] = useState<Set<number>>(() => {
    try {
      const raw = localStorage.getItem('hs_visited_frames');
      return raw ? new Set(JSON.parse(raw) as number[]) : new Set();
    } catch { return new Set(); }
  });

  const markFrameVisited = (frameId: number) => {
    setVisitedFrames(prev => {
      const next = new Set(prev);
      next.add(frameId);
      localStorage.setItem('hs_visited_frames', JSON.stringify([...next]));
      return next;
    });
  };

  return (
    <motion.div
      key="atelier"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7 }}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--g-wall)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '72px 24px 120px',
      }}
      className="no-scrollbar"
    >
      {/* ── Ceiling / floor implied lines ── */}
      <div style={{
        position: 'absolute', top: 56, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(232,235,238,0.06) 20%, rgba(232,235,238,0.08) 50%, rgba(232,235,238,0.06) 80%, transparent)',
      }} />
      <div style={{
        position: 'absolute', bottom: 36, left: '10%', right: '10%', height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(232,235,238,0.04) 30%, rgba(232,235,238,0.05) 50%, rgba(232,235,238,0.04) 70%, transparent)',
      }} />

      {/* ── Ring label ── */}
      <div style={{
        position: 'absolute', top: 20, left: 0, right: 0,
        display: 'flex', justifyContent: 'space-between', padding: '0 36px',
      }}>
        <span className="t-mono-tag" style={{ opacity: 0.25 }}>RING 01 — ATELIER</span>
      </div>

      {/* ── Frame grid ── */}
      {/* Layout: 4 | 1 | 4 arranged as 3 rows of 3 = 9 cells total */}
      {/* Center cell (Complete) is larger, others are equal */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))',
        gridTemplateRows: 'auto',
        gap: '40px 24px',
        width: '100%',
        maxWidth: 900,
        alignItems: 'start',
      }}>
        {FRAMES.map((frame, idx) => {
          const owned = isOwned(frame.id);
          const isCenter = frame.isComplete;

          return (
            <motion.div
              key={frame.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: idx * 0.055,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
              }}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                cursor: owned ? 'pointer' : 'default',
                transform: isCenter ? 'scale(1.05)' : 'scale(0.98)',
                zIndex: isCenter ? 10 : 1,
                opacity: (isCenter || owned) ? 1 : 0.8,
              }}
              onClick={() => {
                if (owned && onDescend) {
                  markFrameVisited(frame.id);
                  onDescend(frame.id);
                }
              }}
            >
              {/* Frame border */}
              <div
                className={owned && !visitedFrames.has(frame.id) ? 'entry-border-pulse' : undefined}
                style={{
                  width: '100%',
                  aspectRatio: isCenter ? '1.8 / 1' : '1.6 / 1',
                  border: isCenter
                    ? '1px solid rgba(232,235,238,0.18)'
                    : '1px solid rgba(232,235,238,0.08)',
                  background: owned
                    ? (isCenter
                        ? 'rgba(218,172,98,0.05)'
                        : 'rgba(232,235,238,0.028)')
                    : 'rgba(6,7,8,0.85)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'border-color 0.4s ease, background 0.4s ease',
                }}
              >
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: owned
                    ? (isCenter
                      ? 'linear-gradient(135deg, rgba(218,172,98,0.12) 0%, rgba(150,165,185,0.06) 100%)'
                      : 'rgba(232,235,238,0.015)')
                    : 'linear-gradient(180deg, rgba(12,13,16,0.98) 0%, rgba(8,9,12,0.95) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: owned ? 'none' : 'blur(12px)',
                  boxShadow: isCenter 
                    ? '0 30px 60px -20px rgba(0,0,0,0.8), inset 0 0 40px rgba(218,172,98,0.05)' 
                    : (owned ? 'none' : 'inset 0 0 40px rgba(0,0,0,0.9)'),
                  transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                }}>
                  {owned ? (
                    <FrameArtwork frameId={frame.id} />
                  ) : (
                    /* Subtle silhouette reflection for unowned frames or inner void luminance for center */
                    !isCenter && (
                      <div style={{
                        position: 'absolute',
                        bottom: '-20%',
                        left: '10%',
                        right: '10%',
                        height: '60%',
                        background: 'radial-gradient(ellipse at top, rgba(218,172,98,0.04) 0%, transparent 70%)',
                        opacity: 0.6,
                        filter: 'blur(20px)',
                      }} />
                    )
                  )}
                  {isCenter && !owned && (
                     <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'radial-gradient(circle at center, rgba(218,172,98,0.1) 0%, transparent 60%)',
                      opacity: 0.3,
                      filter: 'blur(30px)',
                      transition: 'opacity 1s ease',
                    }} />
                  )}
                </div>

                {/* Highlight on complete frame */}
                {isCenter && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                    background: 'linear-gradient(90deg, transparent, rgba(218,172,98,0.4) 30%, rgba(218,172,98,0.6) 50%, rgba(218,172,98,0.4) 70%, transparent)',
                  }} />
                )}
              </div>

              {/* Title card below frame */}
              <div style={{
                paddingTop: 8,
                paddingLeft: 2,
              }}>
                <div
                  className="t-mono-tag"
                  style={{
                    color: isCenter
                      ? 'rgba(218,172,98,0.6)'
                      : 'rgba(237,236,234,0.30)',
                    marginBottom: 3,
                    letterSpacing: '0.16em',
                    fontSize: isCenter ? '0.62rem' : '0.57rem',
                  }}
                >
                  {frame.edition}
                </div>
                <div
                  className="t-gallery-subtitle"
                  style={{
                    color: owned
                      ? 'rgba(237,236,234,0.65)'
                      : 'rgba(237,236,234,0.18)',
                    fontSize: '0.62rem',
                    letterSpacing: '0.12em',
                  }}
                >
                  {owned ? frame.title : '— — —'}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Access gate (when not connected and not DEVMODE) ── */}
      {!isConnected && !DEVMODE && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          style={{
            marginTop: 48,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            flexShrink: 0,
          }}
        >
          <p className="t-gallery-subtitle" style={{
            opacity: 0.50,
            textAlign: 'center',
            fontSize: 'clamp(0.62rem, 1.1vw, 0.78rem)',
            letterSpacing: '0.18em',
            lineHeight: '1.8',
          }}>
            Presence requires a bond on the Base network.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={onConnectWallet}
              className="t-mono-label"
              style={{
                background: 'none',
                border: '1px solid rgba(232,235,238,0.12)',
                color: 'rgba(237,236,234,0.45)',
                padding: '9px 20px',
                cursor: 'pointer',
                letterSpacing: '0.18em',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(218,172,98,0.3)';
                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(218,172,98,0.7)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(232,235,238,0.12)';
                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(237,236,234,0.45)';
              }}
            >
              APPROACH
            </button>
            <GlassHint
              hint="Opens your Web3 wallet (e.g. MetaMask) to verify Frame ownership on the Base network. No sign-up needed."
              position="top"
              size={14}
            />
          </div>
        </motion.div>
      )}

      {/* ── Archive Curator hint (small, lower-right) ── */}
      {(isConnected || DEVMODE) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          style={{
            position: 'absolute',
            bottom: 48,
            right: 48,
            textAlign: 'right',
          }}
        >
          <div className="t-mono-tag" style={{ opacity: 0.18, marginBottom: 4 }}>
            ARCHIVE CURATOR
          </div>
          <div className="t-mono-tag" style={{ opacity: 0.12 }}>
            DEEPER ACCESS — COMING SOON
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

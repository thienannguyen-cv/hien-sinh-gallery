'use client';
/**
 * AtelierGallery — Ring 01
 *
 * Eight standalone Frame editions and Complete Package 05 are presented in a
 * single arrangement. Package 05 contains Frame 05 and the Painting and is
 * acquired directly; it is never an upgrade from another Frame. This view is
 * never evidence of wallet ownership, archive delivery,
 * a deployed contract, or transaction authority.
 *
 * Contract-backed relationship state is deliberately unavailable until a
 * verified adapter exists. The local presentation environment may identify synthetic
 * relationships, but never wallet, token, archive, or transaction authority.
 * The public encounter representation is never a clearer Painting image.
 *
 * The Frame Curator entry is positioned in the lower-right,
 * distinct from the Public Curator at the Threshold.
 */

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { FrameSymbol } from './FrameSymbol';
import { useGlassCaustic } from './glassCaustic';
import { HIEN_SINH_CONTRACT } from '../../generated/contract/hienSinhInterface';
import { COMPLETE_PACKAGE_ID } from './completePackageDesignation';
import metadata from '../../../../../metadata.json';

interface EditionEntry {
  id: number;
  title: string;
  edition: string;
  price: string;
  isCenter?: boolean;
}

const MAX_SUPPLY = HIEN_SINH_CONTRACT.constants.maxFrameSupply;
const FRAME_PRICE = `${HIEN_SINH_CONTRACT.constants.framePriceEth} ETH`;
const FRAME_TITLES = Object.values(metadata.representation.frames) as string[];

if (FRAME_TITLES.length !== MAX_SUPPLY) {
  throw new Error('Gallery frame labels are out of sync with the canonical contract interface.');
}

const EDITION_ENTRIES: EditionEntry[] = FRAME_TITLES.map((title, index) => {
  const id = index + 1;
  return {
    id,
    title,
    edition: `Frame ${String(id).padStart(2, '0')} / ${String(MAX_SUPPLY).padStart(2, '0')}`,
    price: FRAME_PRICE,
    isCenter: id === COMPLETE_PACKAGE_ID,
  };
});

/**
 * The entrance begins from a distant equal plane (scale 0.88, equal 1.8:1 aspect).
 * As the viewer approaches, frames smoothly expand into the room. Outer frames
 * become taller (1.6:1, scale 1.0), while Center Frame 05 scales less (scale 0.94,
 * aspect 1.8:1) and aligns flush with the row's top edge, creating a solemn,
 * deep perspective sanctuary.
 */
const INITIAL_FRAME_SCALE = 0.88;
const INITIAL_FRAME_ASPECT = 1.8;
const OUTER_FINAL_SCALE = 1.0;
const OUTER_FINAL_ASPECT = 1.6;
const CENTER_FINAL_SCALE = 0.94;
const CENTER_FINAL_ASPECT = 1.8;

const DEPTH_DURATION = 3.2;
const DEPTH_TIMES = [0, 0.12, 0.45, 0.80, 1];
const OUTER_SCALE_KEYFRAMES = [0.88, 0.88, 0.94, 0.99, 1.0];
const CENTER_SCALE_KEYFRAMES = [0.88, 0.88, 0.905, 0.93, 0.94];
const OUTER_ASPECT_KEYFRAMES = [1.8, 1.8, 1.72, 1.63, 1.6];
const CENTER_ASPECT_KEYFRAMES = [1.8, 1.8, 1.8, 1.8, 1.8];
const TRANSIENT_LIGHT_KEYFRAMES = [0, 0, 0.035, 0.015, 0];

interface AtelierGalleryProps {
  presentedRelationshipIds?: number[]; // Local presentation only; never authority.
  localPresentationActive?: boolean;
  animateDepthEntrance?: boolean;
  onSelectFrame: (frameId: number) => void;
}

export const AtelierGallery: React.FC<AtelierGalleryProps> = ({
  presentedRelationshipIds = [],
  localPresentationActive = false,
  animateDepthEntrance = true,
  onSelectFrame,
}) => {
  const reduceMotion = useReducedMotion();
  const shouldAnimateDepth = animateDepthEntrance && !reduceMotion;
  const hasPresentedRelationship = (id: number) => presentedRelationshipIds.includes(id);
  const hasAnyPresentedRelationship = localPresentationActive && presentedRelationshipIds.length > 0;
  const [visitedFrames, setVisitedFrames] = useState<Set<number>>(() => {
    try {
      const raw = localStorage.getItem('hs_visited_frames');
      return raw ? new Set(JSON.parse(raw) as number[]) : new Set();
    } catch { return new Set(); }
  });

  const centerCaustic = useGlassCaustic();

  const markFrameVisited = (frameId: number) => {
    setVisitedFrames(prev => {
      const next = new Set(prev);
      next.add(frameId);
      localStorage.setItem('hs_visited_frames', JSON.stringify([...next]));
      return next;
    });
  };

  return (
    <div className="atelier-room no-scrollbar">
      <div className="atelier-ceiling-line" aria-hidden="true" />
      <div className="atelier-floor-boundary" aria-hidden="true" />

      <div className="atelier-ring-label">
        <span className="t-mono-tag" style={{ opacity: 0.25 }}>RING 01 — ATELIER</span>
      </div>

      <div className="atelier-safe-area">
        <div className="atelier-depth-field" data-atelier-stage>
          {EDITION_ENTRIES.map((frame) => {
            const relationshipVisible = hasPresentedRelationship(frame.id);
            const isCenter = frame.isCenter;
            const isSealed = hasAnyPresentedRelationship && !hasPresentedRelationship(frame.id);

            return (
              <motion.button
                key={frame.id}
                type="button"
                disabled={isSealed}
                aria-label={relationshipVisible
                  ? `Enter ${frame.edition}: ${frame.title}`
                  : `Enter ${frame.edition}`}
                data-atelier-frame={frame.id}
                data-atelier-position={isCenter ? 'center' : 'outer'}
                className="atelier-frame-card"
                initial={shouldAnimateDepth ? { scale: INITIAL_FRAME_SCALE } : false}
                animate={{
                  scale: shouldAnimateDepth
                    ? (isCenter ? CENTER_SCALE_KEYFRAMES : OUTER_SCALE_KEYFRAMES)
                    : (isCenter ? CENTER_FINAL_SCALE : OUTER_FINAL_SCALE),
                }}
                transition={{
                  duration: shouldAnimateDepth ? DEPTH_DURATION : 0,
                  times: shouldAnimateDepth ? DEPTH_TIMES : undefined,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  zIndex: isCenter ? 10 : 1,
                  opacity: isCenter ? 1 : 0.85,
                  cursor: isSealed ? 'default' : 'pointer',
                }}
                onClick={() => {
                  markFrameVisited(frame.id);
                  onSelectFrame(frame.id);
                }}
              >
                <motion.div
                  ref={isCenter ? centerCaustic.surfaceRef : undefined}
                  className={`atelier-frame-visual${relationshipVisible && !visitedFrames.has(frame.id) ? ' entry-border-pulse' : ''}`}
                  onPointerMove={isCenter ? centerCaustic.onPointerMove : undefined}
                  onPointerLeave={isCenter ? centerCaustic.onPointerLeave : undefined}
                  initial={shouldAnimateDepth ? { aspectRatio: INITIAL_FRAME_ASPECT } : false}
                  animate={{
                    aspectRatio: shouldAnimateDepth
                      ? (isCenter ? CENTER_ASPECT_KEYFRAMES : OUTER_ASPECT_KEYFRAMES)
                      : (isCenter ? CENTER_FINAL_ASPECT : OUTER_FINAL_ASPECT),
                  }}
                  transition={{
                    duration: shouldAnimateDepth ? DEPTH_DURATION : 0,
                    times: shouldAnimateDepth ? DEPTH_TIMES : undefined,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{
                    border: isSealed
                      ? '1px solid rgba(232,235,238,0.05)'
                      : isCenter
                        ? '1px solid rgba(232,235,238,0.18)'
                        : '1px solid rgba(232,235,238,0.08)',
                    background: isSealed
                      ? 'rgba(6,7,8,0.85)'
                      : isCenter
                        ? 'rgba(218,172,98,0.05)'
                        : 'rgba(232,235,238,0.028)',
                  }}
                >
                  <div
                    className="atelier-frame-surface"
                    style={{
                      background: isSealed
                        ? 'linear-gradient(180deg, rgba(12,13,16,0.98) 0%, rgba(8,9,12,0.95) 100%)'
                        : isCenter
                          ? 'linear-gradient(135deg, rgba(218,172,98,0.12) 0%, rgba(150,165,185,0.06) 100%)'
                          : 'rgba(232,235,238,0.015)',
                      backdropFilter: isSealed ? 'blur(12px)' : 'none',
                      boxShadow: isSealed
                        ? 'inset 0 0 40px rgba(0,0,0,0.9)'
                        : isCenter
                          ? '0 30px 60px -20px rgba(0,0,0,0.8), inset 0 0 40px rgba(218,172,98,0.05)'
                          : 'none',
                      opacity: isSealed ? 0.60 : 1,
                    }}
                  >
                    <FrameSymbol frameId={frame.id} />
                  </div>

                  <motion.div
                    className="atelier-depth-light"
                    aria-hidden="true"
                    initial={shouldAnimateDepth ? { opacity: 0 } : false}
                    animate={{ opacity: shouldAnimateDepth ? TRANSIENT_LIGHT_KEYFRAMES : 0 }}
                    transition={{
                      duration: shouldAnimateDepth ? DEPTH_DURATION : 0,
                      times: shouldAnimateDepth ? DEPTH_TIMES : undefined,
                      ease: 'linear',
                    }}
                  />

                  {isCenter && !isSealed && <div className="atelier-complete-accent" aria-hidden="true" />}

                  {isCenter && !isSealed && (
                    <div
                      className="gallery-caustic atelier-center-caustic"
                      data-glass-caustic
                      aria-hidden="true"
                    />
                  )}
                </motion.div>

                <div className="atelier-frame-label">
                  <div
                    className="t-mono-tag atelier-frame-edition"
                    style={{
                      color: isSealed
                        ? 'rgba(237,236,234,0.10)'
                        : isCenter
                          ? 'rgba(218,172,98,0.25)'
                          : 'rgba(237,236,234,0.20)',
                    }}
                  >
                    {frame.edition}
                  </div>
                  <div
                    className="t-gallery-subtitle atelier-frame-title"
                    style={{
                      color: relationshipVisible
                        ? 'rgba(237,236,234,0.30)'
                        : 'rgba(237,236,234,0.12)',
                    }}
                  >
                    {relationshipVisible ? frame.title : '— — —'}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {hasAnyPresentedRelationship && (
        <motion.div
          initial={shouldAnimateDepth ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ delay: shouldAnimateDepth ? 0.9 : 0, duration: 0.9 }}
          className="atelier-buyer-hint"
        >
          <div className="t-mono-tag" style={{ opacity: 0.18, marginBottom: 4 }}>
            FRAME CURATOR
          </div>
          <div className="t-mono-tag" style={{ opacity: 0.12 }}>
            WITHIN THE DESIGNATED EDITION
          </div>
        </motion.div>
      )}
    </div>
  );
};

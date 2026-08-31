import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PublicEncounterRepresentation } from './PublicEncounterRepresentation';

import {
  RESONANCE_INVITATIONS,
  HELD_RITUAL_CONTENT,
  RAIL_LABELS,
  UNRESOLVED_RITUAL_CONTENT,
  AVAILABLE_BLOCK_REPRESENTATION,
  type RitualContentMode,
  type ResonanceRailId,
} from './resonanceConstants';

export {
  RESONANCE_INVITATIONS,
  RAIL_LABELS,
  type ResonanceRailId,
};

export interface IntersectionEnvironmentProps {
  role?: 'PUBLIC' | 'PRACTITIONER' | 'STEWARD';
  encounterCount?: number;
  isTyping?: boolean;
  typingProgress?: number; // 0.0 to 1.0
  usedRails?: ResonanceRailId[];
  onSelectRail?: (rail: ResonanceRailId) => void;
  selectableTrigger?: ResonanceRailId | 'IMAGE' | null;
  onSelectImage?: () => void;
  stewardImageUrl?: string | null;
  ritualContentMode?: RitualContentMode;
  onArtworkFocusChange?: (focused: boolean) => void;
}

/**
 * Typewriter text hook for prompt blocks
 */
function useTypewriter(targetText: string, active: boolean, speedMs: number = 20) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (!active) {
      setDisplayedText('');
      return;
    }

    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex++;
      setDisplayedText(targetText.slice(0, currentIndex));
      if (currentIndex >= targetText.length) {
        clearInterval(interval);
      }
    }, speedMs);

    return () => clearInterval(interval);
  }, [targetText, active, speedMs]);

  return displayedText;
}

/**
 * Glass Corner Wedges — fills the gap between the PNG's baked border-radius
 * and the square container with a glass-material arc wedge at each corner.
 *
 * The PNG has a ~4.1% border-radius baked into its alpha channel (42px on 1024px).
 * These wedges sit behind the PNG (z-index: 1) and render as a quarter-circle
 * subtraction: a square corner minus the PNG's arc, creating an L-shaped glass nub.
 *
 * Each wedge has:
 *  - A frosted glass fill with subtle gradient
 *  - Two straight edges (along the frame border) and one curved edge (the PNG arc)
 *  - A faint golden caustic shimmer on the curved inner edge
 */
const WEDGE_SIZE = '4.4%'; // slightly larger than the 4.1% PNG radius to ensure coverage

type WedgeCorner = 'tl' | 'tr' | 'br' | 'bl';

const GRADIENT_ORIGINS: Record<WedgeCorner, string> = {
  tl: '100% 100%',
  tr: '0% 100%',
  br: '0% 0%',
  bl: '100% 0%',
};

/**
 * GlassCornerWedge — a single arc-shaped glass wedge in one corner.
 * Accepts a `scatterRef` that the edge-wave animation loop uses to
 * inject time-varying internal scattering (dispersion glow) and
 * edge-reflection intensity when light transits the corner junction.
 */
const GlassCornerWedge = React.forwardRef<
  HTMLDivElement,
  { corner: WedgeCorner }
>(({ corner }, scatterRef) => {
  const posStyle: React.CSSProperties = {
    position: 'absolute',
    width: WEDGE_SIZE,
    height: WEDGE_SIZE,
    zIndex: 3,
    pointerEvents: 'none',
    overflow: 'hidden',
  };

  if (corner === 'tl') { posStyle.top = 0; posStyle.left = 0; }
  if (corner === 'tr') { posStyle.top = 0; posStyle.right = 0; }
  if (corner === 'br') { posStyle.bottom = 0; posStyle.right = 0; }
  if (corner === 'bl') { posStyle.bottom = 0; posStyle.left = 0; }

  const origin = GRADIENT_ORIGINS[corner];

  return (
    <div style={posStyle}>
      {/* Static glass fill */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(circle at ${origin}, transparent 68%, rgba(150,165,185,0.06) 69%, rgba(180,190,200,0.10) 78%, rgba(218,172,98,0.05) 100%)`,
        backdropFilter: 'blur(1.5px)',
      }} />
      {/* Static caustic arc edge */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(circle at ${origin}, transparent 66%, rgba(218,172,98,0.22) 69%, rgba(218,172,98,0.08) 72%, transparent 76%)`,
      }} />
      {/* Static straight-edge border highlights */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderTop: (corner === 'bl' || corner === 'br') ? 'none' : '1px solid rgba(218,172,98,0.12)',
        borderBottom: (corner === 'tl' || corner === 'tr') ? 'none' : '1px solid rgba(218,172,98,0.12)',
        borderLeft: (corner === 'tr' || corner === 'br') ? 'none' : '1px solid rgba(218,172,98,0.12)',
        borderRight: (corner === 'tl' || corner === 'bl') ? 'none' : '1px solid rgba(218,172,98,0.12)',
      }} />
      {/* Dynamic scattering overlay — driven by the edge-wave animation loop.
          When light transits this corner junction:
          - Internal dispersion: radial glow fills the wedge glass
          - Edge reflection: arc border and straight borders brighten
          - boxShadow: outward caustic spill onto surrounding surfaces */}
      <div
        ref={scatterRef}
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0,
          background: `radial-gradient(circle at ${origin}, transparent 50%, rgba(218,172,98,0.35) 70%, rgba(255,240,200,0.18) 85%, rgba(218,172,98,0.08) 100%)`,
          boxShadow: 'none',
          transition: 'none', // driven by rAF, not CSS transitions
        }}
      />
    </div>
  );
});

GlassCornerWedge.displayName = 'GlassCornerWedge';

/**
 * GlassCornerWedges — renders all 4 corner wedges.
 * When `scatterRefs` is provided, each wedge gets a ref for animation.
 * Without refs (e.g. on the FrameInterior Sanctum card), wedges render
 * with static glass material only.
 */
export const GlassCornerWedges: React.FC<{
  scatterRefs?: Record<WedgeCorner, React.RefObject<HTMLDivElement | null>>;
}> = ({ scatterRefs }) => (
  <>
    <GlassCornerWedge corner="tl" ref={scatterRefs?.tl} />
    <GlassCornerWedge corner="tr" ref={scatterRefs?.tr} />
    <GlassCornerWedge corner="br" ref={scatterRefs?.br} />
    <GlassCornerWedge corner="bl" ref={scatterRefs?.bl} />
  </>
);

export const IntersectionEnvironment: React.FC<IntersectionEnvironmentProps> = ({
  role = 'PUBLIC',
  encounterCount = 0,
  isTyping = false,
  typingProgress = 0,
  usedRails = [],
  onSelectRail,
  selectableTrigger = null,
  onSelectImage,
  stewardImageUrl,
  ritualContentMode = 'unresolved',
  onArtworkFocusChange,
}) => {
  const isPublic = role === 'PUBLIC';
  const isSteward = role === 'STEWARD';
  const isPractitioner = role === 'PRACTITIONER';

  // Image source:
  // - PUBLIC: uses '/assets/intersection-public.png' (2 corners cut out in file + center circle cut)
  // - PRACTITIONER (Frame Curator): uses '/api/practitioner-image' (all 4 corners open in file + center circle cut)
  // - STEWARD (Complete Package): uses stewardImageUrl || '/api/steward-image' (100% full unmasked artwork)
  const imageSource = isSteward && stewardImageUrl
    ? stewardImageUrl
    : isPractitioner
      ? '/api/practitioner-image'
      : '/assets/intersection-public.png';

  // Rail mapping: Public uses P1 & P2; Buyer uses P3 & P4
  const leftRailId: ResonanceRailId = isPublic ? 'P1' : 'P3';
  const rightRailId: ResonanceRailId = isPublic ? 'P2' : 'P4';
  const leftCompleted = usedRails.includes(leftRailId);
  const rightCompleted = usedRails.includes(rightRailId);
  const leftReady = selectableTrigger === leftRailId;
  const rightReady = selectableTrigger === rightRailId;
  const imageReady = selectableTrigger === 'IMAGE';

  // Focus hysteresis state
  // Idle state: only the 3 distinct card rectangles can receive mouse enter
  // Focused state: expanded polygon bridge activates to allow smooth cross-card traversal without sinking or flicker
  const [isArtworkFocused, setIsArtworkFocused] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<'left' | 'png' | 'right' | null>(null);
  const arenaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onArtworkFocusChange) {
      onArtworkFocusChange(isArtworkFocused);
    }
  }, [isArtworkFocused, onArtworkFocusChange]);

  const handleCardEnter = (card: 'left' | 'png' | 'right') => {
    setIsArtworkFocused(true);
    setHoveredCard(card);
  };

  const handleArenaLeave = () => {
    setIsArtworkFocused(false);
    setHoveredCard(null);
  };

  // Global pointer tracker to guarantee the polygon focus boundary reliably releases
  // when cursor moves outside the red 8-point polygon bridge
  useEffect(() => {
    if (!isArtworkFocused) return;

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const handleGlobalPointerMove = (e: PointerEvent) => {
      const arena = arenaRef.current;
      if (!arena) return;

      const rect = arena.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;

      const isInsideRect = nx >= 0 && nx <= 1 && ny >= 0 && ny <= 1;
      const isOutsideTL = nx < 0.28 && ny < 0.28 && (nx + ny < 0.28);
      const isOutsideTR = nx > 0.72 && ny < 0.28 && ((1 - nx) + ny < 0.28);
      const isOutsideBL = nx < 0.28 && ny > 0.72 && (nx + (1 - ny) < 0.28);
      const isOutsideBR = nx > 0.72 && ny > 0.72 && ((1 - nx) + (1 - ny) < 0.28);

      const isInsidePolygon = isInsideRect && !isOutsideTL && !isOutsideTR && !isOutsideBL && !isOutsideBR;

      if (!isInsidePolygon) {
        if (!debounceTimer) {
          debounceTimer = setTimeout(() => {
            setIsArtworkFocused(false);
            setHoveredCard(null);
          }, 80);
        }
      } else {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
          debounceTimer = null;
        }
      }
    };

    window.addEventListener('pointermove', handleGlobalPointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [isArtworkFocused]);

  // Progressive Typewriter texts for Left and Right blocks
  const leftActive = encounterCount >= 1;
  const rightActive = encounterCount >= 2;
  const visibleRitualContent = ritualContentMode === 'held'
    ? HELD_RITUAL_CONTENT
    : UNRESOLVED_RITUAL_CONTENT;
  const leftTyped = useTypewriter(visibleRitualContent[leftRailId], leftActive, 20);
  const rightTyped = useTypewriter(visibleRitualContent[rightRailId], rightActive, 20);

  // Mask reveal calculation for 3rd Encounter:
  const revealProgress = useMemo(() => {
    if (encounterCount < 3) return 0;
    if (encounterCount > 3) return 1;
    return isTyping ? typingProgress : 1;
  }, [encounterCount, isTyping, typingProgress]);

  // Public and Practitioner initially meet the same visual representation (2 corners cut).
  // PUBLIC starts with TR/BL baked cut out, and TL/BR masked by SVG. At 3rd encounter, TL/BR masks fade out.
  const publicTlMaskOpacity = isPublic ? Math.max(0, Math.min(1, 1 - revealProgress / 0.5)) : 0;
  const publicBrMaskOpacity = isPublic ? Math.max(0, Math.min(1, 1 - (revealProgress - 0.5) / 0.5)) : 0;

  // PRACTITIONER starts with full 4 corners, so we manually mask TR/BL with SVG to look like Public.
  // At 3rd encounter, TR/BL masks fade out, revealing all 4 corners.
  const practitionerTrMaskOpacity = isPractitioner ? Math.max(0, Math.min(1, 1 - revealProgress / 0.5)) : 0;
  const practitionerBlMaskOpacity = isPractitioner ? Math.max(0, Math.min(1, 1 - (revealProgress - 0.5) / 0.5)) : 0;

  const isMaskActive = publicTlMaskOpacity > 0.001 || publicBrMaskOpacity > 0.001 || practitionerTrMaskOpacity > 0.001 || practitionerBlMaskOpacity > 0.001;

  // ── Synchronized Refractive Light Wave in PNG Edge Waveguides (Response 3+) ──
  // Public Curator: 2 Edges (Left <-> Bottom) oscillating harmonically.
  // Buyer Curator: 4 Edges (Left -> Bottom -> Right -> Top) circulating counter-clockwise.
  const showEdgeWave = encounterCount >= 3;

  const pngLeftEdgeRef = useRef<HTMLDivElement>(null);
  const pngBottomEdgeRef = useRef<HTMLDivElement>(null);
  const pngRightEdgeRef = useRef<HTMLDivElement>(null);
  const pngTopEdgeRef = useRef<HTMLDivElement>(null);

  // Corner scatter refs — driven by the edge-wave loop when light transits each junction
  const wedgeTlRef = useRef<HTMLDivElement>(null);
  const wedgeTrRef = useRef<HTMLDivElement>(null);
  const wedgeBrRef = useRef<HTMLDivElement>(null);
  const wedgeBlRef = useRef<HTMLDivElement>(null);
  const wedgeScatterRefs = useMemo(() => ({
    tl: wedgeTlRef, tr: wedgeTrRef, br: wedgeBrRef, bl: wedgeBlRef,
  }), []);

  useEffect(() => {
    if (!showEdgeWave) return;

    let frameId: number;
    const cycleDuration = isPublic ? 7000 : 8000;
    const startTime = performance.now();

    // ── Helper: apply scatter intensity to a wedge's dynamic overlay ──
    // `intensity` ∈ [0, 1]: 0 = dark, 1 = full caustic glow.
    const applyScatter = (
      ref: React.RefObject<HTMLDivElement | null>,
      intensity: number
    ) => {
      if (!ref.current) return;
      if (intensity < 0.01) {
        ref.current.style.opacity = '0';
        ref.current.style.boxShadow = 'none';
        return;
      }
      ref.current.style.opacity = intensity.toFixed(3);
      const spillR = (intensity * 12).toFixed(1);
      const spillA = (intensity * 0.35).toFixed(2);
      ref.current.style.boxShadow =
        `0 0 ${spillR}px rgba(218,172,98,${spillA}), ` +
        `0 0 ${(intensity * 4).toFixed(1)}px rgba(255,240,200,${(intensity * 0.20).toFixed(2)})`;
    };

    const resetEdge = (ref: React.RefObject<HTMLDivElement | null>) => {
      if (ref.current) {
        ref.current.style.background = 'rgba(218,172,98,0.12)';
        ref.current.style.boxShadow = 'none';
      }
    };

    // ── Helper: build an edge-wave gradient + dispersion for one edge ──
    const applyEdgePulse = (
      ref: React.RefObject<HTMLDivElement | null>,
      progress: number, // 0→1 along the edge
      direction: 'to bottom' | 'to right' | 'to top' | 'to left',
      shadowDir: string  // e.g. '-1px 0' for left edge outward dispersion
    ) => {
      if (!ref.current) return;
      const intensity = Math.pow(Math.sin(Math.PI * progress), 1.1);
      const pct = progress * 100;
      const pStart = Math.max(0, pct - 18).toFixed(1);
      const pEnd = Math.min(100, pct + 18).toFixed(1);
      const peakA = (0.15 + 0.65 * intensity).toFixed(2);
      ref.current.style.background =
        `linear-gradient(${direction}, rgba(218,172,98,0.12) 0%, rgba(218,172,98,0.12) ${pStart}%, rgba(218,172,98,${peakA}) ${pct.toFixed(1)}%, rgba(218,172,98,0.12) ${pEnd}%, rgba(218,172,98,0.12) 100%)`;
      ref.current.style.boxShadow =
        `${shadowDir} ${(intensity * 8).toFixed(1)}px rgba(218,172,98,${(intensity * 0.40).toFixed(2)})`;
    };

    const animateEdgeWave = (now: number) => {
      const elapsed = (now - startTime) % cycleDuration;

      if (isPublic) {
        // ═══ PUBLIC: 2-Edge Oscillation (Left ↔ Bottom) ═══
        // s smoothly oscillates 0 → 1 → 0 via half-cosine.
        // Light path: TL(s=0) → Left edge → BL(s=0.5) → Bottom edge → BR(s=1)
        const s = (1 - Math.cos((2 * Math.PI * elapsed) / cycleDuration)) / 2;

        if (s <= 0.5) {
          const u = s / 0.5; // 0→1 along Left edge (top→bottom)
          applyEdgePulse(pngLeftEdgeRef, u, 'to bottom', '-1px 0');
          resetEdge(pngBottomEdgeRef);
        } else {
          const w = (s - 0.5) / 0.5; // 0→1 along Bottom edge (left→right)
          applyEdgePulse(pngBottomEdgeRef, w, 'to right', '0 1px');
          resetEdge(pngLeftEdgeRef);
        }

        // ── Corner Scattering (phase-distance, not hardcoded) ──
        // Corner phases along the 2-edge path:
        //   TL = 0.0,  BL = 0.5,  BR = 1.0,  TR = unreachable
        const hw2 = 0.08; // Gaussian half-width in s-space
        applyScatter(wedgeTlRef, Math.exp(-Math.pow(s / hw2, 2)));
        applyScatter(wedgeBlRef, Math.exp(-Math.pow((s - 0.5) / hw2, 2)));
        applyScatter(wedgeBrRef, Math.exp(-Math.pow((1 - s) / hw2, 2)));
        applyScatter(wedgeTrRef, 0); // No edge reaches TR in 2-edge mode

      } else {
        // ═══ BUYER/PRACTITIONER: 4-Edge Counter-Clockwise Circulation ═══
        // theta cycles 0 → 1 linearly.
        // Light path: TL(θ=0) → Left → BL(θ=0.25) → Bottom → BR(θ=0.50) → Right → TR(θ=0.75) → Top → TL(θ=1.0≡0)
        const theta = elapsed / cycleDuration;

        if (theta < 0.25) {
          const u = theta / 0.25;
          applyEdgePulse(pngLeftEdgeRef, u, 'to bottom', '-1px 0');
          resetEdge(pngBottomEdgeRef);
          resetEdge(pngRightEdgeRef);
          resetEdge(pngTopEdgeRef);
        } else if (theta < 0.50) {
          const w = (theta - 0.25) / 0.25;
          applyEdgePulse(pngBottomEdgeRef, w, 'to right', '0 1px');
          resetEdge(pngLeftEdgeRef);
          resetEdge(pngRightEdgeRef);
          resetEdge(pngTopEdgeRef);
        } else if (theta < 0.75) {
          const v = (theta - 0.50) / 0.25;
          applyEdgePulse(pngRightEdgeRef, v, 'to top', '1px 0');
          resetEdge(pngLeftEdgeRef);
          resetEdge(pngBottomEdgeRef);
          resetEdge(pngTopEdgeRef);
        } else {
          const z = (theta - 0.75) / 0.25;
          applyEdgePulse(pngTopEdgeRef, z, 'to left', '0 -1px');
          resetEdge(pngLeftEdgeRef);
          resetEdge(pngBottomEdgeRef);
          resetEdge(pngRightEdgeRef);
        }

        // ── Corner Scattering (cyclic phase-distance) ──
        // Corner junction phases: TL=0.0, BL=0.25, BR=0.50, TR=0.75
        // Cyclic distance handles the wrap-around at θ=0/1 seamlessly.
        const hw4 = 0.04; // Gaussian half-width in θ-space (~16% of a quarter-cycle)
        const cyclicDist = (a: number, b: number) => {
          const d = Math.abs(a - b);
          return Math.min(d, 1 - d);
        };
        applyScatter(wedgeTlRef, Math.exp(-Math.pow(cyclicDist(theta, 0.00) / hw4, 2)));
        applyScatter(wedgeBlRef, Math.exp(-Math.pow(cyclicDist(theta, 0.25) / hw4, 2)));
        applyScatter(wedgeBrRef, Math.exp(-Math.pow(cyclicDist(theta, 0.50) / hw4, 2)));
        applyScatter(wedgeTrRef, Math.exp(-Math.pow(cyclicDist(theta, 0.75) / hw4, 2)));
      }

      frameId = requestAnimationFrame(animateEdgeWave);
    };

    frameId = requestAnimationFrame(animateEdgeWave);
    return () => cancelAnimationFrame(frameId);
  }, [showEdgeWave, isPublic]);

  const uniqueMaskId = useMemo(() => `hien-sinh-mask-${Math.random().toString(36).substr(2, 9)}`, []);

  // Spatial stages:
  const isInitial = encounterCount === 0;

  const pngIdleOpacity = isPublic
    ? (isInitial ? 0.44 : 0.13)
    : isSteward
      ? (isInitial ? 0.48 : 0.28) // Reduced to match PRACTITIONER visually since it has no cutouts
      : (isInitial ? 0.60 : 0.40);

  const leftIdleOpacity = isPublic
    ? (isInitial ? 0.46 : (leftActive ? 0.14 : 0.08))
    : (isInitial ? 0.52 : (leftActive ? 0.20 : 0.10));

  const rightIdleOpacity = isPublic
    ? (isInitial ? 0.46 : (rightActive ? 0.14 : 0.08))
    : (isInitial ? 0.52 : (rightActive ? 0.20 : 0.10));

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: isArtworkFocused ? 25 : 1,
        overflow: 'hidden',
        pointerEvents: 'none',
        transition: 'z-index 0s',
      }}
    >
      {/* SVG Mask Definition */}
      <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
        <defs>
          <mask id={uniqueMaskId} maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox">
            <rect width="1" height="1" fill="white" />
            
            {/* PUBLIC Curator: Masks Top-Left and Bottom-Right corners initially */}
            {publicTlMaskOpacity > 0.001 && (
              <polygon points="0,0 0.18,0 0,0.18" fill="black" opacity={publicTlMaskOpacity} />
            )}
            {publicBrMaskOpacity > 0.001 && (
              <polygon points="0.82,1 1,1 1,0.82" fill="black" opacity={publicBrMaskOpacity} />
            )}
            
            {/* PRACTITIONER (Frame Curator): Masks Top-Right and Bottom-Left corners initially
                to match the baked cutouts of the Public Curator representation. */}
            {practitionerTrMaskOpacity > 0.001 && (
              <polygon points="0.82,0 1,0 1,0.18" fill="black" opacity={practitionerTrMaskOpacity} />
            )}
            {practitionerBlMaskOpacity > 0.001 && (
              <polygon points="0,0.82 0,1 0.18,1" fill="black" opacity={practitionerBlMaskOpacity} />
            )}
          </mask>
        </defs>
      </svg>

      {/* Atmospheric backdrop */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backdropFilter: isPublic ? 'blur(6px)' : 'blur(2px)',
        background: isPublic ? 'rgba(6,7,8,0.38)' : 'rgba(6,7,8,0.15)',
        pointerEvents: 'none',
      }} />

      {/* Ambient background representation: Rendered in PUBLIC mode for layered depth */}
      {isPublic && (
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.28,
          filter: 'blur(8px)',
          transform: 'scale(1.02)',
          pointerEvents: 'none',
        }}>
          <PublicEncounterRepresentation />
        </div>
      )}

      {/* ── EXPANDED HYSTERESIS ARENA (Active ONLY when focused) ── */}
      {/* Creates the continuous polygon bridge across Left -> PNG -> Right to prevent edge flicker & sinking */}
      <div
        ref={arenaRef}
        onMouseLeave={handleArenaLeave}
        style={{
          position: 'absolute',
          left: 'clamp(10px, 2.5vw, 40px)',
          right: 'clamp(10px, 2.5vw, 40px)',
          top: '50%',
          transform: 'translateY(-50%)',
          height: 'min(520px, 52vw, 62vh)',
          pointerEvents: isArtworkFocused ? 'auto' : 'none',
          zIndex: 25,
          clipPath: 'polygon(0% 28%, 28% 0%, 72% 0%, 100% 28%, 100% 72%, 72% 100%, 28% 100%, 0% 72%)',
        }}
      />

      {/* ── CENTER: Permitted PNG Image with Watermark / Hover & Mask Reveal ── */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: isArtworkFocused ? 50 : 5,
        pointerEvents: 'none',
      }}>
        {/* PNG Individual Hitbox */}
        <div
          onMouseEnter={() => handleCardEnter('png')}
          onMouseLeave={() => {
            if (!isArtworkFocused) setHoveredCard(null);
          }}
          onClick={() => {
            if (imageReady && onSelectImage) onSelectImage();
          }}
          role={onSelectImage ? 'button' : undefined}
          tabIndex={imageReady ? 0 : -1}
          aria-disabled={onSelectImage ? !imageReady : undefined}
          aria-label={onSelectImage ? (imageReady ? 'Continue the encounter through the image' : 'Image encounter is not yet available') : undefined}
          onKeyDown={(event) => {
            if (imageReady && onSelectImage && (event.key === 'Enter' || event.key === ' ')) {
              event.preventDefault();
              onSelectImage();
            }
          }}
          style={{
            position: 'absolute',
            inset: isArtworkFocused ? -32 : 0,
            pointerEvents: 'auto',
            cursor: imageReady && onSelectImage ? 'pointer' : 'crosshair',
            zIndex: 30,
          }}
        />

        <div
          style={{
            position: 'relative',
            width: 'min(460px, 44vw, 54vh)',
            aspectRatio: '1 / 1',
            pointerEvents: 'none',
            transition: 'opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), filter 0.45s ease, box-shadow 0.45s ease, border-color 0.45s ease, transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: hoveredCard === 'png' ? 'scale(1.02)' : 'scale(1)',
            opacity: isArtworkFocused ? 1.0 : pngIdleOpacity,
            filter: isArtworkFocused
              ? 'grayscale(0%) contrast(1.15) blur(0px)'
              : (isPublic
                ? (isInitial ? 'grayscale(15%) contrast(1.08) blur(0.2px)' : 'grayscale(45%) contrast(1.02) blur(1.5px)')
                : (isInitial ? 'grayscale(10%) contrast(1.08) blur(0.2px)' : 'grayscale(25%) contrast(1.05) blur(0.8px)')),
            borderTop: encounterCount >= 3 && !isPublic ? '1px solid rgba(218,172,98,0.25)' : '1px solid rgba(232,235,238,0.04)',
            borderRight: encounterCount >= 3 && !isPublic ? '1px solid rgba(218,172,98,0.25)' : '1px solid rgba(232,235,238,0.04)',
            borderLeft: encounterCount >= 3 ? '1px solid rgba(218,172,98,0.25)' : '1px solid rgba(232,235,238,0.06)',
            borderBottom: encounterCount >= 3 ? '1px solid rgba(218,172,98,0.25)' : '1px solid rgba(232,235,238,0.06)',
            boxShadow: isArtworkFocused
              ? '0 24px 70px rgba(0,0,0,0.98), 0 0 45px rgba(218,172,98,0.28), -6px 6px 30px rgba(218,172,98,0.22)'
              : (isInitial
                ? '0 0 35px rgba(0,0,0,0.65), 0 0 16px rgba(218,172,98,0.08)'
                : (encounterCount >= 3
                  ? '0 0 24px rgba(0,0,0,0.5), -2px 2px 10px rgba(218,172,98,0.08)'
                  : '0 0 20px rgba(0,0,0,0.4)')),
          }}
        >
          {/* ── BACKLIGHT & OPTICAL AURA LAYER (Radiates through Alpha=0 Apertures for Public/Practitioner) ── */}
          {!isSteward && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 1,
                pointerEvents: 'none',
                overflow: 'hidden',
              }}
            >
              {/* Radiant Center Core Glow */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '44%', // matches r=22% aperture (diameter 44%)
                  height: '44%',
                  borderRadius: '50%',
                  background: isPublic
                    ? 'radial-gradient(circle at center, rgba(218,172,98,0.24) 0%, rgba(218,172,98,0.09) 45%, rgba(150,165,185,0.03) 70%, transparent 100%)'
                    : 'radial-gradient(circle at center, rgba(218,172,98,0.32) 0%, rgba(218,172,98,0.12) 50%, transparent 100%)',
                  boxShadow: 'inset 0 0 22px rgba(218,172,98,0.16), 0 0 36px rgba(218,172,98,0.14)',
                  border: '1px solid rgba(218,172,98,0.20)',
                }}
              />

              {/* Concentric Optical Lens Ring around Center */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '45.5%',
                  height: '45.5%',
                  borderRadius: '50%',
                  border: '1px dashed rgba(218,172,98,0.14)',
                  pointerEvents: 'none',
                }}
              />

              {/* Public Top-Right Aperture Caustic Glow */}
              {isPublic && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '18%',
                    height: '18%',
                    background: 'radial-gradient(circle at 100% 0%, rgba(218,172,98,0.18) 0%, rgba(218,172,98,0.04) 65%, transparent 100%)',
                    borderBottom: '1px solid rgba(218,172,98,0.14)',
                    borderLeft: '1px solid rgba(218,172,98,0.14)',
                  }}
                />
              )}

              {/* Public Bottom-Left Aperture Caustic Glow */}
              {isPublic && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '18%',
                    height: '18%',
                    background: 'radial-gradient(circle at 0% 100%, rgba(218,172,98,0.18) 0%, rgba(218,172,98,0.04) 65%, transparent 100%)',
                    borderTop: '1px solid rgba(218,172,98,0.14)',
                    borderRight: '1px solid rgba(218,172,98,0.14)',
                  }}
                />
              )}
            </div>
          )}

          {/* Masked / Baked PNG Image */}
          {isSteward ? (
            <motion.div
              layoutId="steward-canonical-masterpiece"
              style={{
                position: 'relative',
                zIndex: 2,
                width: '100%',
                height: '100%',
                backgroundImage: `url(${imageSource})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
              transition={{ type: "spring", stiffness: 180, damping: 24, mass: 1 }}
            />
          ) : (
            <div
              style={{
                position: 'relative',
                zIndex: 2,
                width: '100%',
                height: '100%',
                backgroundImage: `url(${imageSource})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                mask: isMaskActive ? `url(#${uniqueMaskId})` : 'none',
                WebkitMask: isMaskActive ? `url(#${uniqueMaskId})` : 'none',
              }}
            />
          )}

          {/* Glass Corner Wedges: fills the gap between PNG rounded corners and square frame */}
          <GlassCornerWedges scatterRefs={wedgeScatterRefs} />

          {/* Optical Left Edge Waveguide */}
          {showEdgeWave && (
            <div
              ref={pngLeftEdgeRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                width: 1.5,
                pointerEvents: 'none',
                zIndex: 10,
                background: 'rgba(218,172,98,0.12)',
                transition: 'box-shadow 0.1s ease',
              }}
            />
          )}

          {/* Optical Bottom Edge Waveguide */}
          {showEdgeWave && (
            <div
              ref={pngBottomEdgeRef}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: 1.5,
                pointerEvents: 'none',
                zIndex: 10,
                background: 'rgba(218,172,98,0.12)',
                transition: 'box-shadow 0.1s ease',
              }}
            />
          )}

          {/* Optical Right Edge Waveguide (Buyer Curator 4-edge cycle) */}
          {showEdgeWave && !isPublic && (
            <div
              ref={pngRightEdgeRef}
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                width: 1.5,
                pointerEvents: 'none',
                zIndex: 10,
                background: 'rgba(218,172,98,0.12)',
                transition: 'box-shadow 0.1s ease',
              }}
            />
          )}

          {/* Optical Top Edge Waveguide (Buyer Curator 4-edge cycle) */}
          {showEdgeWave && !isPublic && (
            <div
              ref={pngTopEdgeRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 1.5,
                pointerEvents: 'none',
                zIndex: 10,
                background: 'rgba(218,172,98,0.12)',
                transition: 'box-shadow 0.1s ease',
              }}
            />
          )}
        </div>
      </div>

      {/* ── LEFT: Left Rectangular Block (P1 in Public, P3 in Buyer) ── */}
      <div
        style={{
          position: 'absolute',
          left: 'clamp(20px, 3.8vw, 64px)',
          top: '50%',
          transform: hoveredCard === 'left' ? 'translateY(-50%) scale(1.02)' : 'translateY(-50%)',
          width: 'clamp(210px, 19.5vw, 250px)',
          height: 154,
          boxSizing: 'border-box',
          padding: '14px 16px',
          background: isArtworkFocused ? 'rgba(8, 10, 14, 0.96)' : (isInitial ? 'rgba(8, 10, 14, 0.38)' : 'rgba(8, 10, 14, 0.06)'),
          backdropFilter: isArtworkFocused ? 'blur(24px)' : (isInitial ? 'blur(8px)' : 'blur(2px)'),
          WebkitBackdropFilter: isArtworkFocused ? 'blur(24px)' : (isInitial ? 'blur(8px)' : 'blur(2px)'),
          border: `1px solid rgba(218, 172, 98, ${hoveredCard === 'left' ? 0.75 : isArtworkFocused ? 0.45 : (isInitial ? 0.25 : (leftActive ? 0.12 : 0.05))})`,
          boxShadow: isArtworkFocused
            ? '0 24px 60px rgba(0,0,0,0.95), 0 0 35px rgba(218,172,98,0.25)'
            : (isInitial ? '0 8px 24px rgba(0,0,0,0.45), 0 0 14px rgba(218,172,98,0.08)' : '0 4px 16px rgba(0,0,0,0.2)'),
          opacity: isArtworkFocused ? 1.0 : leftIdleOpacity,
          transition: 'opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), background 0.45s ease, border-color 0.45s ease, box-shadow 0.45s ease',
          pointerEvents: 'auto',
          cursor: onSelectRail && leftReady ? 'pointer' : 'default',
          zIndex: isArtworkFocused ? 50 : 5,
        }}
      >
        {/* Left Block Individual Hitbox */}
        <div
          onMouseEnter={() => handleCardEnter('left')}
          onMouseLeave={() => {
            if (!isArtworkFocused) setHoveredCard(null);
          }}
          onClick={() => {
            if (leftReady && onSelectRail) {
              onSelectRail(leftRailId);
            }
          }}
          style={{
            position: 'absolute',
            inset: isArtworkFocused ? -28 : 0,
            pointerEvents: 'auto',
            cursor: onSelectRail && leftReady ? 'pointer' : 'default',
            zIndex: 30,
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span
            className="t-mono-tag"
            style={{
              color: isArtworkFocused ? 'rgba(218,172,98,0.98)' : (isInitial ? 'rgba(218,172,98,0.85)' : (leftActive ? 'rgba(218,172,98,0.65)' : 'rgba(237,236,234,0.3)')),
              fontSize: '0.60rem',
              letterSpacing: '0.18em',
              transition: 'color 0.4s ease',
            }}
          >
            {RAIL_LABELS[leftRailId]}
          </span>
          <span
            className="t-mono-tag"
            style={{
              fontSize: '0.48rem',
              color: leftCompleted || leftReady ? 'rgba(218,172,98,0.62)' : (isArtworkFocused ? 'rgba(237,236,234,0.50)' : 'rgba(237,236,234,0.2)'),
            }}
          >
            {leftCompleted ? 'OPENED' : leftReady ? 'READY' : 'LOCKED'}
          </span>
        </div>

        <div style={{
          height: 94,
          overflow: 'hidden',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.62rem',
          lineHeight: 1.55,
          color: isArtworkFocused ? 'rgba(237,236,234,0.98)' : (isInitial ? 'rgba(237,236,234,0.65)' : 'rgba(237,236,234,0.30)'),
          transition: 'color 0.4s ease',
        }}>
          {leftCompleted || leftActive
            ? leftTyped
            : leftReady
              ? AVAILABLE_BLOCK_REPRESENTATION[leftRailId]
              : '—'}
        </div>
      </div>

      {/* ── RIGHT: Right Rectangular Block (P2 in Public, P4 in Buyer) ── */}
      <div
        style={{
          position: 'absolute',
          right: 'clamp(20px, 3.8vw, 64px)',
          top: '50%',
          transform: hoveredCard === 'right' ? 'translateY(-50%) scale(1.02)' : 'translateY(-50%)',
          width: 'clamp(210px, 19.5vw, 250px)',
          height: 154,
          boxSizing: 'border-box',
          padding: '14px 16px',
          background: isArtworkFocused ? 'rgba(8, 10, 14, 0.96)' : (isInitial ? 'rgba(8, 10, 14, 0.38)' : 'rgba(8, 10, 14, 0.06)'),
          backdropFilter: isArtworkFocused ? 'blur(24px)' : (isInitial ? 'blur(8px)' : 'blur(2px)'),
          WebkitBackdropFilter: isArtworkFocused ? 'blur(24px)' : (isInitial ? 'blur(8px)' : 'blur(2px)'),
          border: `1px solid rgba(218, 172, 98, ${hoveredCard === 'right' ? 0.75 : isArtworkFocused ? 0.45 : (isInitial ? 0.25 : (rightActive ? 0.12 : 0.05))})`,
          boxShadow: isArtworkFocused
            ? '0 24px 60px rgba(0,0,0,0.95), 0 0 35px rgba(218,172,98,0.25)'
            : (isInitial ? '0 8px 24px rgba(0,0,0,0.45), 0 0 14px rgba(218,172,98,0.08)' : '0 4px 16px rgba(0,0,0,0.2)'),
          opacity: isArtworkFocused ? 1.0 : rightIdleOpacity,
          transition: 'opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), background 0.45s ease, border-color 0.45s ease, box-shadow 0.45s ease',
          pointerEvents: 'auto',
          cursor: onSelectRail && rightReady ? 'pointer' : 'default',
          zIndex: isArtworkFocused ? 50 : 5,
        }}
      >
        {/* Right Block Individual Hitbox */}
        <div
          onMouseEnter={() => handleCardEnter('right')}
          onMouseLeave={() => {
            if (!isArtworkFocused) setHoveredCard(null);
          }}
          onClick={() => {
            if (rightReady && onSelectRail) {
              onSelectRail(rightRailId);
            }
          }}
          style={{
            position: 'absolute',
            inset: isArtworkFocused ? -28 : 0,
            pointerEvents: 'auto',
            cursor: onSelectRail && rightReady ? 'pointer' : 'default',
            zIndex: 30,
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span
            className="t-mono-tag"
            style={{
              color: isArtworkFocused ? 'rgba(218,172,98,0.98)' : (isInitial ? 'rgba(218,172,98,0.85)' : (rightActive ? 'rgba(218,172,98,0.65)' : 'rgba(237,236,234,0.3)')),
              fontSize: '0.60rem',
              letterSpacing: '0.18em',
              transition: 'color 0.4s ease',
            }}
          >
            {RAIL_LABELS[rightRailId]}
          </span>
          <span
            className="t-mono-tag"
            style={{
              fontSize: '0.48rem',
              color: rightCompleted || rightReady ? 'rgba(218,172,98,0.62)' : (isArtworkFocused ? 'rgba(237,236,234,0.50)' : 'rgba(237,236,234,0.2)'),
            }}
          >
            {rightCompleted ? 'OPENED' : rightReady ? 'READY' : 'LOCKED'}
          </span>
        </div>

        <div style={{
          height: 94,
          overflow: 'hidden',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.62rem',
          lineHeight: 1.55,
          color: isArtworkFocused ? 'rgba(237,236,234,0.98)' : (isInitial ? 'rgba(237,236,234,0.65)' : 'rgba(237,236,234,0.30)'),
          transition: 'color 0.4s ease',
        }}>
          {rightCompleted || rightActive
            ? rightTyped
            : rightReady
              ? AVAILABLE_BLOCK_REPRESENTATION[rightRailId]
              : '—'}
        </div>
      </div>

      {/* Subtle glass reflection gradient */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(232,235,238,0.026) 0%, rgba(0,0,0,0) 58%)',
        border: '1px solid rgba(232,235,238,0.025)',
        pointerEvents: 'none',
      }} />
    </div>
  );
};

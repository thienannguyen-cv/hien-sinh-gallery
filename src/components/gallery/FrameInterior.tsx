'use client';
/**
 * FrameInterior — Encounter Space Within a Frame
 *
 * When a visitor selects a Frame or Package from the Atelier grid,
 * they step into this immersive interior. The FrameSymbol occupies
 * the central field as a contemplation anchor. A glass-partition
 * drawer on the right edge reveals acquisition or accession content.
 *
 * This component carries no wallet, signature, or transaction authority.
 * Held relationships suppress price and purchase actions per ontology.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowUpRight, X, Sparkle, Lock, ShieldCheck } from '@phosphor-icons/react';
import { FrameSymbol } from './FrameSymbol';
import { useGlassCaustic } from './glassCaustic';
import { OverlayRegistration, useOverlayContext } from '../../context/OverlayContext';
import { HIEN_SINH_CONTRACT } from '../../generated/contract/hienSinhInterface';
import { RELEASE_COORDINATES } from '../../generated/release/releaseCoordinates';
import { useReleasePreviewMode } from '../../security/useReleasePreviewMode';
import { ArchiveCuratorTerminal } from './ArchiveCuratorTerminal';
import { GlassCornerWedges } from './IntersectionEnvironment';
import { WalletConnectButton } from './WalletConnectButton';
import { CompletePurchase } from './CompletePurchase';
import { FramePurchase } from './FramePurchase';

import { useWallet } from '../../wallet/WalletContext';
import { submitEncounterRequest } from '../../services/encounterSubmission';

declare const __HIEN_SINH_LOCAL_PRESENTATION_ENABLED__: boolean;

const FRAME_PRICE_LABEL = `${HIEN_SINH_CONTRACT.constants.framePriceEth} ETH`;
const COMPLETE_PACKAGE_PRICE_LABEL = `${HIEN_SINH_CONTRACT.constants.completePackagePriceEth} ETH`;
const MAX_SUPPLY = HIEN_SINH_CONTRACT.constants.maxFrameSupply;

interface FrameInteriorProps {
  frameId: number;
  frameTitle: string;
  frameEdition: string;
  relationshipHeld: boolean;
  isCompletePackage: boolean;
  curatorRole: 'PRACTITIONER' | 'STEWARD';
  stewardImageUrl?: string | null;
}

/* ── Drawer spring: heavy glass partition feel ── */
const DRAWER_SPRING = { type: 'spring' as const, damping: 34, stiffness: 260, mass: 1.1 };
const DRAWER_WIDTH = 440;

export const FrameInterior: React.FC<FrameInteriorProps> = ({
  frameId,
  frameTitle,
  frameEdition,
  relationshipHeld,
  isCompletePackage,
  curatorRole,
  stewardImageUrl,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(!relationshipHeld);
  const { address, provider } = useWallet();
  
  const caustic = useGlassCaustic();

  const isReleasePreview = useReleasePreviewMode();
  const showEvidenceAffordances = RELEASE_COORDINATES.publicRepoPublished || isReleasePreview;

  /* Package 05 retains the Three Brushstrokes locus. It is a private,
   * non-qualifying contribution: it neither opens Frame Curator nor grants
   * acquisition, stewardship, or image authority. */
  type BrushstrokeStep = 'brushstrokes' | 'wallet_review' | 'submitting' | 'submitted' | 'error';
  type BrushstrokeAuthorityStatus = 'LOADING' | 'NONE' | 'PENDING_ARTIST_REVIEW' | 'ENCOUNTER_EVIDENCE_NOT_CONFIRMED' | 'ARTIST_CONFIRMED' | 'SERVICE_UNAVAILABLE';
  const [brushstrokeStep, setBrushstrokeStep] = useState<BrushstrokeStep>('brushstrokes');
  const [brushstrokes, setBrushstrokes] = useState(['', '', '']);
  const [brushstrokeError, setBrushstrokeError] = useState<string | null>(null);
  const [brushstrokeAuthorityStatus, setBrushstrokeAuthorityStatus] = useState<BrushstrokeAuthorityStatus>('NONE');
  const brushstrokesComplete = brushstrokes.every(value => value.trim().length > 0 && value.length <= 4000);

  const addressRef = React.useRef(address);
  addressRef.current = address;

  useEffect(() => {
    if (!address) {
      setBrushstrokeAuthorityStatus('NONE');
      setBrushstrokeStep('brushstrokes');
      if (typeof document !== 'undefined') {
        document.cookie = 'hs-frame-session=; Path=/; SameSite=Lax; Max-Age=0';
      }
      return;
    }
    setBrushstrokeAuthorityStatus('LOADING');
    setBrushstrokeStep('brushstrokes');
    let cancelled = false;
    const queryAddress = address;
    const refresh = async () => {
      try {
        const response = await fetch('/api/encounter-request', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          cache: 'no-store',
          body: JSON.stringify({ action: 'status', walletAddress: queryAddress }),
        });
        if (cancelled || addressRef.current?.toLowerCase() !== queryAddress.toLowerCase()) return;
        if (!response.ok) {
          setBrushstrokeAuthorityStatus('SERVICE_UNAVAILABLE');
          return;
        }
        const result = await response.json();
        if (cancelled || addressRef.current?.toLowerCase() !== queryAddress.toLowerCase()) return;
        if (!['NONE', 'PENDING', 'CONFIRMED', 'DECLINED', 'REVOKED'].includes(result.status)) {
          setBrushstrokeAuthorityStatus('SERVICE_UNAVAILABLE');
          return;
        }
        setBrushstrokeAuthorityStatus(
          result.status === 'CONFIRMED'
            ? 'ARTIST_CONFIRMED'
            : result.status === 'PENDING'
            ? 'PENDING_ARTIST_REVIEW'
            : result.status === 'DECLINED' || result.status === 'REVOKED'
            ? 'ENCOUNTER_EVIDENCE_NOT_CONFIRMED'
            : 'NONE'
        );
      } catch {
        if (!cancelled && addressRef.current?.toLowerCase() === queryAddress.toLowerCase()) {
          setBrushstrokeAuthorityStatus('SERVICE_UNAVAILABLE');
        }
      }
    };
    void refresh();
    const interval = window.setInterval(refresh, 10000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [address]);
  const submitBrushstrokes = useCallback(async () => {
    if (!brushstrokesComplete || !address || !provider) return;
    const submittedAddress = address;
    setBrushstrokeError(null); setBrushstrokeStep('submitting');
    try {
      await submitEncounterRequest({address:submittedAddress,contributions:brushstrokes,provider});
      const accounts = await provider.request({method:'eth_accounts'});
      if (!Array.isArray(accounts) || String(accounts[0]).toLowerCase() !== submittedAddress.toLowerCase()) {
        throw new Error('The request was saved for the previous address. Your wallet has changed.');
      }
      setBrushstrokeAuthorityStatus('PENDING_ARTIST_REVIEW'); setBrushstrokeStep('submitted');
    } catch(error) {
      setBrushstrokeError(error instanceof Error ? error.message : 'Submission was not completed.');
      setBrushstrokeStep('error');
    }
  }, [address,provider,brushstrokes,brushstrokesComplete]);

  const [showCurator, setShowCurator] = useState(false);
  const { isOverlayOpen } = useOverlayContext();
  // Frame Curator availability is not evidence of stewardship, acquisition,
  // wallet control, a Three Brushstrokes submission, or Artist confirmation.
  // The future image boundary selects representation server-side.
  const canOpenFrameCurator = true;

  const priceLabel = isCompletePackage ? COMPLETE_PACKAGE_PRICE_LABEL : FRAME_PRICE_LABEL;

  const toggleDrawer = useCallback(() => {
    setDrawerOpen(prev => !prev);
  }, []);

  const handleRoomClick = useCallback((e: React.MouseEvent) => {
    if (showCurator) return;
    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Do not intercept interactive elements or the center artwork anchor
    if (
      target.closest('button') ||
      target.closest('a') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('.frame-curator-entry') ||
      target.closest('.frame-details-entry') ||
      target.closest('.frame-interior-artwork')
    ) {
      return;
    }

    if (!drawerOpen) {
      setDrawerOpen(true);
    }
  }, [showCurator, drawerOpen]);

  return (
    <motion.div
      key={`frame-interior-${frameId}`}
      initial={{ opacity: 0, scale: 1.03, filter: 'blur(5px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.97, filter: 'blur(3px)' }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      onClick={handleRoomClick}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--g-black)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* ── Architectural lines ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(232,235,238,0.05) 25%, rgba(232,235,238,0.08) 50%, rgba(232,235,238,0.05) 75%, transparent)',
      }} />
      <div style={{
        position: 'absolute', bottom: 36, left: '12%', right: '12%', height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(232,235,238,0.03) 30%, rgba(232,235,238,0.05) 50%, rgba(232,235,238,0.03) 70%, transparent)',
      }} />

      {/* ── Ring / Frame label ── */}
      <div style={{
        position: 'absolute', top: 18, right: 36, zIndex: 10,
      }}>
        <span className="t-mono-tag" style={{ opacity: 0.20 }}>
          FRAME {String(frameId).padStart(2, '0')} / {String(MAX_SUPPLY).padStart(2, '0')}
        </span>
      </div>

      {/* ── Frame composition: artwork and its curator-side architectural edge ── */}
      <motion.div 
        layout
        className="frame-interior-composition"
        data-steward-focus={curatorRole === 'STEWARD' && !showCurator}
        initial={false}
        transition={{ type: "spring", stiffness: 180, damping: 24, mass: 1 }}
      >
        <motion.div
          layout
          ref={caustic.surfaceRef}
          className="frame-interior-artwork"
          onPointerMove={isCompletePackage ? caustic.onPointerMove : undefined}
          onPointerLeave={isCompletePackage ? caustic.onPointerLeave : undefined}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ layout: { type: "spring", stiffness: 180, damping: 24, mass: 1 }, opacity: { delay: 0.15, duration: 0.9 } }}
          style={{
            aspectRatio: isCompletePackage ? '1.8 / 1' : '1.6 / 1',
            border: isCompletePackage
              ? '1px solid rgba(218,172,98,0.22)'
              : '1px solid rgba(232,235,238,0.12)',
            boxShadow: isCompletePackage
              ? '0 0 140px rgba(212, 175, 55, 0.12), 0 0 50px rgba(255, 255, 255, 0.04), inset 0 0 80px rgba(0,0,0,0.85)'
              : '0 0 120px rgba(212, 175, 55, 0.08), 0 0 40px rgba(255, 255, 255, 0.03), inset 0 0 80px rgba(0,0,0,0.8)',
            background: 'linear-gradient(135deg, rgba(218,172,98,0.06) 0%, rgba(150,165,185,0.02) 100%)',
          }}
        >
        <FrameSymbol frameId={frameId} />

        {/* Subtle Frosted Membrane / Vignette Spotlight from canonical SanctumGallery */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, rgba(218,172,98,0.05) 0%, transparent 60%)',
          filter: 'blur(20px)',
          pointerEvents: 'none',
        }} />

        {/* Package 05 top accent */}
        {isCompletePackage && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(218,172,98,0.4) 30%, rgba(218,172,98,0.6) 50%, rgba(218,172,98,0.4) 70%, transparent)',
          }} />
        )}

        {/* Caustic for Package 05 */}
        {isCompletePackage && (
          <div
            className="gallery-caustic"
            data-glass-caustic
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse 60% 50% at var(--caustic-x, 30%) var(--caustic-y, 25%), rgba(218,172,98,0.072) 0%, rgba(218,172,98,0.024) 40%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: 3,
              mixBlendMode: 'screen',
            }}
          />
        )}
        {/* ── Recessed Frame title inside symbol container ── */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '10%',
            right: '10%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          {/* Top subtle line */}
          <div style={{ width: '100%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(237,236,234,0.06), transparent)' }} />
          
          <span className="t-gallery-subtitle" style={{
            color: 'rgba(237,236,234,0.08)',
            fontSize: '0.65rem',
            letterSpacing: '0.40em',
            textAlign: 'center',
          }}>
            {frameEdition.split('/')[0].trim().toUpperCase()} &mdash; {frameTitle.toUpperCase()}
          </span>

          {/* Bottom subtle line */}
          <div style={{ width: '100%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(237,236,234,0.03), transparent)' }} />
        </div>
        </motion.div>

        <AnimatePresence>
          {canOpenFrameCurator && !showCurator && (
            <motion.button
              type="button"
              aria-label={`Meet the ${curatorRole === 'STEWARD' ? 'Complete' : 'Frame'} Curator`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ delay: 0.55, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setShowCurator(true)}
              className="frame-curator-entry"
              data-gallery-surface-control
              inert={isOverlayOpen}
              aria-hidden={isOverlayOpen || undefined}
              style={{ visibility: isOverlayOpen ? 'hidden' : 'visible' }}
            >
              <span className="frame-curator-entry__rail" aria-hidden="true" />
              <span className="frame-curator-entry__label" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="t-mono-tag" style={{ opacity: 0.25, fontSize: '0.45rem' }}>FRAME CURATOR</span>
                <span className="t-mono-tag">INITIATE DIALOGUE</span>
              </span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* ── Steward Canonical Masterpiece on Sanctum Card ── */}
        {/* Anchored to the composition container (the card itself) for semantic centering.
            When Frame Curator opens, this element transforms physically via shared layoutId
            into the Curator chamber. When closed, it transforms back onto the card. */}
        {curatorRole === 'STEWARD' && !showCurator && (
          <motion.div
            layoutId="steward-canonical-masterpiece"
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 6,
              pointerEvents: 'none',
            }}
            transition={{ type: "spring", stiffness: 180, damping: 24, mass: 1 }}
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                aspectRatio: '1 / 1',
                backgroundImage: `url(${stewardImageUrl || '/assets/intersection-public.png'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: '0 24px 80px rgba(0,0,0,0.85), 0 0 40px rgba(218,172,98,0.14), 0 0 2px rgba(218,172,98,0.40)',
              }}
            >
              <GlassCornerWedges />
            </div>
          </motion.div>
        )}

      </motion.div>

      {/* The dossier opens from the viewport boundary, not from the artwork. */}
      <AnimatePresence>
        {!drawerOpen && (
          <motion.button
            type="button"
            aria-label="Open acquisition details"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 6 }}
            transition={{ delay: 0.55, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            onClick={toggleDrawer}
            className="frame-details-entry"
            data-gallery-surface-control
            inert={isOverlayOpen}
            aria-hidden={isOverlayOpen || undefined}
            style={{ visibility: isOverlayOpen ? 'hidden' : 'visible' }}
          >
            <span className="frame-details-entry__rail" aria-hidden="true" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Curator Terminal Overlay ── */}
      <AnimatePresence>
        {showCurator && (
          <motion.div
            key="archive-curator-terminal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              inset: '5vh 5vw',
              zIndex: 2100,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <OverlayRegistration id={`frame-interior-curator-${frameId}`} />
            <div
              style={{
                position: 'relative',
                flex: 1,
                border: '1px solid rgba(232,235,238,0.15)',
                boxShadow: `
                  inset 0 1px 0 rgba(255,255,255,0.10),
                  inset 0 -1px 0 rgba(0,0,0,0.3),
                  0 40px 120px rgba(0,0,0,0.85)
                `,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Glass reflection top edge */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 1,
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.14) 25%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0.14) 75%, transparent 100%)',
                zIndex: 1,
                pointerEvents: 'none',
              }} />

              {/* Ambient glass glow */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(ellipse at 70% 20%, rgba(218,172,98,0.04) 0%, transparent 55%)',
                pointerEvents: 'none',
              }} />

              <ArchiveCuratorTerminal
                onClose={() => setShowCurator(false)}
                role={curatorRole}
                stewardImageUrl={stewardImageUrl}
                frameId={String(frameId).padStart(2, '0')}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Glass Partition Drawer ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Scrim */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={toggleDrawer}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(4,5,6,0.40)',
                zIndex: 30,
              }}
            />

            {/* Drawer panel */}
            <motion.div
              initial={{ x: DRAWER_WIDTH + 20 }}
              animate={{ x: 0 }}
              exit={{ x: DRAWER_WIDTH + 20 }}
              transition={DRAWER_SPRING}
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                width: DRAWER_WIDTH,
                maxWidth: '88vw',
                background: 'rgba(8,10,13,0.94)',
                borderLeft: '1px solid rgba(232,235,238,0.10)',
                backdropFilter: 'blur(28px) saturate(160%) contrast(1.04)',
                WebkitBackdropFilter: 'blur(28px) saturate(160%) contrast(1.04)',
                boxShadow: '-24px 0 80px rgba(0,0,0,0.7), inset 1px 0 0 rgba(255,255,255,0.04)',
                zIndex: 40,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <OverlayRegistration id={`frame-interior-drawer-${frameId}`} />
              {/* Drawer header */}
              <div className="frame-dossier-header">
                <div>
                  <span className="t-mono-tag" style={{
                    color: isCompletePackage ? 'rgba(218,172,98,0.70)' : 'rgba(232,235,238,0.35)',
                    letterSpacing: '0.22em',
                  }}>
                    {relationshipHeld
                      ? (isCompletePackage ? 'DESIGNATED RELATION' : 'PRACTICE RELATION')
                      : (isCompletePackage ? 'FRAME 05 · PAINTING RELATION' : 'FRAME PRACTICE')}
                  </span>
                  <h2 className="t-gallery-subtitle" style={{
                    fontSize: '1rem',
                    color: 'var(--g-text-primary)',
                    marginTop: 6,
                    letterSpacing: '0.14em',
                  }}>
                    {frameEdition}
                  </h2>
                </div>
                <button
                  type="button"
                  aria-label="Close acquisition details"
                  onClick={toggleDrawer}
                  style={{
                    background: 'none',
                    border: '1px solid rgba(232,235,238,0.10)',
                    color: 'rgba(237,236,234,0.40)',
                    padding: 7,
                    cursor: 'pointer',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(218,172,98,0.35)';
                    e.currentTarget.style.color = 'var(--g-text-accent)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(232,235,238,0.10)';
                    e.currentTarget.style.color = 'rgba(237,236,234,0.40)';
                  }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Drawer body */}
              <div className="frame-dossier-body no-scrollbar">
                <a
                  href="/gallery/materials"
                  className="frame-drawer__direct-link"
                  aria-label="Retrieve materials for token holders"
                >
                  <ArrowUpRight size={12} weight="light" aria-hidden="true" />
                  <span>MATERIALS FOR TOKEN HOLDERS</span>
                </a>
                {/* Axis designation card */}
                <div style={{
                  background: 'rgba(5,6,7,0.9)',
                  border: '1px solid rgba(232,235,238,0.08)',
                  padding: 20,
                  marginBottom: 24,
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                    background: 'linear-gradient(90deg, transparent, rgba(218,172,98,0.35), transparent)',
                  }} />
                  <span className="t-mono-tag" style={{ opacity: 0.28, fontSize: '0.54rem' }}>AXIS DESIGNATION</span>
                  <h3 className="t-gallery-subtitle" style={{
                    fontSize: '1rem',
                    lineHeight: 1.28,
                    letterSpacing: '0.16em',
                    marginTop: 6,
                    color: 'var(--g-text-accent)',
                    overflowWrap: 'anywhere',
                  }}>
                    {frameTitle}
                  </h3>
                  <p className="t-mono-tag frame-readable-copy" style={{ marginTop: 10, fontSize: '0.58rem', lineHeight: 1.6 }}>
                    {isCompletePackage ? 'Frame 05 within the Complete relation' : 'A distinct Frame practice'}
                  </p>
                </div>

                {/* Rights section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <Sparkle size={16} color="var(--g-text-accent)" style={{ flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <h4 className="t-mono-label" style={{ color: 'rgba(237,236,234,0.80)', marginBottom: 3, fontSize: '0.60rem' }}>
                        PRACTICE
                      </h4>
                      <p className="t-mono-tag frame-readable-copy" style={{ fontSize: '0.56rem', lineHeight: 1.6 }}>
                        This Frame configures a distinct practice. Exact permissions belong to the applicable legal schedule.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <ShieldCheck size={16} color="rgba(232,235,238,0.50)" style={{ flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <h4 className="t-mono-label" style={{ color: 'rgba(237,236,234,0.80)', marginBottom: 3, fontSize: '0.60rem' }}>
                        LINEAGE
                      </h4>
                      <p className="t-mono-tag frame-readable-copy" style={{ fontSize: '0.56rem', lineHeight: 1.6 }}>
                        Records may witness continuity; this interface neither creates lineage nor proves a deployed contract.
                      </p>
                    </div>
                  </div>
                </div>

                {/* ─── HELD: no price, no purchase ─── */}
                {relationshipHeld && (
                  <div style={{
                    borderTop: '1px solid rgba(232,235,238,0.06)',
                    paddingTop: 20,
                    marginTop: 'auto',
                  }}>
                    <div className="t-mono-tag" style={{
                      opacity: 0.35,
                      textAlign: 'center',
                      letterSpacing: '0.18em',
                    }}>
                      RELATIONSHIP CONFIRMED — NO ACTION REQUIRED
                    </div>

                  </div>
                )}

                {/* ─── NOT HELD: acquisition content ─── */}
                {!relationshipHeld && !isCompletePackage && (
                  <div style={{ borderTop: '1px solid rgba(232,235,238,0.06)', paddingTop: 20, marginTop: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <span className="t-mono-tag" style={{ opacity: 0.40 }}>PRIMARY CONSIDERATION</span>
                      <span className="t-mono-label" style={{ color: 'var(--g-text-accent)', fontSize: '0.85rem', letterSpacing: '0.1em' }}>
                        {priceLabel}
                      </span>
                    </div>
                    <p className="t-mono-tag frame-readable-copy" style={{ fontSize: '0.55rem', lineHeight: 1.7, marginBottom: 16 }}>
                      A released transaction will identify its verified contract in the Dossier before any wallet action.
                    </p>
                    {showEvidenceAffordances && (
                      <a
                        href={RELEASE_COORDINATES.independentOperationDocUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="frame-drawer__direct-link"
                        aria-label="View independent direct smart contract interaction guide on GitHub"
                      >
                        <ArrowUpRight size={12} weight="light" aria-hidden="true" />
                        <span>DIRECT CONTRACT INTERACTION</span>
                      </a>
                    )}
                    <WalletConnectButton />
                    {frameId !== 5 && frameId !== 6 ? (
                      <FramePurchase frameId={frameId} />
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="t-mono-label"
                        style={{
                          width: '100%',
                          background: 'rgba(232,235,238,0.03)',
                          border: '1px solid rgba(232,235,238,0.08)',
                          color: 'rgba(237,236,234,0.18)',
                          fontWeight: 600,
                          padding: '12px 20px',
                          cursor: 'not-allowed',
                          letterSpacing: '0.18em',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          fontSize: '0.58rem',
                          marginTop: 16,
                        }}
                      >
                        {frameId === 5 ? 'RESERVED FOR COMPLETE PACKAGE' : 'RESERVED FOR ARTIST GENESIS ARCHIVE'}
                        <Lock size={13} />
                      </button>
                    )}
                  </div>
                )}


                {/* ─── PACKAGE 05: private Three Brushstrokes contribution ─── */}
                {!relationshipHeld && isCompletePackage && brushstrokeAuthorityStatus === 'NONE' && brushstrokeStep === 'brushstrokes' && (
                  <div style={{ borderTop: '1px solid rgba(232,235,238,0.06)', paddingTop: 20, marginTop: 'auto' }}>
                    <WalletConnectButton />
                    <div style={{
                      background: 'rgba(5,6,7,0.85)',
                      border: '1px solid rgba(218,172,98,0.18)',
                      padding: 16,
                      marginBottom: 20,
                    }}>
                      <span className="t-mono-tag" style={{ color: 'var(--g-text-accent)', opacity: 0.75 }}>THREE BRUSHSTROKES</span>
                      <p className="t-mono-tag frame-readable-copy" style={{ fontSize: '0.56rem', lineHeight: 1.6, marginTop: 5 }}>
                        A private relational contribution situated with Package 05. It is not a purchase, qualification, authority claim, or a gate to Frame Curator.<br/><br/>
                        DO NOT SUBMIT SENSITIVE OR CONFIDENTIAL INFORMATION. These three contributions are held privately for Artist review.
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                      <div>
                        <label className="t-mono-tag frame-readable-label" style={{ display: 'block', marginBottom: 5, fontSize: '0.54rem' }}>
                          FIRST BRUSHSTROKE — ANCHOR
                        </label>
                        <input
                          value={brushstrokes[0]}
                          onChange={e => setBrushstrokes(values => [e.target.value, values[1], values[2]])}
                          placeholder="What specific detail held your attention?"
                          className="frame-brushstroke-input"
                          style={{
                            width: '100%',
                            background: 'rgba(4,5,6,0.9)',
                            border: '1px solid rgba(232,235,238,0.10)',
                            padding: '9px 12px',
                            color: 'var(--g-text-primary)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.68rem',
                            outline: 'none',
                            transition: 'border-color 0.3s ease',
                          }}
                          onFocus={e => { e.currentTarget.style.borderColor = 'rgba(218,172,98,0.30)'; }}
                          onBlur={e => { e.currentTarget.style.borderColor = 'rgba(232,235,238,0.10)'; }}
                        />
                      </div>
                      <div>
                        <label className="t-mono-tag frame-readable-label" style={{ display: 'block', marginBottom: 5, fontSize: '0.54rem' }}>
                          SECOND BRUSHSTROKE — READING
                        </label>
                        <input
                          value={brushstrokes[1]}
                          onChange={e => setBrushstrokes(values => [values[0], e.target.value, values[2]])}
                          placeholder="What reading emerged, and what could challenge it?"
                          className="frame-brushstroke-input"
                          style={{
                            width: '100%',
                            background: 'rgba(4,5,6,0.9)',
                            border: '1px solid rgba(232,235,238,0.10)',
                            padding: '9px 12px',
                            color: 'var(--g-text-primary)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.68rem',
                            outline: 'none',
                            transition: 'border-color 0.3s ease',
                          }}
                          onFocus={e => { e.currentTarget.style.borderColor = 'rgba(218,172,98,0.30)'; }}
                          onBlur={e => { e.currentTarget.style.borderColor = 'rgba(232,235,238,0.10)'; }}
                        />
                      </div>
                      <div>
                        <label className="t-mono-tag frame-readable-label" style={{ display: 'block', marginBottom: 5, fontSize: '0.54rem' }}>
                          THIRD BRUSHSTROKE — UNCERTAINTY
                        </label>
                        <input
                          value={brushstrokes[2]}
                          onChange={e => setBrushstrokes(values => [values[0], values[1], e.target.value])}
                          placeholder="What remains unresolved or uncertain?"
                          className="frame-brushstroke-input"
                          style={{
                            width: '100%',
                            background: 'rgba(4,5,6,0.9)',
                            border: '1px solid rgba(232,235,238,0.10)',
                            padding: '9px 12px',
                            color: 'var(--g-text-primary)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.68rem',
                            outline: 'none',
                            transition: 'border-color 0.3s ease',
                          }}
                          onFocus={e => { e.currentTarget.style.borderColor = 'rgba(218,172,98,0.30)'; }}
                          onBlur={e => { e.currentTarget.style.borderColor = 'rgba(232,235,238,0.10)'; }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => { if (brushstrokesComplete) setBrushstrokeStep('wallet_review'); }}
                      disabled={!brushstrokesComplete}
                      className="t-mono-label"
                      style={{
                        width: '100%',
                        background: brushstrokesComplete
                          ? 'linear-gradient(135deg, rgba(218,172,98,0.22) 0%, rgba(218,172,98,0.08) 100%)'
                          : 'rgba(232,235,238,0.03)',
                        border: `1px solid ${brushstrokesComplete ? 'rgba(218,172,98,0.45)' : 'rgba(232,235,238,0.08)'}`,
                        color: brushstrokesComplete ? 'var(--g-text-accent)' : 'rgba(237,236,234,0.18)',
                        padding: '12px 20px',
                        cursor: brushstrokesComplete ? 'pointer' : 'not-allowed',
                        letterSpacing: '0.18em',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                      }}
                    >
                      REVIEW WALLET ADDRESS
                      <ArrowRight size={13} />
                    </button>
                  </div>
                )}

                {/* ─── PACKAGE 05: wallet proof, not a transaction or invitation request ─── */}
                {!relationshipHeld && isCompletePackage && brushstrokeAuthorityStatus === 'NONE' && brushstrokeStep === 'wallet_review' && (
                  <div style={{ borderTop: '1px solid rgba(232,235,238,0.06)', paddingTop: 20, marginTop: 'auto' }}>
                    <div style={{
                      background: 'rgba(5,6,7,0.95)',
                      border: '1px solid rgba(218,172,98,0.25)',
                      padding: 18,
                      marginBottom: 18,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <ShieldCheck size={18} color="var(--g-text-accent)" />
                        <span className="t-mono-tag" style={{ color: 'var(--g-text-accent)', letterSpacing: '0.18em' }}>
                          WALLET ADDRESS
                        </span>
                      </div>
                      <p className="t-mono-tag frame-readable-copy" style={{ fontSize: '0.58rem', lineHeight: 1.6 }}>
                        Submit these three contributions with your selected wallet address for Artist review. No wallet signature or transaction is requested.
                      </p>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <div className="t-mono-tag" style={{ opacity: 0.45, marginBottom: 6, fontSize: '0.54rem' }}>PRIVATE SUBMISSION PARAMETERS</div>
                      {[
                        ['Locus', 'Package 05'],
                        ['Contribution', 'Exactly Three Brushstrokes'],
                        ['Wallet address', address ?? 'Connect your wallet'],
                      ].map(([label, value], i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(232,235,238,0.05)' }}>
                          <span className="t-mono-tag" style={{ opacity: 0.50, fontSize: '0.56rem' }}>{label}</span>
                          <span className="t-mono-tag" style={{ color: i === 0 ? 'var(--g-text-accent)' : 'var(--g-text-primary)', fontSize: '0.56rem' }}>{value}</span>
                        </div>
                      ))}
                    </div>


                    {showEvidenceAffordances && (
                      <a
                        href={RELEASE_COORDINATES.independentOperationDocUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="frame-drawer__direct-link"
                        aria-label="View independent direct smart contract interaction guide on GitHub"
                        style={{ marginBottom: 16 }}
                      >
                        <ArrowUpRight size={12} weight="light" aria-hidden="true" />
                        <span>DIRECT CONTRACT INTERACTION</span>
                      </a>
                    )}

                    <WalletConnectButton />

                    <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                      <button
                        onClick={() => setBrushstrokeStep('brushstrokes')}
                        className="t-mono-label"
                        style={{
                          background: 'none',
                          border: '1px solid rgba(232,235,238,0.10)',
                          color: 'rgba(237,236,234,0.45)',
                          padding: '12px 16px',
                          cursor: 'pointer',
                          fontSize: '0.58rem',
                        }}
                      >
                        BACK
                      </button>
                      <button
                        onClick={() => void submitBrushstrokes()}
                        disabled={!address}
                        className="t-mono-label"
                        style={{
                          flex: 1,
                          background: address
                            ? 'linear-gradient(135deg, rgba(218,172,98,0.25) 0%, rgba(218,172,98,0.10) 100%)'
                            : 'rgba(232,235,238,0.03)',
                          border: `1px solid ${address ? 'rgba(218,172,98,0.45)' : 'rgba(232,235,238,0.08)'}`,
                          color: address ? 'var(--g-text-accent)' : 'rgba(237,236,234,0.20)',
                          padding: '12px 16px',
                          cursor: address ? 'pointer' : 'not-allowed',
                          letterSpacing: '0.16em',
                          fontSize: '0.58rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                        }}
                      >
                        SUBMIT THREE BRUSHSTROKES
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                )}

                {/* ─── PACKAGE 05: checking status ─── */}
                {!relationshipHeld && isCompletePackage && brushstrokeAuthorityStatus === 'LOADING' && (
                  <div style={{ borderTop: '1px solid rgba(232,235,238,0.06)', paddingTop: 20, marginTop: 'auto' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      padding: '24px 20px',
                      background: 'rgba(218,172,98,0.04)',
                      border: '1px dashed rgba(218,172,98,0.20)',
                    }}>
                      <motion.span
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                        className="t-mono-tag"
                        style={{ color: 'var(--g-text-accent)', fontSize: '0.60rem', letterSpacing: '0.18em' }}
                      >
                        CHECKING ENCOUNTER STATUS…
                      </motion.span>
                    </div>
                  </div>
                )}

                {/* ─── PACKAGE 05: service status unavailable (network/API error) ─── */}
                {!relationshipHeld && isCompletePackage && brushstrokeAuthorityStatus === 'SERVICE_UNAVAILABLE' && (
                  <div style={{ borderTop: '1px solid rgba(232,235,238,0.06)', paddingTop: 20, marginTop: 'auto' }}>
                    <div style={{
                      background: 'rgba(5,6,7,0.95)',
                      border: '1px solid rgba(225,160,142,0.35)',
                      padding: 18,
                      marginBottom: 16,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <ShieldCheck size={18} color="rgba(225,160,142,0.95)" />
                        <span className="t-mono-tag" style={{ color: 'rgba(225,160,142,0.95)', letterSpacing: '0.18em' }}>
                          SERVICE STATUS UNAVAILABLE
                        </span>
                      </div>
                      <p className="t-mono-tag frame-readable-copy" style={{ fontSize: '0.58rem', lineHeight: 1.6, color: 'rgba(237,236,234,0.70)' }}>
                        Unable to verify encounter status for this wallet. Your confirmed status is preserved. Check your connection or retry.
                      </p>
                    </div>
                    <WalletConnectButton />
                  </div>
                )}

                {/* ─── PACKAGE 05: submitted private evidence (awaiting review or not confirmed) ─── */}
                {!relationshipHeld && isCompletePackage && (brushstrokeAuthorityStatus === 'PENDING_ARTIST_REVIEW' || brushstrokeAuthorityStatus === 'ENCOUNTER_EVIDENCE_NOT_CONFIRMED' || (brushstrokeAuthorityStatus === 'NONE' && (brushstrokeStep === 'submitting' || brushstrokeStep === 'error' || brushstrokeStep === 'submitted'))) && (
                  <div style={{ borderTop: '1px solid rgba(232,235,238,0.06)', paddingTop: 20, marginTop: 'auto' }}>
                    <div style={{
                      background: 'rgba(5,6,7,0.95)',
                      border: '1px solid rgba(218,172,98,0.25)',
                      padding: 18,
                      marginBottom: 18,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <Sparkle size={18} color="var(--g-text-accent)" />
                        <span className="t-mono-tag" style={{ color: 'var(--g-text-accent)', letterSpacing: '0.18em' }}>
                          {brushstrokeAuthorityStatus === 'ENCOUNTER_EVIDENCE_NOT_CONFIRMED' ? 'ENCOUNTER EVIDENCE NOT CONFIRMED' : brushstrokeAuthorityStatus === 'PENDING_ARTIST_REVIEW' || brushstrokeStep === 'submitted' ? 'PRIVATE EVIDENCE TRANSMITTED' : brushstrokeStep === 'submitting' ? 'SAVING YOUR SUBMISSION' : 'SUBMISSION NOT COMPLETED'}
                        </span>
                      </div>
                      <p className="t-mono-tag frame-readable-copy" style={{ fontSize: '0.58rem', lineHeight: 1.6 }}>
                        {brushstrokeAuthorityStatus === 'ENCOUNTER_EVIDENCE_NOT_CONFIRMED'
                            ? 'The Artist has not confirmed this request. The purchase interface is unavailable for this wallet.'
                            : brushstrokeAuthorityStatus === 'PENDING_ARTIST_REVIEW' || brushstrokeStep === 'submitted'
                          ? 'Your Three Brushstrokes have been saved and are awaiting Artist review.'
                          : brushstrokeError ?? 'The private proof was not completed. Your Frame Curator access is unaffected.'}
                      </p>
                    </div>

                    {brushstrokeAuthorityStatus === 'NONE' && brushstrokeStep !== 'submitted' && <WalletConnectButton />}

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      padding: '16px 20px',
                      background: 'rgba(218,172,98,0.06)',
                      border: '1px dashed rgba(218,172,98,0.30)',
                      marginTop: 8,
                      marginBottom: 12,
                    }}>
                      <motion.span
                        animate={{ opacity: [0.35, 1, 0.35] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                        className="t-mono-tag"
                        style={{ color: 'var(--g-text-accent)', fontSize: '0.60rem', letterSpacing: '0.18em' }}
                      >
                        {brushstrokeAuthorityStatus === 'ENCOUNTER_EVIDENCE_NOT_CONFIRMED' ? 'NOT CONFIRMED' : brushstrokeAuthorityStatus === 'PENDING_ARTIST_REVIEW' || brushstrokeStep === 'submitted' ? 'AWAITING ARTIST REVIEW' : 'NO PRIVATE SUBMISSION CREATED'}
                      </motion.span>
                    </div>

                    {brushstrokeAuthorityStatus === 'NONE' && <button
                        onClick={() => setBrushstrokeStep('brushstrokes')}
                      className="t-mono-label"
                      style={{
                        width: '100%',
                        background: 'none',
                        border: '1px solid rgba(232,235,238,0.10)',
                        color: 'rgba(237,236,234,0.45)',
                        padding: '10px 16px',
                        cursor: 'pointer',
                        fontSize: '0.56rem',
                        letterSpacing: '0.12em',
                      }}
                    >
                      BACK TO THREE BRUSHSTROKES
                    </button>}
                  </div>
                )}

                {!relationshipHeld && isCompletePackage && brushstrokeAuthorityStatus === 'ARTIST_CONFIRMED' && (
                  <div style={{ borderTop: '1px solid rgba(232,235,238,0.06)', paddingTop: 20, marginTop: 'auto' }}>
                    <CompletePurchase />
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

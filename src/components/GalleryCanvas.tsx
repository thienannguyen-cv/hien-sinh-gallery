'use client';
/**
 * GalleryCanvas — Root Gallery Orchestrator
 *
 * Manages the two gallery zones and the Frame rooms within the Atelier.
 *
 * Rings:
 *   0 — Threshold Hall (public)
 *   1 — Atelier, including Frame interiors and the Complete relation
 */

import React, { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { createPublicClient, custom, parseAbi, type Address } from 'viem';
import { ThresholdHall } from './gallery/ThresholdHall';
import { COMPLETE_PACKAGE_ID } from './gallery/completePackageDesignation';
import { AtelierGallery } from './gallery/AtelierGallery';
import { FrameInterior } from './gallery/FrameInterior';
import { GalleryStatusBar } from './gallery/GalleryStatusBar';
import { AboutRoom, DossierRoom } from './gallery/InformationRooms';
import { OverlayProvider, useOverlayContext } from '../context/OverlayContext';
import { useLocalPresentationEnvironment } from '../security/useLocalPresentationEnvironment';
import { useWallet } from '../wallet/WalletContext';
import { COMPLETE_CONTRACT } from '../services/completePackageProtocol';
import { FRAME_TITLES } from '../constants/frameTitles';

type Ring = 0 | 1 | 2;

const FORWARD_TRANSITION = {
  initial: { opacity: 0, scale: 1.04, filter: 'blur(6px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, scale: 0.97, filter: 'blur(3px)' },
  transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

const BACK_TRANSITION = {
  initial: { opacity: 0, scale: 0.97, filter: 'blur(3px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, scale: 1.03, filter: 'blur(4px)' },
  transition: { duration: 0.65, ease: [0.25, 1, 0.5, 1] as [number, number, number, number] },
};

type PanelType = 'about' | 'dossier' | null;

const GalleryCanvasInner: React.FC = () => {
  const [ring, setRing] = useState<Ring>(0);
  const [navDir, setNavDir] = useState<'forward' | 'back'>('forward');
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [activeFrame, setActiveFrame] = useState<number | null>(null);

  const { address, chainId, provider } = useWallet();
  const [onChainOwnedTokens, setOnChainOwnedTokens] = useState<Set<number>>(new Set());

  useEffect(() => {
    const isBase = chainId === 8453 || chainId === 0x2105;
    if (!address || !provider || !isBase) {
      setOnChainOwnedTokens(new Set());
      return;
    }

    let isMounted = true;
    const client = createPublicClient({ transport: custom(provider) });
    const normAddress = address.toLowerCase();

    const checkTokens = async () => {
      const owned = new Set<number>();
      const promises = Array.from({ length: 10 }, async (_, i) => {
        try {
          const owner = await client.readContract({
            address: COMPLETE_CONTRACT as Address,
            abi: parseAbi(['function ownerOf(uint256) view returns (address)']),
            functionName: 'ownerOf',
            args: [BigInt(i)],
          });
          if (typeof owner === 'string' && owner.toLowerCase() === normAddress) {
            owned.add(i);
          }
        } catch {
          // Token not minted or call reverted
        }
      });

      await Promise.all(promises);
      if (isMounted) {
        setOnChainOwnedTokens(owned);
      }
    };

    void checkTokens();
    const interval = window.setInterval(checkTokens, 12000);
    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [address, chainId, provider]);

  const presentationEnv = useLocalPresentationEnvironment();

  // Canonical SANCTUM eligibility: wallet owns Token #0 (Painting) AND at least one Frame (Tokens #1..#9)
  const isSanctumEligible = Boolean(
    address && onChainOwnedTokens.has(0) && Array.from({ length: 9 }, (_, i) => i + 1).some(id => onChainOwnedTokens.has(id))
  );

  // Derived held relationship IDs
  let presentedRelationshipIds: number[] = [];
  let localPresentationActive = false;

  if (address) {
    // Real wallet connected -> authoritative on-chain state
    const held = Array.from({ length: 9 }, (_, i) => i + 1).filter(id => {
      if (id === COMPLETE_PACKAGE_ID) return isSanctumEligible || onChainOwnedTokens.has(COMPLETE_PACKAGE_ID);
      return onChainOwnedTokens.has(id);
    });
    presentedRelationshipIds = held;
    localPresentationActive = held.length > 0;
  } else if (presentationEnv) {
    // No wallet connected -> fallback to mock dev environment perspective if configured
    presentedRelationshipIds = presentationEnv.frameId !== null && presentationEnv.frameId !== undefined
      ? [presentationEnv.frameId]
      : [];
    localPresentationActive = presentationEnv.perspective !== 'PUBLIC';
  }

  const { isOverlayOpen } = useOverlayContext();
  const shouldHideOverlays = activePanel !== null || isOverlayOpen;

  const descend = useCallback(() => {
    setNavDir('forward');
    setRing(1);
  }, []);

  const selectFrame = useCallback((frameId: number) => {
    setNavDir('forward');
    setActiveFrame(frameId);
  }, []);

  const ascend = useCallback(() => {
    setNavDir('back');
    if (ring === 1 && activeFrame !== null) {
      setActiveFrame(null);
    } else {
      setRing(r => Math.max(r - 1, 0) as Ring);
    }
  }, [ring, activeFrame]);

  const trans = navDir === 'forward' ? FORWARD_TRANSITION : BACK_TRANSITION;

  const inFrameInterior = ring === 1 && activeFrame !== null;

  const activeFrameTitle = activeFrame !== null ? FRAME_TITLES[activeFrame - 1] ?? '' : '';
  const activeFrameEdition = activeFrame !== null
    ? `Frame ${String(activeFrame).padStart(2, '0')} / ${String(FRAME_TITLES.length).padStart(2, '0')}`
    : '';
  const activeFrameIsComplete = activeFrame === COMPLETE_PACKAGE_ID;
  const activeFrameHeld = activeFrame !== null && presentedRelationshipIds.includes(activeFrame);

  // Derive completeStewardRelation: Package 05 is in Sanctum mode if wallet is sanctum-eligible (or dev mock steward when disconnected)
  const completeStewardRelation = activeFrameIsComplete && (
    address ? isSanctumEligible : (presentationEnv?.perspective === 'STEWARD' && activeFrameHeld)
  );

  return (
    <div
      data-gallery-overlay-open={shouldHideOverlays || undefined}
      style={{
        width: '100vw',
        height: '100dvh',
        overflow: 'hidden',
        position: 'relative',
        background: 'var(--g-black)',
      }}
    >
      <div className="gallery-grain" />

      <AnimatePresence>
        {(ring > 0 || inFrameInterior) && (
          <motion.button
            key="back-btn"
            data-gallery-surface-control
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onClick={ascend}
            className="t-mono-tag"
            style={{
              position: 'fixed',
              top: 18,
              left: 28,
              zIndex: 80,
              display: shouldHideOverlays ? 'none' : 'flex',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(237,236,234,0.40)',
              alignItems: 'center',
              gap: 8,
              padding: '4px 0',
              transition: 'color 0.3s ease',
              letterSpacing: '0.2em',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(237,236,234,0.6)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(237,236,234,0.40)')}
          >
            RETURN
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {ring === 0 && (
          <motion.div
            key="ring-0"
            style={{ position: 'absolute', inset: 0 }}
            {...trans}
          >
            <ThresholdHall
              onDescend={descend}
              onAbout={() => setActivePanel('about')}
              onDossier={() => setActivePanel('dossier')}
            />
          </motion.div>
        )}

        {ring === 1 && !inFrameInterior && (
          <motion.div
            key="ring-1-grid"
            style={{ position: 'absolute', inset: 0 }}
            {...trans}
          >
            <AtelierGallery
              presentedRelationshipIds={presentedRelationshipIds}
              localPresentationActive={localPresentationActive}
              animateDepthEntrance={navDir === 'forward'}
              onSelectFrame={selectFrame}
            />
          </motion.div>
        )}

        {ring === 1 && inFrameInterior && activeFrame !== null && (
          <motion.div
            key={`ring-1-interior-${activeFrame}`}
            style={{ position: 'absolute', inset: 0 }}
            {...trans}
          >
            <FrameInterior
              frameId={activeFrame}
              frameTitle={activeFrameTitle}
              frameEdition={activeFrameEdition}
              relationshipHeld={activeFrameHeld}
              isCompletePackage={activeFrameIsComplete}
              curatorRole={completeStewardRelation ? 'STEWARD' : 'PRACTITIONER'}
              stewardImageUrl={completeStewardRelation ? '/api/steward-image' : null}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activePanel === 'about' && (
          <AboutRoom
            key="about-panel"
            onClose={() => setActivePanel(null)}
            onOpenDossier={() => setActivePanel('dossier')}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activePanel === 'dossier' && (
          <DossierRoom
            key="dossier-panel"
            onClose={() => setActivePanel(null)}
            onOpenAbout={() => setActivePanel('about')}
          />
        )}
      </AnimatePresence>

      {!shouldHideOverlays && <GalleryStatusBar currentRing={ring === 0 ? 0 : inFrameInterior ? 2 : 1} />}

    </div>
  );
};

export const GalleryCanvas: React.FC = () => {
  return (
    <MotionConfig reducedMotion="user">
      <OverlayProvider>
        <GalleryCanvasInner />
      </OverlayProvider>
    </MotionConfig>
  );
};

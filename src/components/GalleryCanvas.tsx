'use client';
/**
 * GalleryCanvas — Root Gallery Orchestrator
 *
 * Manages ring navigation with spring physics transitions.
 * Renders the correct spatial zone based on current ring depth.
 *
 * Rings:
 *   0 — Threshold Hall (public)
 *   1 — Atelier (Practitioner-Bearer)
 *   2 — Sanctum (Designated Steward)
 */

import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAccount, useConnect } from 'wagmi';
import { ThresholdHall } from './gallery/ThresholdHall';
import { AtelierGallery } from './gallery/AtelierGallery';
import { SanctumGallery } from './gallery/SanctumGallery';
import { WalletStatusBar } from './gallery/WalletStatusBar';
import { DEVMODE } from '../lib/devMode';

type Ring = 0 | 1 | 2;

// Transition config for forward navigation (descend into gallery)
const FORWARD_TRANSITION = {
  initial: { opacity: 0, scale: 1.04, filter: 'blur(6px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, scale: 0.97, filter: 'blur(3px)' },
  transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

// Transition config for backward navigation (return to threshold)
const BACK_TRANSITION = {
  initial: { opacity: 0, scale: 0.97, filter: 'blur(3px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, scale: 1.03, filter: 'blur(4px)' },
  transition: { duration: 0.65, ease: [0.25, 1, 0.5, 1] as [number, number, number, number] },
};

// Panels
type PanelType = 'about' | 'dossier' | null;

export const GalleryCanvas: React.FC = () => {
  const [ring, setRing] = useState<Ring>(0);
  const [navDir, setNavDir] = useState<'forward' | 'back'>('forward');
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [mockRole, setMockRole] = useState<'public' | 'practitioner' | 'steward'>('public');
  const [activeFrame, setActiveFrame] = useState<number | null>(null);

  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();

  // Navigation — descend one ring deeper
  const descend = useCallback((frameId?: number) => {
    setNavDir('forward');
    if (frameId) setActiveFrame(frameId);
    setRing(r => Math.min(r + 1, 2) as Ring);
  }, []);

  // Navigation — ascend one ring (return)
  const ascend = useCallback(() => {
    setNavDir('back');
    setRing(r => Math.max(r - 1, 0) as Ring);
  }, []);

  const trans = navDir === 'forward' ? FORWARD_TRANSITION : BACK_TRANSITION;

  return (
    <div
      style={{
        width: '100vw',
        height: '100dvh',
        overflow: 'hidden',
        position: 'relative',
        background: 'var(--g-black)',
      }}
    >
      {/* Gallery grain overlay */}
      <div className="gallery-grain" />

      {/* Back navigation — appears on rings 1+ */}
      <AnimatePresence>
        {ring > 0 && (
          <motion.button
            key="back-btn"
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
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(237,236,234,0.22)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 0',
              transition: 'color 0.3s ease',
              letterSpacing: '0.2em',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(237,236,234,0.6)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(237,236,234,0.22)')}
          >
            <span style={{ fontSize: '0.8em' }}>←</span>
            RETURN
          </motion.button>
        )}
      </AnimatePresence>

      {/* Ring scenes */}
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

        {ring === 1 && (
          <motion.div
            key="ring-1"
            style={{ position: 'absolute', inset: 0 }}
            {...trans}
          >
            <AtelierGallery
              ownedFrameIds={
                mockRole === 'steward' ? [1, 2, 3, 4, 5, 6, 7, 8, 9] :
                mockRole === 'practitioner' ? [2] : []
              }
              isConnected={(DEVMODE && mockRole !== 'public') || isConnected}
              onConnectWallet={() => {
                const injected = connectors.find(c => c.id === 'injected');
                if (injected) connect({ connector: injected });
              }}
              onDescend={descend}
            />
          </motion.div>
        )}

        {ring === 2 && (
          <motion.div
            key="ring-2"
            style={{ position: 'absolute', inset: 0 }}
            {...trans}
          >
            {activeFrame && <SanctumGallery frameId={activeFrame} />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* About panel */}
      <AnimatePresence>
        {activePanel === 'about' && (
          <motion.div
            key="about-panel"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', stiffness: 200, damping: 30 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 70,
              background: 'rgba(6,7,8,0.92)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
            onClick={() => setActivePanel(null)}
          >
            <div
              style={{
                width: '42vw',
                maxWidth: 520,
                height: '100%',
                background: 'rgba(10,11,14,0.98)',
                borderLeft: '1px solid rgba(232,235,238,0.08)',
                padding: '56px 44px',
                overflowY: 'auto',
              }}
              onClick={e => e.stopPropagation()}
            >
              <div className="t-mono-tag" style={{ marginBottom: 36, opacity: 0.35 }}>
                ABOUT — HIỆN SINH
              </div>
              <p className="t-literary" style={{ marginBottom: 24 }}>
                Hiện Sinh is a relational practice operating on the Base blockchain.
                It exists as a painting, a set of nine canonical frames, and a record of encounter.
              </p>
              <p className="t-literary">
                The work is organized around a relation and a transmission — through the act
                of accession, designated stewardship, and the structured encounter between
                visitor and Oracle.
              </p>
              <div style={{ marginTop: 48, borderTop: '1px solid rgba(232,235,238,0.06)', paddingTop: 28 }}>
                <div className="t-mono-tag" style={{ opacity: 0.2, marginBottom: 8 }}>
                  COMMISSIONED — 2025
                </div>
                <div className="t-mono-tag" style={{ opacity: 0.2 }}>
                  ARCHIVE — BASE MAINNET
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dossier panel */}
      <AnimatePresence>
        {activePanel === 'dossier' && (
          <motion.div
            key="dossier-panel"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', stiffness: 200, damping: 30 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 70,
              background: 'rgba(6,7,8,0.92)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
            onClick={() => setActivePanel(null)}
          >
            <div
              style={{
                width: '42vw',
                maxWidth: 520,
                height: '100%',
                background: 'rgba(10,11,14,0.98)',
                borderLeft: '1px solid rgba(232,235,238,0.08)',
                padding: '56px 44px',
                overflowY: 'auto',
              }}
              onClick={e => e.stopPropagation()}
            >
              <div className="t-mono-tag" style={{ marginBottom: 36, opacity: 0.35 }}>
                DOSSIER — LEGAL
              </div>
              <div className="t-mono-label" style={{ marginBottom: 20, opacity: 0.55 }}>
                COPYRIGHT
              </div>
              <p className="t-literary" style={{ marginBottom: 24 }}>
                All original artwork and curatorial content within Hiện Sinh is the exclusive
                intellectual property of the designated artist. Holding a Frame NFT
                grants practice and access rights only — it does not transfer copyright of the underlying work.
              </p>
              <div className="t-mono-label" style={{ marginBottom: 20, opacity: 0.55, marginTop: 32 }}>
                TERMS OF ACCESS
              </div>
              <p className="t-literary">
                Access to Ring 01 and Ring 02 is granted exclusively through verified
                Frame token holding on the Base network. The Oracle Curator operates within
                defined encounter limits per session. The gallery reserves the right to modify
                access parameters at any time.
              </p>
              <div style={{ marginTop: 48, borderTop: '1px solid rgba(232,235,238,0.06)', paddingTop: 28 }}>
                <div className="t-mono-tag" style={{ opacity: 0.2 }}>
                  HIỆN SINH — ALL RIGHTS RESERVED
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wallet status bar */}
      <WalletStatusBar 
        currentRing={ring}
        walletAddress={address as string | undefined}
        isConnecting={isPending}
        onConnect={() => {
          const injected = connectors.find(c => c.id === 'injected' || c.id === 'metaMask');
          if (injected) {
            connect({ connector: injected });
          } else {
            alert('Vui lòng cài đặt ví Web3 (như MetaMask) trên trình duyệt để kết nối không gian.');
          }
        }}
      />
      
      {/* DEV ROLE Selector — Tái ẩn dụ thành ký hiệu bí ẩn */}
      {DEVMODE && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 100,
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          padding: '12px',
          opacity: 0.8,
        }}>
          {(['public', 'practitioner', 'steward'] as const).map(role => (
            <button
              key={role}
              onClick={() => setMockRole(role)}
              title={`Role: ${role}`}
              style={{
                background: 'none',
                border: 'none',
                color: mockRole === role ? 'rgba(237,236,234,0.7)' : 'rgba(237,236,234,0.15)',
                cursor: 'pointer',
                fontSize: '1.2rem',
                padding: '4px',
                lineHeight: 1,
                transition: 'color 0.4s ease',
              }}
            >
              ·
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

'use client';
/**
 * ThresholdHall — Ring 00
 *
 * The entrance to the gallery. A dark, spacious room.
 * Warm amber light filters through a frosted partition
 * from an unseen artwork. The Curator desk sits in the
 * center foreground. Navigation deeper is earned, not given.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArtworkGlow } from './ArtworkGlow';
import { CuratorDesk } from './CuratorDesk';
import { GlassHint } from './GlassHint';

interface ThresholdHallProps {
  onDescend: () => void;          // Go deeper (Ring 01)
  onAbout: () => void;            // Open About panel
  onDossier: () => void;          // Open Dossier panel
}

export const ThresholdHall: React.FC<ThresholdHallProps> = ({
  onDescend,
  onAbout,
  onDossier,
}) => {
  const [atelierVisited, setAtelierVisited] = useState<boolean>(
    () => localStorage.getItem('hs_atelier_visited') === 'true'
  );

  const handleDescend = () => {
    localStorage.setItem('hs_atelier_visited', 'true');
    setAtelierVisited(true);
    onDescend();
  };

  return (
    <motion.div
      key="threshold"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.97, filter: 'blur(4px)' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--g-black)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* ── Artwork chromatic field (behind everything) ── */}
      <ArtworkGlow />

      {/* ── Gallery ceiling line — implied height ── */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        background: 'linear-gradient(90deg, transparent 0%, rgba(232,235,238,0.06) 20%, rgba(232,235,238,0.10) 50%, rgba(232,235,238,0.06) 80%, transparent 100%)',
      }} />

      {/* ── Floor reflection line ── */}
      <div style={{
        position: 'absolute',
        bottom: 48,
        left: '15%',
        right: '15%',
        height: 1,
        background: 'linear-gradient(90deg, transparent 0%, rgba(232,235,238,0.04) 25%, rgba(232,235,238,0.08) 50%, rgba(232,235,238,0.04) 75%, transparent 100%)',
      }} />

      {/* ── Top navigation bar ── */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 36px',
        zIndex: 20,
      }}>
        {/* Title mark */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}
        >
          <span className="t-mono-tag" style={{ opacity: 0.35 }}>○</span>
          <span className="t-mono-tag" style={{ letterSpacing: '0.22em' }}>
            HIỆN SINH
          </span>
        </motion.div>

        {/* Secondary nav */}
        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'flex', gap: 28 }}
        >
          {[
            { label: 'ABOUT', action: onAbout },
            { label: 'DOSSIER', action: onDossier },
          ].map(({ label, action }) => (
            <button
              key={label}
              onClick={action}
              className="t-mono-tag"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'rgba(237,236,234,0.25)',
                padding: 0,
                letterSpacing: '0.2em',
                transition: 'color 0.3s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(237,236,234,0.65)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(237,236,234,0.25)')}
            >
              {label}
            </button>
          ))}
        </motion.div>
      </div>

      {/* ── Main content area ── */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0,
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: 640,
        padding: '0 24px',
      }}>

        {/* Gallery title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: 'center', marginBottom: 8 }}
        >
          <h1 className="t-gallery-title">HIỆN SINH</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          style={{ textAlign: 'center', marginBottom: 52 }}
        >
          <p className="t-gallery-subtitle">
            Not a painting, not a token — a relational practice on blockchain
          </p>
        </motion.div>

        {/* Curator desk */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
        >
          <CuratorDesk />
        </motion.div>

        {/* Descend invitation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 1.0 }}
          style={{ marginTop: 44, textAlign: 'center' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={handleDescend}
              className={`t-mono-tag${!atelierVisited ? ' entry-pulse' : ''}`}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'rgba(237,236,234,0.18)',
                padding: '8px 0',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                transition: 'color 0.4s ease, text-shadow 0.4s ease',
                letterSpacing: '0.2em',
                animationPlayState: atelierVisited ? 'paused' : 'running',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'rgba(218,172,98,0.45)';
                e.currentTarget.style.animation = 'none';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'rgba(237,236,234,0.18)';
                if (!atelierVisited) e.currentTarget.style.animation = '';
              }}
            >
              <span style={{
                display: 'block',
                width: 20,
                height: 1,
                background: 'currentColor',
                transition: 'width 0.3s ease',
              }} />
              ENTER THE ATELIER
              <span style={{
                display: 'block',
                width: 20,
                height: 1,
                background: 'currentColor',
                transition: 'width 0.3s ease',
              }} />
            </button>
            <GlassHint
              hint="Proceed to the gallery of 9 canonical frames. Viewing is open; full access requires a Web3 wallet with Frame holdings."
              position="right"
              size={12}
            />
          </div>
        </motion.div>
      </div>

      {/* ── Bottom metadata strip ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.8 }}
        style={{
          position: 'absolute',
          bottom: 20,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0 36px',
          zIndex: 10,
        }}
      >
        <span className="t-mono-tag" style={{ opacity: 0.20 }}>
          ARCHIVE — 9 CANONICAL FRAMES
        </span>
        <span className="t-mono-tag" style={{ opacity: 0.20 }}>
          RELATIONAL PRACTICE V2.0 — BASE
        </span>
      </motion.div>
    </motion.div>
  );
};

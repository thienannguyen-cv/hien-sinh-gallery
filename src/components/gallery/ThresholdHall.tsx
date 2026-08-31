'use client';
/**
 * ThresholdHall — Ring 00
 *
 * The entrance to the gallery. A dark, spacious room.
 * Warm amber light filters through a frosted partition
 * from an unseen artwork. The Curator desk sits in the
 * center foreground. Navigation deeper is earned, not given.
 *
 * Gating Rule:
 *  - "ENTER THE ATELIER" and its glass hint are locked/hidden until the 3-step
 *    Public Curator dialogue is completed and admitted.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PublicEncounterRepresentation } from './PublicEncounterRepresentation';
import { CuratorDesk } from './CuratorDesk';
import { GlassHint } from './GlassHint';
import { isPublicEncounterCompleted, ADMITTED_EVENT } from '../../services/curator/publicCuratorState';
import { useLocalPresentationEnvironment } from '../../security/useLocalPresentationEnvironment';

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
  const localPresentation = useLocalPresentationEnvironment();
  const isHolderRole = localPresentation?.perspective === 'PRACTITIONER' || localPresentation?.perspective === 'STEWARD';

  const [atelierVisited, setAtelierVisited] = useState<boolean>(
    () => localStorage.getItem('hs_atelier_visited') === 'true'
  );

  const [isAdmitted, setIsAdmitted] = useState<boolean>(
    () => isHolderRole || isPublicEncounterCompleted()
  );

  useEffect(() => {
    const checkAdmission = () => {
      setIsAdmitted(isHolderRole || isPublicEncounterCompleted());
    };
    checkAdmission();
    window.addEventListener(ADMITTED_EVENT, checkAdmission);
    window.addEventListener('focus', checkAdmission);
    window.addEventListener('storage', checkAdmission);
    return () => {
      window.removeEventListener(ADMITTED_EVENT, checkAdmission);
      window.removeEventListener('focus', checkAdmission);
      window.removeEventListener('storage', checkAdmission);
    };
  }, [isHolderRole]);

  const handleDescend = () => {
    if (!isAdmitted) return;
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
        userSelect: 'none',
      }}
    >
      {/* ── Background: Ambient diffused light through frosted partition ── */}
      <div
        className="threshold-ambient-glow"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.28,
          pointerEvents: 'none',
        }}
      >
        <PublicEncounterRepresentation />
      </div>

      {/* ── Top Bar: Navigation + Brand mark ── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 36px',
          zIndex: 10,
        }}
      >
        {/* Brand mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            display: 'inline-block',
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: 'var(--g-gold)',
            opacity: 0.8,
          }} />
          <span className="t-mono-tag" style={{ letterSpacing: '0.24em', opacity: 0.5 }}>
            HIỆN SINH
          </span>
        </div>

        {/* Info room links */}
        <div style={{ display: 'flex', gap: 24 }}>
          <button
            onClick={onAbout}
            className="t-mono-tag"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(237,236,234,0.35)',
              transition: 'color 0.2s ease',
              padding: 0,
              letterSpacing: '0.18em',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(237,236,234,0.75)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(237,236,234,0.35)'; }}
          >
            ABOUT
          </button>
          <button
            onClick={onDossier}
            className="t-mono-tag"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(237,236,234,0.35)',
              transition: 'color 0.2s ease',
              padding: 0,
              letterSpacing: '0.18em',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(237,236,234,0.75)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(237,236,234,0.35)'; }}
          >
            DOSSIER
          </button>
        </div>
      </div>

      {/* ── Center stage: Title + Subtitle + Curator Desk + Descend invitation ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 5,
          padding: '0 24px',
          maxWidth: 680,
          width: '100%',
        }}
      >
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: 'center', marginBottom: 12 }}
        >
          <h1
            className="t-gallery-title"
            style={{
              letterSpacing: '0.24em',
              fontWeight: 200,
            }}
          >
            HIỆN SINH
          </h1>
        </motion.div>

        {/* Subtitle / Contemplative Question */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          style={{ textAlign: 'center', marginBottom: 52 }}
        >
          <p className="t-gallery-subtitle">
            What is the origin of value: the artist, the brush, or the observer’s perception?
          </p>
        </motion.div>

        {/* Curator desk */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
        >
          <CuratorDesk
            onDescend={handleDescend}
            onClose={() => setIsAdmitted(isPublicEncounterCompleted())}
          />
        </motion.div>

        {/* Descend invitation (Gated: visible only after 3-step Public Curator admission) */}
        {isAdmitted && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            style={{ marginTop: 44, textAlign: 'center' }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', position: 'relative' }}>
              <button
                onClick={handleDescend}
                className={`t-mono-tag${!atelierVisited ? ' entry-pulse' : ''}`}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'rgba(218,172,98,0.75)',
                  padding: '8px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  transition: 'color 0.4s ease, text-shadow 0.4s ease',
                  letterSpacing: '0.2em',
                  animationPlayState: atelierVisited ? 'paused' : 'running',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'rgba(218,172,98,0.98)';
                  e.currentTarget.style.textShadow = '0 0 20px rgba(218,172,98,0.55)';
                  e.currentTarget.style.animation = 'none';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'rgba(218,172,98,0.75)';
                  e.currentTarget.style.textShadow = 'none';
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
              <div style={{ position: 'absolute', left: '100%', paddingLeft: 10, display: 'flex' }}>
                <GlassHint
                  hint="The Atelier contains nine Frame editions. Select an edition to enter its room."
                  position="top"
                  size={14}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Bottom metadata strip ── */}
      <motion.div
        className="threshold-meta"
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
          FRAME PRACTICE — 9 EDITIONS
        </span>
      </motion.div>
    </motion.div>
  );
};

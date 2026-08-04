'use client';
/**
 * FrameArtwork — Visual Artwork Renderers for the 9 Canonical Frames
 *
 * Provides distinct, breathtaking digital abstract art compositions
 * for each of the 9 frames of "Hiện Sinh".
 *
 * Palette: Cold Luxury — Deep Obsidian, Smoked Amber, Mineral Slate, Gold Foil.
 */

import React from 'react';

interface FrameArtworkProps {
  frameId: number;
  isSanctum?: boolean;
  imageUrl?: string;
}

export const FrameArtwork: React.FC<FrameArtworkProps> = ({ frameId, isSanctum = false, imageUrl }) => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: '#060708',
      }}
    >
      {/* Real PNG Artwork (if authenticated & fetched from Supabase/IPFS) */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`Frame ${frameId} Canonical Work`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            position: 'relative',
            zIndex: 1,
            animation: 'glassHintFadeIn 1s ease forwards',
          }}
        />
      ) : null}

      {/* Composition variations based on frame ID (Abstract Placeholder / Pre-load State) */}
      {frameId === 1 && (
        /* Encounter — First Light: Piercing golden ray in dark mineral fog */
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 20% 30%, rgba(218,172,98,0.35) 0%, rgba(12,13,16,0.95) 70%)',
          }} />
          <div style={{
            position: 'absolute', top: '-20%', left: '15%', width: '40%', height: '140%',
            background: 'linear-gradient(115deg, transparent 40%, rgba(240,200,130,0.25) 48%, rgba(218,172,98,0.5) 50%, rgba(240,200,130,0.2) 52%, transparent 60%)',
            filter: 'blur(8px)',
            transform: 'rotate(-15deg)',
          }} />
          <div style={{
            position: 'absolute', bottom: '15%', right: '20%', width: '120px', height: '120px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(218,172,98,0.2) 0%, transparent 70%)',
            filter: 'blur(15px)',
          }} />
        </div>
      )}

      {frameId === 2 && (
        /* Encounter — The Threshold: Vertical obsidian partition with warm ambient glow */
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, #07080a 0%, #0d0f14 45%, #181a22 50%, #0a0b0e 55%, #050607 100%)',
          }} />
          <div style={{
            position: 'absolute', top: 0, bottom: 0, left: '48%', width: '4%',
            background: 'linear-gradient(180deg, rgba(218,172,98,0.8) 0%, rgba(218,172,98,0.2) 40%, rgba(240,200,130,0.9) 70%, rgba(196,148,72,0.3) 100%)',
            boxShadow: '0 0 30px rgba(218,172,98,0.6), 0 0 60px rgba(218,172,98,0.3)',
          }} />
        </div>
      )}

      {frameId === 3 && (
        /* Encounter — Surface: Metallic gold ripples on charcoal void */
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(circle at 60% 50%, #12141a 0%, #060708 100%)',
          }} />
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.75 }}>
            <circle cx="60%" cy="50%" r="25%" fill="none" stroke="rgba(218,172,98,0.35)" strokeWidth="1" />
            <circle cx="60%" cy="50%" r="40%" fill="none" stroke="rgba(218,172,98,0.2)" strokeWidth="1.5" strokeDasharray="4 8" />
            <circle cx="60%" cy="50%" r="55%" fill="none" stroke="rgba(218,172,98,0.12)" strokeWidth="1" />
          </svg>
        </div>
      )}

      {frameId === 4 && (
        /* Encounter — Immersion: Volumetric dark mist with submerged glowing core */
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(circle at 50% 60%, rgba(180,140,70,0.3) 0%, rgba(20,24,32,0.8) 45%, #050607 85%)',
          }} />
          <div style={{
            position: 'absolute', top: '35%', left: '35%', width: '30%', height: '30%',
            background: 'rgba(218,172,98,0.4)',
            filter: 'blur(35px)',
            borderRadius: '40% 60% 70% 30% / 40% 50% 60% 70%',
          }} />
        </div>
      )}

      {frameId === 5 && (
        /* Frame 5: COMPLETE ARCHIVE — Master Synthesis (Sacred Geometry & Radiant Gold Lattice) */
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(218,172,98,0.25) 0%, rgba(15,17,22,0.9) 60%, #060708 100%)',
          }} />
          {/* Sacred geometry lattice lines */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.6 }}>
            <line x1="0" y1="0" x2="100%" y2="100%" stroke="rgba(218,172,98,0.25)" strokeWidth="1" />
            <line x1="100%" y1="0" x2="0" y2="100%" stroke="rgba(218,172,98,0.25)" strokeWidth="1" />
            <circle cx="50%" cy="50%" r="30%" fill="none" stroke="rgba(240,200,130,0.4)" strokeWidth="1.5" />
            <rect x="35%" y="25%" width="30%" height="50%" fill="none" stroke="rgba(218,172,98,0.3)" strokeWidth="1" transform="rotate(45 50 50)" />
          </svg>
          {/* Radiant center core */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            width: isSanctum ? '260px' : '120px',
            height: isSanctum ? '260px' : '120px',
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,225,160,0.7) 0%, rgba(218,172,98,0.4) 40%, transparent 70%)',
            filter: 'blur(20px)',
          }} />
        </div>
      )}

      {frameId === 6 && (
        /* Encounter — The Question: Radial resonance cutting dark space */
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, #090a0d 0%, #141720 100%)',
          }} />
          <div style={{
            position: 'absolute', top: '20%', left: '10%', right: '10%', height: '1px',
            background: 'rgba(218,172,98,0.4)', boxShadow: '0 0 15px rgba(218,172,98,0.5)',
          }} />
          <div style={{
            position: 'absolute', top: '75%', left: '10%', right: '10%', height: '1px',
            background: 'rgba(218,172,98,0.2)',
          }} />
        </div>
      )}

      {frameId === 7 && (
        /* Encounter — Silence: Minimalist dark plane with gold horizon */
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, #040506 0%, #0a0c10 70%, #15120a 100%)',
          }} />
          <div style={{
            position: 'absolute', bottom: '25%', left: 0, right: 0, height: '2px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(218,172,98,0.7) 50%, transparent 100%)',
            boxShadow: '0 0 20px rgba(218,172,98,0.8)',
          }} />
        </div>
      )}

      {frameId === 8 && (
        /* Encounter — Return: Golden eclipse ring */
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(circle at 45% 50%, #101218 0%, #050607 100%)',
          }} />
          <div style={{
            position: 'absolute', top: '50%', left: '45%', width: '140px', height: '140px',
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            border: '2px solid rgba(218,172,98,0.6)',
            boxShadow: '0 0 35px rgba(218,172,98,0.4), inset 0 0 25px rgba(218,172,98,0.3)',
          }} />
        </div>
      )}

      {frameId === 9 && (
        /* Encounter — Remainder: Asymmetric gold foil texture */
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 80% 20%, rgba(218,172,98,0.25) 0%, #060708 75%)',
          }} />
          <div style={{
            position: 'absolute', top: '10%', right: '10%', width: '35%', height: '50%',
            background: 'linear-gradient(135deg, rgba(240,200,130,0.3) 0%, rgba(196,148,72,0.1) 100%)',
            filter: 'blur(25px)',
            transform: 'skewY(-10deg)',
          }} />
        </div>
      )}

      {/* Surface texture grain over artwork */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at center, transparent 30%, rgba(6,7,8,0.5) 100%)',
        pointerEvents: 'none',
      }} />
    </div>
  );
};

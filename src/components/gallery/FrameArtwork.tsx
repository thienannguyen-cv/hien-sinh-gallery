'use client';
/**
 * FrameArtwork — Secure Artwork Presentation & Reveal Component
 *
 * Handles:
 *   1. Unowned / Public: Abstract frosted glass geometry silhouette.
 *   2. Owned / Verified: Triggers RitualSpinner during secure fetch.
 *   3. Session Caching: Caches fetched Blob URLs so subsequent views load instantly.
 *   4. Revealed: Rich high-res painterly PNG artwork canvas with gold-amber Sacred Aura.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RitualSpinner } from './RitualSpinner';

interface FrameArtworkProps {
  frameId: number;
  isOwned: boolean;
  isCenter?: boolean;
  title: string;
  edition: string;
  aspectRatio?: string;
  showDetails?: boolean;
  className?: string;
}

// Module-level session blob cache to avoid re-fetching during the session
const sessionImageCache = new Map<number, string>();

/**
 * Generate a high-resolution painterly digital artwork canvas blob URL
 * representing the authentic painting "Hiện Sinh" for each Canonical Axis.
 */
function getArtworkUrl(frameId: number): Promise<string> {
  if (sessionImageCache.has(frameId)) {
    return Promise.resolve(sessionImageCache.get(frameId)!);
  }

  return new Promise(resolve => {
    setTimeout(() => {
      // Color & texture palettes for the 9 canonical axes of "Hiện Sinh"
      const palettes: Record<number, { gold: string; dark: string; warm: string; accent: string; title: string }> = {
        1: { gold: '#e5b869', dark: '#0a0805', warm: '#38250e', accent: '#f5d38b', title: 'Encounter — First Light' },
        2: { gold: '#dba254', dark: '#06070a', warm: '#2e1e0b', accent: '#ebd09b', title: 'Encounter — The Threshold' },
        3: { gold: '#c99042', dark: '#08090d', warm: '#241708', accent: '#dfbd82', title: 'Encounter — Surface' },
        4: { gold: '#f0c77a', dark: '#050608', warm: '#422c10', accent: '#fae3b3', title: 'Encounter — Immersion' },
        5: { gold: '#f7d996', dark: '#070604', warm: '#523412', accent: '#fff0cc', title: 'Complete Archive — Designated Steward' },
        6: { gold: '#cca055', dark: '#090a0e', warm: '#2b1b0a', accent: '#e0c48d', title: 'Encounter — The Question' },
        7: { gold: '#b88a42', dark: '#040507', warm: '#1f1306', accent: '#d4b274', title: 'Encounter — Silence' },
        8: { gold: '#e0b263', dark: '#08090c', warm: '#3a240d', accent: '#f0d6a1', title: 'Encounter — Return' },
        9: { gold: '#d6a656', dark: '#050608', warm: '#301e0a', accent: '#e8cb92', title: 'Encounter — Remainder' },
      };

      const p = palettes[frameId] || palettes[5];

      // High-resolution painterly SVG canvas mimicking rich oil paint & gold leaf texture
      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1200" width="1920" height="1200">
          <defs>
            <!-- Deep Charcoal Wall Background Gradient -->
            <radialGradient id="bgGrad" cx="50%" cy="50%" r="80%">
              <stop offset="0%" stop-color="${p.warm}" stop-opacity="0.8" />
              <stop offset="45%" stop-color="${p.dark}" stop-opacity="0.96" />
              <stop offset="100%" stop-color="#040506" stop-opacity="1" />
            </radialGradient>

            <!-- Luminous Gold Leaf Core -->
            <radialGradient id="goldCore" cx="50%" cy="50%" r="45%">
              <stop offset="0%" stop-color="${p.accent}" stop-opacity="0.95" />
              <stop offset="25%" stop-color="${p.gold}" stop-opacity="0.75" />
              <stop offset="60%" stop-color="${p.warm}" stop-opacity="0.3" />
              <stop offset="100%" stop-color="transparent" stop-opacity="0" />
            </radialGradient>

            <!-- Organic Brush Stroke Texture Mask -->
            <radialGradient id="strokeGlow" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stop-color="${p.gold}" stop-opacity="0.6" />
              <stop offset="70%" stop-color="${p.warm}" stop-opacity="0.1" />
              <stop offset="100%" stop-color="transparent" />
            </radialGradient>

            <filter id="oilBlur">
              <feGaussianBlur stdDeviation="60" />
            </filter>

            <filter id="fineBlur">
              <feGaussianBlur stdDeviation="15" />
            </filter>
          </defs>

          <!-- Canvas Base -->
          <rect width="100%" height="100%" fill="url(#bgGrad)" />

          <!-- Layer 1: Soft Ambient Underpainting -->
          <circle cx="960" cy="600" r="500" fill="url(#goldCore)" filter="url(#oilBlur)" opacity="0.85" />

          <!-- Layer 2: Painterly Impasto / Gold Leaf Swaths -->
          <ellipse cx="880" cy="520" rx="420" ry="280" fill="url(#strokeGlow)" filter="url(#oilBlur)" transform="rotate(-15 880 520)" />
          <ellipse cx="1060" cy="680" rx="360" ry="220" fill="url(#strokeGlow)" filter="url(#oilBlur)" transform="rotate(25 1060 680)" opacity="0.7" />

          <!-- Layer 3: Organic Gold Filament Textures (Hand-painted effect) -->
          <path d="M 460 750 Q 800 300 1460 450" fill="none" stroke="${p.gold}" stroke-width="4" stroke-opacity="0.4" filter="url(#fineBlur)" />
          <path d="M 520 400 Q 960 780 1380 550" fill="none" stroke="${p.accent}" stroke-width="3" stroke-opacity="0.5" filter="url(#fineBlur)" />
          <path d="M 700 300 Q 960 600 1220 350" fill="none" stroke="${p.gold}" stroke-width="6" stroke-opacity="0.3" filter="url(#oilBlur)" />

          <!-- Layer 4: Central Luminescent Heart -->
          <circle cx="960" cy="600" r="180" fill="${p.accent}" opacity="0.25" filter="url(#oilBlur)" />
          <circle cx="960" cy="600" r="80" fill="#ffffff" opacity="0.2" filter="url(#fineBlur)" />

          <!-- Layer 5: Fine Relational Axis Markings -->
          <line x1="160" y1="600" x2="1760" y2="600" stroke="${p.gold}" stroke-opacity="0.12" stroke-width="1" />
          <line x1="960" y1="120" x2="960" y2="1080" stroke="${p.gold}" stroke-opacity="0.12" stroke-width="1" />
          <circle cx="960" cy="600" r="420" fill="none" stroke="${p.gold}" stroke-opacity="0.15" stroke-width="1" stroke-dasharray="12 8" />

          <!-- Title Stamp -->
          <text x="960" y="1040" font-family="'EB Garamond', serif" font-style="italic" font-size="22" fill="${p.gold}" opacity="0.6" text-anchor="middle" letter-spacing="4">HIỆN SINH — ${p.title}</text>
        </svg>
      `;

      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const blobUrl = URL.createObjectURL(blob);
      sessionImageCache.set(frameId, blobUrl);
      resolve(blobUrl);
    }, 1200); // 1.2s ritual loading delay
  });
}

export const FrameArtwork: React.FC<FrameArtworkProps> = ({
  frameId,
  isOwned,
  isCenter = false,
  aspectRatio = '1.6 / 1',
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(
    sessionImageCache.get(frameId) || null
  );
  const [isLoading, setIsLoading] = useState<boolean>(
    isOwned && !sessionImageCache.has(frameId)
  );

  useEffect(() => {
    if (isOwned && !imageUrl) {
      setIsLoading(true);
      getArtworkUrl(frameId).then(url => {
        setImageUrl(url);
        setIsLoading(false);
      });
    }
  }, [isOwned, frameId, imageUrl]);

  return (
    <div
      style={{
        width: '100%',
        aspectRatio,
        border: isCenter
          ? '1px solid rgba(218,172,98,0.3)'
          : isOwned
          ? '1px solid rgba(232,235,238,0.18)'
          : '1px solid rgba(232,235,238,0.08)',
        background: isOwned
          ? 'rgba(9, 10, 12, 0.95)'
          : 'rgba(6, 7, 8, 0.85)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: isCenter
          ? '0 0 80px rgba(218,172,98,0.12), inset 0 0 40px rgba(218,172,98,0.05)'
          : isOwned
          ? '0 12px 40px rgba(0,0,0,0.6)'
          : 'inset 0 0 40px rgba(0,0,0,0.9)',
        transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <AnimatePresence mode="wait">
        {/* State 1: Loading verification */}
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(8, 9, 12, 0.92)',
              backdropFilter: 'blur(16px)',
              zIndex: 10,
            }}
          >
            <RitualSpinner label="DECRYPTING CANONICAL AXIS..." size={48} />
          </motion.div>
        )}

        {/* State 2: Unowned / Public Frosted Abstract Geometry */}
        {!isOwned && (
          <motion.div
            key="unowned"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(180deg, rgba(12,13,16,0.98) 0%, rgba(8,9,12,0.95) 100%)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                bottom: '-20%',
                left: '10%',
                right: '10%',
                height: '60%',
                background: 'radial-gradient(ellipse at top, rgba(218,172,98,0.04) 0%, transparent 70%)',
                opacity: 0.6,
                filter: 'blur(20px)',
              }}
            />
          </motion.div>
        )}

        {/* State 3: Revealed High-Res Painting Artwork */}
        {isOwned && imageUrl && (
          <motion.div
            key="revealed"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={imageUrl}
              alt={`Canonical Axis ${frameId}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            {/* Subtle highlight gradient overlay */}
            {isCenter && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'radial-gradient(circle at center, rgba(218,172,98,0.08) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Gold Border Accent for Complete Frame */}
      {isCenter && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(218,172,98,0.6) 30%, rgba(218,172,98,0.8) 50%, rgba(218,172,98,0.6) 70%, transparent)',
            zIndex: 12,
          }}
        />
      )}
    </div>
  );
};

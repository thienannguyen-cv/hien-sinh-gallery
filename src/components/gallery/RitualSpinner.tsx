'use client';
/**
 * RitualSpinner — Elegant Relational Transmission Loading Indicator
 *
 * A minimalist, dignified loading indicator matching the Cold Luxury
 * glass gallery aesthetic. It represents a visual transition only and must
 * never be interpreted as wallet, archive, or transaction progress.
 */

import React from 'react';
import { motion } from 'framer-motion';

interface RitualSpinnerProps {
  message?: string;
  size?: number;
}

export const RitualSpinner: React.FC<RitualSpinnerProps> = ({
  message = 'TRANSMISSION IN PROGRESS',
  size = 48,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        padding: 32,
      }}
    >
      {/* Concentric rotating gold rings */}
      <div
        style={{
          position: 'relative',
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Outer ring — slow clockwise */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '1px solid rgba(218,172,98,0.25)',
            borderTopColor: 'rgba(218,172,98,0.7)',
          }}
        />

        {/* Inner ring — faster counter-clockwise */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            inset: 8,
            borderRadius: '50%',
            border: '1px stroke rgba(232,235,238,0.15)',
            borderBottomColor: 'rgba(240,200,130,0.8)',
          }}
        />

        {/* Pulsing center core */}
        <motion.div
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'rgba(218,172,98,0.9)',
            boxShadow: '0 0 12px rgba(218,172,98,0.8)',
          }}
        />
      </div>

      {/* Transmission message */}
      <motion.span
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="t-mono-tag"
        style={{ letterSpacing: '0.24em', color: 'rgba(218,172,98,0.6)' }}
      >
        {message}
      </motion.span>
    </div>
  );
};

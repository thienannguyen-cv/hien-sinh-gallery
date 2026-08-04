'use client';
/**
 * RitualSpinner — Minimalist Cold Luxury Loading Spinner
 *
 * Displays a rotating gold-amber concentric ring with a pulsing core
 * and subtle status text during secure artwork verification and decryption.
 */

import React from 'react';
import { motion } from 'framer-motion';

interface RitualSpinnerProps {
  label?: string;
  size?: number;
}

export const RitualSpinner: React.FC<RitualSpinnerProps> = ({
  label = 'VERIFYING RELATIONAL BOND...',
  size = 64,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      {/* Outer & Inner Rotating Concentric Rings */}
      <div style={{ position: 'relative', width: size, height: size }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '1px solid rgba(218, 172, 98, 0.15)',
            borderTopColor: 'rgba(218, 172, 98, 0.7)',
            borderRightColor: 'rgba(218, 172, 98, 0.3)',
          }}
        />

        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
          style={{
            position: 'absolute',
            inset: size * 0.18,
            borderRadius: '50%',
            border: '1px dashed rgba(232, 235, 238, 0.2)',
            borderBottomColor: 'rgba(218, 172, 98, 0.6)',
          }}
        />

        {/* Pulsing Core */}
        <motion.div
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.8, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            inset: size * 0.38,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(218, 172, 98, 0.8) 0%, rgba(218, 172, 98, 0.1) 70%, transparent 100%)',
            boxShadow: '0 0 16px rgba(218, 172, 98, 0.4)',
          }}
        />
      </div>

      {/* Monospace Status Label */}
      {label && (
        <span
          className="t-mono-tag"
          style={{
            opacity: 0.4,
            letterSpacing: '0.24em',
            fontSize: '0.58rem',
            textAlign: 'center',
            color: 'rgba(237, 236, 234, 0.6)',
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
};

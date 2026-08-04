'use client';
/**
 * CuratorDesk — The Glass Panel on the Pedestal
 *
 * A frosted glass panel mounted on a dark minimal pedestal,
 * situated in the threshold hall. The glass reflects the room
 * subtly and invites touch. When activated, it expands via
 * shared layout animation to fill the screen, becoming the
 * full Curator terminal.
 *
 * Physical metaphor: stepping up to a consultation window
 * and having it open to envelop you.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CuratorTerminal } from './CuratorTerminal';

export const CuratorDesk: React.FC = () => {
  const [active, setActive] = useState(false);

  return (
    <>
      {/* ── Background scrim when terminal is active ── */}
      <AnimatePresence>
        {active && (
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 40,
              background: 'rgba(6,7,8,0.72)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Pedestal + Glass panel ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          zIndex: 50,
        }}
      >
        {!active && (
          <motion.div
            layoutId="curator-glass"
            onClick={() => setActive(true)}
            style={{
              width: 360,
              cursor: 'pointer',
            }}
          >
            {/* Glass panel */}
            <motion.div
              className="glass-panel--elevated"
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.99 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                width: '100%',
                height: 190,
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                // Elevated glass
                background: 'rgba(232,235,238,0.052)',
                border: '1px solid rgba(232,235,238,0.13)',
                backdropFilter: 'blur(30px) saturate(170%) contrast(1.05)',
                WebkitBackdropFilter: 'blur(30px) saturate(170%) contrast(1.05)',
                boxShadow: `
                  inset 0 1px 0 rgba(255,255,255,0.10),
                  inset 0 -1px 0 rgba(0,0,0,0.28),
                  0 32px 100px rgba(0,0,0,0.65),
                  0 0 80px rgba(218,172,98,0.05)
                `,
              }}
            >
              {/* Glass reflection highlight — top edge */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 1,
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 30%, rgba(255,255,255,0.32) 50%, rgba(255,255,255,0.18) 70%, transparent 100%)',
              }} />

              {/* Subtle noise texture on glass */}
              <div style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.035,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                mixBlendMode: 'overlay',
              }} />

              {/* Drifting light on glass surface */}
              <motion.div
                animate={{
                  x: ['-20%', '20%', '-10%', '15%', '-20%'],
                  y: ['10%', '-10%', '20%', '-5%', '10%'],
                }}
                transition={{
                  duration: 18,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{
                  position: 'absolute',
                  width: '140%',
                  height: '140%',
                  top: '-20%',
                  left: '-20%',
                  background: 'radial-gradient(ellipse at 40% 40%, rgba(218,172,98,0.065) 0%, transparent 60%)',
                }}
              />

              {/* Center indicator text */}
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}>
                <div className="t-mono-tag" style={{
                  color: 'rgba(237,236,234,0.28)',
                  letterSpacing: '0.25em',
                }}>
                  CONSULT THE ORACLE
                </div>
                <div style={{
                  width: 20,
                  height: 1,
                  background: 'rgba(218,172,98,0.3)',
                }} />
              </div>
            </motion.div>

            {/* Pedestal */}
            <div style={{
              width: '100%',
              height: 6,
              background: 'linear-gradient(to bottom, rgba(18,19,22,0.9), rgba(12,13,16,0.95))',
              borderLeft: '1px solid rgba(232,235,238,0.06)',
              borderRight: '1px solid rgba(232,235,238,0.06)',
              borderBottom: '1px solid rgba(232,235,238,0.04)',
            }} />
            <div style={{
              width: '85%',
              marginLeft: '7.5%',
              height: 28,
              background: 'linear-gradient(to bottom, rgba(12,13,16,1), rgba(9,10,12,1))',
              border: '1px solid rgba(232,235,238,0.055)',
              borderTop: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div className="t-mono-tag" style={{ color: 'rgba(237,236,234,0.18)', letterSpacing: '0.2em' }}>
                MONOLITHIC CURATOR
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Full-screen terminal (shared layout) ── */}
        <AnimatePresence>
          {active && (
            <motion.div
              layoutId="curator-glass"
              key="curator-terminal"
              initial={false}
              style={{
                position: 'fixed',
                inset: '5vh 5vw',
                zIndex: 60,
                display: 'flex',
                flexDirection: 'column',
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 28 }}
            >
              <div
                style={{
                  position: 'relative',
                  flex: 1,
                  background: 'rgba(232,235,238,0.042)',
                  border: '1px solid rgba(232,235,238,0.13)',
                  backdropFilter: 'blur(30px) saturate(170%) contrast(1.05)',
                  WebkitBackdropFilter: 'blur(30px) saturate(170%) contrast(1.05)',
                  boxShadow: `
                    inset 0 1px 0 rgba(255,255,255,0.10),
                    inset 0 -1px 0 rgba(0,0,0,0.3),
                    0 40px 120px rgba(0,0,0,0.80)
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
                }} />

                {/* Ambient glass glow */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'radial-gradient(ellipse at 30% 20%, rgba(218,172,98,0.04) 0%, transparent 55%)',
                  pointerEvents: 'none',
                }} />

                <CuratorTerminal onClose={() => setActive(false)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

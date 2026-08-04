'use client';
/**
 * GlassHint — Contextual tooltip in gallery aesthetic
 *
 * A small "?" glyph that reveals a frosted-glass tooltip on hover.
 * Designed to be unobtrusive and consistent with the cold luxury
 * visual language. Provides Web3 context to visitors who need it
 * without breaking immersion for those who don't.
 */

import React, { useState, useRef, useEffect } from 'react';

interface GlassHintProps {
  hint: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  /** Size of the glyph in px */
  size?: number;
}

export const GlassHint: React.FC<GlassHintProps> = ({
  hint,
  position = 'top',
  align = 'center',
  size = 14,
}) => {
  const [visible, setVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const glyphRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!visible || !glyphRef.current) return;

    // Calculate position relative to glyph
    const offset = 10;
    const style: React.CSSProperties = {
      position: 'absolute',
      whiteSpace: 'normal',
      width: 'max-content',
      maxWidth: 240,
      zIndex: 200,
    };

    switch (position) {
      case 'top':
        style.bottom = `calc(100% + ${offset}px)`;
        break;
      case 'bottom':
        style.top = `calc(100% + ${offset}px)`;
        break;
      case 'left':
        style.right = `calc(100% + ${offset}px)`;
        style.top = '50%';
        style.transform = 'translateY(-50%)';
        break;
      case 'right':
        style.left = `calc(100% + ${offset}px)`;
        style.top = '50%';
        style.transform = 'translateY(-50%)';
        break;
    }

    // Horizontal alignment for top/bottom tooltips
    if (position === 'top' || position === 'bottom') {
      if (align === 'center') {
        style.left = '50%';
        style.transform = 'translateX(-50%)';
      } else if (align === 'start') {
        style.left = 0;
      } else {
        style.right = 0;
      }
    }

    setTooltipStyle(style);
  }, [visible, position, align]);

  return (
    <span
      ref={glyphRef}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: '50%',
        border: '1px solid rgba(232,235,238,0.12)',
        color: 'rgba(237,236,234,0.25)',
        fontSize: size * 0.6,
        fontFamily: 'var(--f-mono, "JetBrains Mono", monospace)',
        cursor: 'help',
        userSelect: 'none',
        transition: 'all 0.4s ease',
        pointerEvents: 'all',
        ...(visible
          ? {
              borderColor: 'rgba(218,172,98,0.3)',
              color: 'rgba(218,172,98,0.6)',
              background: 'rgba(218,172,98,0.04)',
            }
          : {}),
      }}
    >
      ?
      {visible && (
        <span
          style={{
            ...tooltipStyle,
            background: 'rgba(10,11,14,0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(232,235,238,0.08)',
            borderRadius: 3,
            padding: '10px 14px',
            color: 'rgba(237,236,234,0.6)',
            fontSize: '0.62rem',
            fontFamily: 'var(--f-mono, "JetBrains Mono", monospace)',
            letterSpacing: '0.04em',
            lineHeight: '1.6',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            pointerEvents: 'none',
            animation: 'glassHintFadeIn 0.25s ease forwards',
          }}
        >
          {hint}
        </span>
      )}
    </span>
  );
};

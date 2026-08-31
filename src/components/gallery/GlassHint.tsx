'use client';

import React, { useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface GlassHintProps {
  hint: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  /** Visual diameter of the glyph in px. */
  size?: number;
}

interface TooltipPosition {
  left: number;
  top: number;
}

const VIEWPORT_MARGIN = 12;
const TOOLTIP_OFFSET = 10;

export const GlassHint: React.FC<GlassHintProps> = ({
  hint,
  position = 'top',
  align = 'center',
  size = 14,
}) => {
  const [visible, setVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tooltipId = useId();

  useLayoutEffect(() => {
    if (!visible || !triggerRef.current || !tooltipRef.current) return;

    const placeTooltip = () => {
      if (!triggerRef.current || !tooltipRef.current) return;

      const trigger = triggerRef.current.getBoundingClientRect();
      const tooltip = tooltipRef.current.getBoundingClientRect();
      let left = trigger.left + (trigger.width - tooltip.width) / 2;
      let top = trigger.top - tooltip.height - TOOLTIP_OFFSET;

      if (position === 'top' || position === 'bottom') {
        if (align === 'start') left = trigger.left;
        if (align === 'end') left = trigger.right - tooltip.width;

        top = position === 'top'
          ? trigger.top - tooltip.height - TOOLTIP_OFFSET
          : trigger.bottom + TOOLTIP_OFFSET;

        if (top < VIEWPORT_MARGIN && position === 'top') {
          top = trigger.bottom + TOOLTIP_OFFSET;
        } else if (top + tooltip.height > window.innerHeight - VIEWPORT_MARGIN && position === 'bottom') {
          top = trigger.top - tooltip.height - TOOLTIP_OFFSET;
        }
      } else {
        top = trigger.top + (trigger.height - tooltip.height) / 2;
        left = position === 'left'
          ? trigger.left - tooltip.width - TOOLTIP_OFFSET
          : trigger.right + TOOLTIP_OFFSET;

        if (left < VIEWPORT_MARGIN && position === 'left') {
          left = trigger.right + TOOLTIP_OFFSET;
        } else if (left + tooltip.width > window.innerWidth - VIEWPORT_MARGIN && position === 'right') {
          left = trigger.left - tooltip.width - TOOLTIP_OFFSET;
        }
      }

      left = Math.min(
        Math.max(left, VIEWPORT_MARGIN),
        Math.max(VIEWPORT_MARGIN, window.innerWidth - tooltip.width - VIEWPORT_MARGIN),
      );
      top = Math.min(
        Math.max(top, VIEWPORT_MARGIN),
        Math.max(VIEWPORT_MARGIN, window.innerHeight - tooltip.height - VIEWPORT_MARGIN),
      );

      setTooltipPosition({ left, top });
    };

    placeTooltip();
    window.addEventListener('resize', placeTooltip);
    window.addEventListener('scroll', placeTooltip, true);

    return () => {
      window.removeEventListener('resize', placeTooltip);
      window.removeEventListener('scroll', placeTooltip, true);
    };
  }, [align, hint, position, visible]);

  const tooltip = visible && typeof document !== 'undefined'
    ? createPortal(
        <div
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          style={{
            position: 'fixed',
            left: tooltipPosition?.left ?? 0,
            top: tooltipPosition?.top ?? 0,
            zIndex: 10000,
            width: 'max-content',
            maxWidth: 'min(270px, calc(100vw - 24px))',
            boxSizing: 'border-box',
            visibility: tooltipPosition ? 'visible' : 'hidden',
            background: 'rgba(10,11,14,0.96)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(232,235,238,0.1)',
            borderRadius: 3,
            padding: '10px 14px',
            color: 'rgba(237,236,234,0.68)',
            fontSize: '0.62rem',
            fontFamily: 'var(--f-mono, "JetBrains Mono", monospace)',
            letterSpacing: '0.04em',
            lineHeight: 1.6,
            boxShadow: '0 8px 32px rgba(0,0,0,0.46)',
            pointerEvents: 'none',
            animation: 'glassHintFadeIn 0.25s ease forwards',
          }}
        >
          {hint}
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`More information: ${hint}`}
        aria-describedby={visible ? tooltipId : undefined}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        onClick={() => setVisible(true)}
        onKeyDown={event => {
          if (event.key === 'Escape') {
            setVisible(false);
            triggerRef.current?.blur();
          }
        }}
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
          width: size,
          height: size,
          minWidth: size,
          padding: 0,
          overflow: 'visible',
          borderRadius: '50%',
          border: `1px solid ${visible ? 'rgba(218,172,98,0.34)' : 'rgba(232,235,238,0.14)'}`,
          background: visible ? 'rgba(218,172,98,0.05)' : 'transparent',
          color: visible ? 'rgba(218,172,98,0.68)' : 'rgba(237,236,234,0.34)',
          fontSize: Math.max(8, size * 0.62),
          fontFamily: 'var(--f-mono, "JetBrains Mono", monospace)',
          fontWeight: 400,
          lineHeight: 1,
          textAlign: 'center',
          cursor: 'help',
          userSelect: 'none',
          transition: 'border-color 0.35s ease, color 0.35s ease, background 0.35s ease',
          pointerEvents: 'auto',
        }}
      >
        <span aria-hidden="true" style={{ display: 'block', transform: 'translateY(-0.02em)' }}>
          ?
        </span>
      </button>
      {tooltip}
    </>
  );
};

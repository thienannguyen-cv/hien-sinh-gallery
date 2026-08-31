import React, { useId } from 'react';

export type GlassCorner = 'tl' | 'tr' | 'bl' | 'br';

interface GlassCornerSpandrelsProps {
  /** Corner radius percentage relative to full container width/height (default: 4.15%) */
  radiusPercent?: number;
  /** Explicit pixel radius if not percentage (optional) */
  radiusPx?: number;
  /** Which corners to render (default: all 4 corners) */
  corners?: GlassCorner[];
  /** Active illumination multiplier (0.0 to 1.0) */
  intensity?: number;
  /** Whether the parent container is currently focused/hovered */
  isFocused?: boolean;
  /** Whether optical light waves are currently traversing the perimeter */
  hasLightWave?: boolean;
  /** Optional custom class name */
  className?: string;
  /** Optional custom style overrides */
  style?: React.CSSProperties;
}

/**
 * GlassCornerSpandrels ("Kính hóa góc khuyết")
 *
 * Fills the geometric corner spandrels between sharp 90-degree outer architectural
 * frames and the rounded-corner silhouette of the artwork / panel.
 *
 * Each corner is crafted as a high-refraction vitreous prism featuring:
 * 1. Two straight architectural outer hairline borders with gold specular sheen.
 * 2. One precision concave arc tracing the rounded silhouette with a luminous polished bevel.
 * 3. Deep obsidian-gold caustic glass body that refracts and scatters ambient gallery light rays.
 * 4. Micro-faceted internal optical dispersion lines reflecting light dynamically.
 */
export const GlassCornerSpandrels: React.FC<GlassCornerSpandrelsProps> = ({
  radiusPercent = 4.15,
  radiusPx,
  corners = ['tl', 'tr', 'bl', 'br'],
  intensity = 1.0,
  isFocused = false,
  hasLightWave = false,
  className = '',
  style = {},
}) => {
  // Reserved for callers that still pass an explicit pixel radius; the current
  // SVG geometry remains percentage-based so rendering is unchanged.
  void radiusPx;
  const rawId = useId();
  const id = rawId.replace(/:/g, '-');

  const r = radiusPercent;
  const invR = (100 - r).toFixed(2);
  const rStr = r.toFixed(2);

  // Optical brightness calculations based on gallery state
  const baseAlpha = isFocused ? 1.0 : (hasLightWave ? 0.95 : 0.85);
  const specularAlpha = (baseAlpha * intensity).toFixed(2);

  const showTL = corners.includes('tl');
  const showTR = corners.includes('tr');
  const showBL = corners.includes('bl');
  const showBR = corners.includes('br');

  return (
    <div
      className={`glass-corner-spandrels ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 15,
        overflow: 'hidden',
        ...style,
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          overflow: 'visible',
        }}
      >
        <defs>
          {/* ── Vitreous Obsidian-Gold Body Gradients ── */}
          {/* Top-Left: Apex at (0,0) */}
          <radialGradient id={`glass-body-tl-${id}`} cx="0%" cy="0%" r="6%" fx="0%" fy="0%">
            <stop offset="0%" stopColor="rgba(255, 248, 220, 0.45)" />
            <stop offset="30%" stopColor="rgba(218, 172, 98, 0.28)" />
            <stop offset="65%" stopColor="rgba(150, 165, 185, 0.10)" />
            <stop offset="100%" stopColor="rgba(6, 7, 8, 0.70)" />
          </radialGradient>

          {/* Top-Right: Apex at (100,0) */}
          <radialGradient id={`glass-body-tr-${id}`} cx="100%" cy="0%" r="6%" fx="100%" fy="0%">
            <stop offset="0%" stopColor="rgba(255, 248, 220, 0.45)" />
            <stop offset="30%" stopColor="rgba(218, 172, 98, 0.28)" />
            <stop offset="65%" stopColor="rgba(150, 165, 185, 0.10)" />
            <stop offset="100%" stopColor="rgba(6, 7, 8, 0.70)" />
          </radialGradient>

          {/* Bottom-Left: Apex at (0,100) */}
          <radialGradient id={`glass-body-bl-${id}`} cx="0%" cy="100%" r="6%" fx="0%" fy="100%">
            <stop offset="0%" stopColor="rgba(255, 248, 220, 0.45)" />
            <stop offset="30%" stopColor="rgba(218, 172, 98, 0.28)" />
            <stop offset="65%" stopColor="rgba(150, 165, 185, 0.10)" />
            <stop offset="100%" stopColor="rgba(6, 7, 8, 0.70)" />
          </radialGradient>

          {/* Bottom-Right: Apex at (100,100) */}
          <radialGradient id={`glass-body-br-${id}`} cx="100%" cy="100%" r="6%" fx="100%" fy="100%">
            <stop offset="0%" stopColor="rgba(255, 248, 220, 0.45)" />
            <stop offset="30%" stopColor="rgba(218, 172, 98, 0.28)" />
            <stop offset="65%" stopColor="rgba(150, 165, 185, 0.10)" />
            <stop offset="100%" stopColor="rgba(6, 7, 8, 0.70)" />
          </radialGradient>

          {/* ── Luminous Curved Bevel Rim Gradients ── */}
          <linearGradient id={`bevel-tl-${id}`} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(218, 172, 98, 0.75)" />
            <stop offset="50%" stopColor="rgba(255, 248, 225, 0.98)" />
            <stop offset="100%" stopColor="rgba(218, 172, 98, 0.75)" />
          </linearGradient>

          <linearGradient id={`bevel-tr-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(218, 172, 98, 0.75)" />
            <stop offset="50%" stopColor="rgba(255, 248, 225, 0.98)" />
            <stop offset="100%" stopColor="rgba(218, 172, 98, 0.75)" />
          </linearGradient>

          <linearGradient id={`bevel-bl-${id}`} x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="rgba(218, 172, 98, 0.75)" />
            <stop offset="50%" stopColor="rgba(255, 248, 225, 0.98)" />
            <stop offset="100%" stopColor="rgba(218, 172, 98, 0.75)" />
          </linearGradient>

          <linearGradient id={`bevel-br-${id}`} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(218, 172, 98, 0.75)" />
            <stop offset="50%" stopColor="rgba(255, 248, 225, 0.98)" />
            <stop offset="100%" stopColor="rgba(218, 172, 98, 0.75)" />
          </linearGradient>

          {/* ── Optical Caustic Flare Filter for Specular Bevel ── */}
          <filter id={`corner-glow-${id}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="0.35" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ════════════════════════════════════════════════════════════════
            1. TOP-LEFT GLASS CORNER SPANDREL
           ════════════════════════════════════════════════════════════════ */}
        {showTL && (
          <g opacity={specularAlpha} style={{ transition: 'opacity 0.4s ease' }}>
            {/* Glass body fill */}
            <path
              d={`M 0,0 L ${rStr},0 A ${rStr},${rStr} 0 0,0 0,${rStr} Z`}
              fill={`url(#glass-body-tl-${id})`}
            />

            {/* Internal refractive caustic facet line (diamond cut from apex towards arc) */}
            <line
              x1="0"
              y1="0"
              x2={(r * 0.293).toFixed(2)}
              y2={(r * 0.293).toFixed(2)}
              stroke="rgba(255, 248, 220, 0.65)"
              strokeWidth="0.22"
            />

            {/* Two straight outer architectural hairlines */}
            <path
              d={`M ${rStr},0 L 0,0 L 0,${rStr}`}
              fill="none"
              stroke="rgba(218, 172, 98, 0.50)"
              strokeWidth="0.35"
            />

            {/* Curved inner arc: Polished bevel catching gold specular rim light */}
            <path
              d={`M ${rStr},0 A ${rStr},${rStr} 0 0,0 0,${rStr}`}
              fill="none"
              stroke={`url(#bevel-tl-${id})`}
              strokeWidth="0.42"
              filter={`url(#corner-glow-${id})`}
            />

            {/* Subtle micro-dot specular glint at corner apex */}
            <circle
              cx="0.35"
              cy="0.35"
              r="0.32"
              fill="rgba(255, 255, 255, 0.85)"
            />
          </g>
        )}

        {/* ════════════════════════════════════════════════════════════════
            2. TOP-RIGHT GLASS CORNER SPANDREL
           ════════════════════════════════════════════════════════════════ */}
        {showTR && (
          <g opacity={specularAlpha} style={{ transition: 'opacity 0.4s ease' }}>
            {/* Glass body fill */}
            <path
              d={`M 100,0 L ${invR},0 A ${rStr},${rStr} 0 0,1 100,${rStr} Z`}
              fill={`url(#glass-body-tr-${id})`}
            />

            {/* Internal refractive caustic facet line */}
            <line
              x1="100"
              y1="0"
              x2={(100 - r * 0.293).toFixed(2)}
              y2={(r * 0.293).toFixed(2)}
              stroke="rgba(255, 248, 220, 0.65)"
              strokeWidth="0.22"
            />

            {/* Two straight outer architectural hairlines */}
            <path
              d={`M ${invR},0 L 100,0 L 100,${rStr}`}
              fill="none"
              stroke="rgba(218, 172, 98, 0.50)"
              strokeWidth="0.35"
            />

            {/* Curved inner arc: Polished bevel */}
            <path
              d={`M ${invR},0 A ${rStr},${rStr} 0 0,1 100,${rStr}`}
              fill="none"
              stroke={`url(#bevel-tr-${id})`}
              strokeWidth="0.42"
              filter={`url(#corner-glow-${id})`}
            />

            {/* Apex glint */}
            <circle
              cx="99.65"
              cy="0.35"
              r="0.32"
              fill="rgba(255, 255, 255, 0.85)"
            />
          </g>
        )}

        {/* ════════════════════════════════════════════════════════════════
            3. BOTTOM-LEFT GLASS CORNER SPANDREL
           ════════════════════════════════════════════════════════════════ */}
        {showBL && (
          <g opacity={specularAlpha} style={{ transition: 'opacity 0.4s ease' }}>
            {/* Glass body fill */}
            <path
              d={`M 0,100 L ${rStr},100 A ${rStr},${rStr} 0 0,1 0,${invR} Z`}
              fill={`url(#glass-body-bl-${id})`}
            />

            {/* Internal refractive caustic facet line */}
            <line
              x1="0"
              y1="100"
              x2={(r * 0.293).toFixed(2)}
              y2={(100 - r * 0.293).toFixed(2)}
              stroke="rgba(255, 248, 220, 0.65)"
              strokeWidth="0.22"
            />

            {/* Two straight outer architectural hairlines */}
            <path
              d={`M ${rStr},100 L 0,100 L 0,${invR}`}
              fill="none"
              stroke="rgba(218, 172, 98, 0.50)"
              strokeWidth="0.35"
            />

            {/* Curved inner arc: Polished bevel */}
            <path
              d={`M ${rStr},100 A ${rStr},${rStr} 0 0,1 0,${invR}`}
              fill="none"
              stroke={`url(#bevel-bl-${id})`}
              strokeWidth="0.42"
              filter={`url(#corner-glow-${id})`}
            />

            {/* Apex glint */}
            <circle
              cx="0.35"
              cy="99.65"
              r="0.32"
              fill="rgba(255, 255, 255, 0.85)"
            />
          </g>
        )}

        {/* ════════════════════════════════════════════════════════════════
            4. BOTTOM-RIGHT GLASS CORNER SPANDREL
           ════════════════════════════════════════════════════════════════ */}
        {showBR && (
          <g opacity={specularAlpha} style={{ transition: 'opacity 0.4s ease' }}>
            {/* Glass body fill */}
            <path
              d={`M 100,100 L ${invR},100 A ${rStr},${rStr} 0 0,0 100,${invR} Z`}
              fill={`url(#glass-body-br-${id})`}
            />

            {/* Internal refractive caustic facet line */}
            <line
              x1="100"
              y1="100"
              x2={(100 - r * 0.293).toFixed(2)}
              y2={(100 - r * 0.293).toFixed(2)}
              stroke="rgba(255, 248, 220, 0.65)"
              strokeWidth="0.22"
            />

            {/* Two straight outer architectural hairlines */}
            <path
              d={`M ${invR},100 L 100,100 L 100,${invR}`}
              fill="none"
              stroke="rgba(218, 172, 98, 0.50)"
              strokeWidth="0.35"
            />

            {/* Curved inner arc: Polished bevel */}
            <path
              d={`M ${invR},100 A ${rStr},${rStr} 0 0,0 100,${invR}`}
              fill="none"
              stroke={`url(#bevel-br-${id})`}
              strokeWidth="0.42"
              filter={`url(#corner-glow-${id})`}
            />

            {/* Apex glint */}
            <circle
              cx="99.65"
              cy="99.65"
              r="0.32"
              fill="rgba(255, 255, 255, 0.85)"
            />
          </g>
        )}
      </svg>
    </div>
  );
};

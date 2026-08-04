import React from 'react';

const MONO_FONT_STYLE = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' };

export const FrameIndex: React.FC = () => {
  
  // 9 Canonical Axes (3x3 grid) — Artist holds Frame 00 (Anchor)
  // Frames 01-08 available to Collectors; Frame 00 reserved for Artist's Anchor
  const frames = Array.from({ length: 9 }, (_, i) => i); // 0-8: 00 = Artist's Anchor

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center font-mono select-none py-2 pb-6" style={MONO_FONT_STYLE}>
      {/* Architectural Section Header */}
      <div className="text-center mb-3 font-mono" style={MONO_FONT_STYLE}>
        <h3 className="font-mono text-neutral-300 text-xs tracking-[0.3em] uppercase mb-1 font-bold whitespace-nowrap select-none" style={MONO_FONT_STYLE}>
          [ RING 01 // THE 9 CANONICAL AXES ]
        </h3>
        <p className="font-mono text-[10px] text-neutral-400 tracking-[0.2em] uppercase font-semibold whitespace-nowrap select-none" style={MONO_FONT_STYLE}>
          [ CANONICAL NODE INDEX // 9 SPATIAL ALLOCATIONS ]
        </p>
      </div>
      
      {/* 3x3 Cryptographic Matrix: Floating Directly in Obsidian Void */}
      <div className="grid grid-cols-3 gap-5 p-6 relative font-mono" style={MONO_FONT_STYLE}>
        {frames.map((frame) => {
          const isArtistAnchor = frame === 0;
          const isActive = frame === 1; // Frame 01 — first collector node
          const frameLabel = frame.toString().padStart(2, '0');
          return (
            <div 
              key={frame}
              style={MONO_FONT_STYLE}
              className={`w-24 h-24 aspect-square border text-[11px] font-mono transition-all duration-300 flex flex-col items-center justify-center relative group select-none rounded-none
                ${isArtistAnchor
                  ? 'bg-charcoal border-neutral-400/60 text-neutral-200 shadow-[0_0_30px_rgba(255,255,255,0.12)] cursor-default'
                  : isActive 
                    ? 'bg-obsidian border-neutral-200 text-neutral-100 shadow-[0_0_20px_rgba(255,255,255,0.25)]' 
                    : 'bg-obsidian/30 opacity-20 border-white/[0.06] text-neutral-500 hover:opacity-100 hover:border-neutral-300/80 hover:text-neutral-100 hover:bg-obsidian/80 hover:shadow-[0_0_15px_rgba(255,255,255,0.15)] cursor-pointer'}
              `}
              title={isArtistAnchor ? `Frame #00 — Artist's Anchor` : `Frame #${frameLabel}`}
            >
              {/* Animate pulse for artist anchor */}
              {isArtistAnchor && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-neutral-400/70 rounded-full animate-pulse"></span>
              )}

              {/* Corner accent line for active node */}
              {isActive && (
                <span className="absolute top-0.5 right-0.5 w-1 h-1 bg-neutral-200 rounded-full animate-pulse"></span>
              )}
              
              <span className="font-bold text-[13px] tracking-widest" style={MONO_FONT_STYLE}>
                {frameLabel}
              </span>

              {isArtistAnchor && (
                <span className="text-[8px] tracking-[0.15em] text-neutral-400 mt-0.5 uppercase" style={MONO_FONT_STYLE}>ANCHOR</span>
              )}
              
              {/* Subtle hover node indicator */}
              {!isArtistAnchor && !isActive && (
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.04] transition-colors pointer-events-none"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Metadata Footnote with Safe Bottom Padding & DevAccessBar Clearance */}
      <div className="mt-3.5 text-center max-w-lg font-mono text-[10px] text-neutral-400/80 leading-relaxed pb-4" style={MONO_FONT_STYLE}>
        <p className="tracking-wide" style={MONO_FONT_STYLE}>A RELATIONAL PRACTICE CONFIGURATION. EACH NODE PERMITS A SYMBOLIC GENERATIVE EVENT.</p>
        <div className="mt-2 flex items-center justify-center gap-3 text-[10px] text-neutral-300 uppercase tracking-widest font-semibold" style={MONO_FONT_STYLE}>
          <span style={MONO_FONT_STYLE}>[ TOTAL SUPPLY // 9 EDITIONS ]</span>
          <span>//</span>
          <span style={MONO_FONT_STYLE}>[ FRAME_01 // ACCESSED ]</span>
        </div>
      </div>
    </div>
  );
};

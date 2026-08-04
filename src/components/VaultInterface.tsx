import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

const MONO_FONT_STYLE = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' };

export const VaultInterface: React.FC = () => {
  const { role } = useAuth();

  if (role !== 'Steward') {
    return (
      <div className="w-full max-w-3xl mx-auto mt-16 bg-charcoal/90 border border-subpixel/80 p-12 text-center flex flex-col items-center shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-md relative overflow-hidden select-none" style={MONO_FONT_STYLE}>
        <div className="absolute top-0 left-0 w-full h-[1px] bg-neutral-300/30"></div>
        <ShieldAlert className="w-10 h-10 text-neutral-400 mb-6 animate-pulse" />
        <h2 className="font-mono text-neutral-200 tracking-[0.25em] uppercase text-xs mb-4 font-bold" style={MONO_FONT_STYLE}>
          [ ACCESSION INCOMPLETE // VAULT LOCKED ]
        </h2>
        <p className="text-neutral-400/80 font-mono text-xs max-w-md leading-relaxed tracking-wide" style={MONO_FONT_STYLE}>
          The Vault remains closed. Token transfer without complete archive custody yields designated successor; accession incomplete.
        </p>
        <div className="mt-8 px-5 py-2.5 border border-white/[0.15] bg-obsidian/90 text-neutral-300 font-mono text-[10px] tracking-[0.25em] uppercase rounded-none font-semibold shadow-[0_0_15px_rgba(0,0,0,0.9)]" style={MONO_FONT_STYLE}>
          [ STATUS // FAIL_CLOSED ] // [ ERR_NO_CUSTODY_EVIDENCE ]
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto mt-2 mb-6 bg-charcoal/95 border border-subpixel/80 shadow-[0_0_60px_rgba(0,0,0,0.9)] backdrop-blur-lg overflow-hidden relative select-none font-mono" style={MONO_FONT_STYLE}>
      <div className="absolute top-0 left-0 w-full h-[1px] bg-neutral-200/40"></div>
      
      {/* Header Bar */}
      <div className="p-5 border-b border-subpixel/60 flex items-center justify-between bg-obsidian/40 font-mono select-none" style={MONO_FONT_STYLE}>
        <div className="flex items-center gap-3 font-mono flex-wrap shrink-0" style={MONO_FONT_STYLE}>
          <ShieldCheck className="w-4 h-4 text-neutral-300 shrink-0" />
          <h2 className="font-mono text-neutral-200 text-xs tracking-[0.25em] uppercase font-semibold whitespace-nowrap" style={MONO_FONT_STYLE}>
            [ INNER SANCTUM // COMPLETE ARCHIVE CUSTODY ]
          </h2>
          <span className="bg-obsidian border border-white/[0.15] text-neutral-300 px-2.5 py-0.5 text-[9px] font-mono font-bold tracking-[0.2em] uppercase rounded-none shadow-[0_0_10px_rgba(255,255,255,0.05)] whitespace-nowrap ml-1" style={MONO_FONT_STYLE}>
            [ STEWARD VERIFIED ]
          </span>
        </div>
        <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-[0.2em] whitespace-nowrap shrink-0 ml-4" style={MONO_FONT_STYLE}>
          [ ACCESS_LEVEL // 02 ]
        </span>
      </div>

      <div className="p-6 flex gap-6 font-mono" style={MONO_FONT_STYLE}>
        {/* Procedural Monochromatic Geometric Core (H_CORE Masterpiece Render) */}
        <div className="flex-1 aspect-square bg-obsidian border border-white/[0.08] p-6 flex flex-col justify-between relative overflow-hidden shadow-inner group font-mono" style={MONO_FONT_STYLE}>
           
           {/* Top HUD Metadata Overlay */}
           <div className="flex justify-between items-center z-10 font-mono text-[8px] tracking-[0.2em] text-neutral-400 uppercase" style={MONO_FONT_STYLE}>
             <span>[ H_CORE // CANONICAL_EMBODIMENT ]</span>
             <span>0x8F3A...C4E1</span>
           </div>

           {/* Animated Monochromatic Geometric Graphic Engine */}
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Outer Rotational Ring */}
              <div className="w-4/5 h-4/5 border border-neutral-300/20 rounded-full animate-[spin_40s_linear_infinite] flex items-center justify-center">
                <div className="w-[98%] h-[98%] border border-dashed border-neutral-400/15 rounded-full"></div>
              </div>
              
              {/* Inner Rotating Diamond Matrix */}
              <div className="w-3/5 h-3/5 border border-neutral-200/25 absolute rotate-45 animate-[spin_25s_linear_infinite_reverse] flex items-center justify-center">
                <div className="w-3/4 h-3/4 border border-white/10"></div>
              </div>

              {/* Crosshair Alignment Axes */}
              <div className="w-full h-[1px] bg-neutral-500/10 absolute"></div>
              <div className="h-full w-[1px] bg-neutral-500/10 absolute"></div>

              {/* Pulsing Core Center */}
              <div className="w-6 h-6 border border-neutral-200/50 bg-neutral-900/80 rounded-full animate-pulse z-10 shadow-[0_0_15px_rgba(255,255,255,0.1)]"></div>
           </div>

           {/* Bottom HUD Metadata Overlay */}
           <div className="flex justify-between items-center z-10 font-mono text-[8px] tracking-[0.2em] text-neutral-400 uppercase" style={MONO_FONT_STYLE}>
             <span style={MONO_FONT_STYLE}>[ SYS_MODE // RENDER_ACTIVE ]</span>
             <span style={MONO_FONT_STYLE}>[ ROT // 0.02RAD/S ]</span>
           </div>
        </div>

        {/* Cryptographic Hashes and Metadata */}
        <div className="flex-1 space-y-5 font-mono" style={MONO_FONT_STYLE}>
          <div>
            <h3 className="font-mono text-neutral-300 text-[10px] tracking-[0.2em] mb-2 uppercase flex items-center gap-2 font-semibold select-none" style={MONO_FONT_STYLE}>
              [ CANONICAL MASTERPIECE HASH ]
            </h3>
            <div className="bg-obsidian px-3 py-2 border border-white/[0.08] text-neutral-300 font-mono text-[10px] tracking-normal leading-relaxed select-all hover:border-neutral-400/40 hover:bg-neutral-900/80 transition-colors cursor-pointer whitespace-nowrap overflow-x-auto" style={MONO_FONT_STYLE}>
              190dfcfc8439c1613c149e72088c0bd32eefa66f2ded7cfbc0f250640b146d8e
            </div>
          </div>
          
          <div>
            <h3 className="font-mono text-neutral-300 text-[10px] tracking-[0.2em] mb-2 uppercase flex items-center gap-2 font-semibold select-none" style={MONO_FONT_STYLE}>
              [ SCAR-CODE PROOF HASH ]
            </h3>
            <div className="bg-obsidian px-3 py-2 border border-white/[0.08] text-neutral-300 font-mono text-[10px] tracking-normal leading-relaxed select-all hover:border-neutral-400/40 hover:bg-neutral-900/80 transition-colors cursor-pointer whitespace-nowrap overflow-x-auto" style={MONO_FONT_STYLE}>
              370e115eb052e1cf9b575840da35d2ec6544daa8ad45d3020ed6d6cd9dce9378
            </div>
          </div>

          <div>
            <h3 className="font-mono text-neutral-300 text-[10px] tracking-[0.2em] mb-2 uppercase flex items-center gap-2 font-semibold select-none" style={MONO_FONT_STYLE}>
              [ RITUAL TRANSCRIPT HASH ]
            </h3>
            <div className="bg-obsidian px-3 py-2 border border-white/[0.08] text-neutral-300 font-mono text-[10px] tracking-normal leading-relaxed select-all hover:border-neutral-400/40 hover:bg-neutral-900/80 transition-colors cursor-pointer whitespace-nowrap overflow-x-auto" style={MONO_FONT_STYLE}>
              3d8e7c0b130f4f8b76bc5d0d4b643b08e03a3bdfb5633317647a2f680c6c0a11
            </div>
          </div>

          <div className="pt-6 border-t border-subpixel/60 font-mono text-[10px] text-neutral-400/70 leading-relaxed tracking-wide" style={MONO_FONT_STYLE}>
             <p style={MONO_FONT_STYLE}>
               CUSTODY EVIDENCE CONFIRMED. THE COMPLETE STEWARD IS THE DESIGNATED BEARER OF THE CANONICAL EMBODIMENT AND ENTERS A STEWARDSHIP RELATION THROUGH CARE.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

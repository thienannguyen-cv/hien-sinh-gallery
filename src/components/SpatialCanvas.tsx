import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MonolithicCurator } from './MonolithicCurator';
import { FrameIndex } from './FrameIndex';
import { VaultInterface } from './VaultInterface';
import { ChevronUp, ChevronDown } from 'lucide-react';

export const SpatialCanvas: React.FC = () => {
  const [level, setLevel] = useState<0 | 1 | 2>(0);

  const handleZoomIn = () => setLevel((prev) => Math.min(prev + 1, 2) as 0 | 1 | 2);
  const handleZoomOut = () => setLevel((prev) => Math.max(prev - 1, 0) as 0 | 1 | 2);

  const ringNames = ['RING_00_THRESHOLD', 'RING_01_FRAME_GALLERY', 'RING_02_VAULT_SANCTUM'];
  const hudNames = ['THRESHOLD_TERMINAL_HUD', 'FRAME_GALLERY_HUD', 'VAULT_SANCTUM_HUD'];

  return (
    <div className="relative w-full h-screen bg-obsidian overflow-hidden flex flex-col items-center justify-center select-none">
      
      {/* 1. Grain / Noise Texture Overlay */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* 2. Deep Ambient Radial Light Glow */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 opacity-40 transition-all duration-700"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.08) 0%, rgba(20, 20, 22, 0.4) 45%, rgba(10, 10, 11, 0.95) 85%)'
        }}
      />

      {/* 3. Edge Metadata HUD (4 Viewport Corners) */}
      <div 
        className="pointer-events-none fixed inset-0 z-30 p-6 font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-400 opacity-35 flex flex-col justify-between"
        style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
      >
        {/* Top Edge */}
        <div className="flex justify-between items-center" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>
          <span className="whitespace-nowrap select-none shrink-0" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>{`[ Z_LEVEL // 0${level} // ${ringNames[level]} ]`}</span>
          <span className="whitespace-nowrap select-none shrink-0" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>{`[ ${hudNames[level]} // COMMIT // 0x8F3A...C4E1 ]`}</span>
        </div>
        
        {/* Bottom Edge */}
        <div className="flex justify-between items-center mb-12" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>
          <span className="whitespace-nowrap select-none shrink-0" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>{`[ LATENCY // 12MS // ARCHIVE_EDITIONS // 9 ]`}</span>
          <span className="whitespace-nowrap select-none shrink-0" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>{`[ HIỆN SINH // RELATIONAL_PRACTICE_V2.0 ]`}</span>
        </div>
      </div>

      {/* 4. Mechanical Z-Depth Meter Vault Gauge Container (Right Fixed) */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 flex flex-col items-center bg-charcoal/90 border border-white/10 p-4 rounded-none z-40 backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.8)] font-mono" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>
        <div className="font-mono text-[9px] text-neutral-300 font-semibold tracking-[0.2em] uppercase mb-4 text-center border-b border-white/[0.08] pb-2 w-full" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>
          [ Z-DEPTH METER ]
        </div>

        <button 
          onClick={handleZoomOut} 
          disabled={level === 0}
          style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
          className="text-neutral-300 hover:text-neutral-100 disabled:opacity-40 disabled:text-neutral-500 transition-all flex flex-col items-center gap-1 font-mono text-[10px] tracking-wider cursor-pointer disabled:cursor-not-allowed mb-4 group font-medium"
        >
          <ChevronUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform text-neutral-200" />
          <span>ZOOM OUT</span>
        </button>
        
        {/* Mechanical Step Indicators */}
        <div className="flex flex-col items-center gap-2.5 my-2 w-full py-2 border-y border-white/[0.08]" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>
           {[0, 1, 2].map(l => (
             <div key={l} className="flex items-center gap-2.5 w-full justify-between px-1" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>
               <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }} className={`font-mono text-[9px] ${l === level ? 'text-neutral-100 font-bold' : 'text-neutral-300 font-medium opacity-80'}`}>
                 0{l}
               </span>
               <div className={`transition-all duration-300 ${l === level ? 'w-5 h-1 bg-neutral-100 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'w-3 h-0.5 bg-neutral-400/60'}`}></div>
             </div>
           ))}
        </div>

        <button 
          onClick={handleZoomIn} 
          disabled={level === 2}
          style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
          className="text-neutral-300 hover:text-neutral-100 disabled:opacity-40 disabled:text-neutral-500 transition-all flex flex-col items-center gap-1 font-mono text-[10px] tracking-wider cursor-pointer disabled:cursor-not-allowed mt-4 group font-medium"
        >
          <span>ZOOM IN</span>
          <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform text-neutral-200" />
        </button>

        <div className="mt-4 pt-2 border-t border-white/[0.06] font-mono text-[8px] text-neutral-400 font-semibold uppercase tracking-widest" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>
          {`[ Z_DEPTH // 0${level}/02 ]`}
        </div>
      </div>

      {/* Spatial Z-Axis Container with Depth Transitions */}
      <div className="relative w-full h-full max-w-6xl mx-auto flex flex-col items-center justify-center z-10 perspective-[1000px] pt-12 pb-16 overflow-y-auto scrollbar-none">
        <AnimatePresence mode="wait">
          {level === 0 && (
            <motion.div 
              key="ring-0"
              initial={{ opacity: 0, scale: 1.3, filter: 'blur(8px)', translateZ: 400 }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', translateZ: 0 }}
              exit={{ opacity: 0, scale: 0.85, filter: 'blur(6px)', translateZ: -200 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col items-center"
            >
              <div className="text-center mb-3">
                <h1 className="font-mono text-4xl tracking-[0.35em] font-bold mb-3 text-neutral-100 uppercase">HIỆN SINH</h1>
                <p className="font-mono text-neutral-400 text-xs max-w-lg mx-auto leading-relaxed tracking-wider uppercase">
                  NOT A PAINTING, NOT A TOKEN // A RELATIONAL PRACTICE ON BLOCKCHAIN
                </p>
              </div>
              <MonolithicCurator />
            </motion.div>
          )}

          {level === 1 && (
            <motion.div 
              key="ring-1"
              initial={{ opacity: 0, scale: 1.25, filter: 'blur(8px)', translateZ: 300 }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', translateZ: 0 }}
              exit={{ opacity: 0, scale: 0.85, filter: 'blur(6px)', translateZ: -200 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <FrameIndex />
            </motion.div>
          )}

          {level === 2 && (
            <motion.div 
              key="ring-2"
              initial={{ opacity: 0, scale: 1.25, filter: 'blur(8px)', translateZ: 300 }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', translateZ: 0 }}
              exit={{ opacity: 0, scale: 1.3, filter: 'blur(8px)', translateZ: 400 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <VaultInterface />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
    </div>
  );
};

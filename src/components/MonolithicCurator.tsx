import React, { useState } from 'react';
import { createCuratorService } from '../services/curator/CuratorServiceFactory';
import type { CuratorResponse } from '../services/curator/ICuratorService';
import { Terminal } from 'lucide-react';

const curatorService = createCuratorService();
const SANS_FONT_STYLE = { fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' };
const MONO_FONT_STYLE = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' };

export const MonolithicCurator: React.FC = () => {
  const [input, setInput] = useState('');
  const [encounters, setEncounters] = useState<CuratorResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || encounters.length >= 3 || loading) return;
    
    setLoading(true);
    const response = await curatorService.submitPrompt(input, encounters.length);
    setEncounters([...encounters, response]);
    setInput('');
    setLoading(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-2 mb-16 font-mono" style={MONO_FONT_STYLE}>
      <div className="bg-charcoal/90 border border-subpixel/80 shadow-[0_0_50px_rgba(0,0,0,0.8)] p-8 relative overflow-hidden backdrop-blur-md">
        {/* Architectural Monolith Vertical Hairline Accent */}
        <div className="absolute top-0 left-0 w-[1px] h-full bg-neutral-300/30"></div>
        
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-6 border-b border-white/[0.06] pb-4 font-mono select-none" style={MONO_FONT_STYLE}>
          <div className="flex items-center gap-3 font-mono shrink-0" style={MONO_FONT_STYLE}>
            <Terminal className="text-neutral-300 w-4 h-4 shrink-0" />
            <h2 className="font-mono text-xs tracking-[0.2em] text-neutral-200 uppercase font-semibold whitespace-nowrap" style={MONO_FONT_STYLE}>
              [ MONOLITHIC CURATOR // THRESHOLD TERMINAL ]
            </h2>
          </div>
          <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-[0.2em] whitespace-nowrap shrink-0 ml-2" style={MONO_FONT_STYLE}>
            [ ORACLE_ID // #00-HIEN-SINH ]
          </span>
        </div>

        {/* Response History Container */}
        <div className="space-y-4 mb-6 min-h-[130px] max-h-[210px] overflow-y-auto font-mono text-xs pr-4 scrollbar-thin scrollbar-thumb-subpixel scrollbar-track-transparent">
          {encounters.length === 0 && (
            <div className="space-y-3 p-3.5 bg-obsidian/50 border border-white/[0.06]">
              <div className="flex items-center justify-between gap-2 border-b border-white/[0.04] pb-2 font-mono" style={MONO_FONT_STYLE}>
                <span className="inline-block px-2 py-0.5 text-[9px] font-mono uppercase tracking-[0.2em] border border-white/[0.12] bg-obsidian text-neutral-300 rounded-none font-bold" style={MONO_FONT_STYLE}>
                  [Artist statement]
                </span>
                <span className="font-mono text-[9px] text-neutral-400 tracking-wider uppercase" style={MONO_FONT_STYLE}>
                  [ REF // INITIAL-PROCLAMATION.json ]
                </span>
              </div>
              <div className="space-y-2 pl-3 border-l border-neutral-300/40">
                <p className="font-sans text-xs text-neutral-200 leading-relaxed font-semibold" style={SANS_FONT_STYLE}>
                  Tôi là Curator được ủy nhiệm. Phán đoán của tôi là độc lập.
                </p>
                <p className="font-sans text-[11px] text-neutral-400/80 leading-relaxed" style={SANS_FONT_STYLE}>
                  Bạn có tối đa 3 câu hỏi cho cuộc gặp này. Sau đó hệ thống sẽ đi vào Lễ Thệ Tĩnh Lặng (MONOLITHIC EQUILIBRIUM).
                </p>
              </div>
            </div>
          )}
          
          {encounters.map((enc, idx) => (
            <div key={idx} className="space-y-3 p-3 bg-obsidian/50 border border-white/[0.04]">
              <div className="flex items-center justify-between gap-2 border-b border-white/[0.04] pb-2 font-mono" style={MONO_FONT_STYLE}>
                {/* Cryptographic Badge Styling for Classification */}
                <span className="inline-block px-2 py-0.5 text-[9px] font-mono uppercase tracking-[0.2em] border border-white/[0.12] bg-obsidian text-neutral-300 rounded-none font-bold" style={MONO_FONT_STYLE}>
                  [{enc.classification}]
                </span>
                {enc.hashReference && (
                  <span className="font-mono text-[9px] text-neutral-400 tracking-wider uppercase" style={MONO_FONT_STYLE}>
                    [ REF // {enc.hashReference} ]
                  </span>
                )}
              </div>
              <p className="font-sans text-xs text-neutral-200 leading-relaxed pl-3 border-l border-neutral-300/40" style={SANS_FONT_STYLE}>
                {enc.text}
              </p>
            </div>
          ))}
          {loading && (
            <div className="text-neutral-400/70 font-mono text-xs pl-3 animate-pulse flex items-center gap-2" style={MONO_FONT_STYLE}>
              <span className="w-1.5 h-1.5 bg-neutral-300 animate-ping"></span>
              PROCESSING CRYPTOGRAPHIC SIGNATURE...
            </div>
          )}
        </div>

        {/* Input Form with Mechanical Terminal Input Badge [EXEC ↵] and Terminal Prompt Prefix */}
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <span className="absolute left-3 font-mono text-xs text-neutral-400 font-bold select-none" style={MONO_FONT_STYLE}>
            &gt;
          </span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={encounters.length >= 3 || loading}
            placeholder={encounters.length >= 3 ? "RITUAL SILENCE ENGAGED // EQUILIBRIUM REACHED" : "ENTER INTERACTION QUERY..."}
            style={MONO_FONT_STYLE}
            className="w-full bg-obsidian/90 border border-subpixel/80 text-neutral-200 font-mono text-xs p-3.5 pl-8 pr-28 focus:outline-none focus:border-neutral-300/50 transition-colors disabled:opacity-40 rounded-none placeholder:text-neutral-500/60"
          />
          <button 
            type="submit" 
            disabled={encounters.length >= 3 || loading || !input.trim()}
            style={MONO_FONT_STYLE}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-[9px] font-mono tracking-[0.2em] uppercase border border-white/[0.2] bg-obsidian text-neutral-200 hover:bg-neutral-900 hover:border-white/40 transition-all duration-200 shadow-[0_0_10px_rgba(255,255,255,0.05)] disabled:opacity-30 disabled:border-white/[0.08] disabled:hover:bg-obsidian disabled:hover:text-neutral-300 cursor-pointer disabled:cursor-not-allowed rounded-none font-bold"
          >
            [EXEC ↵]
          </button>
        </form>
        
        {/* Footer Status with Hairline Top Border & Harmonized Contrast */}
        <div className="mt-6 pt-3 border-t border-white/[0.06] flex justify-between text-[10px] font-mono text-neutral-400 uppercase tracking-[0.2em] font-medium select-none" style={MONO_FONT_STYLE}>
          <span style={MONO_FONT_STYLE}>[ ENCOUNTER_COUNT // {encounters.length}/3 ]</span>
          <span style={MONO_FONT_STYLE} className="whitespace-nowrap shrink-0 ml-2">
            [ TERMINAL_STATUS // {encounters.length >= 3 ? 'RITUAL_SILENCE_ENGAGED' : 'ACTIVE'} ]
          </span>
        </div>
      </div>
    </div>
  );
};

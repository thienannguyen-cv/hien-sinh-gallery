import React from 'react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../services/auth/IAuthAdapter';

const MONO_FONT_STYLE = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' };

export const DevAccessBar: React.FC = () => {
  const { role, setRole } = useAuth();
  
  const roles: UserRole[] = ['Public', 'Practitioner', 'Steward'];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-obsidian/95 border-t border-white/[0.1] px-6 py-2.5 flex items-center justify-between font-mono text-[10px] tracking-[0.2em] uppercase z-50 backdrop-blur-md select-none" style={MONO_FONT_STYLE}>
      <div className="flex items-center gap-2 text-neutral-300 font-semibold font-mono" style={MONO_FONT_STYLE}>
        <span style={MONO_FONT_STYLE} className="whitespace-nowrap select-none">[ REVERENT ROLE TRANSMUTATION ALTAR ]</span>
      </div>
      
      <div className="flex gap-2.5 font-mono" style={MONO_FONT_STYLE}>
        {roles.map(r => {
          const isActive = role === r;
          return (
            <button
              key={r}
              onClick={() => setRole(r)}
              style={MONO_FONT_STYLE}
              className={`px-3 py-1 transition-all cursor-pointer rounded-none font-mono text-[10px] tracking-wider uppercase border ${
                isActive 
                  ? 'bg-obsidian border-white/40 text-neutral-100 font-bold shadow-[0_0_12px_rgba(255,255,255,0.15)]' 
                  : 'bg-charcoal/90 text-neutral-300 font-medium border-white/[0.12] hover:border-neutral-200/60 hover:text-neutral-100 hover:bg-neutral-800/60'
              }`}
            >
              {r}
            </button>
          );
        })}
      </div>
    </div>
  );
};

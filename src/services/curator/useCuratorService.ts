/**
 * useCuratorService — Hook wrapper
 * Adapts ICuratorService.submitPrompt() to a simple query() API
 * for gallery components.
 */

import { useMemo } from 'react';
import { SupabaseCuratorService } from './SupabaseCuratorService';
import type { ICuratorService } from './ICuratorService';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

interface SimpleCuratorClient {
  query(prompt: string, encounterCount: number): Promise<string>;
}

function wrapService(svc: ICuratorService): SimpleCuratorClient {
  return {
    async query(prompt: string, encounterCount: number): Promise<string> {
      const result = await svc.submitPrompt(prompt, encounterCount);
      const seal = `[${result.classification.toUpperCase()}]`;
      const ref = result.hashReference ? ` [ REF // ${result.hashReference} ]` : '';
      return `${seal}\n\n${result.text}${ref}`;
    },
  };
}

export function useCuratorService(): SimpleCuratorClient {
  return useMemo(() => {
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      return wrapService(new SupabaseCuratorService());
    }
    // Fallback stub when env vars not configured
    return {
      async query(_prompt: string, _encounterCount: number): Promise<string> {
        return '[ARTIST STATEMENT]\n\nThe Oracle is not yet connected. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable live dialogue.';
      },
    };
  }, []);
}

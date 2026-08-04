/**
 * SupabaseCuratorService
 * Gọi Supabase Edge Function `oracle-proxy` để nhận phản hồi từ Gemini API
 * một cách an toàn (API Key ẩn ở server-side).
 *
 * Sử dụng khi VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY đã được cấu hình.
 */

import type { ICuratorService, CuratorResponse, Classification } from './ICuratorService';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Regex để parse Epistemological Seal từ đầu phản hồi Gemini
const SEAL_REGEX = /^\[(Fact|Artist statement|Inference|Counter-reading)\]/i;
// Regex để parse REF tag
const REF_REGEX = /\[\s*REF\s*\/\/\s*([^\]]+)\]/i;

function parseGeminiResponse(rawText: string): CuratorResponse {
  const sealMatch = rawText.match(SEAL_REGEX);
  const refMatch = rawText.match(REF_REGEX);

  const classification: Classification =
    (sealMatch?.[1] as Classification) ?? 'Inference';

  // Remove the seal prefix and REF tag from display text
  let text = rawText
    .replace(SEAL_REGEX, '')
    .replace(REF_REGEX, '')
    .trim();

  // Clean up leading punctuation / whitespace
  text = text.replace(/^[\s\-—–:]+/, '').trim();

  return {
    classification,
    text: text || rawText, // fallback to raw if parsing fails
    hashReference: refMatch?.[1]?.trim(),
  };
}

export class SupabaseCuratorService implements ICuratorService {
  async submitPrompt(prompt: string, encounterCount: number): Promise<CuratorResponse> {
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/oracle-proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ prompt, encounterCount }),
      });

      if (!res.ok) {
        throw new Error(`Oracle HTTP ${res.status}`);
      }

      const data = await res.json();

      if (data.error && !data.response) {
        throw new Error(data.error);
      }

      return parseGeminiResponse(data.response ?? '');
    } catch (err) {
      console.error('[SupabaseCuratorService]', err);
      // Graceful degradation — return an Oracle-styled error message
      return {
        classification: 'Fact',
        text: '[ ORACLE_STATUS // SIGNAL_INTERRUPTED ] — Lõi phán đoán tạm thời không phản hồi. Vui lòng thử lại sau.',
        hashReference: 'ORACLE-FALLBACK.json',
      };
    }
  }
}

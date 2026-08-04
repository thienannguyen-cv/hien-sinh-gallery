/**
 * CuratorServiceFactory
 * Tự động chọn service phù hợp dựa trên biến môi trường:
 * - Nếu VITE_SUPABASE_URL đã được cấu hình → dùng SupabaseCuratorService (Gemini thực)
 * - Nếu chưa → dùng MockCuratorService (dành cho dev local không có API key)
 */

import type { ICuratorService } from './ICuratorService';
import { MockCuratorService } from './MockCuratorService';
import { SupabaseCuratorService } from './SupabaseCuratorService';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;

export function createCuratorService(): ICuratorService {
  if (supabaseUrl && supabaseUrl.startsWith('https://')) {
    console.info('[Curator] Using SupabaseCuratorService (Gemini API via Edge Function)');
    return new SupabaseCuratorService();
  }
  console.info('[Curator] Using MockCuratorService (no VITE_SUPABASE_URL configured)');
  return new MockCuratorService();
}

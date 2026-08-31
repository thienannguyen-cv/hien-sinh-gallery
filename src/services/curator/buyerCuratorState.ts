/**
 * buyerCuratorState.ts — Buyer / Frame Curator Encounter Session Persistence
 *
 * Manages client-side session persistence for the 3-step Frame Curator encounter.
 *
 * Invariants:
 * 1. Tracks cumulative questions across visits to ensure the 3-encounter limit is respected.
 * 2. Preserves conversation thread, typed progress, used rails (P3, P4), and sealed status in localStorage.
 * 3. On 3rd response completion (encounterCount >= 3), seals the session and permanently unlocks
 *    the full 4-edge counter-clockwise waveguide light cycle.
 */

export interface BuyerCuratorMessage {
  id: string;
  role: 'curator' | 'visitor';
  content: string;
  seal?: string;
  typedLength?: number;
  isTyping?: boolean;
}

export interface BuyerCuratorSession {
  messages: BuyerCuratorMessage[];
  encounterCount: number;
  sealed: boolean;
  completedAt?: number;
  usedRails: string[];
  status: 'IN_PROGRESS' | 'COMPLETED';
  replayPrefixIntact?: boolean;
  completionSources?: Array<'audited-preset' | 'live'>;
  rehearsalSessionId?: string;
}

const STORAGE_KEY_PREFIX = 'hs_buyer_curator_session_v1';

export const CANONICAL_BUYER_SUMMARY_MESSAGES: BuyerCuratorMessage[] = [
  {
    id: 'canonical-buyer-open',
    role: 'curator',
    content: 'The public threshold has closed. What in this Frame practice would you like to examine?',
    seal: '[FRAME CURATOR]',
    typedLength: 89,
    isTyping: false,
  },
  {
    id: 'canonical-buyer-r1',
    role: 'curator',
    content: 'Ở tầng tiếp cận của Frame practice, hạt mầm cấu trúc được khảo sát trong mối liên hệ giữa không gian ý niệm và khả năng sản sinh biểu tượng. Khung không áp đặt hình ảnh cuối cùng mà xác lập các điều kiện biên cho một cuộc hiện sinh.',
    seal: '[FACT]',
    typedLength: 236,
    isTyping: false,
  },
  {
    id: 'canonical-buyer-r2',
    role: 'curator',
    content: 'Các trục P3 và P4 mở rộng sự chú ý đến mối quan hệ giữa tính đa bội (plurality) và sự cô đọng (condensation). Tác phẩm lưu giữ những dấu vết bản thể trong khi để các khả năng diễn giải khác tiếp tục phân nhánh.',
    seal: '[INFERENCE]',
    typedLength: 218,
    isTyping: false,
  },
  {
    id: 'canonical-buyer-r3',
    role: 'curator',
    content: 'Bốn cạnh của khung giờ đây đã được hiện diện đầy đủ theo chu trình hoàn chỉnh. Người thực hành có toàn quyền tiếp tục chiêm ngưỡng và đối chiếu trong không gian Atelier.',
    seal: '[RESPONSE]',
    typedLength: 172,
    isTyping: false,
  },

];

export function getBuyerCuratorSession(role?: string, frameId?: number): BuyerCuratorSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const rolePrefix = role ? `${STORAGE_KEY_PREFIX}_${role.toLowerCase()}` : STORAGE_KEY_PREFIX;
    const key = frameId !== undefined ? `${rolePrefix}_f${frameId}` : rolePrefix;
    const raw = localStorage.getItem(key) || (role ? null : localStorage.getItem(STORAGE_KEY_PREFIX));
    if (raw) {
      return JSON.parse(raw) as BuyerCuratorSession;
    }
  } catch {
    // Graceful fallback
  }
  return null;
}

export function saveBuyerCuratorSession(session: BuyerCuratorSession, role?: string, frameId?: number): void {
  if (typeof window === 'undefined') return;
  try {
    const serialized = JSON.stringify(session);
    const rolePrefix = role ? `${STORAGE_KEY_PREFIX}_${role.toLowerCase()}` : STORAGE_KEY_PREFIX;
    localStorage.setItem(rolePrefix, serialized);
    if (frameId !== undefined) {
      localStorage.setItem(`${rolePrefix}_f${frameId}`, serialized);
    }
  } catch {
    // Storage quota exceeded or private mode
  }
}

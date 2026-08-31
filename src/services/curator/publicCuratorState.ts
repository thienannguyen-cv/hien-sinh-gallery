/**
 * publicCuratorState.ts — Public Curator Encounter Session & Wallet Admission
 *
 * Manages client-side persistence and wallet status for the 3-step Public Curator encounter.
 *
 * Flow:
 * 1. Visitor interacts with Public Curator (3 questions).
 * 2. On 3rd response completion, wallet is admitted (PUBLIC_ADMITTED status).
 * 3. Session is preserved in localStorage.
 * 4. If cookies/storage are cleared for an admitted wallet, canonical summary transcript is restored.
 * 5. Gating: "ENTER THE ATELIER" is unlocked only after PUBLIC_ADMITTED is granted.
 */

export interface PublicCuratorMessage {
  id: string;
  role: 'curator' | 'visitor';
  content: string;
  seal?: string;
  typedLength?: number;
  isTyping?: boolean;
}

export interface PublicCuratorSession {
  messages: PublicCuratorMessage[];
  encounterCount: number;
  sealed: boolean;
  completedAt?: number;
  usedRails: string[];
  replayPrefixIntact?: boolean;
  completionSources?: Array<'audited-preset' | 'live'>;
  rehearsalSessionId?: string;
  status: 'IN_PROGRESS' | 'PUBLIC_COMPLETED';
}

const STORAGE_KEY = 'hs_public_curator_session_v1';
const ADMITTED_WALLET_KEY = 'hs_public_wallet_admitted_v1';
export const ADMITTED_EVENT = 'hs_public_curator_admitted';

export const CANONICAL_PUBLIC_SUMMARY_MESSAGES: PublicCuratorMessage[] = [
  {
    id: 'canonical-open',
    role: 'curator',
    content: 'Bạn đang ở cuộc gặp công khai với Hiện sinh. Tôi đồng hành cùng bạn quan sát tác phẩm; mọi phán xét đối với hình ảnh sau cùng vẫn hoàn toàn thuộc về bạn.',
    seal: '[PUBLIC CURATOR]',
    typedLength: 147,
    isTyping: false,
  },
  {
    id: 'canonical-u1',
    role: 'visitor',
    content: 'Chào bạn, cho mình hỏi cái vòng đen ở ngay giữa bức tranh này là bị lỗi nét vẽ hay tác giả cố ý để như vậy thế?',
    typedLength: 110,
    isTyping: false,
  },
  {
    id: 'canonical-r1',
    role: 'curator',
    content: 'Chào bạn, rất vui được đón tiếp bạn đến với không gian của *Hiện sinh*.\n\nVề vòng đen ở vị trí trung tâm mà bạn nhắc tới, đây không phải là một lỗi nét vẽ. Trong cấu trúc tác phẩm, bố cục của vùng che này là một quyết định có chủ ý nhằm thiết lập điều kiện nguồn ban đầu—nơi tổ chức lại hướng nhìn và tạo ra một ngữ cảnh xuất phát để các dấu vết hình thức đi vào quỹ đạo của tác phẩm, thay vì là một sơ suất kỹ thuật ngẫu nhiên.',
    seal: '[PUBLIC CURATOR]',
    typedLength: 436,
    isTyping: false,
  },
  {
    id: 'canonical-u2',
    role: 'visitor',
    content: 'À ra là tác giả chủ ý đặt ở đó. Nhưng nhìn vào nó mình cứ thấy có cảm giác như một khoảng trống bị che khuất hoàn toàn, làm nổi bật hẳn những vệt màu và đường nét xung quanh. Sự che chắn này có tác động gì đến tổng thể các mảng màu khác trên tranh không bạn?',
    typedLength: 260,
    isTyping: false,
  },
  {
    id: 'canonical-r2',
    role: 'curator',
    content: 'Khoảng trống bị che khuất mà bạn đề cập chính là cách tác phẩm thiết lập một ranh giới cấu trúc. Khi một giới hạn xuất hiện, nó đóng vai trò như một ngưỡng chọn lọc: sự ngăn cách này tác động lên các vệt màu và đường nét xung quanh, khiến chúng phải tương tác và phản chiếu lẫn nhau để các mối liên hệ cùng các kiểu mẫu thị giác được bộc lộ rõ nét hơn. Ranh giới đó vì vậy không chỉ đơn thuần là che phủ, mà trực tiếp tổ chức lại cách các mảng màu đối thoại với nhau trong trải nghiệm của người xem.',
    seal: '[PUBLIC CURATOR]',
    typedLength: 504,
    isTyping: false,
  },
  {
    id: 'canonical-u3',
    role: 'visitor',
    content: 'Nghe bạn giải thích thì khi lùi lại nhìn toàn bộ bức tranh, mình thấy khoảng che ấy đúng là điểm tựa khiến mọi đường nét và mảng màu xung quanh gắn kết lại với nhau. Cảm giác ban đầu tưởng như một nét vẽ lỗi giờ lại mở ra một cách nhìn trọn vẹn và đa chiều hơn về tác phẩm.',
    typedLength: 279,
    isTyping: false,
  },
  {
    id: 'canonical-r3',
    role: 'curator',
    content: 'Góc nhìn toàn thể khi bạn lùi lại để quan sát bức tranh là một không gian tiếp nhận của riêng bạn trong cuộc gặp gỡ này. *Hiện sinh* giữ nguyên sự hiện diện của nó với tất cả những sắp đặt có chủ ý lẫn các yếu tố ngẫu nhiên trên bề mặt, để mỗi người khi đứng trước tác phẩm đều có thể tự do mở ra, tiếp tục hoặc dừng lại ở những liên hệ của chính mình. Chúc bạn có những khoảnh khắc tiếp cận trọn vẹn khi tiếp tục ngắm nhìn tác phẩm.',
    seal: '[PUBLIC CURATOR]',
    typedLength: 466,
    isTyping: false,
  },
];

export function getPublicCuratorSession(): PublicCuratorSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as PublicCuratorSession;
    }

    // Fallback: If localStorage session is missing but wallet was previously admitted
    const isAdmitted = localStorage.getItem(ADMITTED_WALLET_KEY) === 'true';
    if (isAdmitted) {
      return {
        messages: CANONICAL_PUBLIC_SUMMARY_MESSAGES,
        encounterCount: 3,
        sealed: true,
        usedRails: ['P1', 'P2', 'P3'],
        status: 'PUBLIC_COMPLETED',
      };
    }
  } catch {
    // Graceful fallback
  }
  return null;
}

export function savePublicCuratorSession(session: PublicCuratorSession): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    if (session.status === 'PUBLIC_COMPLETED' || session.encounterCount >= 3) {
      localStorage.setItem(ADMITTED_WALLET_KEY, 'true');
      window.dispatchEvent(new CustomEvent(ADMITTED_EVENT));
    }
  } catch {
    // Graceful fallback
  }
}

export function isPublicEncounterCompleted(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (localStorage.getItem(ADMITTED_WALLET_KEY) === 'true') return true;
    const session = getPublicCuratorSession();
    return session?.status === 'PUBLIC_COMPLETED' || (session?.encounterCount ?? 0) >= 3;
  } catch {
    return false;
  }
}

export function admitPublicWallet(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ADMITTED_WALLET_KEY, 'true');
    window.dispatchEvent(new CustomEvent(ADMITTED_EVENT));
  } catch {
    // Graceful fallback
  }
}

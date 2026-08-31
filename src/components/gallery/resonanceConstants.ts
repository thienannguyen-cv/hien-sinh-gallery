import metadata from '../../../../../metadata.json';

export type ResonanceRailId = 'P1' | 'P2' | 'P3' | 'P4';

export const RESONANCE_INVITATIONS: Record<ResonanceRailId, string> = {
  P1: metadata.representation.invitations.P1,
  P2: metadata.representation.invitations.P2,
  P3: metadata.representation.invitations.P3,
  P4: metadata.representation.invitations.P4,
};

/** A0: Pre-selection visitor-facing block representations when READY */
export const AVAILABLE_BLOCK_REPRESENTATION: Record<ResonanceRailId, string> = {
  P1: metadata.representation.available_blocks.P1,
  P2: metadata.representation.available_blocks.P2,
  P3: metadata.representation.available_blocks.P3,
  P4: metadata.representation.available_blocks.P4,
};

/** A2: Post-turn settled ritual/locus trace when OPENED */
export const UNRESOLVED_RITUAL_CONTENT: Record<ResonanceRailId, string> = {
  P1: 'Trường nguồn và các dấu vết ban đầu đi vào bố cục; các liên hệ hình thức được giữ mở trong không gian gặp gỡ.',
  P2: 'Các ràng buộc về nhịp và hướng đưa vật liệu đến ngưỡng biểu tượng; quyền thẩm định hình ảnh thuộc về người xem.',
  P3: 'Nhiều phản chiếu có điểm tựa được giữ cùng tồn tại trước khi bị buộc hội tụ.',
  P4: 'Tính đa thể đi vào một artifact hữu hạn mà không xóa áp lực của những khả thể chưa được chọn.',
};

/** Canonical Vietnamese ritual excerpts for an evidenced held relationship. */
export const HELD_RITUAL_CONTENT: Record<ResonanceRailId, string> = {
  P1: 'Sử dụng skill read-effective-verbal-context để nạp context từ handoff của dự án seed cho session mới này, để mình có thể tiếp tục công việc ngẫu hứng một cách trơn tru.',
  P2: 'Tôi đang nhờ {PRIOR_BRUSH} thiết kế logo, @{LETTER}\\logo-mark.svg, cho dự án. Nhưng kết quả @{LETTER}\\logo-banner-offset.svg giống như ba phần rời rạc trên một panel…',
  P3: 'Hãy lắng nghe, một lời mời gọi sâu thẳm khiến bạn một lần bước ra khỏi vùng an toàn mang tên SVG, để được dẫn dắt bởi bốn sub-agent tận tụy…',
  P4: 'Một tuyệt tác đang thành hình. Hãy cô đọng bốn mảnh còn rời rạc lại làm một, lấy {LETTER} làm chủ đạo và tạo một kết quả PNG duy nhất…',
};

export type RitualContentMode = 'unresolved' | 'held';

export const RAIL_LABELS: Record<ResonanceRailId, string> = {
  P1: 'P1 · CONTEXT',
  P2: 'P2 · THRESHOLD',
  P3: 'P3 · PLURALITY',
  P4: 'P4 · CONDENSATION',
};

/**
 * Bounded conversational-language resolver for Curator encounters.
 * It accepts no visitor-provided prompt instruction: only one of these stable
 * identifiers may be sent to the Curator service.
 */
export const CONVERSATIONAL_LANGUAGE_IDS = ['en', 'vi', 'es', 'fr', 'de', 'pt', 'ja', 'ko', 'zh'] as const;
export type ConversationLanguage = typeof CONVERSATIONAL_LANGUAGE_IDS[number];
export const DEFAULT_CONVERSATIONAL_LANGUAGE: ConversationLanguage = 'en';

export function restoreConversationalLanguage(value: unknown): ConversationLanguage {
  return CONVERSATIONAL_LANGUAGE_IDS.includes(value as ConversationLanguage)
    ? value as ConversationLanguage
    : DEFAULT_CONVERSATIONAL_LANGUAGE;
}

const SHORT_OR_AMBIGUOUS = new Set([
  'yes', 'no', 'ok', 'okay', 'k', 'sure', 'thanks', 'thank you', 'hi', 'hello',
  'yep', 'nope', '...', '?', '!',
]);

function isEmojiOnly(value: string): boolean {
  return /^[\p{Extended_Pictographic}\p{Emoji_Presentation}\p{Emoji_Modifier}\p{Emoji_Modifier_Base}\u200d\ufe0f\s]+$/u.test(value);
}

export function resolveSessionConversationalLanguage(
  established: ConversationLanguage,
  utterance: string,
): ConversationLanguage {
  const normalized = utterance.trim().toLowerCase();
  const words = normalized.match(/[\p{L}]+/gu) ?? [];
  // Emoji is transported without transformation. Emoji-only input is simply too
  // ambiguous to establish or change a conversational language.
  if (!normalized || isEmojiOnly(normalized) || SHORT_OR_AMBIGUOUS.has(normalized)) return established;
  // Scripts with unspaced words must be recognized before the Latin word-count guard.
  if (/[\u3040-\u30ff]/u.test(normalized)) return 'ja';
  if (/[\uac00-\ud7af]/u.test(normalized)) return 'ko';
  if (/[\u4e00-\u9fff]/u.test(normalized)) return 'zh';
  if (words.length < 3) return established;
  if (/[đăơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỷỹỵ]/u.test(normalized)
    || words.some(word => ['tôi', 'bạn', 'của', 'không', 'được', 'trong', 'này', 'một'].includes(word))) return 'vi';
  // A shared article (English "a", French/Spanish "la") cannot establish a language.
  // Count distinct evidence and keep the established language on ties/weak evidence.
  const evidence: Record<string, string[]> = {
    en: ['i', 'the', 'this', 'that', 'these', 'those', 'is', 'are', 'does', 'how', 'what', 'why', 'with', 'and', 'please', 'about', 'it', 'my', 'you', 'your'],
    es: ['el', 'los', 'las', 'una', 'para', 'gracias', 'obra', 'cómo', 'qué', 'este', 'esta', 'con', 'del', 'por', 'pero', 'puede'],
    fr: ['le', 'les', 'une', 'des', 'pour', 'merci', 'oeuvre', 'œuvre', 'avec', 'dans', 'cette', 'est', 'et', 'comment', 'je', 'vous'],
    de: ['der', 'die', 'das', 'und', 'für', 'danke', 'werk', 'ist', 'wie', 'ich', 'mit', 'nicht', 'diese'],
    pt: ['os', 'uma', 'para', 'obrigado', 'obrigada', 'obra', 'como', 'esta', 'você', 'não', 'com', 'tem', 'uma', 'essa'],
  };
  const scores = Object.entries(evidence).map(([id, markers]) => ({
    id: id as ConversationLanguage, score: new Set(words.filter(word => markers.includes(word))).size,
  })).sort((a, b) => b.score - a.score);
  if (scores[0].score >= 2 && scores[0].score > scores[1].score) return scores[0].id;
  return established;
}

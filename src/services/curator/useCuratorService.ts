/**
 * Browser boundary for the serverless Curator adapter.
 *
 * The browser sends relationship evidence, one surface, the current temporal
 * slot and the visible transcript to a same-origin endpoint. It never receives
 * a Gemini key, protected material registry or omnibus context.
 */

import { useMemo } from 'react';
import type {
  CuratorSurface,
  EncounterTrigger,
  RelationshipState,
} from './encounterProtocol';
import type { ConversationLanguage } from './conversationLanguage';

export interface CuratorDialogueMessage {
  role: 'curator' | 'visitor';
  content: string;
  seal?: string;
}

export interface CuratorQueryRequest {
  surface: CuratorSurface;
  relationship: RelationshipState;
  language: ConversationLanguage;
  trigger: EncounterTrigger;
  dialogue: CuratorDialogueMessage[];
  frameId?: string;
}

export interface CuratorReply {
  content: string;
  seal: string;
  invocationId?: string;
  diagnostic?: { invocationId?: string; textLength: number; textSha256: string; finishReason: string | null; promptTokenCount: number | null; candidateTokenCount: number | null; totalTokenCount: number | null };
}

interface CuratorClient {
  query(request: CuratorQueryRequest): Promise<CuratorReply>;
}

export class CuratorRequestError extends Error {
  readonly code: string;
  readonly httpStatus: number;

  constructor(code: string, httpStatus: number) {
    super(code);
    this.name = 'CuratorRequestError';
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

const CURATOR_ENDPOINT = '/api/curator-interaction';
async function digest(value: string): Promise<string> { const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)); return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, '0')).join(''); }
export async function emitCuratorDiagnostic(stage: 'received' | 'persisted', reply: CuratorReply): Promise<void> {
  if (!reply.diagnostic) return;
  const textSha256 = await digest(reply.content);
  window.dispatchEvent(new CustomEvent('hien-sinh-curator-diagnostic', { detail: { stage, invocationId: reply.diagnostic.invocationId, textLength: reply.content.length, textSha256, boundaryMatches: reply.diagnostic.textLength === reply.content.length && reply.diagnostic.textSha256 === textSha256 } }));
}

function isCuratorReply(value: unknown): value is CuratorReply {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.content === 'string' && typeof candidate.seal === 'string';
}

export function useCuratorService(): CuratorClient {
  return useMemo(() => ({
    async query(request: CuratorQueryRequest): Promise<CuratorReply> {
      const response = await fetch(CURATOR_ENDPOINT, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(request),
      });

      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message = payload && typeof payload === 'object' && typeof (payload as Record<string, unknown>).error === 'string'
          ? String((payload as Record<string, unknown>).error)
          : `Curator service returned ${response.status}.`;
        throw new CuratorRequestError(message, response.status);
      }
      if (!isCuratorReply(payload)) {
        throw new CuratorRequestError('MALFORMED_CURATOR_RESPONSE', response.status);
      }
      await emitCuratorDiagnostic('received', payload);
      return payload;
    },
  }), []);
}

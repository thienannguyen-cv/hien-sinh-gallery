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

export interface CuratorDialogueMessage {
  role: 'curator' | 'visitor';
  content: string;
  seal?: string;
}

export interface CuratorQueryRequest {
  surface: CuratorSurface;
  relationship: RelationshipState;
  language: 'vi' | 'en';
  trigger: EncounterTrigger;
  dialogue: CuratorDialogueMessage[];
  frameId?: string;
}

export interface CuratorReply {
  content: string;
  seal: string;
  invocationId?: string;
}

interface CuratorClient {
  query(request: CuratorQueryRequest): Promise<CuratorReply>;
}

const CURATOR_ENDPOINT = '/api/curator-interaction';

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
        throw new Error(message);
      }
      if (!isCuratorReply(payload)) {
        throw new Error('Curator service returned an invalid response envelope.');
      }
      return payload;
    },
  }), []);
}

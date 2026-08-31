import { useEffect, useMemo, useState } from 'react';
import type {
  CuratorSurface,
  EncounterTrigger,
  RelationshipState,
} from './encounterProtocol';

export interface AuditedExchange {
  trigger: EncounterTrigger;
  visitor: string;
  curatorSeal: string;
  curator: string;
}

export interface AuditedRehearsalSession {
  id: string;
  label: string;
  surface: CuratorSurface;
  relationship: RelationshipState;
  language: 'vi' | 'en';
  verdict: 'ELIGIBLE_FOR_OWNER_REHEARSAL';
  auditorSupportGap: number[];
  opening: {
    seal: string;
    content: string;
  };
  exchanges: AuditedExchange[];
}

interface AuditedRehearsalEnvelope {
  schema: 'hiensinh.curator-owner-rehearsal.v1';
  status: 'DEVELOP_OWNER_REHEARSAL_ONLY';
  sessions: AuditedRehearsalSession[];
}

const REHEARSAL_SESSIONS_URL = '/assets/curator-contexts/v2/audit-sessions/owner-rehearsal.vi.json';

function isEnvelope(value: unknown): value is AuditedRehearsalEnvelope {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return candidate.schema === 'hiensinh.curator-owner-rehearsal.v1'
    && candidate.status === 'DEVELOP_OWNER_REHEARSAL_ONLY'
    && Array.isArray(candidate.sessions);
}

export function useAuditedRehearsalSessions(
  surface: CuratorSurface,
  relationship: RelationshipState,
): {
  sessions: AuditedRehearsalSession[];
  loading: boolean;
  error: string | null;
} {
  const [allSessions, setAllSessions] = useState<AuditedRehearsalSession[]>([]);
  const [loading, setLoading] = useState(import.meta.env.DEV);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!import.meta.env.DEV) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    fetch(REHEARSAL_SESSIONS_URL, {
      signal: controller.signal,
      credentials: 'same-origin',
    })
      .then(async response => {
        if (!response.ok) throw new Error('Rehearsal registry returned ' + response.status + '.');
        const payload: unknown = await response.json();
        if (!isEnvelope(payload)) throw new Error('Rehearsal registry has an invalid envelope.');
        setAllSessions(payload.sessions);
      })
      .catch(reason => {
        if (controller.signal.aborted) return;
        setError(reason instanceof Error ? reason.message : 'Unable to load rehearsal sessions.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const sessions = useMemo(
    () => allSessions.filter(session =>
      session.surface === surface
      && session.relationship === relationship
      && session.verdict === 'ELIGIBLE_FOR_OWNER_REHEARSAL'),
    [allSessions, relationship, surface],
  );

  return { sessions, loading, error };
}

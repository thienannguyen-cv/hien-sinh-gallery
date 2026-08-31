import { useState } from 'react';
import { HIEN_SINH_CONTRACT } from '../generated/contract/hienSinhInterface';

declare const __HIEN_SINH_LOCAL_PRESENTATION_ENABLED__: boolean;

export type LocalPresentationRole = 'PUBLIC' | 'PRACTITIONER' | 'STEWARD';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);
// One explicit operator setting for local Practitioner QA; it is not a URL API.
const LOCAL_PRACTITIONER_FRAME_ID = 2;
export interface LocalPresentationEnvironment {
  perspective: LocalPresentationRole;
  /** Visual QA only; never a wallet lookup or entitlement. */
  frameId: number | null;
}

function normalizePerspective(value: string | null): LocalPresentationRole | null {
  const normalized = value?.trim().toUpperCase();
  return normalized === 'PUBLIC' || normalized === 'PRACTITIONER' || normalized === 'STEWARD'
    ? normalized
    : null;
}

/**
 * Local-only visual QA. This is deliberately not an authorization mechanism:
 * it has no secret, persists no entitlement, and can only select synthetic
 * presentation on a Vite dev server bound to a loopback host.
 *
 * Examples:
 *   http://localhost:5174/?role=PRACTITIONER
 *   http://localhost:5174/?role=STEWARD
 */
function readLocalPresentation(): LocalPresentationEnvironment | null {
  if (!__HIEN_SINH_LOCAL_PRESENTATION_ENABLED__ || !import.meta.env.DEV || typeof window === 'undefined') return null;
  if (!LOCAL_HOSTS.has(window.location.hostname)) return null;

  const params = new URLSearchParams(window.location.search);
  // A signed loopback server is the local rehearsal boundary. The role query
  // selects a perspective only; without one, rehearsal defaults to PUBLIC.
  const requested = normalizePerspective(params.get('role')) ?? 'PUBLIC';
  if (requested === 'PUBLIC') return { perspective: requested, frameId: null };
  if (requested === 'STEWARD') return { perspective: requested, frameId: HIEN_SINH_CONTRACT.constants.completePackageId };

  // Changing the reviewed Frame is an operator configuration decision, not a
  // URL API. The default local review is Frame 02.
  return { perspective: requested, frameId: LOCAL_PRACTITIONER_FRAME_ID };
}

export function useLocalPresentationEnvironment(): LocalPresentationEnvironment | null {
  return useState(readLocalPresentation)[0];
}

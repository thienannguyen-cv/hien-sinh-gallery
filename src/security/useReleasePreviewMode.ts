import { useState } from 'react';

/**
 * Release-Preview Mode — Non-Authoritative Presentation Preview.
 *
 * Allows the Owner and QA to inspect publication-gated UI affordances
 * via `?mode=release-preview` without altering the canonical release state.
 *
 * Safety Invariants:
 *  - RELEASE_PREVIEW ≠ RELEASE_STATE
 *  - RELEASE_PREVIEW ≠ PUBLICATION
 *  - RELEASE_PREVIEW ≠ DEPLOYMENT
 *  - RELEASE_PREVIEW ≠ ENTITLEMENT
 *  - RELEASE_PREVIEW ≠ TRANSACTION_AUTHORITY
 *  - Unknown mode values fail closed (return false).
 *  - Ephemeral only: does NOT persist to localStorage.
 */
export function isReleasePreviewActive(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode')?.trim().toLowerCase();
    return mode === 'release-preview';
  } catch {
    return false;
  }
}

export function useReleasePreviewMode(): boolean {
  const [active] = useState(isReleasePreviewActive);
  return active;
}

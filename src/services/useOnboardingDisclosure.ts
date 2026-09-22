/**
 * Onboarding Disclosure Protocol
 *
 * Ensures first-time visitors must be presented with essential exhibition
 * context (About) and technical/legal boundary perimeter (Dossier) before
 * entering the unencumbered gallery space.
 */

const ONBOARDING_DISCLOSED_KEY = 'hs_onboarding_disclosed';

export function isOnboardingDisclosed(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return localStorage.getItem(ONBOARDING_DISCLOSED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setOnboardingDisclosed(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ONBOARDING_DISCLOSED_KEY, 'true');
  } catch {
    // Ignore localStorage access restrictions
  }
}

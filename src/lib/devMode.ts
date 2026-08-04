/**
 * devMode.ts — DEVMODE Security Mechanism
 *
 * DEVMODE is only active when:
 *   1. VITE_DEVMODE_ENABLED === 'true'  (explicitly set)
 *   2. VITE_CONTRACT_ADDRESS is still the zero address (mockup phase)
 *
 * If DEVMODE is enabled but the contract is real, the app throws
 * an error at startup — preventing accidental exposure of real
 * buyer content behind a bypass that should be disabled.
 */

const CONTRACT = import.meta.env.VITE_CONTRACT_ADDRESS ?? '0x0000000000000000000000000000000000000000';
const ZERO_ADDR = '0x0000000000000000000000000000000000000000';

/** True if a real (non-zero) contract address has been deployed */
export const IS_REAL_CONTRACT =
  CONTRACT !== ZERO_ADDR &&
  CONTRACT.startsWith('0x') &&
  CONTRACT.length === 42;

/**
 * DEVMODE: allows bypassing NFT ownership checks for local testing.
 * Automatically disabled when a real contract is detected.
 *
 * SECURITY: Cannot be enabled alongside a real contract address.
 * Attempting to do so will throw a build-time error.
 */
function computeDevMode(): boolean {
  const rawEnabled = import.meta.env.VITE_DEVMODE_ENABLED === 'true';

  if (rawEnabled && IS_REAL_CONTRACT) {
    throw new Error(
      '[SECURITY VIOLATION] DEVMODE cannot be active with a real contract. ' +
      'Remove VITE_DEVMODE_ENABLED=true from your deployment environment.'
    );
  }

  return rawEnabled && !IS_REAL_CONTRACT;
}

export const DEVMODE = computeDevMode();

/** True when the gate system is fully active (real contract deployed) */
export const GATE_ACTIVE = IS_REAL_CONTRACT;

export type Eip1193Provider = {
  request: (request: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: 'accountsChanged' | 'chainChanged', listener: (value: string[] | string) => void) => void;
  removeListener?: (event: 'accountsChanged' | 'chainChanged', listener: (value: string[] | string) => void) => void;
  isRabby?: boolean;
};

export interface ProviderDescriptor {
  readonly id: string;
  readonly name: string;
  readonly rdns?: string;
  readonly provider: Eip1193Provider;
  readonly source: 'eip6963' | 'explicit-rabby-injection';
}

export function selectProofProvider(candidates: readonly ProviderDescriptor[]): ProviderDescriptor | null {
  const rabby = candidates.find(candidate => candidate.rdns === 'io.rabby' || /rabby/i.test(candidate.name) || candidate.provider.isRabby === true);
  if (rabby) return rabby;
  return candidates.length === 1 ? candidates[0] : null;
}

export function accountFrom(value: unknown): string | null {
  return Array.isArray(value) && typeof value[0] === 'string' ? value[0] : null;
}

export function chainIdFrom(value: unknown): number | null {
  if (typeof value !== 'string' || !/^0x[0-9a-f]+$/i.test(value)) return null;
  const chainId = Number.parseInt(value, 16);
  return Number.isSafeInteger(chainId) ? chainId : null;
}

export function proofIdentityMismatch(input: {
  readonly challengedWallet: string;
  readonly challengedChainId: number;
  readonly currentWallet: string | null;
  readonly currentChainId: number | null;
}): 'NONE' | 'ACCOUNT_CHANGED' | 'CHAIN_CHANGED' {
  if (!input.currentWallet || input.currentWallet.toLowerCase() !== input.challengedWallet.toLowerCase()) return 'ACCOUNT_CHANGED';
  if (input.currentChainId !== input.challengedChainId) return 'CHAIN_CHANGED';
  return 'NONE';
}

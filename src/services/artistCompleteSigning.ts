import { type Address, type Hex } from 'viem';
import { completeDigest, completeWalletPayload, verifyCompleteAuthorization, type CompleteAcceptance } from './completePackageProtocol.ts';

export const DEPLOYED_ARTIST = '0x3cff39491b333016055B3d9328905B0b172988a4';
export interface SigningWallet { request(args: { method: string; params?: unknown[] }): Promise<unknown> }
export interface AcquisitionState {
  artist: Address; designation: Hex; license: Hex; nonce: bigint;
  paintingOwner: Address; packageId: bigint; mintStart: bigint; timestamp: bigint; digest: Hex;
}
export type ReadAcquisitionState = (message: CompleteAcceptance) => Promise<AcquisitionState>;

export function assertAcquisitionState(message: CompleteAcceptance, state: AcquisitionState) {
  if (state.designation.toLowerCase() !== message.canonicalDesignationHash.toLowerCase()
    || state.license.toLowerCase() !== message.licenseHash.toLowerCase()) throw new Error('Commitments do not match the contract');
  if (state.nonce !== message.nonce) throw new Error('Buyer nonce changed');
  if (state.timestamp > message.deadline) throw new Error('Authorization expired');
  if (state.timestamp < state.mintStart) throw new Error('Acquisition has not opened');
  if (state.packageId !== 0n || state.paintingOwner.toLowerCase() !== state.artist.toLowerCase()) throw new Error('Package 05 is unavailable');
  if (state.digest.toLowerCase() !== completeDigest(message).toLowerCase()) throw new Error('Contract digest does not match');
}

/** Signing capability rehearsal only. No real Artist approval is enabled here.
 * CONFIRM integration supplies the reviewed message; this helper does not create
 * a new approval policy or equate an invitation with a contract signature. */
export async function rehearseArtistAuthorization(input: {
  message: CompleteAcceptance; wallet: SigningWallet; readState: ReadAcquisitionState;
}) {
  // Copy before any await: editing a form while a wallet prompt is open cannot
  // change the message returned with its signature.
  const message = { ...input.message };
  completeDigest(message);
  const before = await input.readState(message);
  assertAcquisitionState(message, before);
  if (before.artist.toLowerCase() === DEPLOYED_ARTIST.toLowerCase()) {
    throw new Error('Production Artist signing is disabled during rehearsal');
  }
  const assertWallet = async () => {
    const accounts = await input.wallet.request({ method: 'eth_accounts' });
    const chain = await input.wallet.request({ method: 'eth_chainId' });
    if (chain !== '0x2105') throw new Error('Select Base before signing');
    if (!Array.isArray(accounts) || typeof accounts[0] !== 'string'
      || accounts[0].toLowerCase() !== before.artist.toLowerCase()) throw new Error('Artist wallet changed');
  };
  await assertWallet();
  const signature = await input.wallet.request({ method: 'eth_signTypedData_v4',
    params: [before.artist, completeWalletPayload(message)] });
  await assertWallet();
  if (typeof signature !== 'string') throw new Error('Wallet did not return a signature');
  await verifyCompleteAuthorization(message, signature as Hex, before.artist);
  const after = await input.readState(message);
  if (after.artist.toLowerCase() !== before.artist.toLowerCase()) throw new Error('Artist identity changed');
  assertAcquisitionState(message, after);
  return { message, signature: signature as Hex, digest: completeDigest(message), rehearsal: true as const };
}

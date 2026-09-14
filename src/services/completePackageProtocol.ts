import { encodeFunctionData, hashTypedData, isAddress, recoverTypedDataAddress, type Address, type Hex } from 'viem';

// Public protocol only: no provider, private key, server, signing or submission.
export const COMPLETE_CONTRACT = '0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8' as const;
export const COMPLETE_PRICE = 4290000000000000000n;
export const COMPLETE_DOMAIN = Object.freeze({ name: 'HienSinh', version: '2', chainId: 8453, verifyingContract: COMPLETE_CONTRACT });
export const COMPLETE_TYPES = {
  CompletePackageAcceptance: [
    { name: 'canonicalDesignationHash', type: 'bytes32' },
    { name: 'archiveCommitment', type: 'bytes32' },
    { name: 'licenseHash', type: 'bytes32' },
    { name: 'paintingTokenId', type: 'uint256' },
    { name: 'frameTokenId', type: 'uint256' },
    { name: 'designatedBearer', type: 'address' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
} as const;
export const COMPLETE_ACQUIRE_ABI = [{
  type: 'function', name: 'acquireCompletePackage', stateMutability: 'payable', outputs: [],
  inputs: [
    { name: 'designationHash', type: 'bytes32' }, { name: 'archiveCommitment', type: 'bytes32' },
    { name: 'licenseHash', type: 'bytes32' }, { name: 'paintingTokenId', type: 'uint256' },
    { name: 'frameTokenId', type: 'uint256' }, { name: 'deadline', type: 'uint256' },
    { name: 'nonce', type: 'uint256' }, { name: 'artistSignature', type: 'bytes' },
  ],
}] as const;

export interface CompleteAcceptance {
  canonicalDesignationHash: Hex;
  archiveCommitment: Hex;
  licenseHash: Hex;
  paintingTokenId: 0n;
  frameTokenId: 5n;
  designatedBearer: Address;
  nonce: bigint;
  deadline: bigint;
}

export function completeTypedData(message: CompleteAcceptance) {
  for (const field of ['canonicalDesignationHash', 'archiveCommitment', 'licenseHash'] as const) {
    if (!/^0x[0-9a-f]{64}$/i.test(message[field]) || /^0x0{64}$/i.test(message[field])) throw new Error(`Invalid ${field}`);
  }
  if (!isAddress(message.designatedBearer) || /^0x0{40}$/i.test(message.designatedBearer)) throw new Error('Invalid buyer address');
  if (message.paintingTokenId !== 0n || message.frameTokenId !== 5n) throw new Error('Package 05 requires Painting 0 and Frame 5');
  for (const field of ['nonce', 'deadline'] as const) {
    if (typeof message[field] !== 'bigint' || message[field] < 0n || message[field] >= 2n ** 256n) throw new Error(`Invalid ${field}`);
  }
  return { domain: COMPLETE_DOMAIN, types: COMPLETE_TYPES, primaryType: 'CompletePackageAcceptance' as const, message: { ...message } };
}

export function completeDigest(message: CompleteAcceptance) { return hashTypedData(completeTypedData(message)); }

export function completeWalletPayload(message: CompleteAcceptance) {
  // JSON-RPC needs decimal strings for uint256 values; never coerce them to Number.
  return JSON.stringify({ ...completeTypedData(message), types: {
    EIP712Domain: [{ name: 'name', type: 'string' }, { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' }, { name: 'verifyingContract', type: 'address' }],
    ...COMPLETE_TYPES,
  } }, (_key, value) => typeof value === 'bigint' ? value.toString() : value);
}

export async function verifyCompleteAuthorization(message: CompleteAcceptance, signature: Hex, artist: Address) {
  if (!/^0x[0-9a-f]{130}$/i.test(signature)) throw new Error('Expected a 65-byte Artist signature');
  const recovered = await recoverTypedDataAddress({ ...completeTypedData(message), signature });
  if (recovered.toLowerCase() !== artist.toLowerCase()) throw new Error('Artist signature does not match');
  return recovered;
}

export function completeTransaction(message: CompleteAcceptance, signature: Hex) {
  completeTypedData(message);
  if (!/^0x[0-9a-f]{130}$/i.test(signature)) throw new Error('Expected a 65-byte Artist signature');
  return {
    chainId: 8453, from: message.designatedBearer, to: COMPLETE_CONTRACT, value: COMPLETE_PRICE,
    data: encodeFunctionData({ abi: COMPLETE_ACQUIRE_ABI, functionName: 'acquireCompletePackage', args: [
      message.canonicalDesignationHash, message.archiveCommitment, message.licenseHash,
      message.paintingTokenId, message.frameTokenId, message.deadline, message.nonce, signature,
    ] }),
  };
}

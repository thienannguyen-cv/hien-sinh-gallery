export const ARCHIVE_ASSET_TYPES = [
  'H_CORE',
  'H_CONSTITUTIVE_SCAR',
  'H_CONSTITUTIVE_RITUAL',
] as const;

export type ArchiveAssetType = typeof ARCHIVE_ASSET_TYPES[number];

export interface ArchiveChallengeInput {
  address: string;
  tokenId: number;
  assetType: ArchiveAssetType;
}

export interface ArchiveChallengeRequest extends ArchiveChallengeInput {
  requestNonce: string;
  requestSignature: string;
}

export interface ArchiveTransmissionInput extends ArchiveChallengeInput {
  nonce: string;
  signature: string;
}

export interface ArchiveChallengeRecord extends ArchiveChallengeInput {
  nonceHash: string;
  origin: string;
  message: string;
  issuedAt: string;
  expiresAt: string;
  usedAt: string | null;
}

export interface OnChainArchiveAccess {
  owner: string;
  completePackageId: number;
  completePackageTokenId: number;
  relationshipState: number;
  canonicalDesignationHash: string;
  archiveCommitment: string;
  authorizationBlockNumber: string;
  authorizationBlockHash: string;
}

export interface ArchiveAssetRecord {
  tokenId: number;
  assetType: ArchiveAssetType;
  assetHash: string;
  archiveCommitment: string;
  filePath: string;
}

export interface TransmissionDependencies {
  now: () => Date;
  hashNonce: (nonce: string) => Promise<string>;
  insertChallenge: (record: ArchiveChallengeRecord) => Promise<void>;
  getChallenge: (nonceHash: string) => Promise<ArchiveChallengeRecord | null>;
  verifyWalletSignature: (address: string, message: string, signature: string) => Promise<boolean>;
  readOnChainAccess: (tokenId: number) => Promise<OnChainArchiveAccess>;
  getAsset: (tokenId: number, assetType: ArchiveAssetType) => Promise<ArchiveAssetRecord | null>;
  consumeChallenge: (nonceHash: string, consumedAt: string) => Promise<boolean>;
  createSignedUrl: (filePath: string, expiresInSeconds: number) => Promise<string>;
  writeAuditLog: (entry: {
    address: string;
    tokenId: number;
    assetType: ArchiveAssetType;
    assetHash: string;
    archiveCommitment: string;
    authorizationBlockNumber: string;
    authorizationBlockHash: string;
    expiresAt: string;
  }) => Promise<void>;
}

export class ArchiveAccessError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, status: number, message: string) {
    super(message);
    this.name = 'ArchiveAccessError';
    this.code = code;
    this.status = status;
  }
}

const ADDRESS_PATTERN = /^0x[0-9a-fA-F]{40}$/;
const SIGNATURE_PATTERN = /^0x[0-9a-fA-F]{130}$/;
const NONCE_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const HASH_PATTERN = /^(?:0x)?[0-9a-fA-F]{64}$/;
const ZERO_HASH_PATTERN = /^(?:0x)?0{64}$/;
const CHALLENGE_LIFETIME_MS = 5 * 60 * 1000;
const SIGNED_URL_LIFETIME_SECONDS = 60;

function normalizeAddress(address: string): string {
  if (!ADDRESS_PATTERN.test(address)) {
    throw new ArchiveAccessError('INVALID_ADDRESS', 400, 'Invalid wallet address.');
  }
  return address.toLowerCase();
}

function validateTokenId(tokenId: number): number {
  if (!Number.isSafeInteger(tokenId) || tokenId <= 0) {
    throw new ArchiveAccessError('INVALID_TOKEN', 400, 'Invalid token identifier.');
  }
  return tokenId;
}

function validateAssetType(assetType: string): ArchiveAssetType {
  if (!ARCHIVE_ASSET_TYPES.includes(assetType as ArchiveAssetType)) {
    throw new ArchiveAccessError('INVALID_ASSET_TYPE', 400, 'Invalid archive component.');
  }
  return assetType as ArchiveAssetType;
}

function validateChallengeInput(input: ArchiveChallengeInput): ArchiveChallengeInput {
  return {
    address: normalizeAddress(input.address),
    tokenId: validateTokenId(input.tokenId),
    assetType: validateAssetType(input.assetType),
  };
}

export function buildArchiveAccessMessage(
  input: ArchiveChallengeInput,
  origin: string,
  nonce: string,
  issuedAt: string,
  expiresAt: string,
  chainId: number,
  contractAddress: string,
): string {
  return [
    'Hien Sinh requests a one-time signature to verify archive custody.',
    '',
    `Origin: ${origin}`,
    `Address: ${input.address}`,
    `Token ID: ${input.tokenId}`,
    `Archive component: ${input.assetType}`,
    `Chain ID: ${chainId}`,
    `Contract: ${contractAddress}`,
    `Nonce: ${nonce}`,
    `Issued At: ${issuedAt}`,
    `Expiration Time: ${expiresAt}`,
    '',
    'This signature does not authorize a transaction or transfer.',
  ].join('\n');
}

export function buildArchiveChallengeRequestMessage(
  input: ArchiveChallengeInput,
  origin: string,
  requestNonce: string,
  chainId: number,
  contractAddress: string,
): string {
  return [
    'Hien Sinh requests proof of wallet control before issuing an archive challenge.',
    '',
    `Origin: ${origin}`,
    `Address: ${input.address}`,
    `Token ID: ${input.tokenId}`,
    `Archive component: ${input.assetType}`,
    `Chain ID: ${chainId}`,
    `Contract: ${contractAddress}`,
    `Request Nonce: ${requestNonce}`,
    '',
    'This signature does not authorize a transaction or transfer.',
  ].join('\n');
}

export function createTransmissionService(
  dependencies: TransmissionDependencies,
  configuration: { origin: string; chainId: number; contractAddress: string },
) {
  const origin = new URL(configuration.origin).origin;
  const contractAddress = normalizeAddress(configuration.contractAddress);

  const requireCanonicalAccess = async (input: ArchiveChallengeInput): Promise<OnChainArchiveAccess> => {
    const chain = await dependencies.readOnChainAccess(input.tokenId);
    if (normalizeAddress(chain.owner) !== input.address) {
      throw new ArchiveAccessError('NOT_CURRENT_OWNER', 403, 'The signing wallet is not the current token owner.');
    }
    if (
      input.tokenId !== chain.completePackageId ||
      chain.completePackageTokenId !== chain.completePackageId ||
      chain.relationshipState !== 1
    ) {
      throw new ArchiveAccessError('NOT_COMPLETE_STEWARD', 403, 'This token is not the designated Complete token.');
    }
    if (
      !HASH_PATTERN.test(chain.canonicalDesignationHash) ||
      !HASH_PATTERN.test(chain.archiveCommitment) ||
      ZERO_HASH_PATTERN.test(chain.canonicalDesignationHash) ||
      ZERO_HASH_PATTERN.test(chain.archiveCommitment)
    ) {
      throw new ArchiveAccessError('INVALID_ON_CHAIN_COMMITMENT', 503, 'Canonical commitments are unavailable.');
    }
    return chain;
  };

  return {
    async issueChallenge(rawInput: ArchiveChallengeRequest) {
      const input = validateChallengeInput(rawInput);
      if (!NONCE_PATTERN.test(rawInput.requestNonce)) {
        throw new ArchiveAccessError('INVALID_REQUEST_NONCE', 400, 'Invalid challenge-request nonce.');
      }
      if (!SIGNATURE_PATTERN.test(rawInput.requestSignature)) {
        throw new ArchiveAccessError('INVALID_REQUEST_SIGNATURE', 401, 'Invalid challenge-request signature.');
      }
      const requestMessage = buildArchiveChallengeRequestMessage(
        input,
        origin,
        rawInput.requestNonce,
        configuration.chainId,
        contractAddress,
      );
      const requestSignatureValid = await dependencies.verifyWalletSignature(
        input.address,
        requestMessage,
        rawInput.requestSignature,
      );
      if (!requestSignatureValid) {
        throw new ArchiveAccessError('CHALLENGE_REQUEST_REJECTED', 401, 'Wallet control was not proven.');
      }
      await requireCanonicalAccess(input);
      const now = dependencies.now();
      const expiresAt = new Date(now.getTime() + CHALLENGE_LIFETIME_MS);
      // The wallet-signed request nonce becomes the one-time server challenge.
      // Its database primary key prevents the signed request from being replayed.
      const nonce = rawInput.requestNonce;
      const nonceHash = await dependencies.hashNonce(nonce);
      const issuedAt = now.toISOString();
      const expiration = expiresAt.toISOString();
      const message = buildArchiveAccessMessage(
        input,
        origin,
        nonce,
        issuedAt,
        expiration,
        configuration.chainId,
        contractAddress,
      );

      await dependencies.insertChallenge({
        ...input,
        nonceHash,
        origin,
        message,
        issuedAt,
        expiresAt: expiration,
        usedAt: null,
      });

      return { nonce, message, expiresAt: expiration };
    },

    async transmit(rawInput: ArchiveTransmissionInput) {
      const input = validateChallengeInput(rawInput);
      if (!NONCE_PATTERN.test(rawInput.nonce)) {
        throw new ArchiveAccessError('INVALID_CHALLENGE', 400, 'Invalid access challenge.');
      }
      if (!SIGNATURE_PATTERN.test(rawInput.signature)) {
        throw new ArchiveAccessError('INVALID_SIGNATURE', 401, 'Invalid wallet signature.');
      }

      const nonceHash = await dependencies.hashNonce(rawInput.nonce);
      const challenge = await dependencies.getChallenge(nonceHash);
      const now = dependencies.now();
      if (!challenge || challenge.usedAt || Date.parse(challenge.expiresAt) <= now.getTime()) {
        throw new ArchiveAccessError('CHALLENGE_REJECTED', 401, 'Challenge is invalid, expired, or already used.');
      }
      if (
        challenge.origin !== origin ||
        challenge.address !== input.address ||
        challenge.tokenId !== input.tokenId ||
        challenge.assetType !== input.assetType
      ) {
        throw new ArchiveAccessError('CHALLENGE_MISMATCH', 401, 'Challenge does not match this request.');
      }

      const signatureValid = await dependencies.verifyWalletSignature(
        input.address,
        challenge.message,
        rawInput.signature,
      );
      if (!signatureValid) {
        throw new ArchiveAccessError('SIGNATURE_REJECTED', 401, 'Wallet signature verification failed.');
      }

      const chain = await requireCanonicalAccess(input);

      const asset = await dependencies.getAsset(input.tokenId, input.assetType);
      if (
        !asset ||
        !HASH_PATTERN.test(asset.assetHash) ||
        !HASH_PATTERN.test(asset.archiveCommitment) ||
        asset.archiveCommitment.toLowerCase() !== chain.archiveCommitment.toLowerCase() ||
        !asset.filePath
      ) {
        throw new ArchiveAccessError('ARCHIVE_COMPONENT_UNAVAILABLE', 404, 'Archive component is unavailable.');
      }

      const consumed = await dependencies.consumeChallenge(nonceHash, now.toISOString());
      if (!consumed) {
        throw new ArchiveAccessError('CHALLENGE_REPLAYED', 401, 'Challenge was already consumed.');
      }

      const signedUrl = await dependencies.createSignedUrl(asset.filePath, SIGNED_URL_LIFETIME_SECONDS);
      const parsedUrl = new URL(signedUrl);
      if (parsedUrl.protocol !== 'https:') {
        throw new ArchiveAccessError('UNSAFE_SIGNED_URL', 500, 'Archive transmission could not be secured.');
      }

      const transmissionExpiresAt = new Date(now.getTime() + SIGNED_URL_LIFETIME_SECONDS * 1000).toISOString();
      await dependencies.writeAuditLog({
        address: input.address,
        tokenId: input.tokenId,
        assetType: input.assetType,
        assetHash: asset.assetHash,
        archiveCommitment: chain.archiveCommitment,
        authorizationBlockNumber: chain.authorizationBlockNumber,
        authorizationBlockHash: chain.authorizationBlockHash,
        expiresAt: transmissionExpiresAt,
      });

      return {
        status: 'TRANSMISSION_GRANTED' as const,
        signedUrl,
        expiresInSeconds: SIGNED_URL_LIFETIME_SECONDS,
        assetHash: asset.assetHash,
        archiveCommitment: chain.archiveCommitment,
        authorizationBlockNumber: chain.authorizationBlockNumber,
        authorizationBlockHash: chain.authorizationBlockHash,
      };
    },
  };
}

export const ARCHIVE_ASSET_TYPES = [
  'H_CORE',
  'H_CONSTITUTIVE_SCAR',
  'H_CONSTITUTIVE_RITUAL',
  'H_FRAME_PACKAGE',
  'H_PAINTING_PACKAGE',
] as const;

export type ArchiveAssetType = typeof ARCHIVE_ASSET_TYPES[number];

export interface ArchiveChallengeInput {
  address: string;
  tokenId: number;
  assetType: ArchiveAssetType;
}

export type ArchiveTransmissionInput = ArchiveChallengeInput;

export interface OnChainArchiveAccess {
  owner: string;
  completePackageId: number;
  completePackageTokenId: number;
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
  readOnChainAccess: (tokenId: number) => Promise<OnChainArchiveAccess>;
  getAsset: (tokenId: number, assetType: ArchiveAssetType) => Promise<ArchiveAssetRecord | null>;
  createSignedUrl: (filePath: string, expiresInSeconds: number) => Promise<string>;
  writeAuditLog?: (entry: {
    address: string;
    tokenId: number;
    assetType: ArchiveAssetType;
    assetHash: string;
    archiveCommitment: string;
    authorizationBlockNumber: string;
    authorizationBlockHash: string;
    expiresAt: string;
  }) => Promise<void>;
  hasAcquisitionAuthorization?: (address: string) => Promise<boolean>;
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
const HASH_PATTERN = /^(?:0x)?[0-9a-fA-F]{64}$/;
const ZERO_HASH_PATTERN = /^(?:0x)?0{64}$/;
const SIGNED_URL_LIFETIME_SECONDS = 60;
const sameHash = (left: string, right: string) =>
  left.toLowerCase().replace(/^0x/, '') === right.toLowerCase().replace(/^0x/, '');

function normalizeAddress(address: string): string {
  if (!ADDRESS_PATTERN.test(address)) {
    throw new ArchiveAccessError('INVALID_ADDRESS', 400, 'Invalid wallet address.');
  }
  return address.toLowerCase();
}

function validateTokenId(tokenId: number): number {
  if (!Number.isSafeInteger(tokenId) || tokenId < 0 || tokenId > 9) {
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

export function createTransmissionService(
  dependencies: TransmissionDependencies,
  configuration: { origin: string; chainId: number; contractAddress: string;
    publishedArchiveCommitment?: string },
) {
  const normalizeContract = normalizeAddress(configuration.contractAddress);

  const requireCanonicalAccess = async (input: ArchiveChallengeInput): Promise<OnChainArchiveAccess> => {
    if (input.assetType === 'H_CONSTITUTIVE_RITUAL') {
      throw new ArchiveAccessError('ASSET_MAPPING_REVIEW_REQUIRED', 503, 'This component mapping has not been reviewed.');
    }
    const isFrame = input.assetType === 'H_FRAME_PACKAGE';
    if ((isFrame && input.tokenId === 0) || (!isFrame && input.tokenId !== 0)) {
      throw new ArchiveAccessError('ASSET_TOKEN_MISMATCH', 400, 'The component does not belong to this token.');
    }
    const chain = await dependencies.readOnChainAccess(input.tokenId);
    if (chain.completePackageId !== 5) {
      throw new ArchiveAccessError('CANONICAL_PACKAGE_MISMATCH', 503, 'Canonical package identity is unavailable.');
    }
    if (normalizeAddress(chain.owner) !== input.address) {
      throw new ArchiveAccessError('NOT_CURRENT_OWNER', 403, 'The requested wallet is not the current token owner.');
    }
    if (!HASH_PATTERN.test(chain.canonicalDesignationHash) || ZERO_HASH_PATTERN.test(chain.canonicalDesignationHash)) {
      throw new ArchiveAccessError('INVALID_ON_CHAIN_COMMITMENT', 503, 'Canonical designation is unavailable.');
    }
    if (!isFrame) {
      if (dependencies.hasAcquisitionAuthorization) {
        const hasAuth = await dependencies.hasAcquisitionAuthorization(input.address);
        if (!hasAuth) {
          throw new ArchiveAccessError('ACQUISITION_AUTHORIZATION_REQUIRED', 403, 'Painting materials retrieval requires primary acquisition authorization history.');
        }
      }
      const published = configuration.publishedArchiveCommitment;
      if (!published || !HASH_PATTERN.test(published) || ZERO_HASH_PATTERN.test(published)) {
        throw new ArchiveAccessError('ARCHIVE_CONFIGURATION_INVALID', 503, 'Verified published archive commitment is required.');
      }
      const prePrimary = chain.completePackageTokenId === 0;
      if (!(prePrimary && ZERO_HASH_PATTERN.test(chain.archiveCommitment)) &&
          !sameHash(chain.archiveCommitment, published)) {
        throw new ArchiveAccessError('ARCHIVE_COMMITMENT_MISMATCH', 503, 'Archive commitment does not match the reviewed release.');
      }
    }
    return chain;
  };

  return {
    async transmit(rawInput: ArchiveTransmissionInput) {
      const input = validateChallengeInput(rawInput);
      const chain = await requireCanonicalAccess(input);
      const isPainting = input.tokenId === 0;

      const asset = await dependencies.getAsset(input.tokenId, input.assetType);
      if (
        !asset ||
        asset.tokenId !== input.tokenId || asset.assetType !== input.assetType ||
        !HASH_PATTERN.test(asset.assetHash) ||
        !HASH_PATTERN.test(asset.archiveCommitment) ||
        ZERO_HASH_PATTERN.test(asset.assetHash) || ZERO_HASH_PATTERN.test(asset.archiveCommitment) ||
        (isPainting && !sameHash(asset.archiveCommitment, configuration.publishedArchiveCommitment!)) ||
        !asset.filePath
      ) {
        throw new ArchiveAccessError('ARCHIVE_COMPONENT_UNAVAILABLE', 404, 'Archive component is unavailable.');
      }

      const now = dependencies.now();
      const signedUrl = await dependencies.createSignedUrl(asset.filePath, SIGNED_URL_LIFETIME_SECONDS);
      const parsedUrl = new URL(signedUrl);
      if (parsedUrl.protocol !== 'https:') {
        throw new ArchiveAccessError('UNSAFE_SIGNED_URL', 500, 'Archive transmission could not be secured.');
      }

      const effectiveCommitment = isPainting ? configuration.publishedArchiveCommitment! : asset.archiveCommitment;
      const transmissionExpiresAt = new Date(now.getTime() + SIGNED_URL_LIFETIME_SECONDS * 1000).toISOString();
      if (dependencies.writeAuditLog) {
        await dependencies.writeAuditLog({
          address: input.address,
          tokenId: input.tokenId,
          assetType: input.assetType,
          assetHash: asset.assetHash,
          archiveCommitment: effectiveCommitment,
          authorizationBlockNumber: chain.authorizationBlockNumber,
          authorizationBlockHash: chain.authorizationBlockHash,
          expiresAt: transmissionExpiresAt,
        });
      }

      return {
        status: 'TRANSMISSION_GRANTED' as const,
        signedUrl,
        expiresInSeconds: SIGNED_URL_LIFETIME_SECONDS,
        assetHash: asset.assetHash,
        archiveCommitment: effectiveCommitment,
        authorizationBlockNumber: chain.authorizationBlockNumber,
        authorizationBlockHash: chain.authorizationBlockHash,
      };
    },
  };
}

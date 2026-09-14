import { createClient } from 'npm:@supabase/supabase-js@2.95.0';
import {
  createPublicClient,
  getAddress,
  http,
  isAddress,
  keccak256,
  type Address,
  type Hex,
} from 'npm:viem@2.55.10';
import { base } from 'npm:viem@2.55.10/chains';
import {
  ArchiveAccessError,
  createTransmissionService,
} from '../_shared/transmission-service.ts';
import { createArchiveStorageDependencies } from '../_shared/transmission-storage.ts';
import { createTransmissionHandler } from '../_shared/transmission-http.ts';
import { HIEN_SINH_ARCHIVE_ACCESS_ABI } from '../_shared/generated/hien-sinh-archive-access.abi.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const BASE_RPC_URL_PRIMARY = Deno.env.get('BASE_RPC_URL_PRIMARY') ?? '';
const BASE_RPC_URL_SECONDARY = Deno.env.get('BASE_RPC_URL_SECONDARY') ?? '';
const CONTRACT_RAW = Deno.env.get('HIEN_SINH_CONTRACT_ADDRESS') ?? '';
const EXPECTED_CODE_HASH = (Deno.env.get('HIEN_SINH_CONTRACT_CODE_HASH') ?? '').toLowerCase();
const EXPECTED_DESIGNATION_HASH = (Deno.env.get('HIEN_SINH_CANONICAL_DESIGNATION_HASH') ?? '').toLowerCase();
const ALLOWED_ORIGINS = new Set(
  (Deno.env.get('ALLOWED_ARCHIVE_ORIGINS') ?? '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean)
    .map(origin => new URL(origin).origin),
);

const PUBLISHED_ARCHIVE_COMMITMENT = (Deno.env.get('HIEN_SINH_PUBLISHED_ARCHIVE_COMMITMENT') ?? '').toLowerCase();

const HASH_PATTERN = /^0x[0-9a-f]{64}$/;
const isSecureRPC = (value: string) => {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
};

const CONFIGURED = Boolean(
  SUPABASE_URL &&
  SUPABASE_SERVICE_ROLE_KEY &&
  isSecureRPC(BASE_RPC_URL_PRIMARY) &&
  isSecureRPC(BASE_RPC_URL_SECONDARY) &&
  BASE_RPC_URL_PRIMARY !== BASE_RPC_URL_SECONDARY &&
  isAddress(CONTRACT_RAW) &&
  HASH_PATTERN.test(EXPECTED_CODE_HASH) &&
  HASH_PATTERN.test(EXPECTED_DESIGNATION_HASH) &&
  ALLOWED_ORIGINS.size,
);

const CONTRACT_ADDRESS = CONFIGURED ? getAddress(CONTRACT_RAW) : undefined;
const supabase = CONFIGURED ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) : undefined;
const publicClients = CONFIGURED
  ? [BASE_RPC_URL_PRIMARY, BASE_RPC_URL_SECONDARY].map(url =>
      createPublicClient({ chain: base, transport: http(url) })
    )
  : [];

async function readConsensusAccess(tokenId: number) {
  if (publicClients.length !== 2) {
    throw new ArchiveAccessError('RPC_CONFIGURATION_INVALID', 503, 'Exactly two archive RPC providers are required.');
  }
  const finalizedHeads = await Promise.all(
    publicClients.map(client => client.getBlock({ blockTag: 'finalized' })),
  );
  const firstFinalizedHead = finalizedHeads.at(0);
  if (!firstFinalizedHead) {
    throw new ArchiveAccessError('RPC_CONSENSUS_FAILED', 503, 'Finalized block consensus is unavailable.');
  }
  const blockNumber = finalizedHeads.reduce(
    (minimum, block) => block.number < minimum ? block.number : minimum,
    firstFinalizedHead.number,
  );
  const blocks = await Promise.all(
    publicClients.map(client => client.getBlock({ blockNumber })),
  );
  const firstBlock = blocks.at(0);
  const blockHash = firstBlock?.hash;
  if (!blockHash || blocks.some(block => block.hash !== blockHash)) {
    throw new ArchiveAccessError('RPC_CONSENSUS_FAILED', 503, 'Finalized block consensus is unavailable.');
  }

  const snapshots = await Promise.all(publicClients.map(async client => {
    const args = [BigInt(tokenId)] as const;
    let owner = '0x0000000000000000000000000000000000000000';
    try {
      owner = String(await client.readContract({ address: CONTRACT_ADDRESS as Address, abi: HIEN_SINH_ARCHIVE_ACCESS_ABI, functionName: 'ownerOf', args, blockNumber })).toLowerCase();
    } catch {
      owner = '0x0000000000000000000000000000000000000000';
    }
    const [bytecode, completePackageId, completePackageTokenId, canonicalDesignationHash, archiveCommitment] = await Promise.all([
      client.getBytecode({ address: CONTRACT_ADDRESS as Address, blockNumber }),
      client.readContract({ address: CONTRACT_ADDRESS as Address, abi: HIEN_SINH_ARCHIVE_ACCESS_ABI, functionName: 'COMPLETE_PACKAGE_ID', blockNumber }),
      client.readContract({ address: CONTRACT_ADDRESS as Address, abi: HIEN_SINH_ARCHIVE_ACCESS_ABI, functionName: 'completePackageTokenId', blockNumber }),
      client.readContract({ address: CONTRACT_ADDRESS as Address, abi: HIEN_SINH_ARCHIVE_ACCESS_ABI, functionName: 'canonicalDesignationHash', blockNumber }),
      client.readContract({ address: CONTRACT_ADDRESS as Address, abi: HIEN_SINH_ARCHIVE_ACCESS_ABI, functionName: 'designatedArchiveCommitment', blockNumber }),
    ]);
    if (!bytecode || bytecode === '0x') {
      throw new ArchiveAccessError('CONTRACT_CODE_UNAVAILABLE', 503, 'Canonical contract code is unavailable.');
    }
    return {
      codeHash: keccak256(bytecode).toLowerCase(),
      owner,
      completePackageId: Number(completePackageId),
      completePackageTokenId: Number(completePackageTokenId),
      canonicalDesignationHash: String(canonicalDesignationHash).toLowerCase(),
      archiveCommitment: String(archiveCommitment).toLowerCase(),
    };
  }));

  const firstSnapshot = snapshots.at(0);
  if (!firstSnapshot) {
    throw new ArchiveAccessError('RPC_CONSENSUS_FAILED', 503, 'Canonical contract state is unavailable.');
  }
  const canonicalSnapshot = JSON.stringify(firstSnapshot);
  if (snapshots.some(snapshot => JSON.stringify(snapshot) !== canonicalSnapshot)) {
    throw new ArchiveAccessError('RPC_CONSENSUS_FAILED', 503, 'Canonical contract state disagrees across RPC providers.');
  }
  const snapshot = firstSnapshot;
  if (snapshot.codeHash !== EXPECTED_CODE_HASH) {
    throw new ArchiveAccessError('CONTRACT_IDENTITY_MISMATCH', 503, 'Canonical contract bytecode does not match the deployment record.');
  }
  if (snapshot.canonicalDesignationHash !== EXPECTED_DESIGNATION_HASH) {
    throw new ArchiveAccessError('DESIGNATION_MISMATCH', 503, 'Canonical designation does not match the deployment record.');
  }

  return {
    owner: snapshot.owner,
    completePackageId: snapshot.completePackageId,
    completePackageTokenId: snapshot.completePackageTokenId,
    canonicalDesignationHash: snapshot.canonicalDesignationHash,
    archiveCommitment: snapshot.archiveCommitment,
    authorizationBlockNumber: blockNumber.toString(),
    authorizationBlockHash: blockHash,
  };
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

Deno.serve(createTransmissionHandler({
  allowedOrigins: ALLOWED_ORIGINS,
  configured: CONFIGURED,
  async verifyChain() {
    const chainIds = await Promise.all(publicClients.map(client => client.getChainId()));
    if (chainIds.length !== 2 || chainIds.some(chainId => chainId !== base.id)) {
      throw new ArchiveAccessError('WRONG_CHAIN', 503, 'Canonical chain unavailable.');
    }
  },
  serviceForOrigin(origin) {
    if (!supabase || !CONTRACT_ADDRESS) {
      throw new ArchiveAccessError('ARCHIVE_NOT_CONFIGURED', 503, 'Archive is not configured.');
    }
    return createTransmissionService({
      now: () => new Date(),
      ...createArchiveStorageDependencies(supabase),
      async readOnChainAccess(tokenId) {
        return readConsensusAccess(tokenId);
      },
    }, { origin, chainId: base.id, contractAddress: CONTRACT_ADDRESS, publishedArchiveCommitment: PUBLISHED_ARCHIVE_COMMITMENT });

  },
}));

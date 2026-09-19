import {
  createPublicClient,
  custom,
  fromBytes,
  fromHex,
  keccak256,
  parseAbi,
  parseAbiItem,
  type Address,
  type Hex,
  type Log,
  type PublicClient,
} from 'viem';
import { COMPLETE_CONTRACT } from '../completePackageProtocol.ts';
import {
  verifyAuthorizationPipeline,
  type AuthorizationArtifact,
  type OnChainVerificationState,
  type VerificationResult,
} from './authorizationProvider.ts';

export const CANONICAL_HIEN_SINH: Address = COMPLETE_CONTRACT;
export const DEPLOYED_ARTIST: Address = '0x3cff39491b333016055B3d9328905B0b172988a4';

/**
 * Canonical registry contract address on Base Mainnet.
 * Can be overridden via environment or configuration.
 */
export const DEFAULT_AUTHORIZATION_REGISTRY: Address =
  (typeof import.meta !== 'undefined' &&
    (import.meta as unknown as { env?: { VITE_AUTHORIZATION_REGISTRY_ADDRESS?: string } })?.env
      ?.VITE_AUTHORIZATION_REGISTRY_ADDRESS as Address) ||
  '0x845371E8691516e86D8b9812423377F58097Ac37';

/**
 * Configurable operational confirmation policy.
 * Default: 3 blocks on Base L2 (~6 seconds).
 *
 * NOTE: This is an operational buffer against transient sequencer micro-reorgs,
 * NOT a claim of cryptographic or L1 consensus finality.
 */
export const DEFAULT_REQUIRED_CONFIRMATIONS = 3n;

export const authorizationRegistryAbi = parseAbi([
  'event AuthorizationAnchored(address indexed targetContract, address indexed designatedBearer, uint256 indexed nonce, bytes32 artifactHash, uint256 deadline, bytes canonicalPayload, bytes signature)',
  'function anchorAuthorization(address targetContract, address designatedBearer, uint256 nonce, uint256 deadline, bytes canonicalPayload, bytes signature) external',
]);

export const authorizationAnchoredEvent = parseAbiItem(
  'event AuthorizationAnchored(address indexed targetContract, address indexed designatedBearer, uint256 indexed nonce, bytes32 artifactHash, uint256 deadline, bytes canonicalPayload, bytes signature)'
);

export type BuyerObservableState =
  | 'NOT_ANCHORED'
  | 'PENDING_CONFIRMATION'
  | 'ON_CHAIN_CONFIRMED'
  | 'ANCHOR_REVERTED'
  | 'ACQUIRED_OWNED'
  | 'ACQUIRED_OTHER'
  | 'EXPIRED';

export interface DiscoveryOptions {
  registryAddress?: Address;
  requiredConfirmations?: bigint;
  fromBlock?: bigint;
  toBlock?: bigint;
  chunkSize?: bigint;
  onChainState?: OnChainVerificationState;
}

export interface DiscoveredAnchorCandidate {
  targetContract: Address;
  designatedBearer: Address;
  nonce: bigint;
  artifactHash: Hex;
  deadline: bigint;
  canonicalPayload: Hex;
  signature: Hex;
  blockNumber: bigint;
  transactionHash: Hex;
  logIndex: number;
}

export interface DiscoveryResult {
  state: BuyerObservableState;
  candidate?: DiscoveredAnchorCandidate;
  artifact?: AuthorizationArtifact;
  verification?: VerificationResult;
  confirmations?: bigint;
  requiredConfirmations: bigint;
  message: string;
  error?: string;
}

/**
 * Decodes raw AuthorizationAnchored log into a typed candidate structure.
 */
export function parseAnchorEventLog(
  log: Log<bigint, number, false, typeof authorizationAnchoredEvent>
): DiscoveredAnchorCandidate | null {
  try {
    const { args, blockNumber, transactionHash, logIndex } = log;
    if (!args || !blockNumber || !transactionHash) return null;

    const {
      targetContract,
      designatedBearer,
      nonce,
      artifactHash,
      deadline,
      canonicalPayload,
      signature,
    } = args;

    if (!targetContract || !designatedBearer || nonce === undefined || !artifactHash) {
      return null;
    }

    return {
      targetContract: targetContract as Address,
      designatedBearer: designatedBearer as Address,
      nonce: BigInt(nonce),
      artifactHash: artifactHash as Hex,
      deadline: BigInt(deadline ?? 0n),
      canonicalPayload: canonicalPayload as Hex,
      signature: signature as Hex,
      blockNumber: BigInt(blockNumber),
      transactionHash: transactionHash as Hex,
      logIndex: logIndex ?? 0,
    };
  } catch {
    return null;
  }
}

/**
 * Direct topic-filtered discovery through standard Ethereum JSON-RPC with chunked range pagination.
 * Avoids RPC provider block-range limit rejections by fetching recent blocks first.
 */
export async function queryAnchorLogsPaginated(
  client: PublicClient,
  registryAddress: Address,
  designatedBearer: Address,
  fromBlock: bigint,
  toBlock: bigint,
  chunkSize = 50000n
): Promise<Log<bigint, number, false, typeof authorizationAnchoredEvent>[]> {
  if (toBlock < fromBlock) return [];

  const allLogs: Log<bigint, number, false, typeof authorizationAnchoredEvent>[] = [];
  let currentEnd = toBlock;

  // Scan newest to oldest so recent authorizations are found immediately
  while (currentEnd >= fromBlock) {
    const currentStart = currentEnd >= fromBlock + chunkSize ? currentEnd - chunkSize + 1n : fromBlock;

    try {
      const chunkLogs = await client.getLogs({
        address: registryAddress,
        event: authorizationAnchoredEvent,
        args: {
          targetContract: CANONICAL_HIEN_SINH,
          designatedBearer,
        },
        fromBlock: currentStart,
        toBlock: currentEnd,
      });

      if (chunkLogs.length > 0) {
        allLogs.push(...chunkLogs);
        // If we found logs in the most recent chunk, we can return early
        break;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
      // If range is too large, decrease chunkSize dynamically
      if (
        msg.includes('range') ||
        msg.includes('limit') ||
        msg.includes('block range') ||
        msg.includes('too many') ||
        msg.includes('-32005')
      ) {
        if (chunkSize > 5000n) {
          return queryAnchorLogsPaginated(client, registryAddress, designatedBearer, fromBlock, toBlock, chunkSize / 4n);
        }
      }
      throw err;
    }

    if (currentStart === fromBlock) break;
    currentEnd = currentStart - 1n;
  }

  // Sort descending by blockNumber then logIndex
  allLogs.sort((a, b) => {
    if (b.blockNumber !== a.blockNumber) {
      return Number(b.blockNumber - a.blockNumber);
    }
    return (b.logIndex ?? 0) - (a.logIndex ?? 0);
  });

  return allLogs;
}

/**
 * Autonomous On-Chain Authorization Discovery Service
 *
 * Implements the 11-point candidate validation checklist against the untrusted registry bulletin board.
 */
export async function discoverOnChainAuthorization(
  providerOrClient: PublicClient | { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> },
  designatedBearer: Address,
  options: DiscoveryOptions = {}
): Promise<DiscoveryResult> {
  const client: PublicClient =
    'getLogs' in providerOrClient
      ? (providerOrClient as PublicClient)
      : createPublicClient({ transport: custom(providerOrClient as { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> }) });

  const registryAddress = options.registryAddress ?? DEFAULT_AUTHORIZATION_REGISTRY;
  const requiredConfirmations = options.requiredConfirmations ?? DEFAULT_REQUIRED_CONFIRMATIONS;

  // 1. Fetch current block number and timestamp
  let latestBlockNumber: bigint;
  let currentBlockTimestamp: bigint;
  try {
    const block = await client.getBlock();
    latestBlockNumber = block.number;
    currentBlockTimestamp = block.timestamp;
  } catch (err) {
    return {
      state: 'NOT_ANCHORED',
      requiredConfirmations,
      message: 'Failed to connect to Base RPC.',
      error: err instanceof Error ? err.message : String(err),
    };
  }

  // 2. Fetch authoritative on-chain contract state if not already supplied
  let onChainState = options.onChainState;
  if (!onChainState) {
    try {
      const packageAbi = parseAbi([
        'function nonces(address) view returns(uint256)',
        'function artistSigner() view returns(address)',
      ]);
      const [contractNonce, artistSigner] = await Promise.all([
        client.readContract({
          address: CANONICAL_HIEN_SINH,
          abi: packageAbi,
          functionName: 'nonces',
          args: [designatedBearer],
        }),
        client.readContract({
          address: CANONICAL_HIEN_SINH,
          abi: packageAbi,
          functionName: 'artistSigner',
        }),
      ]);
      onChainState = {
        contractNonce: BigInt(contractNonce),
        artistSigner: artistSigner as Address,
        blockTimestamp: currentBlockTimestamp,
      };
    } catch {
      // Contract state read failure
    }
  }

  // 3. Query Anchor Registry event logs via direct topic-filtered RPC call
  const fromBlock = options.fromBlock ?? (latestBlockNumber > 50000n ? latestBlockNumber - 50000n : 0n);
  const toBlock = options.toBlock ?? latestBlockNumber;

  let rawLogs: Log<bigint, number, false, typeof authorizationAnchoredEvent>[];
  try {
    rawLogs = await queryAnchorLogsPaginated(
      client,
      registryAddress,
      designatedBearer,
      fromBlock,
      toBlock,
      options.chunkSize ?? 50000n
    );
  } catch (err) {
    return {
      state: 'NOT_ANCHORED',
      requiredConfirmations,
      message: 'No on-chain authorization found for this wallet.',
      error: err instanceof Error ? err.message : String(err),
    };
  }

  if (rawLogs.length === 0) {
    return {
      state: 'NOT_ANCHORED',
      requiredConfirmations,
      message: 'No on-chain authorization found for this wallet.',
    };
  }

  // 4. Candidate Validation Loop (Untrusted Bulletin Board Model)
  for (const rawLog of rawLogs) {
    const candidate = parseAnchorEventLog(rawLog);
    if (!candidate) continue;

    // Check 1: Target contract matches canonical HienSinh
    if (candidate.targetContract.toLowerCase() !== CANONICAL_HIEN_SINH.toLowerCase()) {
      continue;
    }

    // Check 2: Designated bearer matches queried address
    if (candidate.designatedBearer.toLowerCase() !== designatedBearer.toLowerCase()) {
      continue;
    }

    // Check 3: Checkpoint deadline
    if (candidate.deadline <= currentBlockTimestamp) {
      continue; // Stale anchor
    }

    // Check 4: Checkpoint nonce against on-chain contract nonce
    if (onChainState?.contractNonce !== undefined && candidate.nonce < onChainState.contractNonce) {
      continue; // Nonce already consumed on-chain
    }

    // Check 5: Parse canonical JSON payload and compute commitment
    let payloadString: string;
    try {
      if (typeof candidate.canonicalPayload === 'string') {
        payloadString = fromHex(candidate.canonicalPayload as Hex, 'string');
      } else {
        payloadString = fromBytes(candidate.canonicalPayload, 'string');
      }
    } catch {
      continue;
    }

    // Check 6: Validate artifactHash == keccak256(canonicalPayload)
    const computedHash = keccak256(candidate.canonicalPayload);
    if (computedHash.toLowerCase() !== candidate.artifactHash.toLowerCase()) {
      continue; // Tampered payload
    }

    // Check 7: Local cryptographic RAM verification
    const verification = await verifyAuthorizationPipeline(payloadString, {
      connectedWallet: designatedBearer,
      onChainState,
      source: 'on_chain',
    });

    if (!verification.success || !verification.artifact) {
      continue; // Invalid signature or invalid typed data
    }

    // Check 8: Recovered signer MUST match authoritative artistSigner
    const authoritativeArtist = onChainState?.artistSigner ?? DEPLOYED_ARTIST;
    if (verification.artistAddress?.toLowerCase() !== authoritativeArtist.toLowerCase()) {
      continue; // Signature belongs to unauthorized key
    }

    // Candidate is cryptographically authenticated!
    // 5. Evaluate Operational Confirmation Depth Policy
    const confirmations = latestBlockNumber >= candidate.blockNumber
      ? latestBlockNumber - candidate.blockNumber + 1n
      : 0n;

    if (confirmations < requiredConfirmations) {
      return {
        state: 'PENDING_CONFIRMATION',
        candidate,
        artifact: verification.artifact,
        verification,
        confirmations,
        requiredConfirmations,
        message: `Authorization signed — waiting for on-chain confirmation (Block ${confirmations}/${requiredConfirmations}).`,
      };
    }

    // Operational confirmation policy satisfied
    return {
      state: 'ON_CHAIN_CONFIRMED',
      candidate,
      artifact: verification.artifact,
      verification,
      confirmations,
      requiredConfirmations,
      message: 'Authorization confirmed on Base. Ready for acquisition.',
    };
  }

  // If logs were found but none passed the 11-point candidate check
  return {
    state: 'NOT_ANCHORED',
    requiredConfirmations,
    message: 'No on-chain authorization found for this wallet.',
  };
}

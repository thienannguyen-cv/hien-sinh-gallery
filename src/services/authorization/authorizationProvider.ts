import { isAddress, recoverTypedDataAddress, type Address, type Hex } from 'viem';
import {
  COMPLETE_CONTRACT,
  completeTypedData,
  verifyCompleteAuthorization,
  type CompleteAcceptance,
} from '../completePackageProtocol.ts';

export type AuthorizationSource = 'official_api' | 'local_file' | 'clipboard' | 'manual_json';

export interface AuthorizationDomain {
  name: string;
  version: string;
  chainId: number | string;
  verifyingContract: Address | string;
}

export interface AuthorizationArtifact {
  domain: AuthorizationDomain;
  message: CompleteAcceptance;
  signature: Hex;
  source: AuthorizationSource;
}

export type VerificationStep =
  | 'parse'
  | 'schema'
  | 'domain_contract'
  | 'designated_bearer'
  | 'deadline'
  | 'nonce'
  | 'artist_signature'
  | 'eligible';

export interface VerificationDetails {
  designatedBearer?: Address;
  connectedWallet?: Address;
  nonce?: bigint;
  contractNonce?: bigint;
  deadline?: bigint;
  remainingSeconds?: number;
  isExpired?: boolean;
  contractAddress?: Address;
  chainId?: number;
  source?: AuthorizationSource;
}

export interface VerificationResult {
  success: boolean;
  step: VerificationStep;
  error?: string;
  artifact?: AuthorizationArtifact;
  artistAddress?: Address;
  details: VerificationDetails;
}

export interface OnChainVerificationState {
  contractNonce?: bigint;
  artistSigner?: Address;
  blockTimestamp?: bigint;
}

export interface VerificationOptions {
  connectedWallet?: Address;
  onChainState?: OnChainVerificationState;
  source?: AuthorizationSource;
}

/**
 * Canonical Verification Pipeline
 *
 * Enforces the strict sequential verification protocol:
 * 1. parse -> string to JSON
 * 2. schema validation -> structural field presence and type sanity
 * 3. domain / chain / contract validation -> Base, HienSinh v2, token 0 & 5
 * 4. designatedBearer == connected wallet -> cryptographic entitlement bound to caller
 * 5. deadline validation -> temporal validity window
 * 6. nonce validation -> replay protection against on-chain consumed nonces
 * 7. artist signature recovery -> cryptographic proof of Artist AirGap authorization
 * 8. eligible -> authorization verified and ready for on-chain submission
 */
export type PipelineInput = string | Record<string, unknown> | AuthorizationArtifact;

export async function verifyAuthorizationPipeline(
  input: PipelineInput,
  options: VerificationOptions = {}
): Promise<VerificationResult> {
  const source: AuthorizationSource = options.source ?? (typeof input === 'string' ? 'manual_json' : 'official_api');
  const details: VerificationDetails = { source };

  // Step 1: Parse
  let raw: Record<string, unknown>;
  if (typeof input === 'string') {
    if (input.length > 16384) {
      return {
        success: false,
        step: 'parse',
        error: 'Authorization payload exceeds maximum size limit (16KB).',
        details,
      };
    }
    try {
      raw = JSON.parse(input) as Record<string, unknown>;
    } catch (err) {
      return {
        success: false,
        step: 'parse',
        error: `JSON parse error: ${err instanceof Error ? err.message : String(err)}`,
        details,
      };
    }
  } else if (input && typeof input === 'object') {
    raw = input as unknown as Record<string, unknown>;
  } else {
    return {
      success: false,
      step: 'parse',
      error: 'Invalid input: expected JSON string or object payload.',
      details,
    };
  }

  // Step 2: Schema Validation
  if (!raw || typeof raw !== 'object') {
    return {
      success: false,
      step: 'schema',
      error: 'Payload root must be an object.',
      details,
    };
  }

  const rawDomain = raw.domain as Record<string, unknown> | undefined;
  const rawMessage = raw.message as Record<string, unknown> | undefined;
  const rawSignature = raw.signature as string | undefined;

  if (!rawDomain || typeof rawDomain !== 'object') {
    return {
      success: false,
      step: 'schema',
      error: 'Missing or invalid "domain" object in authorization envelope.',
      details,
    };
  }
  if (!rawMessage || typeof rawMessage !== 'object') {
    return {
      success: false,
      step: 'schema',
      error: 'Missing or invalid "message" object in authorization envelope.',
      details,
    };
  }
  if (typeof rawSignature !== 'string' || !/^0x[0-9a-f]{130}$/i.test(rawSignature)) {
    return {
      success: false,
      step: 'schema',
      error: 'Missing or malformed "signature": expected 65-byte hex string (0x...130 hex chars).',
      details,
    };
  }

  const requiredMessageFields = [
    'canonicalDesignationHash',
    'archiveCommitment',
    'licenseHash',
    'paintingTokenId',
    'frameTokenId',
    'designatedBearer',
    'nonce',
    'deadline',
  ] as const;

  for (const field of requiredMessageFields) {
    if (rawMessage[field] === undefined || rawMessage[field] === null) {
      return {
        success: false,
        step: 'schema',
        error: `Missing required message field: "${field}".`,
        details,
      };
    }
  }

  // Parse uint256 integers (must be decimal string, bigint, or non-negative safe number)
  let paintingTokenId: bigint;
  let frameTokenId: bigint;
  let nonce: bigint;
  let deadline: bigint;

  try {
    const parseUint = (val: unknown, name: string): bigint => {
      if (typeof val === 'bigint') {
        if (val < 0n || val >= 2n ** 256n) throw new Error(`${name} out of range`);
        return val;
      }
      if (typeof val === 'number') {
        if (!Number.isSafeInteger(val) || val < 0) throw new Error(`${name} must be a non-negative integer`);
        return BigInt(val);
      }
      if (typeof val === 'string') {
        if (!/^(0|[1-9][0-9]*)$/.test(val)) throw new Error(`${name} must be a valid non-negative decimal string`);
        const b = BigInt(val);
        if (b >= 2n ** 256n) throw new Error(`${name} out of range`);
        return b;
      }
      throw new Error(`${name} has invalid type`);
    };

    paintingTokenId = parseUint(rawMessage.paintingTokenId, 'paintingTokenId');
    frameTokenId = parseUint(rawMessage.frameTokenId, 'frameTokenId');
    nonce = parseUint(rawMessage.nonce, 'nonce');
    deadline = parseUint(rawMessage.deadline, 'deadline');
  } catch (err) {
    return {
      success: false,
      step: 'schema',
      error: `Integer schema validation failed: ${err instanceof Error ? err.message : String(err)}`,
      details,
    };
  }

  details.nonce = nonce;
  details.deadline = deadline;

  // Step 3: Domain / Chain / Contract Validation
  const domainChainId = Number(rawDomain.chainId);
  const domainContract = String(rawDomain.verifyingContract);
  details.chainId = domainChainId;
  details.contractAddress = domainContract as Address;

  if (rawDomain.name !== 'HienSinh' || rawDomain.version !== '2') {
    return {
      success: false,
      step: 'domain_contract',
      error: `Domain name or version mismatch: expected "HienSinh" v2, got "${String(rawDomain.name)}" v"${String(rawDomain.version)}".`,
      details,
    };
  }
  if (domainChainId !== 8453) {
    return {
      success: false,
      step: 'domain_contract',
      error: `Chain ID mismatch: expected Base Mainnet (8453), got ${domainChainId}.`,
      details,
    };
  }
  if (domainContract.toLowerCase() !== COMPLETE_CONTRACT.toLowerCase()) {
    return {
      success: false,
      step: 'domain_contract',
      error: `Verifying contract mismatch: expected ${COMPLETE_CONTRACT}, got ${domainContract}.`,
      details,
    };
  }
  if (paintingTokenId !== 0n || frameTokenId !== 5n) {
    return {
      success: false,
      step: 'domain_contract',
      error: `Package token mismatch: Complete Package 05 requires Painting 0 and Frame 5, got Painting ${paintingTokenId} and Frame ${frameTokenId}.`,
      details,
    };
  }

  // Hash byte32 format validation
  for (const hField of ['canonicalDesignationHash', 'archiveCommitment', 'licenseHash'] as const) {
    const val = String(rawMessage[hField]);
    if (!/^0x[0-9a-f]{64}$/i.test(val) || /^0x0{64}$/i.test(val)) {
      return {
        success: false,
        step: 'domain_contract',
        error: `Field "${hField}" is not a valid non-zero 32-byte hex hash: "${val}".`,
        details,
      };
    }
  }

  // Construct typed CompleteAcceptance
  const designatedBearer = String(rawMessage.designatedBearer) as Address;
  if (!isAddress(designatedBearer) || /^0x0{40}$/i.test(designatedBearer)) {
    return {
      success: false,
      step: 'schema',
      error: `Invalid designatedBearer Ethereum address: "${designatedBearer}".`,
      details,
    };
  }

  const message: CompleteAcceptance = {
    canonicalDesignationHash: rawMessage.canonicalDesignationHash as Hex,
    archiveCommitment: rawMessage.archiveCommitment as Hex,
    licenseHash: rawMessage.licenseHash as Hex,
    paintingTokenId: 0n,
    frameTokenId: 5n,
    designatedBearer,
    nonce,
    deadline,
  };

  details.designatedBearer = designatedBearer;

  // Step 4: designatedBearer == connected wallet
  if (options.connectedWallet) {
    details.connectedWallet = options.connectedWallet;
    if (designatedBearer.toLowerCase() !== options.connectedWallet.toLowerCase()) {
      return {
        success: false,
        step: 'designated_bearer',
        error: `Designated bearer (${designatedBearer}) does not match connected wallet (${options.connectedWallet}).`,
        details,
      };
    }
  }

  // Step 5: Deadline Validation
  const nowSec = options.onChainState?.blockTimestamp ?? BigInt(Math.floor(Date.now() / 1000));
  const remaining = Number(deadline - nowSec);
  details.remainingSeconds = remaining;
  details.isExpired = remaining <= 0;

  if (remaining <= 0) {
    return {
      success: false,
      step: 'deadline',
      error: `Acquisition authorization expired (deadline: ${deadline}, current time: ${nowSec}).`,
      details,
    };
  }

  // Step 6: Nonce Validation (against on-chain contract state if provided)
  if (options.onChainState?.contractNonce !== undefined) {
    const contractNonce = options.onChainState.contractNonce;
    details.contractNonce = contractNonce;

    if (nonce < contractNonce) {
      return {
        success: false,
        step: 'nonce',
        error: `Authorization nonce (${nonce}) has already been consumed on-chain (current on-chain nonce: ${contractNonce}). Replay rejected.`,
        details,
      };
    }
    if (nonce > contractNonce) {
      return {
        success: false,
        step: 'nonce',
        error: `Authorization nonce (${nonce}) does not match current on-chain nonce (${contractNonce}).`,
        details,
      };
    }
  }

  // Step 7: Artist Signature Recovery
  let recoveredSigner: Address;
  try {
    if (options.onChainState?.artistSigner) {
      recoveredSigner = await verifyCompleteAuthorization(
        message,
        rawSignature as Hex,
        options.onChainState.artistSigner
      );
    } else {
      const typedData = completeTypedData(message);
      recoveredSigner = await recoverTypedDataAddress({
        ...typedData,
        signature: rawSignature as Hex,
      });
    }
  } catch (err) {
    return {
      success: false,
      step: 'artist_signature',
      error: `Artist signature cryptographic recovery failed: ${err instanceof Error ? err.message : String(err)}`,
      details,
    };
  }

  const artifact: AuthorizationArtifact = {
    domain: {
      name: 'HienSinh',
      version: '2',
      chainId: 8453,
      verifyingContract: COMPLETE_CONTRACT,
    },
    message,
    signature: rawSignature as Hex,
    source,
  };

  // Step 8: Authorization Eligible
  return {
    success: true,
    step: 'eligible',
    artifact,
    artistAddress: recoveredSigner,
    details,
  };
}

/**
 * Transport Adapter 1: Official API Transport
 * Fetches authorization envelope from the official HTTP endpoint.
 */
export async function fetchFromOfficialApi(
  walletAddress: Address,
  fetcher: typeof fetch = fetch
): Promise<{ status: 'ISSUED' | 'NOT_ISSUED' | 'UNAVAILABLE'; artifact?: AuthorizationArtifact; error?: string }> {
  try {
    const response = await fetcher('/api/acquisition-authorization', {
      method: 'POST',
      cache: 'no-store',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'get', walletAddress }),
    });

    if (!response.ok) {
      return {
        status: 'UNAVAILABLE',
        error: `Official authorization API returned HTTP ${response.status}`,
      };
    }

    const result = await response.json();
    if (result.status === 'ISSUED' && result.authorization) {
      const verification = await verifyAuthorizationPipeline(result.authorization, {
        connectedWallet: walletAddress,
        source: 'official_api',
      });
      if (verification.success && verification.artifact) {
        return { status: 'ISSUED', artifact: verification.artifact };
      }
      return {
        status: 'UNAVAILABLE',
        error: verification.error ?? 'API authorization failed cryptographic pipeline verification.',
      };
    }

    return { status: 'NOT_ISSUED' };
  } catch (err) {
    return {
      status: 'UNAVAILABLE',
      error: err instanceof Error ? err.message : 'Network error reaching official authorization endpoint',
    };
  }
}

/**
 * Transport Adapter 2: Local File / Text Input Transport
 * Reads authorization text from a File object in the browser.
 */
export async function readAuthorizationFile(file: File): Promise<string> {
  if (file.size > 16384) {
    throw new Error('Selected authorization file exceeds maximum allowed size (16KB).');
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Failed to read authorization file.'));
    reader.readAsText(file);
  });
}

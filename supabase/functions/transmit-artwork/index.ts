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
  type ArchiveAssetType,
  type ArchiveChallengeRecord,
} from '../_shared/transmission-service.ts';
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
    const [bytecode, owner, completePackageId, completePackageTokenId, relationshipState, canonicalDesignationHash, archiveCommitment] = await Promise.all([
      client.getBytecode({ address: CONTRACT_ADDRESS as Address, blockNumber }),
      client.readContract({ address: CONTRACT_ADDRESS as Address, abi: HIEN_SINH_ARCHIVE_ACCESS_ABI, functionName: 'ownerOf', args, blockNumber }),
      client.readContract({ address: CONTRACT_ADDRESS as Address, abi: HIEN_SINH_ARCHIVE_ACCESS_ABI, functionName: 'COMPLETE_PACKAGE_ID', blockNumber }),
      client.readContract({ address: CONTRACT_ADDRESS as Address, abi: HIEN_SINH_ARCHIVE_ACCESS_ABI, functionName: 'completePackageTokenId', blockNumber }),
      client.readContract({ address: CONTRACT_ADDRESS as Address, abi: HIEN_SINH_ARCHIVE_ACCESS_ABI, functionName: 'relationshipState', args, blockNumber }),
      client.readContract({ address: CONTRACT_ADDRESS as Address, abi: HIEN_SINH_ARCHIVE_ACCESS_ABI, functionName: 'canonicalDesignationHash', blockNumber }),
      client.readContract({ address: CONTRACT_ADDRESS as Address, abi: HIEN_SINH_ARCHIVE_ACCESS_ABI, functionName: 'designatedArchiveCommitment', blockNumber }),
    ]);
    if (!bytecode || bytecode === '0x') {
      throw new ArchiveAccessError('CONTRACT_CODE_UNAVAILABLE', 503, 'Canonical contract code is unavailable.');
    }
    return {
      codeHash: keccak256(bytecode).toLowerCase(),
      owner: String(owner).toLowerCase(),
      completePackageId: Number(completePackageId),
      completePackageTokenId: Number(completePackageTokenId),
      relationshipState: Number(relationshipState),
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
    relationshipState: snapshot.relationshipState,
    canonicalDesignationHash: snapshot.canonicalDesignationHash,
    archiveCommitment: snapshot.archiveCommitment,
    authorizationBlockNumber: blockNumber.toString(),
    authorizationBlockHash: blockHash,
  };
}

function responseHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
    'Access-Control-Max-Age': '600',
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json',
    'Vary': 'Origin',
  };
}

function json(origin: string, status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: responseHeaders(origin) });
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function mapChallenge(row: Record<string, unknown>): ArchiveChallengeRecord {
  return {
    nonceHash: String(row.nonce_hash),
    address: String(row.requester_address),
    tokenId: Number(row.token_id),
    assetType: String(row.asset_type) as ArchiveAssetType,
    origin: String(row.request_origin),
    message: String(row.signed_message),
    issuedAt: String(row.issued_at),
    expiresAt: String(row.expires_at),
    usedAt: row.used_at ? String(row.used_at) : null,
  };
}

Deno.serve(async (request: Request) => {
  const requestOrigin = request.headers.get('origin') ?? '';
  let origin = '';
  try {
    origin = new URL(requestOrigin).origin;
  } catch {
    return new Response(JSON.stringify({ error: 'Origin required.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }

  if (!ALLOWED_ORIGINS.has(origin)) {
    return new Response(JSON.stringify({ error: 'Origin not allowed.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: responseHeaders(origin) });
  if (request.method !== 'POST') return json(origin, 405, { error: 'Method not allowed.' });
  if (!CONFIGURED || !supabase || publicClients.length !== 2 || !CONTRACT_ADDRESS) {
    return json(origin, 503, { error: 'Archive transmission is not configured.' });
  }

  try {
    const chainIds = await Promise.all(publicClients.map(client => client.getChainId()));
    if (chainIds.some(chainId => chainId !== base.id)) {
      throw new ArchiveAccessError('WRONG_CHAIN', 503, 'Canonical chain unavailable.');
    }

    const service = createTransmissionService({
      now: () => new Date(),
      hashNonce: sha256Hex,
      async insertChallenge(record) {
        const { error } = await supabase.from('transmission_challenges').insert({
          nonce_hash: record.nonceHash,
          requester_address: record.address,
          token_id: record.tokenId,
          asset_type: record.assetType,
          request_origin: record.origin,
          signed_message: record.message,
          issued_at: record.issuedAt,
          expires_at: record.expiresAt,
        });
        if (error?.code === '23505') {
          throw new ArchiveAccessError('CHALLENGE_NONCE_REUSED', 409, 'This signed challenge nonce has already been recorded.');
        }
        if (error) throw error;
      },
      async getChallenge(nonceHash) {
        const { data, error } = await supabase
          .from('transmission_challenges')
          .select('*')
          .eq('nonce_hash', nonceHash)
          .maybeSingle();
        if (error) throw error;
        return data ? mapChallenge(data) : null;
      },
      async verifyWalletSignature(address, message, signature) {
        const results = await Promise.all(publicClients.map(client => client.verifyMessage({
          address: getAddress(address) as Address,
          message,
          signature: signature as Hex,
        })));
        return results.every(Boolean);
      },
      async readOnChainAccess(tokenId) {
        return readConsensusAccess(tokenId);
      },
      async getAsset(tokenId, assetType) {
        const { data, error } = await supabase
          .from('stewardship_assets')
          .select('token_id,asset_type,asset_hash,archive_commitment,file_path')
          .eq('token_id', tokenId)
          .eq('asset_type', assetType)
          .maybeSingle();
        if (error) throw error;
        return data ? {
          tokenId: Number(data.token_id),
          assetType: String(data.asset_type) as ArchiveAssetType,
          assetHash: String(data.asset_hash),
          archiveCommitment: String(data.archive_commitment),
          filePath: String(data.file_path),
        } : null;
      },
      async consumeChallenge(nonceHash, consumedAt) {
        const { data, error } = await supabase
          .from('transmission_challenges')
          .update({ used_at: consumedAt })
          .eq('nonce_hash', nonceHash)
          .is('used_at', null)
          .gt('expires_at', consumedAt)
          .select('nonce_hash')
          .maybeSingle();
        if (error) throw error;
        return Boolean(data);
      },
      async createSignedUrl(filePath, expiresInSeconds) {
        const { data, error } = await supabase.storage
          .from('stewardship-private-archive')
          .createSignedUrl(filePath, expiresInSeconds);
        if (error || !data?.signedUrl) throw error ?? new Error('Signed URL unavailable.');
        return data.signedUrl;
      },
      async writeAuditLog(entry) {
        const { error } = await supabase.from('transmission_audit_logs').insert({
          requester_address: entry.address,
          token_id: entry.tokenId,
          asset_type: entry.assetType,
          verification_hash: entry.assetHash,
          archive_commitment: entry.archiveCommitment,
          authorization_block_number: entry.authorizationBlockNumber,
          authorization_block_hash: entry.authorizationBlockHash,
          expires_at: entry.expiresAt,
        });
        if (error) throw error;
      },
    }, { origin, chainId: base.id, contractAddress: CONTRACT_ADDRESS });

    const body = await request.json();
    if (body?.action === 'challenge') {
      const challenge = await service.issueChallenge({
        address: body.address,
        tokenId: body.tokenId,
        assetType: body.assetType,
        requestNonce: body.requestNonce,
        requestSignature: body.requestSignature,
      });
      return json(origin, 200, challenge);
    }
    if (body?.action === 'transmit') {
      const transmission = await service.transmit({
        address: body.address,
        tokenId: body.tokenId,
        assetType: body.assetType,
        nonce: body.nonce,
        signature: body.signature,
      });
      return json(origin, 200, transmission);
    }
    return json(origin, 400, { error: 'Unknown action.' });
  } catch (error) {
    if (error instanceof ArchiveAccessError) {
      return json(origin, error.status, { error: error.code });
    }
    console.error('Archive transmission failure', error instanceof Error ? error.message : 'unknown');
    return json(origin, 500, { error: 'ARCHIVE_TRANSMISSION_FAILED' });
  }
});

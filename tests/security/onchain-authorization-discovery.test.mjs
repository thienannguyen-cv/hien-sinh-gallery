import test from 'node:test';
import assert from 'node:assert/strict';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { toHex, stringToBytes, keccak256, encodeAbiParameters } from 'viem';

import {
  canonicalizeJson,
  canonicalArtifactHash,
  canonicalArtifactSha256,
} from '../../src/services/authorization/canonicalJson.ts';

import {
  discoverOnChainAuthorization,
  queryAnchorLogsPaginated,
  CANONICAL_HIEN_SINH,
  DEFAULT_REQUIRED_CONFIRMATIONS,
} from '../../src/services/authorization/onChainAuthorizationDiscovery.ts';

import {
  COMPLETE_CONTRACT,
  COMPLETE_PRICE,
  completeDigest,
  completeTypedData,
} from '../../src/services/completePackageProtocol.ts';

import { prepareCompletePurchase } from '../../src/services/completePurchase.ts';

// Helper to generate dynamic cryptographically authentic test setup
async function createTestSetup(options = {}) {
  const artist = privateKeyToAccount(generatePrivateKey());
  const buyer = privateKeyToAccount(generatePrivateKey());
  const deadline = options.deadline ?? 1900000000n;
  const nonce = options.nonce ?? 0n;

  const message = {
    canonicalDesignationHash: '0x' + 'aa'.repeat(32),
    archiveCommitment: '0x' + 'bb'.repeat(32),
    licenseHash: '0x' + 'cc'.repeat(32),
    paintingTokenId: 0n,
    frameTokenId: 5n,
    designatedBearer: buyer.address,
    nonce,
    deadline,
  };

  const typedData = completeTypedData(message);
  const signature = await artist.signTypedData(typedData);

  const artifact = {
    domain: {
      name: 'HienSinh',
      version: '2',
      chainId: 8453,
      verifyingContract: COMPLETE_CONTRACT,
    },
    message: {
      canonicalDesignationHash: message.canonicalDesignationHash,
      archiveCommitment: message.archiveCommitment,
      licenseHash: message.licenseHash,
      paintingTokenId: '0',
      frameTokenId: '5',
      designatedBearer: buyer.address,
      nonce: String(nonce),
      deadline: String(deadline),
    },
    signature,
    source: 'on_chain',
  };

  const canonicalJsonString = canonicalizeJson(artifact);
  const canonicalPayload = toHex(stringToBytes(canonicalJsonString));
  const artifactHash = keccak256(stringToBytes(canonicalJsonString));

  return {
    artist,
    buyer,
    message,
    typedData,
    signature,
    artifact,
    canonicalJsonString,
    canonicalPayload,
    artifactHash,
  };
}

// Mock public client builder
function createMockRpcClient({
  latestBlock = 1000n,
  latestTimestamp = 1726000500n,
  logs = [],
  contractNonce = 0n,
  artistSigner,
  ownerOf0,
  completePackageTokenId = 0n,
  rangeLimitError = false,
  designationHash = '0x' + 'aa'.repeat(32),
  licenseHash = '0x' + 'cc'.repeat(32),
} = {}) {
  return {
    getBlock: async () => ({
      number: latestBlock,
      timestamp: latestTimestamp,
    }),
    readContract: async ({ functionName, args }) => {
      if (functionName === 'nonces') return contractNonce;
      if (functionName === 'artistSigner') return artistSigner;
      if (functionName === 'ownerOf' && args?.[0] === 0n) return ownerOf0 ?? artistSigner;
      if (functionName === 'completePackageTokenId') return completePackageTokenId;
      if (functionName === 'canonicalDesignationHash') return designationHash;
      if (functionName === 'completeLicenseHash') return licenseHash;
      if (functionName === 'COMPLETE_PACKAGE_PRICE') return 4290000000000000000n;
      if (functionName === 'mintStart') return 1700000000n;
      if (functionName === 'hashCompletePackageAcceptance') return '0x1234567890123456789012345678901234567890123456789012345678901234';
      throw new Error(`Unhandled mock readContract: ${functionName}`);
    },
    getLogs: async ({ fromBlock, toBlock }) => {
      if (rangeLimitError && toBlock - fromBlock > 10000n) {
        throw new Error('query returned more than 10000 results: block range limit exceeded (-32005)');
      }
      return logs.filter(l => l.blockNumber >= fromBlock && l.blockNumber <= toBlock);
    },
  };
}

function buildMockAnchorLog(setup, {
  targetContract = CANONICAL_HIEN_SINH,
  designatedBearer,
  nonce = 0n,
  artifactHash,
  deadline,
  canonicalPayload,
  signature,
  blockNumber = 998n,
  transactionHash = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  logIndex = 0,
} = {}) {
  return {
    address: '0x845371E8691516e86D8b9812423377F58097Ac37',
    blockNumber,
    transactionHash,
    logIndex,
    args: {
      targetContract,
      designatedBearer: designatedBearer ?? setup.buyer.address,
      nonce: BigInt(nonce),
      artifactHash: artifactHash ?? setup.artifactHash,
      deadline: BigInt(deadline ?? setup.message.deadline),
      canonicalPayload: canonicalPayload ?? setup.canonicalPayload,
      signature: signature ?? setup.signature,
    },
  };
}

test('RFC 8785 Canonical JSON determinism across key mutations and formatting', () => {
  const obj1 = { z: 1, a: 'test', m: { y: 2, b: 3 } };
  const obj2 = { a: 'test', m: { b: 3, y: 2 }, z: 1 };
  const obj3 = { m: { y: 2, b: 3 }, z: 1, a: 'test' };

  const s1 = canonicalizeJson(obj1);
  const s2 = canonicalizeJson(obj2);
  const s3 = canonicalizeJson(obj3);

  assert.equal(s1, s2);
  assert.equal(s2, s3);
  assert.equal(s1, '{"a":"test","m":{"b":3,"y":2},"z":1}');

  assert.equal(canonicalArtifactHash(obj1), canonicalArtifactHash(obj2));
  assert.equal(canonicalArtifactSha256(obj1), canonicalArtifactSha256(obj3));
});

test('Buyer-Observable State: NOT_ANCHORED when no on-chain event exists', async () => {
  const setup = await createTestSetup();
  const client = createMockRpcClient({ artistSigner: setup.artist.address, logs: [] });
  const result = await discoverOnChainAuthorization(client, setup.buyer.address);

  assert.equal(result.state, 'NOT_ANCHORED');
  assert.equal(result.message, 'No on-chain authorization found for this wallet.');
  // Codex Invariant: Must NOT state "Artist has not signed"
  assert.equal(result.message.includes('not signed'), false);
  assert.equal(result.candidate, undefined);
  assert.equal(result.artifact, undefined);
});

test('Operational Confirmation Policy: PENDING_CONFIRMATION when confirmations < REQUIRED_CONFIRMATIONS', async () => {
  const setup = await createTestSetup();
  // latestBlock = 1000, event block = 1000 -> confirmations = 1000 - 1000 + 1 = 1 < 3
  const log = buildMockAnchorLog(setup, { blockNumber: 1000n });
  const client = createMockRpcClient({
    artistSigner: setup.artist.address,
    latestBlock: 1000n,
    logs: [log],
  });

  const result = await discoverOnChainAuthorization(client, setup.buyer.address, { requiredConfirmations: 3n });

  assert.equal(result.state, 'PENDING_CONFIRMATION');
  assert.equal(result.confirmations, 1n);
  assert.equal(result.requiredConfirmations, 3n);
  assert.equal(
    result.message,
    'Authorization signed — waiting for on-chain confirmation (Block 1/3).'
  );
  assert.ok(result.artifact);
});

test('Operational Confirmation Policy: ON_CHAIN_CONFIRMED when depth >= 3', async () => {
  const setup = await createTestSetup();
  // latestBlock = 1002, event block = 1000 -> confirmations = 1002 - 1000 + 1 = 3 >= 3
  const log = buildMockAnchorLog(setup, { blockNumber: 1000n });
  const client = createMockRpcClient({
    artistSigner: setup.artist.address,
    latestBlock: 1002n,
    logs: [log],
  });

  const result = await discoverOnChainAuthorization(client, setup.buyer.address, { requiredConfirmations: 3n });

  assert.equal(result.state, 'ON_CHAIN_CONFIRMED');
  assert.equal(result.confirmations, 3n);
  assert.equal(result.message, 'Authorization confirmed on Base. Ready for acquisition.');
  assert.ok(result.artifact);
  assert.equal(result.artifact.message.designatedBearer.toLowerCase(), setup.buyer.address.toLowerCase());
});

test('Operational Confirmation Policy: Micro-reorg rollback demotes from ON_CHAIN_CONFIRMED to PENDING_CONFIRMATION', async () => {
  const setup = await createTestSetup();
  const log = buildMockAnchorLog(setup, { blockNumber: 1000n });

  // Initial state at block 1002 (depth 3)
  const clientAtDepth3 = createMockRpcClient({
    artistSigner: setup.artist.address,
    latestBlock: 1002n,
    logs: [log],
  });
  const res1 = await discoverOnChainAuthorization(clientAtDepth3, setup.buyer.address, { requiredConfirmations: 3n });
  assert.equal(res1.state, 'ON_CHAIN_CONFIRMED');

  // Reorg occurs, block rolled back to 1001 (depth 2)
  const clientAtDepth2 = createMockRpcClient({
    artistSigner: setup.artist.address,
    latestBlock: 1001n,
    logs: [log],
  });
  const res2 = await discoverOnChainAuthorization(clientAtDepth2, setup.buyer.address, { requiredConfirmations: 3n });
  assert.equal(res2.state, 'PENDING_CONFIRMATION');
  assert.equal(res2.confirmations, 2n);
});

test('Untrusted Bulletin Board: Discards candidate if artifactHash does not match canonicalPayload', async () => {
  const setup = await createTestSetup();
  const attacker = privateKeyToAccount(generatePrivateKey());

  // Tampered payload: designate attacker wallet
  const tamperedArtifact = JSON.parse(JSON.stringify(setup.artifact));
  tamperedArtifact.message.designatedBearer = attacker.address;
  const tamperedPayloadBytes = toHex(stringToBytes(canonicalizeJson(tamperedArtifact)));

  // Log provides setup.artifactHash but supplies tamperedPayloadBytes
  const log = buildMockAnchorLog(setup, {
    artifactHash: setup.artifactHash,
    canonicalPayload: tamperedPayloadBytes,
    blockNumber: 990n,
  });

  const client = createMockRpcClient({
    artistSigner: setup.artist.address,
    latestBlock: 1000n,
    logs: [log],
  });
  const result = await discoverOnChainAuthorization(client, setup.buyer.address);

  assert.equal(result.state, 'NOT_ANCHORED');
  assert.equal(result.message, 'No on-chain authorization found for this wallet.');
});

test('Untrusted Bulletin Board: Discards candidate with mismatched targetContract', async () => {
  const setup = await createTestSetup();
  const rogueContract = '0x1234567890123456789012345678901234567890';
  const log = buildMockAnchorLog(setup, {
    targetContract: rogueContract,
    blockNumber: 990n,
  });

  const client = createMockRpcClient({
    artistSigner: setup.artist.address,
    latestBlock: 1000n,
    logs: [log],
  });
  const result = await discoverOnChainAuthorization(client, setup.buyer.address);

  assert.equal(result.state, 'NOT_ANCHORED');
});

test('Untrusted Bulletin Board: Discards candidate with stale expired deadline', async () => {
  const setup = await createTestSetup({ deadline: 1726000100n });
  const log = buildMockAnchorLog(setup, {
    deadline: 1726000100n, // Expired relative to latestTimestamp 1726000500n
    blockNumber: 990n,
  });

  const client = createMockRpcClient({
    artistSigner: setup.artist.address,
    latestBlock: 1000n,
    latestTimestamp: 1726000500n,
    logs: [log],
  });
  const result = await discoverOnChainAuthorization(client, setup.buyer.address);

  assert.equal(result.state, 'NOT_ANCHORED');
});

test('Untrusted Bulletin Board: Discards candidate with consumed on-chain nonce', async () => {
  const setup = await createTestSetup({ nonce: 0n });
  const log = buildMockAnchorLog(setup, {
    nonce: 0n,
    blockNumber: 990n,
  });

  // Contract nonce is now 1 (nonce 0 already executed)
  const client = createMockRpcClient({
    artistSigner: setup.artist.address,
    latestBlock: 1000n,
    contractNonce: 1n,
    logs: [log],
  });
  const result = await discoverOnChainAuthorization(client, setup.buyer.address);

  assert.equal(result.state, 'NOT_ANCHORED');
});

test('Untrusted Bulletin Board: Discards candidate with forged/unauthorized signature', async () => {
  const setup = await createTestSetup();
  // Deterministically corrupt r component of the ECDSA signature
  const corruptedByte = setup.signature.slice(2, 4) === 'ff' ? '00' : 'ff';
  const corruptedSig = '0x' + corruptedByte + setup.signature.slice(4);
  const corruptedArtifact = {
    ...setup.artifact,
    signature: corruptedSig,
  };
  const corruptedPayload = toHex(stringToBytes(canonicalizeJson(corruptedArtifact)));
  const corruptedHash = keccak256(stringToBytes(canonicalizeJson(corruptedArtifact)));

  const log = buildMockAnchorLog(setup, {
    signature: corruptedSig,
    canonicalPayload: corruptedPayload,
    artifactHash: corruptedHash,
    blockNumber: 990n,
  });

  const client = createMockRpcClient({
    artistSigner: setup.artist.address,
    latestBlock: 1000n,
    logs: [log],
  });
  const result = await discoverOnChainAuthorization(client, setup.buyer.address);

  assert.equal(result.state, 'NOT_ANCHORED');
});

test('RPC Range Limits: Automatically paginates and chunks query when provider limits block range', async () => {
  const setup = await createTestSetup();
  const log = buildMockAnchorLog(setup, { blockNumber: 99990n });
  const client = createMockRpcClient({
    artistSigner: setup.artist.address,
    latestBlock: 100000n,
    logs: [log],
    rangeLimitError: true, // Throws if query range > 10,000 blocks
  });

  const logs = await queryAnchorLogsPaginated(
    client,
    '0x845371E8691516e86D8b9812423377F58097Ac37',
    setup.buyer.address,
    0n,
    100000n,
    50000n
  );

  assert.equal(logs.length, 1);
  assert.equal(logs[0].blockNumber, 99990n);
});

test('Full Autonomous On-Chain Acquisition: Discovered artifact prepares exact transaction without Web2', async () => {
  const setup = await createTestSetup();
  const log = buildMockAnchorLog(setup, { blockNumber: 990n });
  const client = createMockRpcClient({
    artistSigner: setup.artist.address,
    latestBlock: 1000n,
    logs: [log],
    designationHash: setup.message.canonicalDesignationHash,
    licenseHash: setup.message.licenseHash,
  });

  // 1. Autonomous on-chain discovery
  const discovery = await discoverOnChainAuthorization(client, setup.buyer.address);
  assert.equal(discovery.state, 'ON_CHAIN_CONFIRMED');
  assert.ok(discovery.artifact);

  // 2. Prepare acquisition transaction with the discovered artifact
  const mockProvider = {
    request: async ({ method, params }) => {
      if (method === 'eth_chainId') return '0x2105'; // 8453
      if (method === 'eth_accounts') return [setup.buyer.address];
      if (method === 'eth_blockNumber') return '0x3e8';
      if (method === 'eth_getBlockByNumber') {
        return { number: '0x3e8', timestamp: '0x66e0767c' }; // 1726000500
      }
      if (method === 'eth_call') {
        const data = params?.[0]?.data ?? '';
        if (data.startsWith('0xbbdaeac8')) return encodeAbiParameters([{ type: 'address' }], [setup.artist.address]);
        if (data.startsWith('0x3e75837f')) return setup.message.canonicalDesignationHash;
        if (data.startsWith('0x9247bf2a')) return setup.message.licenseHash;
        if (data.startsWith('0x7ecebe00')) return encodeAbiParameters([{ type: 'uint256' }], [0n]);
        if (data.startsWith('0x6352211e')) return encodeAbiParameters([{ type: 'address' }], [setup.artist.address]);
        if (data.startsWith('0xe7c1677f')) return encodeAbiParameters([{ type: 'uint256' }], [0n]);
        if (data.startsWith('0x255e4685')) return encodeAbiParameters([{ type: 'uint256' }], [1000n]);
        if (data.startsWith('0xf79d36bb')) return encodeAbiParameters([{ type: 'uint256' }], [COMPLETE_PRICE]);
        if (data.startsWith('0x727615af')) return setup.message.archiveCommitment;
        if (data.startsWith('0x9ba9ad81')) return completeDigest(setup.message);
        if (data.startsWith('0x3b5abbb7')) return '0x';
        return '0x';
      }
      throw new Error(`Unhandled mockProvider request: ${method}`);
    },
  };

  const prepared = await prepareCompletePurchase(mockProvider, {
    message: discovery.artifact.message,
    signature: discovery.artifact.signature,
  });

  assert.equal(prepared.transaction.to.toLowerCase(), CANONICAL_HIEN_SINH.toLowerCase());
  assert.equal(prepared.transaction.value, 4290000000000000000n);
  assert.ok(prepared.transaction.data.startsWith('0x'));
});

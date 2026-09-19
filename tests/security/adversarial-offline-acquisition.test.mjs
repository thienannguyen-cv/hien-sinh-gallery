import test from 'node:test';
import assert from 'node:assert/strict';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import {
  decodeFunctionData,
  encodeAbiParameters,
} from 'viem';
import {
  COMPLETE_CONTRACT,
  COMPLETE_PRICE,
  COMPLETE_DOMAIN,
  COMPLETE_TYPES,
  COMPLETE_ACQUIRE_ABI,
  completeTypedData,
  completeDigest,
  completeTransaction,
  verifyCompleteAuthorization,
} from '../../src/services/completePackageProtocol.ts';
import {
  verifyAuthorizationPipeline,
} from '../../src/services/authorization/authorizationProvider.ts';
import {
  prepareCompletePurchase,
} from '../../src/services/completePurchase.ts';

// Helper: generate canonical test setup
async function createAuthoritativeSetup(options = {}) {
  const artist = privateKeyToAccount(generatePrivateKey());
  const buyer = privateKeyToAccount(generatePrivateKey());

  const message = {
    canonicalDesignationHash: '0x' + 'aa'.repeat(32),
    archiveCommitment: '0x' + 'bb'.repeat(32),
    licenseHash: '0x' + 'cc'.repeat(32),
    paintingTokenId: 0n,
    frameTokenId: 5n,
    designatedBearer: buyer.address,
    nonce: options.nonce ?? 0n,
    deadline: options.deadline ?? 1900000000n,
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
      paintingTokenId: 0n,
      frameTokenId: 5n,
      designatedBearer: message.designatedBearer,
      nonce: message.nonce,
      deadline: message.deadline,
    },
    signature,
    source: options.source ?? 'local_file',
  };

  const mockRpcProvider = {
    currentNonce: options.contractNonce ?? 0n,
    request: async ({ method, params }) => {
      if (method === 'eth_chainId') return '0x2105'; // 8453
      if (method === 'eth_accounts') return [buyer.address];
      if (method === 'eth_blockNumber') return '0x100';
      if (method === 'eth_getBlockByNumber') {
        return { number: '0x100', timestamp: '0x65000000' }; // 1694498816 (before deadline)
      }
      if (method === 'eth_call') {
        const callObj = params?.[0];
        const data = callObj?.data ?? '';

        // artistSigner() -> returns artist address (0xbbdaeac8)
        if (data.startsWith('0xbbdaeac8')) {
          return encodeAbiParameters([{ type: 'address' }], [artist.address]);
        }
        // canonicalDesignationHash() -> returns designation hash (0x3e75837f)
        if (data.startsWith('0x3e75837f')) {
          return message.canonicalDesignationHash;
        }
        // completeLicenseHash() -> returns license hash (0x9247bf2a)
        if (data.startsWith('0x9247bf2a')) {
          return message.licenseHash;
        }
        // nonces(address) -> returns mockRpcProvider.currentNonce (0x7ecebe00)
        if (data.startsWith('0x7ecebe00')) {
          return encodeAbiParameters([{ type: 'uint256' }], [mockRpcProvider.currentNonce]);
        }
        // ownerOf(0) -> returns artist address (0x6352211e)
        if (data.startsWith('0x6352211e')) {
          return encodeAbiParameters([{ type: 'address' }], [artist.address]);
        }
        // completePackageTokenId() -> returns 0n (0xe7c1677f)
        if (data.startsWith('0xe7c1677f')) {
          return encodeAbiParameters([{ type: 'uint256' }], [0n]);
        }
        // mintStart() -> returns 1000n (0x255e4685)
        if (data.startsWith('0x255e4685')) {
          return encodeAbiParameters([{ type: 'uint256' }], [1000n]);
        }
        // COMPLETE_PACKAGE_PRICE() -> returns 4.29 ETH (0xf79d36bb)
        if (data.startsWith('0xf79d36bb')) {
          return encodeAbiParameters([{ type: 'uint256' }], [COMPLETE_PRICE]);
        }
        // designatedArchiveCommitment() -> returns archiveCommitment (0x727615af)
        if (data.startsWith('0x727615af')) {
          return message.archiveCommitment;
        }
        // hashCompletePackageAcceptance(...) -> returns completeDigest(m) (0x9ba9ad81)
        if (data.startsWith('0x9ba9ad81')) {
          return completeDigest(message);
        }
        // simulated transaction call: acquireCompletePackage (0x3b5abbb7)
        if (data.startsWith('0x3b5abbb7')) {
          if (mockRpcProvider.currentNonce !== message.nonce) {
            throw new Error('execution reverted: Invalid nonce');
          }
          return '0x';
        }
        return '0x';
      }
      throw new Error(`Unexpected RPC method: ${method}`);
    },
  };

  return { artist, buyer, message, signature, artifact, mockRpcProvider };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Critical Acquisition Path Offline (Zero Web2 Dependency)
// ─────────────────────────────────────────────────────────────────────────────
test('1. CRITICAL ACQUISITION PATH: Offline artifact to valid Base transaction with zero Web2 dependencies', async () => {
  const { artist, buyer, message, signature, artifact, mockRpcProvider } = await createAuthoritativeSetup();

  // Adversarial assertion: Enforce total Web2 blackout
  // Any attempt to call globalThis.fetch MUST fail the test
  const originalFetch = globalThis.fetch;
  let fetchAttempted = false;
  globalThis.fetch = async () => {
    fetchAttempted = true;
    throw new Error('CRITICAL FAILURE: Web2 fetch called during offline acquisition path');
  };

  try {
    // A. Local verification pipeline directly from offline JSON string (100% in RAM)
    const rawJson = JSON.stringify(artifact, (_k, v) => typeof v === 'bigint' ? v.toString() : v);
    const pipelineResult = await verifyAuthorizationPipeline(rawJson, {
      connectedWallet: buyer.address,
      onChainState: {
        contractNonce: 0n,
        artistSigner: artist.address,
        blockTimestamp: 1694498816n,
      },
      source: 'local_file',
    });

    assert.equal(pipelineResult.success, true);
    assert.equal(pipelineResult.step, 'eligible');
    assert.equal(pipelineResult.details.designatedBearer?.toLowerCase(), buyer.address.toLowerCase());

    // C. Prepare complete purchase directly against Base RPC mock
    const prepared = await prepareCompletePurchase(mockRpcProvider, {
      message,
      signature,
    });

    // D. Transaction invariant verification
    const tx = prepared.transaction;
    assert.equal(tx.to.toLowerCase(), COMPLETE_CONTRACT.toLowerCase());
    assert.equal(tx.chainId, 8453);
    assert.equal(tx.value, COMPLETE_PRICE); // 4.29 ETH
    assert.equal(tx.from.toLowerCase(), buyer.address.toLowerCase());

    // E. Calldata decoding verification
    const decoded = decodeFunctionData({
      abi: COMPLETE_ACQUIRE_ABI,
      data: tx.data,
    });
    assert.equal(decoded.functionName, 'acquireCompletePackage');
    assert.equal(decoded.args[0], message.canonicalDesignationHash);
    assert.equal(decoded.args[1], message.archiveCommitment);
    assert.equal(decoded.args[2], message.licenseHash);
    assert.equal(decoded.args[3], 0n);
    assert.equal(decoded.args[4], 5n);
    assert.equal(decoded.args[5], message.deadline);
    assert.equal(decoded.args[6], message.nonce);
    assert.equal(decoded.args[7], signature);

    // Assert zero Web2 interactions occurred
    assert.equal(fetchAttempted, false, 'No Web2 endpoints were invoked during the entire acquisition flow');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Authorization Cryptographic Binding Matrix (Field-by-Field Mutation)
// ─────────────────────────────────────────────────────────────────────────────
test('2. CRYPTOGRAPHIC BINDING MATRIX: Mutating any field breaks signature coverage and rejects authorization', async () => {
  const { artist, buyer, message, signature, artifact } = await createAuthoritativeSetup();

  // Ensure baseline passes
  const baseline = await verifyAuthorizationPipeline(artifact, {
    connectedWallet: buyer.address,
    onChainState: { contractNonce: 0n, artistSigner: artist.address },
    source: 'local_file',
  });
  assert.equal(baseline.success, true);

  // Field mutation test matrix
  const mutations = [
    {
      name: 'domain.chainId (foreign network)',
      mutate: (art) => { art.domain.chainId = 1; },
      expectedStep: 'domain_contract',
    },
    {
      name: 'domain.verifyingContract (foreign contract)',
      mutate: (art) => { art.domain.verifyingContract = '0x1111111111111111111111111111111111111111'; },
      expectedStep: 'domain_contract',
    },
    {
      name: 'message.canonicalDesignationHash (tampered designation)',
      mutate: (art) => { art.message.canonicalDesignationHash = ('0x' + '12'.repeat(32)); },
      expectedStep: 'artist_signature',
    },
    {
      name: 'message.archiveCommitment (tampered package archive hash)',
      mutate: (art) => { art.message.archiveCommitment = ('0x' + '34'.repeat(32)); },
      expectedStep: 'artist_signature',
    },
    {
      name: 'message.licenseHash (tampered license schedule)',
      mutate: (art) => { art.message.licenseHash = ('0x' + '56'.repeat(32)); },
      expectedStep: 'artist_signature',
    },
    {
      name: 'message.paintingTokenId (wrong token ID)',
      mutate: (art) => { art.message.paintingTokenId = 1n; },
      expectedStep: 'domain_contract',
    },
    {
      name: 'message.frameTokenId (wrong frame ID)',
      mutate: (art) => { art.message.frameTokenId = 4n; },
      expectedStep: 'domain_contract',
    },
    {
      name: 'message.designatedBearer (stolen signature attack)',
      mutate: (art) => {
        const attacker = '0x9999999999999999999999999999999999999999';
        art.message.designatedBearer = attacker;
      },
      expectedStep: 'designated_bearer',
    },
    {
      name: 'message.nonce (tampered nonce)',
      mutate: (art) => { art.message.nonce = 1n; },
      expectedStep: 'nonce',
    },
    {
      name: 'message.deadline (extended deadline)',
      mutate: (art) => { art.message.deadline = 2000000000n; },
      expectedStep: 'artist_signature',
    },
    {
      name: 'signature (tampered ECDSA hex)',
      mutate: (art) => {
        // Flip last byte of signature
        const lastByte = art.signature.slice(-2);
        const replacement = lastByte === 'aa' ? 'bb' : 'aa';
        art.signature = (art.signature.slice(0, -2) + replacement);
      },
      expectedStep: 'artist_signature',
    },
  ];

  for (const m of mutations) {
    const clone = JSON.parse(
      JSON.stringify(artifact, (_k, v) => typeof v === 'bigint' ? v.toString() : v),
      (k, v) => ['paintingTokenId', 'frameTokenId', 'nonce', 'deadline'].includes(k) ? BigInt(v) : v
    );

    m.mutate(clone);

    const result = await verifyAuthorizationPipeline(clone, {
      connectedWallet: buyer.address,
      onChainState: { contractNonce: 0n, artistSigner: artist.address },
      source: 'local_file',
    });

    assert.equal(
      result.success,
      false,
      `Mutation '${m.name}' MUST fail verification, but unexpectedly succeeded`
    );
    assert.equal(
      result.step,
      m.expectedStep,
      `Mutation '${m.name}' failed at step '${result.step}', expected '${m.expectedStep}'`
    );

    // Also assert that protocol-level verifyCompleteAuthorization throws when message or signature is altered
    if (m.expectedStep === 'artist_signature') {
      await assert.rejects(
        verifyCompleteAuthorization(clone.message, clone.signature, artist.address),
        /Artist signature does not match|Expected a 65-byte Artist signature|Invalid yParityOrV value/
      );
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Nonce Race / TOCTOU Simulation
// ─────────────────────────────────────────────────────────────────────────────
test('3. NONCE RACE / TOCTOU: Smart contract reverts if nonce is consumed between pre-flight and execution', async () => {
  const { artist, buyer, message, signature, artifact, mockRpcProvider } = await createAuthoritativeSetup();

  // T0: Initial on-chain nonce = 0n
  mockRpcProvider.currentNonce = 0n;

  // T1: Buyer verifies authorization locally when on-chain nonce is 0n
  const t1Check = await verifyAuthorizationPipeline(artifact, {
    connectedWallet: buyer.address,
    onChainState: { contractNonce: 0n, artistSigner: artist.address },
    source: 'local_file',
  });
  assert.equal(t1Check.success, true);
  assert.equal(t1Check.step, 'eligible');

  // T2: Intervening event: Another transaction executes on-chain and consumes nonce 0n
  // The on-chain nonce is now 1n
  mockRpcProvider.currentNonce = 1n;

  // T3: Buyer attempts to submit with the stale authorization (nonce = 0n)
  // Smart contract state validation MUST detect nonce mismatch and fail
  await assert.rejects(
    prepareCompletePurchase(mockRpcProvider, { message, signature }),
    /Buyer nonce changed/
  );

  // T4: Also assert that if client re-checks, the pipeline rejects as replay
  const t4Check = await verifyAuthorizationPipeline(artifact, {
    connectedWallet: buyer.address,
    onChainState: { contractNonce: 1n, artistSigner: artist.address },
    source: 'local_file',
  });
  assert.equal(t4Check.success, false);
  assert.equal(t4Check.step, 'nonce');
  assert.match(t4Check.error ?? '', /already been consumed on-chain/);

  // Invariant documented: Client-side verification is strictly advisory pre-flight;
  // the on-chain smart contract is the absolute, final authority.
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Exact Transaction Invariant Assertion
// ─────────────────────────────────────────────────────────────────────────────
test('4. EXACT TRANSACTION INVARIANTS: Calldata, recipient, value, and arguments strictly bound without intermediary', async () => {
  const { artist, buyer, message, signature } = await createAuthoritativeSetup();

  const tx = completeTransaction(message, signature);

  // Invariant 1: Destination contract must be authoritative deployed contract
  assert.equal(tx.to, COMPLETE_CONTRACT);
  assert.equal(tx.to, '0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8');

  // Invariant 2: Chain ID must be Base Mainnet (8453)
  assert.equal(tx.chainId, 8453);

  // Invariant 3: Value must be exactly 4.29 ETH (4,290,000,000,000,000,000 Wei)
  assert.equal(tx.value, 4290000000000000000n);
  assert.equal(tx.value, COMPLETE_PRICE);

  // Invariant 4: Caller/From must be the designatedBearer
  assert.equal(tx.from.toLowerCase(), buyer.address.toLowerCase());

  // Invariant 5: Calldata parameters match EIP-712 payload byte-for-byte
  const decoded = decodeFunctionData({
    abi: COMPLETE_ACQUIRE_ABI,
    data: tx.data,
  });

  assert.equal(decoded.functionName, 'acquireCompletePackage');
  const [
    designationHash,
    archiveCommitment,
    licenseHash,
    paintingTokenId,
    frameTokenId,
    deadline,
    nonce,
    artistSignature,
  ] = decoded.args;

  assert.equal(designationHash, message.canonicalDesignationHash);
  assert.equal(archiveCommitment, message.archiveCommitment);
  assert.equal(licenseHash, message.licenseHash);
  assert.equal(paintingTokenId, 0n);
  assert.equal(frameTokenId, 5n);
  assert.equal(deadline, message.deadline);
  assert.equal(nonce, message.nonce);
  assert.equal(artistSignature, signature);
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Offline Artifact Canonicality Across All Transports
// ─────────────────────────────────────────────────────────────────────────────
test('5. TRANSPORT CANONICALITY: All transports execute identical verification pipeline with zero transport privilege', async () => {
  const { artist, buyer, artifact } = await createAuthoritativeSetup();

  const sources = ['official_api', 'local_file', 'clipboard', 'manual_json'];
  const results = [];

  for (const source of sources) {
    const transportArtifact = { ...artifact, source };
    const res = await verifyAuthorizationPipeline(transportArtifact, {
      connectedWallet: buyer.address,
      onChainState: { contractNonce: 0n, artistSigner: artist.address },
      source,
    });
    results.push(res);
  }

  // All 4 transports must return identical result structure and status
  for (let i = 0; i < results.length; i++) {
    assert.equal(results[i].success, true);
    assert.equal(results[i].step, 'eligible');
    assert.equal(results[i].details.designatedBearer?.toLowerCase(), buyer.address.toLowerCase());
    assert.equal(results[i].details.nonce, 0n);
    assert.equal(results[i].details.source, sources[i]);
  }

  // Corrupted artifact from 'official_api' MUST be rejected identically as from 'manual_json'
  const corrupted = {
    ...artifact,
    signature: '0x' + '00'.repeat(65),
  };

  const rejectedApi = await verifyAuthorizationPipeline({ ...corrupted, source: 'official_api' }, {
    connectedWallet: buyer.address,
    onChainState: { contractNonce: 0n, artistSigner: artist.address },
    source: 'official_api',
  });

  const rejectedManual = await verifyAuthorizationPipeline({ ...corrupted, source: 'manual_json' }, {
    connectedWallet: buyer.address,
    onChainState: { contractNonce: 0n, artistSigner: artist.address },
    source: 'manual_json',
  });

  assert.equal(rejectedApi.success, false);
  assert.equal(rejectedManual.success, false);
  assert.equal(rejectedApi.step, 'artist_signature');
  assert.equal(rejectedManual.step, 'artist_signature');
  assert.equal(rejectedApi.error, rejectedManual.error);
});

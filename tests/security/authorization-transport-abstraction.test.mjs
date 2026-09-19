import assert from 'node:assert/strict';
import test from 'node:test';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import {
  COMPLETE_CONTRACT,
  completeTypedData,
} from '../../src/services/completePackageProtocol.ts';
import {
  verifyAuthorizationPipeline,
} from '../../src/services/authorization/authorizationProvider.ts';

// Create deterministic test identities
const artist = privateKeyToAccount(generatePrivateKey());
const buyer = privateKeyToAccount(generatePrivateKey());
const attacker = privateKeyToAccount(generatePrivateKey());

function createValidMessage(overrides = {}) {
  const futureDeadline = BigInt(Math.floor(Date.now() / 1000) + 7 * 86400);
  return {
    canonicalDesignationHash: '0x' + '11'.repeat(32),
    archiveCommitment: '0x' + '22'.repeat(32),
    licenseHash: '0x' + '33'.repeat(32),
    paintingTokenId: 0n,
    frameTokenId: 5n,
    designatedBearer: buyer.address,
    nonce: 0n,
    deadline: futureDeadline,
    ...overrides,
  };
}

async function createSignedArtifact(messageOverrides = {}, domainOverrides = {}) {
  const message = createValidMessage(messageOverrides);
  const typedData = completeTypedData(message);
  const signature = await artist.signTypedData(typedData);

  const domain = {
    name: 'HienSinh',
    version: '2',
    chainId: 8453,
    verifyingContract: COMPLETE_CONTRACT,
    ...domainOverrides,
  };

  const artifact = {
    domain,
    message: {
      ...message,
      paintingTokenId: message.paintingTokenId.toString(),
      frameTokenId: message.frameTokenId.toString(),
      nonce: message.nonce.toString(),
      deadline: message.deadline.toString(),
    },
    signature,
  };

  return { artifact, message, signature };
}

// ── Test 1: Valid Authorization Parses & Verifies ──
test('1. Valid authorization parses and passes all verification pipeline steps to ELIGIBLE', async () => {
  const { artifact } = await createSignedArtifact();
  const result = await verifyAuthorizationPipeline(JSON.stringify(artifact), {
    connectedWallet: buyer.address,
    onChainState: {
      contractNonce: 0n,
      artistSigner: artist.address,
    },
  });

  assert.equal(result.success, true);
  assert.equal(result.step, 'eligible');
  assert.equal(result.error, undefined);
  assert.ok(result.artifact);
  assert.equal(result.details.designatedBearer?.toLowerCase(), buyer.address.toLowerCase());
  assert.equal(result.details.connectedWallet?.toLowerCase(), buyer.address.toLowerCase());
  assert.equal(result.artistAddress?.toLowerCase(), artist.address.toLowerCase());
});

// ── Test 2: Wrong designatedBearer -> Rejected ──
test('2. Authorization with mismatched designatedBearer fails at "designated_bearer" step', async () => {
  const { artifact } = await createSignedArtifact();
  const result = await verifyAuthorizationPipeline(JSON.stringify(artifact), {
    connectedWallet: attacker.address,
    onChainState: {
      contractNonce: 0n,
      artistSigner: artist.address,
    },
  });

  assert.equal(result.success, false);
  assert.equal(result.step, 'designated_bearer');
  assert.match(result.error, /does not match connected wallet/i);
});

// ── Test 3: Invalid / Corrupted Signature -> Rejected ──
test('3. Corrupted artist signature fails at "artist_signature" step', async () => {
  const { artifact } = await createSignedArtifact();
  // Tamper last byte of signature
  const tamperedSig = artifact.signature.slice(0, -2) + (artifact.signature.endsWith('ff') ? '00' : 'ff');
  const corruptedArtifact = { ...artifact, signature: tamperedSig };

  const result = await verifyAuthorizationPipeline(JSON.stringify(corruptedArtifact), {
    connectedWallet: buyer.address,
    onChainState: {
      contractNonce: 0n,
      artistSigner: artist.address,
    },
  });

  assert.equal(result.success, false);
  assert.equal(result.step, 'artist_signature');
  assert.match(result.error, /Artist signature/i);
});

// ── Test 4: Wrong chainId -> Rejected ──
test('4. Authorization targeting wrong chainId fails at "domain_contract" step', async () => {
  const { artifact } = await createSignedArtifact({}, { chainId: 1 }); // Ethereum Mainnet instead of Base 8453
  const result = await verifyAuthorizationPipeline(JSON.stringify(artifact), {
    connectedWallet: buyer.address,
    onChainState: {
      contractNonce: 0n,
      artistSigner: artist.address,
    },
  });

  assert.equal(result.success, false);
  assert.equal(result.step, 'domain_contract');
  assert.match(result.error, /Chain ID mismatch/i);
});

// ── Test 5: Wrong verifyingContract -> Rejected ──
test('5. Authorization targeting foreign verifyingContract fails at "domain_contract" step', async () => {
  const foreignContract = '0x1111111111111111111111111111111111111111';
  const { artifact } = await createSignedArtifact({}, { verifyingContract: foreignContract });
  const result = await verifyAuthorizationPipeline(JSON.stringify(artifact), {
    connectedWallet: buyer.address,
    onChainState: {
      contractNonce: 0n,
      artistSigner: artist.address,
    },
  });

  assert.equal(result.success, false);
  assert.equal(result.step, 'domain_contract');
  assert.match(result.error, /Verifying contract mismatch/i);
});

// ── Test 6: Expired Deadline -> Rejected ──
test('6. Expired authorization deadline fails at "deadline" step', async () => {
  const pastDeadline = 1600000000n; // Past timestamp
  const { artifact } = await createSignedArtifact({ deadline: pastDeadline });
  const result = await verifyAuthorizationPipeline(JSON.stringify(artifact), {
    connectedWallet: buyer.address,
    onChainState: {
      contractNonce: 0n,
      artistSigner: artist.address,
      blockTimestamp: 1700000000n,
    },
  });

  assert.equal(result.success, false);
  assert.equal(result.step, 'deadline');
  assert.match(result.error, /expired/i);
});

// ── Test 7: Wrong Nonce (Ahead of On-Chain State) -> Rejected ──
test('7. Authorization with nonce ahead of contract state fails at "nonce" step', async () => {
  const { artifact } = await createSignedArtifact({ nonce: 5n });
  const result = await verifyAuthorizationPipeline(JSON.stringify(artifact), {
    connectedWallet: buyer.address,
    onChainState: {
      contractNonce: 0n, // On-chain expects 0, artifact has 5
      artistSigner: artist.address,
    },
  });

  assert.equal(result.success, false);
  assert.equal(result.step, 'nonce');
  assert.match(result.error, /does not match current on-chain nonce/i);
});

// ── Test 8: Already-Consumed Nonce -> Rejected (Replay Protection) ──
test('8. Already-consumed nonce fails at "nonce" step with explicit replay protection rejection', async () => {
  const { artifact } = await createSignedArtifact({ nonce: 0n });
  const result = await verifyAuthorizationPipeline(JSON.stringify(artifact), {
    connectedWallet: buyer.address,
    onChainState: {
      contractNonce: 1n, // Contract has advanced to nonce 1 (nonce 0 already consumed)
      artistSigner: artist.address,
    },
  });

  assert.equal(result.success, false);
  assert.equal(result.step, 'nonce');
  assert.match(result.error, /already been consumed on-chain/i);
  assert.match(result.error, /Replay rejected/i);
});

// ── Test 9: Complete Replay Lifecycle Simulation ──
test('9. Lifecycle test: authorization accepted on first use, but replay strictly rejected after state increment', async () => {
  const { artifact } = await createSignedArtifact({ nonce: 0n });
  const payloadString = JSON.stringify(artifact);

  // Phase 1: First presentation before on-chain execution (contract nonce = 0)
  const initialVerification = await verifyAuthorizationPipeline(payloadString, {
    connectedWallet: buyer.address,
    onChainState: {
      contractNonce: 0n,
      artistSigner: artist.address,
    },
  });
  assert.equal(initialVerification.success, true);
  assert.equal(initialVerification.step, 'eligible');

  // Phase 2: On-chain acquisition executes (HienSinh.sol increments nonces[msg.sender]++)
  const updatedContractNonce = 1n;

  // Phase 3: Attacker or buyer attempts to replay the exact same authorization artifact
  const replayVerification = await verifyAuthorizationPipeline(payloadString, {
    connectedWallet: buyer.address,
    onChainState: {
      contractNonce: updatedContractNonce,
      artistSigner: artist.address,
    },
  });
  assert.equal(replayVerification.success, false);
  assert.equal(replayVerification.step, 'nonce');
  assert.match(replayVerification.error, /already been consumed on-chain/i);
  assert.match(replayVerification.error, /Replay rejected/i);
});

// ── Test 10: JSON Parse and Size Defense ──
test('10. Parser defense rejects malformed JSON and oversized payloads', async () => {
  const malformedResult = await verifyAuthorizationPipeline('NOT VALID JSON {{{', {
    connectedWallet: buyer.address,
  });
  assert.equal(malformedResult.success, false);
  assert.equal(malformedResult.step, 'parse');

  const hugePayload = ' '.repeat(16385);
  const oversizedResult = await verifyAuthorizationPipeline(hugePayload, {
    connectedWallet: buyer.address,
  });
  assert.equal(oversizedResult.success, false);
  assert.equal(oversizedResult.step, 'parse');
  assert.match(oversizedResult.error, /exceeds maximum size/i);
});

// ── Test 11: Transport Independence & Zero Network Leakage ──
test('11. Local artifact verification runs 100% offline without HTTP courier dependencies', async () => {
  const { artifact } = await createSignedArtifact();
  const rawJson = JSON.stringify(artifact);

  // Stub global fetch to fail immediately if called
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => {
    throw new Error('Network call attempted during local verification!');
  };

  try {
    const result = await verifyAuthorizationPipeline(rawJson, {
      connectedWallet: buyer.address,
      onChainState: {
        contractNonce: 0n,
        artistSigner: artist.address,
      },
      source: 'local_file',
    });

    assert.equal(result.success, true);
    assert.equal(result.step, 'eligible');
    assert.equal(result.details.source, 'local_file');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

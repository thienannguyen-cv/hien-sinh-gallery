import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ArchiveAccessError,
  createTransmissionService,
} from '../../supabase/functions/_shared/transmission-service.ts';

const address = '0x1111111111111111111111111111111111111111';
const otherAddress = '0x2222222222222222222222222222222222222222';
const signature = `0x${'a'.repeat(130)}`;
const nonce = 'N'.repeat(43);
const hash = 'b'.repeat(64);
const commitment = `0x${'c'.repeat(64)}`;
const designation = `0x${'d'.repeat(64)}`;
const authorizationBlockNumber = '12345678';
const authorizationBlockHash = `0x${'e'.repeat(64)}`;

function harness(overrides = {}) {
  let challenge = null;
  let consumed = false;
  let signedUrlCalls = 0;
  const dependencies = {
    now: () => new Date('2027-01-15T00:00:00.000Z'),
    hashNonce: async () => hash,
    insertChallenge: async record => { challenge = record; },
    getChallenge: async () => challenge,
    verifyWalletSignature: async () => true,
    readOnChainAccess: async () => ({
      owner: address,
      completePackageId: 5,
      completePackageTokenId: 5,
      relationshipState: 1,
      canonicalDesignationHash: designation,
      archiveCommitment: commitment,
      authorizationBlockNumber,
      authorizationBlockHash,
    }),
    getAsset: async () => ({
      tokenId: 5,
      assetType: 'H_CORE',
      assetHash: hash,
      archiveCommitment: commitment,
      filePath: 'complete/core.png',
    }),
    consumeChallenge: async () => {
      if (consumed) return false;
      consumed = true;
      return true;
    },
    createSignedUrl: async () => {
      signedUrlCalls += 1;
      return 'https://storage.example/signed/core.png?token=short-lived';
    },
    writeAuditLog: async () => {},
    ...overrides,
  };
  const service = createTransmissionService(dependencies, {
    origin: 'https://gallery.example',
    chainId: 8453,
    contractAddress: '0x3333333333333333333333333333333333333333',
  });
  return { service, getSignedUrlCalls: () => signedUrlCalls };
}

async function issueAndTransmit(sample) {
  await sample.service.issueChallenge({
    address,
    tokenId: 5,
    assetType: 'H_CORE',
    requestNonce: nonce,
    requestSignature: signature,
  });
  return sample.service.transmit({ address, tokenId: 5, assetType: 'H_CORE', nonce, signature });
}

test('grants a short URL only after wallet and canonical contract checks', async () => {
  const sample = harness();
  const result = await issueAndTransmit(sample);
  assert.equal(result.status, 'TRANSMISSION_GRANTED');
  assert.equal(result.expiresInSeconds, 60);
  assert.equal(sample.getSignedUrlCalls(), 1);
});

test('fails closed when signature verification fails', async () => {
  const sample = harness({
    verifyWalletSignature: async (_address, message) => message.startsWith('Hien Sinh requests proof'),
  });
  await assert.rejects(issueAndTransmit(sample), error => {
    assert.equal(error instanceof ArchiveAccessError, true);
    assert.equal(error.code, 'SIGNATURE_REJECTED');
    return true;
  });
  assert.equal(sample.getSignedUrlCalls(), 0);
});

test('requires wallet control before allocating a server challenge', async () => {
  const sample = harness({ verifyWalletSignature: async () => false });
  await assert.rejects(
    sample.service.issueChallenge({
      address,
      tokenId: 5,
      assetType: 'H_CORE',
      requestNonce: nonce,
      requestSignature: signature,
    }),
    error => {
      assert.equal(error instanceof ArchiveAccessError, true);
      assert.equal(error.code, 'CHALLENGE_REQUEST_REJECTED');
      return true;
    },
  );
});

test('fails closed when signer is not current on-chain owner', async () => {
  const sample = harness({
    readOnChainAccess: async () => ({
      owner: otherAddress,
      completePackageId: 5,
      completePackageTokenId: 5,
      relationshipState: 1,
      canonicalDesignationHash: designation,
      archiveCommitment: commitment,
      authorizationBlockNumber,
      authorizationBlockHash,
    }),
  });
  await assert.rejects(issueAndTransmit(sample), /not the current token owner/);
  assert.equal(sample.getSignedUrlCalls(), 0);
});

test('fails closed for a Frame-only token and for a missing archive component', async () => {
  const frameOnly = harness({
    readOnChainAccess: async () => ({
      owner: address,
      completePackageId: 5,
      completePackageTokenId: 5,
      relationshipState: 0,
      canonicalDesignationHash: designation,
      archiveCommitment: commitment,
      authorizationBlockNumber,
      authorizationBlockHash,
    }),
  });
  await assert.rejects(issueAndTransmit(frameOnly), /not the designated Complete token/);
  assert.equal(frameOnly.getSignedUrlCalls(), 0);

  const missing = harness({ getAsset: async () => null });
  await assert.rejects(issueAndTransmit(missing), /unavailable/);
  assert.equal(missing.getSignedUrlCalls(), 0);
});

test('fails closed when the requested token is not the contract-defined Complete Package', async () => {
  const sample = harness({
    readOnChainAccess: async () => ({
      owner: address,
      completePackageId: 4,
      completePackageTokenId: 5,
      relationshipState: 1,
      canonicalDesignationHash: designation,
      archiveCommitment: commitment,
      authorizationBlockNumber,
      authorizationBlockHash,
    }),
  });
  await assert.rejects(issueAndTransmit(sample), /not the designated Complete token/);
  assert.equal(sample.getSignedUrlCalls(), 0);
});

test('fails closed when storage record is not bound to the on-chain archive commitment', async () => {
  const sample = harness({
    getAsset: async () => ({
      tokenId: 5,
      assetType: 'H_CORE',
      assetHash: hash,
      archiveCommitment: `0x${'e'.repeat(64)}`,
      filePath: 'complete/core.png',
    }),
  });
  await assert.rejects(issueAndTransmit(sample), /unavailable/);
  assert.equal(sample.getSignedUrlCalls(), 0);
});

test('atomically consumed challenge cannot mint a second signed URL', async () => {
  const sample = harness();
  await sample.service.issueChallenge({
    address,
    tokenId: 5,
    assetType: 'H_CORE',
    requestNonce: nonce,
    requestSignature: signature,
  });
  const input = { address, tokenId: 5, assetType: 'H_CORE', nonce, signature };
  await sample.service.transmit(input);
  await assert.rejects(sample.service.transmit(input), /already consumed/);
  assert.equal(sample.getSignedUrlCalls(), 1);
});

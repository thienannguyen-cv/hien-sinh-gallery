import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ArchiveAccessError,
  createTransmissionService,
} from '../../supabase/functions/_shared/transmission-service.ts';

const address = '0x1111111111111111111111111111111111111111';
const otherAddress = '0x2222222222222222222222222222222222222222';
const hash = 'b'.repeat(64);
const commitment = `0x${'c'.repeat(64)}`;
const designation = `0x${'d'.repeat(64)}`;
const authorizationBlockNumber = '12345678';
const authorizationBlockHash = `0x${'e'.repeat(64)}`;

function harness(overrides = {}) {
  let signedUrlCalls = 0;
  const dependencies = {
    now: () => new Date('2027-01-15T00:00:00.000Z'),
    hasAcquisitionAuthorization: async (addr) => addr.toLowerCase() === address.toLowerCase(),
    readOnChainAccess: async () => ({
      owner: address,
      completePackageId: 5,
      completePackageTokenId: 5,
      canonicalDesignationHash: designation,
      archiveCommitment: commitment,
      authorizationBlockNumber,
      authorizationBlockHash,
    }),
    getAsset: async () => ({
      tokenId: 0,
      assetType: 'H_CORE',
      assetHash: hash,
      archiveCommitment: commitment,
      filePath: 'complete/core.png',
    }),
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
    publishedArchiveCommitment: commitment,
  });
  return { service, getSignedUrlCalls: () => signedUrlCalls };
}

test('grants a short URL only after canonical Base contract ownership checks', async () => {
  const sample = harness();
  const result = await sample.service.transmit({ address, tokenId: 0, assetType: 'H_CORE' });
  assert.equal(result.status, 'TRANSMISSION_GRANTED');
  assert.equal(result.expiresInSeconds, 60);
  assert.equal(sample.getSignedUrlCalls(), 1);
});

test('fails closed when requester is not current on-chain owner', async () => {
  const sample = harness({
    readOnChainAccess: async () => ({
      owner: otherAddress,
      completePackageId: 5,
      completePackageTokenId: 5,
      canonicalDesignationHash: designation,
      archiveCommitment: commitment,
      authorizationBlockNumber,
      authorizationBlockHash,
    }),
  });
  await assert.rejects(
    sample.service.transmit({ address, tokenId: 0, assetType: 'H_CORE' }),
    /not the current token owner/
  );
  assert.equal(sample.getSignedUrlCalls(), 0);
});

test('permits pre-primary Painting custody but rejects a missing archive component', async () => {
  const frameOnly = harness({
    readOnChainAccess: async () => ({
      owner: address,
      completePackageId: 5,
      completePackageTokenId: 0,
      canonicalDesignationHash: designation,
      archiveCommitment: `0x${'0'.repeat(64)}`,
      authorizationBlockNumber,
      authorizationBlockHash,
    }),
  });
  assert.equal(
    (await frameOnly.service.transmit({ address, tokenId: 0, assetType: 'H_CORE' })).status,
    'TRANSMISSION_GRANTED'
  );
  assert.equal(frameOnly.getSignedUrlCalls(), 1);

  const missing = harness({ getAsset: async () => null });
  await assert.rejects(
    missing.service.transmit({ address, tokenId: 0, assetType: 'H_CORE' }),
    /unavailable/
  );
  assert.equal(missing.getSignedUrlCalls(), 0);
});

test('fails closed when the requested token is not the contract-defined Complete Package', async () => {
  const sample = harness({
    readOnChainAccess: async () => ({
      owner: address,
      completePackageId: 4,
      completePackageTokenId: 5,
      canonicalDesignationHash: designation,
      archiveCommitment: commitment,
      authorizationBlockNumber,
      authorizationBlockHash,
    }),
  });
  await assert.rejects(
    sample.service.transmit({ address, tokenId: 0, assetType: 'H_CORE' }),
    /Canonical package identity/
  );
  assert.equal(sample.getSignedUrlCalls(), 0);
});

test('fails closed when storage record is not bound to the on-chain archive commitment', async () => {
  const sample = harness({
    getAsset: async () => ({
      tokenId: 0,
      assetType: 'H_CORE',
      assetHash: hash,
      archiveCommitment: `0x${'e'.repeat(64)}`,
      filePath: 'complete/core.png',
    }),
  });
  await assert.rejects(
    sample.service.transmit({ address, tokenId: 0, assetType: 'H_CORE' }),
    /unavailable/
  );
  assert.equal(sample.getSignedUrlCalls(), 0);
});

test('grants standalone Frame package retrieval to current frame owner', async () => {
  const sample = harness({
    readOnChainAccess: async tokenId => ({
      owner: address,
      completePackageId: 5,
      completePackageTokenId: 5,
      canonicalDesignationHash: designation,
      archiveCommitment: commitment,
      authorizationBlockNumber,
      authorizationBlockHash,
    }),
    getAsset: async (tokenId, assetType) => ({
      tokenId,
      assetType: 'H_FRAME_PACKAGE',
      assetHash: hash,
      archiveCommitment: designation,
      filePath: `frame/${tokenId}/frame-package.zip`,
    }),
  });

  const result = await sample.service.transmit({
    address,
    tokenId: 1,
    assetType: 'H_FRAME_PACKAGE',
  });

  assert.equal(result.status, 'TRANSMISSION_GRANTED');
  assert.equal(result.expiresInSeconds, 60);
  assert.equal(sample.getSignedUrlCalls(), 1);
});

test('fails closed when requesting non-frame asset type on standalone frame token', async () => {
  const sample = harness({
    readOnChainAccess: async () => ({
      owner: address,
      completePackageId: 5,
      completePackageTokenId: 5,
      canonicalDesignationHash: designation,
      archiveCommitment: commitment,
      authorizationBlockNumber,
      authorizationBlockHash,
    }),
  });

  await assert.rejects(
    sample.service.transmit({
      address,
      tokenId: 1,
      assetType: 'H_CORE',
    }),
    error => {
      assert.equal(error instanceof ArchiveAccessError, true);
      assert.equal(error.code, 'ASSET_TOKEN_MISMATCH');
      return true;
    },
  );
  assert.equal(sample.getSignedUrlCalls(), 0);
});

test('ownership transition fixture: predecessor denied post-transfer, successor granted', async () => {
  let currentOwner = address; // A owns Frame 01 initially

  const sample = harness({
    readOnChainAccess: async tokenId => ({
      owner: currentOwner,
      completePackageId: 5,
      completePackageTokenId: 5,
      canonicalDesignationHash: designation,
      archiveCommitment: commitment,
      authorizationBlockNumber,
      authorizationBlockHash,
    }),
    getAsset: async (tokenId, assetType) => ({
      tokenId,
      assetType: 'H_FRAME_PACKAGE',
      assetHash: hash,
      archiveCommitment: designation,
      filePath: `frame/${tokenId}/frame-package.zip`,
    }),
  });

  // 1. Initial owner A retrieves Frame 01 -> SUCCESS
  const resA = await sample.service.transmit({
    address,
    tokenId: 1,
    assetType: 'H_FRAME_PACKAGE',
  });
  assert.equal(resA.status, 'TRANSMISSION_GRANTED');

  // 2. Transfer Frame 01: A -> B (otherAddress)
  currentOwner = otherAddress;

  // 3. Predecessor A attempts retrieval after transfer -> DENIED (NOT_CURRENT_OWNER)
  await assert.rejects(
    sample.service.transmit({
      address,
      tokenId: 1,
      assetType: 'H_FRAME_PACKAGE',
    }),
    /not the current token owner/,
  );

  // 4. Successor B attempts retrieval -> SUCCESS
  const resB = await sample.service.transmit({
    address: otherAddress,
    tokenId: 1,
    assetType: 'H_FRAME_PACKAGE',
  });
  assert.equal(resB.status, 'TRANSMISSION_GRANTED');
  assert.equal(sample.getSignedUrlCalls(), 2);
});

test('Painting #0 entitlement: requires BOTH Base ownerOf and acquisition authorization history', async () => {
  // Case 1: Owner WITH authorization history -> GRANTED
  const authorized = harness({
    hasAcquisitionAuthorization: async (addr) => addr.toLowerCase() === address.toLowerCase(),
  });
  const res = await authorized.service.transmit({ address, tokenId: 0, assetType: 'H_CORE' });
  assert.equal(res.status, 'TRANSMISSION_GRANTED');
  assert.equal(authorized.getSignedUrlCalls(), 1);

  // Case 2: Owner WITHOUT authorization history -> 403 ACQUISITION_AUTHORIZATION_REQUIRED
  const unauthorized = harness({
    hasAcquisitionAuthorization: async () => false,
  });
  await assert.rejects(
    unauthorized.service.transmit({ address, tokenId: 0, assetType: 'H_CORE' }),
    (err) => {
      assert.equal(err instanceof ArchiveAccessError, true);
      assert.equal(err.code, 'ACQUISITION_AUTHORIZATION_REQUIRED');
      assert.equal(err.status, 403);
      return true;
    }
  );
  assert.equal(unauthorized.getSignedUrlCalls(), 0);

  // Case 3: Former authorized buyer who no longer owns Painting #0 -> 403 NOT_CURRENT_OWNER
  const formerOwner = harness({
    hasAcquisitionAuthorization: async (addr) => addr.toLowerCase() === address.toLowerCase(),
    readOnChainAccess: async () => ({
      owner: otherAddress,
      completePackageId: 5,
      completePackageTokenId: 5,
      canonicalDesignationHash: designation,
      archiveCommitment: commitment,
      authorizationBlockNumber,
      authorizationBlockHash,
    }),
  });
  await assert.rejects(
    formerOwner.service.transmit({ address, tokenId: 0, assetType: 'H_CORE' }),
    (err) => {
      assert.equal(err instanceof ArchiveAccessError, true);
      assert.equal(err.code, 'NOT_CURRENT_OWNER');
      assert.equal(err.status, 403);
      return true;
    }
  );
  assert.equal(formerOwner.getSignedUrlCalls(), 0);

  // Case 4: Frame Tokens (1..9) do NOT require acquisition authorization history
  let authCheckedForFrame = false;
  const frameSample = harness({
    hasAcquisitionAuthorization: async () => {
      authCheckedForFrame = true;
      return false;
    },
    readOnChainAccess: async (tokenId) => ({
      owner: address,
      completePackageId: 5,
      completePackageTokenId: 5,
      canonicalDesignationHash: designation,
      archiveCommitment: commitment,
      authorizationBlockNumber,
      authorizationBlockHash,
    }),
    getAsset: async (tokenId, assetType) => ({
      tokenId,
      assetType: 'H_FRAME_PACKAGE',
      assetHash: hash,
      archiveCommitment: designation,
      filePath: `frame/${tokenId}/frame-package.zip`,
    }),
  });
  const frameRes = await frameSample.service.transmit({
    address,
    tokenId: 1,
    assetType: 'H_FRAME_PACKAGE',
  });
  assert.equal(frameRes.status, 'TRANSMISSION_GRANTED');
  assert.equal(authCheckedForFrame, false, 'Frame retrieval must not invoke hasAcquisitionAuthorization');

  // Case 5: Artist Genesis owning Painting #0 without acquisition authorization record -> 403 ACQUISITION_AUTHORIZATION_REQUIRED
  const artistAddress = '0x3cff39491b333016055b3d9328905b0b172988a4';
  const genesisArtist = harness({
    hasAcquisitionAuthorization: async () => false,
    readOnChainAccess: async () => ({
      owner: artistAddress,
      completePackageId: 5,
      completePackageTokenId: 0,
      canonicalDesignationHash: designation,
      archiveCommitment: `0x${'0'.repeat(64)}`,
      authorizationBlockNumber,
      authorizationBlockHash,
    }),
  });
  await assert.rejects(
    genesisArtist.service.transmit({ address: artistAddress, tokenId: 0, assetType: 'H_CORE' }),
    (err) => {
      assert.equal(err instanceof ArchiveAccessError, true);
      assert.equal(err.code, 'ACQUISITION_AUTHORIZATION_REQUIRED');
      assert.equal(err.status, 403);
      return true;
    }
  );
});


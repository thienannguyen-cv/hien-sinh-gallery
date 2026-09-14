import test from 'node:test';
import assert from 'node:assert/strict';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { recoverTypedDataAddress } from 'viem';
import { handleEncounterRequest } from '../../../api-worker/encounter-request.js';
import { handleAcquisitionAuthorization } from '../../../api-worker/acquisition-authorization.js';
import { handleArtistCeremony, DEPLOYED_ARTIST, extractSignatureFromUR } from '../../../api-worker/artist-ceremony.js';

test('ARTIST SELF-SERVICE CEREMONY: list_pending -> prepare_bundle -> verify -> confirm_signature -> atomic ISSUED + CONFIRMED', async () => {
  const artist = privateKeyToAccount(generatePrivateKey());
  const unauthorizedSigner = privateKeyToAccount(generatePrivateKey());
  const buyer = privateKeyToAccount(generatePrivateKey());

  const dbEncounterRequests = new Map();
  const dbAuthorizations = new Map();

  const mockConfig = {
    origin: 'https://smapworks.art',
    supabaseUrl: 'https://database.example.internal',
    serverKey: 'sb_secret_test_mock_key',
    recoverAddress: recoverTypedDataAddress,
  };

  const mockFetcher = async (url, options = {}) => {
    const u = new URL(url.toString());
    const path = u.pathname;
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body) : {};

    // 1. RPC: list_pending_encounter_requests
    if (path === '/rest/v1/rpc/list_pending_encounter_requests') {
      const rows = Array.from(dbEncounterRequests.values()).filter(r => r.status === 'PENDING').map(r => ({
        requestId: r.request_id,
        walletAddress: r.wallet_address,
        submittedAt: r.submitted_at,
        chainId: r.chain_id || 8453,
        contributions: r.contributions,
      }));
      return new Response(JSON.stringify(rows), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    // 2. RPC: get_pending_encounter_request
    if (path === '/rest/v1/rpc/get_pending_encounter_request') {
      const wallet = body.p_wallet_address?.toLowerCase();
      if (dbAuthorizations.has(wallet)) {
        return new Response(JSON.stringify({ error: 'AUTHORIZATION_ALREADY_EXISTS_FOR_WALLET' }), { status: 200, headers: { 'content-type': 'application/json' } });
      }
      const req = Array.from(dbEncounterRequests.values()).find(r => r.request_id === body.p_request_id && r.wallet_address === wallet && r.status === 'PENDING');
      if (!req) {
        return new Response(JSON.stringify({ error: 'PENDING_REQUEST_NOT_FOUND' }), { status: 200, headers: { 'content-type': 'application/json' } });
      }
      return new Response(JSON.stringify({ status: 'OK', requestId: req.request_id, walletAddress: req.wallet_address, submittedAt: req.submitted_at }), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    // 3. RPC: submit_encounter_request
    if (path === '/rest/v1/rpc/submit_encounter_request') {
      const id = '12345678-1234-4234-8234-' + Math.random().toString(16).slice(2, 14).padStart(12, '0');
      dbEncounterRequests.set(body.p_wallet_address.toLowerCase(), {
        request_id: id,
        wallet_address: body.p_wallet_address.toLowerCase(),
        chain_id: 8453,
        contributions: body.p_contributions,
        status: 'PENDING',
        submitted_at: new Date().toISOString(),
        decided_at: null,
      });
      return new Response(JSON.stringify(id), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    // 4. RPC: encounter_request_status
    if (path === '/rest/v1/rpc/encounter_request_status') {
      const record = dbEncounterRequests.get(body.p_wallet_address.toLowerCase());
      const status = record ? record.status : 'NONE';
      return new Response(JSON.stringify(status), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    // 5. RPC: acquisition_authorization_for_wallet
    if (path === '/rest/v1/rpc/acquisition_authorization_for_wallet') {
      const auth = dbAuthorizations.get(body.p_wallet_address.toLowerCase()) || null;
      return new Response(JSON.stringify(auth ? auth.authorization : null), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    // 6. RPC: store_verified_acquisition_authorization
    if (path === '/rest/v1/rpc/store_verified_acquisition_authorization') {
      const wallet = body.p_wallet_address.toLowerCase();
      if (dbAuthorizations.has(wallet)) {
        return new Response(JSON.stringify({ error: 'AUTHORIZATION_ALREADY_EXISTS_ONE_WINDOW_ONLY' }), { status: 409 });
      }

      const req = Array.from(dbEncounterRequests.values()).find(r => r.wallet_address === wallet && r.status === 'PENDING');
      if (!req) {
        return new Response(JSON.stringify({ error: 'ENCOUNTER_REQUEST_NOT_PENDING' }), { status: 400 });
      }

      const authId = 'auth-' + Math.random().toString(16).slice(2, 10);
      dbAuthorizations.set(wallet, {
        authorization_id: authId,
        request_id: body.p_request_id,
        wallet_address: wallet,
        authorization: body.p_authorization,
        status: 'ISSUED',
        issued_at: new Date().toISOString(),
      });

      req.status = 'CONFIRMED';
      req.decided_at = new Date().toISOString();

      return new Response(JSON.stringify(authId), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    return new Response('Not found', { status: 404 });
  };

  // Step 1: Buyer submits Three Brushstrokes
  const submitReq = new Request('https://smapworks.art/api/encounter-request', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://smapworks.art' },
    body: JSON.stringify({
      action: 'submit',
      walletAddress: buyer.address,
      contributions: ['Contribution 1', 'Contribution 2', 'Contribution 3'],
    }),
  });
  const submitRes = await handleEncounterRequest(submitReq, mockConfig, mockFetcher);
  assert.equal(submitRes.status, 201);
  const { requestId } = await submitRes.json();
  assert.ok(requestId);

  // Verify encounter request is PENDING and no authorization exists
  const buyerStatusReq = new Request('https://smapworks.art/api/encounter-request', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://smapworks.art' },
    body: JSON.stringify({ action: 'status', walletAddress: buyer.address }),
  });
  const buyerStatusRes = await handleEncounterRequest(buyerStatusReq, mockConfig, mockFetcher);
  assert.equal((await buyerStatusRes.json()).status, 'PENDING');

  const buyerAuthReq = new Request('https://smapworks.art/api/acquisition-authorization', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://smapworks.art' },
    body: JSON.stringify({ action: 'get', walletAddress: buyer.address }),
  });
  const buyerAuthRes = await handleAcquisitionAuthorization(buyerAuthReq, mockConfig, mockFetcher);
  assert.equal((await buyerAuthRes.json()).status, 'NOT_ISSUED');

  // Step 2: Artist opens ceremony UI -> calls action: 'list_pending'
  const listReq = new Request('https://smapworks.art/api/artist-ceremony', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://smapworks.art' },
    body: JSON.stringify({ action: 'list_pending' }),
  });
  const listRes = await handleArtistCeremony(listReq, mockConfig, mockFetcher);
  assert.equal(listRes.status, 200);
  const listData = await listRes.json();
  assert.equal(listData.status, 'OK');
  assert.equal(listData.pending.length, 1);
  assert.equal(listData.pending[0].requestId, requestId);
  assert.equal(listData.pending[0].walletAddress, buyer.address.toLowerCase());

  // Step 3: Artist prepares bundle -> calls action: 'prepare_bundle'
  const prepareReq = new Request('https://smapworks.art/api/artist-ceremony', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://smapworks.art' },
    body: JSON.stringify({ action: 'prepare_bundle', requestId, walletAddress: buyer.address }),
  });
  const prepareRes = await handleArtistCeremony(prepareReq, mockConfig, mockFetcher);
  assert.equal(prepareRes.status, 200);
  const bundleData = await prepareRes.json();
  assert.equal(bundleData.status, 'OK');
  assert.equal(bundleData.typedData.domain.chainId, 8453);
  assert.equal(bundleData.typedData.message.designatedBearer, buyer.address.toLowerCase());
  assert.equal(bundleData.typedData.message.paintingTokenId, '0');
  assert.equal(bundleData.typedData.message.frameTokenId, '5');
  assert.equal(bundleData.deadline, bundleData.preparedAt + 7 * 86400);

  // Negative Case 1: Non-Artist signature rejected
  const fakeSig = await unauthorizedSigner.signTypedData({
    domain: bundleData.typedData.domain,
    types: { CompletePackageAcceptance: bundleData.typedData.types.CompletePackageAcceptance },
    primaryType: 'CompletePackageAcceptance',
    message: {
      canonicalDesignationHash: bundleData.typedData.message.canonicalDesignationHash,
      archiveCommitment: bundleData.typedData.message.archiveCommitment,
      licenseHash: bundleData.typedData.message.licenseHash,
      paintingTokenId: 0n,
      frameTokenId: 5n,
      designatedBearer: buyer.address.toLowerCase(),
      nonce: 0n,
      deadline: BigInt(bundleData.deadline),
    },
  });

  const fakeConfirmReq = new Request('https://smapworks.art/api/artist-ceremony', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://smapworks.art' },
    body: JSON.stringify({
      action: 'confirm_signature',
      requestId,
      walletAddress: buyer.address,
      signatureHex: fakeSig,
      preparedAt: bundleData.preparedAt,
      deadline: bundleData.deadline,
    }),
  });
  const fakeConfirmRes = await handleArtistCeremony(fakeConfirmReq, mockConfig, mockFetcher);
  assert.equal(fakeConfirmRes.status, 403);
  const fakeErr = await fakeConfirmRes.json();
  assert.equal(fakeErr.error, 'SIGNER_MISMATCH');

  // Verify status remains PENDING and no authorization issued
  assert.equal(dbEncounterRequests.get(buyer.address.toLowerCase()).status, 'PENDING');
  assert.equal(dbAuthorizations.has(buyer.address.toLowerCase()), false);

  // Positive Case: Valid Artist signature
  mockConfig.expectedArtist = artist.address;

  const validSig = await artist.signTypedData({
    domain: bundleData.typedData.domain,
    types: { CompletePackageAcceptance: bundleData.typedData.types.CompletePackageAcceptance },
    primaryType: 'CompletePackageAcceptance',
    message: {
      canonicalDesignationHash: bundleData.typedData.message.canonicalDesignationHash,
      archiveCommitment: bundleData.typedData.message.archiveCommitment,
      licenseHash: bundleData.typedData.message.licenseHash,
      paintingTokenId: 0n,
      frameTokenId: 5n,
      designatedBearer: buyer.address.toLowerCase(),
      nonce: 0n,
      deadline: BigInt(bundleData.deadline),
    },
  });

  const confirmReq = new Request('https://smapworks.art/api/artist-ceremony', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://smapworks.art' },
    body: JSON.stringify({
      action: 'confirm_signature',
      requestId,
      walletAddress: buyer.address,
      signatureHex: validSig,
      preparedAt: bundleData.preparedAt,
      deadline: bundleData.deadline,
    }),
  });
  const confirmRes = await handleArtistCeremony(confirmReq, mockConfig, mockFetcher);
  assert.equal(confirmRes.status, 200);
  const confirmData = await confirmRes.json();
  assert.equal(confirmData.status, 'CONFIRMED_AND_STORED');
  assert.ok(confirmData.authorizationId);
  assert.equal(confirmData.recoveredSigner.toLowerCase(), artist.address.toLowerCase());

  // Verify encounter request is now CONFIRMED in DB
  assert.equal(dbEncounterRequests.get(buyer.address.toLowerCase()).status, 'CONFIRMED');
  assert.ok(dbAuthorizations.has(buyer.address.toLowerCase()));
  assert.equal(dbAuthorizations.get(buyer.address.toLowerCase()).status, 'ISSUED');

  // Verify buyer acquisition authorization poll returns ISSUED
  const buyerAuthReq2 = new Request('https://smapworks.art/api/acquisition-authorization', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://smapworks.art' },
    body: JSON.stringify({ action: 'get', walletAddress: buyer.address }),
  });
  const buyerAuthRes2 = await handleAcquisitionAuthorization(buyerAuthReq2, mockConfig, mockFetcher);
  assert.equal(buyerAuthRes2.status, 200);
  const buyerAuthData = await buyerAuthRes2.json();
  assert.equal(buyerAuthData.status, 'ISSUED');
  assert.equal(buyerAuthData.authorization.signature, validSig);

  // Negative Case 2: One-window policy: cannot issue another authorization for same wallet
  const prepareReq2 = new Request('https://smapworks.art/api/artist-ceremony', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://smapworks.art' },
    body: JSON.stringify({ action: 'prepare_bundle', requestId, walletAddress: buyer.address }),
  });
  const prepareRes2 = await handleArtistCeremony(prepareReq2, mockConfig, mockFetcher);
  assert.equal(prepareRes2.status, 409);
  const prepareErr2 = await prepareRes2.json();
  assert.equal(prepareErr2.error, 'AUTHORIZATION_ALREADY_EXISTS_FOR_WALLET');

  // Test extractSignatureFromUR utility
  const hexSig = '0x' + '11'.repeat(65);
  const extracted = extractSignatureFromUR(hexSig);
  assert.equal(extracted.signature, hexSig);
});

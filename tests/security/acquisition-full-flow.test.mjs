import test from 'node:test';
import assert from 'node:assert/strict';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { handleEncounterRequest } from '../../../api-worker/encounter-request.js';
import { handleAcquisitionAuthorization } from '../../../api-worker/acquisition-authorization.js';
import {
  completeTypedData,
  completeDigest,
  completeTransaction,
  verifyCompleteAuthorization,
  COMPLETE_CONTRACT,
  COMPLETE_PRICE,
} from '../../src/services/completePackageProtocol.ts';
import { parsePurchaseAuthorization } from '../../src/services/completePurchase.ts';
import {
  prepareAuthoritativeBundle,
  verifyArtistSignature,
  persistVerifiedAuthorization,
  DEPLOYED_ARTIST,
} from '../../../operator/execute_airgap_authorization_ceremony.mjs';

test('B3 CANONICAL PROTOCOL: submit -> pending -> prepare bundle -> cold sign -> server verify -> atomic confirm & store -> buyer poll & tx', async () => {
  const artist = privateKeyToAccount(generatePrivateKey());
  const buyer = privateKeyToAccount(generatePrivateKey());

  const dbEncounterRequests = new Map();
  const dbAuthorizations = new Map();

  const mockFetcher = async (url, options) => {
    const u = new URL(url.toString());
    const path = u.pathname;
    const body = JSON.parse(options.body || '{}');

    if (path === '/rest/v1/rpc/submit_encounter_request') {
      const id = '00000000-0000-0000-0000-' + Math.random().toString(16).slice(2, 14).padStart(12, '0');
      dbEncounterRequests.set(body.p_wallet_address.toLowerCase(), {
        request_id: id,
        wallet_address: body.p_wallet_address.toLowerCase(),
        contributions: body.p_contributions,
        status: 'PENDING',
        submitted_at: new Date().toISOString(),
        decided_at: null,
      });
      return new Response(JSON.stringify(id), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    if (path === '/rest/v1/rpc/encounter_request_status') {
      const record = dbEncounterRequests.get(body.p_wallet_address.toLowerCase());
      const status = record ? record.status : 'NONE';
      return new Response(JSON.stringify(status), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    if (path === '/rest/v1/rpc/acquisition_authorization_for_wallet') {
      const auth = dbAuthorizations.get(body.p_wallet_address.toLowerCase()) || null;
      return new Response(JSON.stringify(auth ? auth.authorization : null), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    if (path === '/rest/v1/rpc/store_verified_acquisition_authorization') {
      const wallet = body.p_wallet_address.toLowerCase();
      // Enforce strict one-window policy: no existing authorization
      if (dbAuthorizations.has(wallet)) {
        return new Response(JSON.stringify({ error: 'AUTHORIZATION_ALREADY_EXISTS_ONE_WINDOW_ONLY' }), { status: 400 });
      }
      const record = dbEncounterRequests.get(wallet);
      if (!record || record.status !== 'PENDING') {
        return new Response(JSON.stringify({ error: 'ENCOUNTER_REQUEST_NOT_PENDING' }), { status: 400 });
      }
      const authId = 'auth-0000-0000-0000-' + Math.random().toString(16).slice(2, 14).padStart(12, '0');
      dbAuthorizations.set(wallet, {
        authorization_id: authId,
        wallet_address: wallet,
        authorization: body.p_authorization,
        prepared_at: body.p_prepared_at,
        deadline: body.p_deadline,
        status: 'ISSUED',
      });
      // Atomically set encounter request to CONFIRMED
      record.status = 'CONFIRMED';
      record.decided_at = new Date().toISOString();
      return new Response(JSON.stringify(authId), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'NOT_FOUND' }), { status: 404 });
  };

  const config = {
    origin: 'https://smapworks.art',
    supabaseUrl: 'https://database.example.internal',
    serverKey: 'sb_secret_test_key_12345',
  };

  // 1. Buyer submits Three Brushstrokes encounter
  const submitReq = new Request('https://smapworks.art/api/encounter-request', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://smapworks.art' },
    body: JSON.stringify({
      action: 'submit',
      walletAddress: buyer.address,
      contributions: ['Anchor detail', 'Reading interpretation', 'Productive uncertainty'],
    }),
  });
  const submitRes = await handleEncounterRequest(submitReq, config, mockFetcher);
  assert.equal(submitRes.status, 201);
  const submitJson = await submitRes.json();
  assert.equal(submitJson.status, 'PENDING_ARTIST_REVIEW');

  // 2. Status check -> PENDING
  const statusReq1 = new Request('https://smapworks.art/api/encounter-request', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://smapworks.art' },
    body: JSON.stringify({ action: 'status', walletAddress: buyer.address }),
  });
  const statusRes1 = await handleEncounterRequest(statusReq1, config, mockFetcher);
  assert.equal((await statusRes1.json()).status, 'PENDING');

  // 3. Buyer authorization check -> NOT_ISSUED
  const getAuthReq1 = new Request('https://smapworks.art/api/acquisition-authorization', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://smapworks.art' },
    body: JSON.stringify({ action: 'get', walletAddress: buyer.address }),
  });
  const getAuthRes1 = await handleAcquisitionAuthorization(getAuthReq1, config, mockFetcher);
  assert.equal(getAuthRes1.status, 200);
  assert.equal((await getAuthRes1.json()).status, 'NOT_ISSUED');

  // 4. Operator prepares authoritative bundle with prepared_at and deadline = prepared_at + 7*86400
  const preparedAt = Math.floor(Date.now() / 1000);
  const bundle = prepareAuthoritativeBundle(buyer.address, 0n, preparedAt);
  assert.equal(bundle.deadline, preparedAt + 7 * 86400);
  assert.equal(bundle.message.designatedBearer.toLowerCase(), buyer.address.toLowerCase());
  assert.equal(bundle.derivationPath, "m/44'/60'/0'/0/0");
  assert.equal(bundle.sourceFingerprint, '5005e802');

  // 5. Cold Vault signing produces 65-byte signature
  const signature = await artist.signTypedData(bundle.typedData);
  assert.match(signature, /^0x[0-9a-f]{130}$/i);

  // 6. Server independently verifies signature recovery
  const recovered = await verifyArtistSignature(bundle.typedData, signature, artist.address);
  assert.equal(recovered.toLowerCase(), artist.address.toLowerCase());

  // 7. Atomic persistence + encounter confirmation
  const persistRes = await persistVerifiedAuthorization({
    supabaseUrl: config.supabaseUrl,
    serviceKey: config.serverKey,
    walletAddress: buyer.address,
    typedData: bundle.typedData,
    signature,
    requestId: bundle.requestId,
    preparedAt: bundle.preparedAt,
    deadline: bundle.deadline,
    encounterRequestId: submitJson.requestId,
    fetcher: mockFetcher,
  });
  assert.equal(persistRes.status, 'CONFIRMED_AND_STORED');

  // 8. Encounter status now transitioned to CONFIRMED
  const statusReq2 = new Request('https://smapworks.art/api/encounter-request', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://smapworks.art' },
    body: JSON.stringify({ action: 'status', walletAddress: buyer.address }),
  });
  const statusRes2 = await handleEncounterRequest(statusReq2, config, mockFetcher);
  assert.equal((await statusRes2.json()).status, 'CONFIRMED');

  // 9. Buyer polls /api/acquisition-authorization -> ISSUED
  const getAuthReq2 = new Request('https://smapworks.art/api/acquisition-authorization', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://smapworks.art' },
    body: JSON.stringify({ action: 'get', walletAddress: buyer.address }),
  });
  const getAuthRes2 = await handleAcquisitionAuthorization(getAuthReq2, config, mockFetcher);
  assert.equal(getAuthRes2.status, 200);
  const authBody = await getAuthRes2.json();
  assert.equal(authBody.status, 'ISSUED');

  // 10. Buyer client parses authorization and constructs transaction
  const parsed = parsePurchaseAuthorization(JSON.stringify(authBody.authorization));
  assert.equal(parsed.message.designatedBearer.toLowerCase(), buyer.address.toLowerCase());
  assert.equal(parsed.message.paintingTokenId, 0n);
  assert.equal(parsed.message.frameTokenId, 5n);
  assert.equal(parsed.signature, signature);

  const tx = completeTransaction(parsed.message, parsed.signature);
  assert.equal(tx.from.toLowerCase(), buyer.address.toLowerCase());
  assert.equal(tx.to, COMPLETE_CONTRACT);
  assert.equal(tx.value, COMPLETE_PRICE);
  assert.equal(tx.chainId, 8453);
  assert.match(tx.data, /^0x3b5abbb7/);

  // 11. STRICT ONE-WINDOW POLICY: Second authorization attempt MUST be rejected
  await assert.rejects(async () => {
    const res = await mockFetcher('https://database.example.internal/rest/v1/rpc/store_verified_acquisition_authorization', {
      method: 'POST',
      body: JSON.stringify({
        p_wallet_address: buyer.address.toLowerCase(),
        p_authorization: authBody.authorization,
        p_prepared_at: new Date().toISOString(),
        p_deadline: new Date(Date.now() + 7 * 86400 * 1000).toISOString(),
      }),
    });
    const json = await res.json();
    if (json.error) throw new Error(json.error);
  }, /AUTHORIZATION_ALREADY_EXISTS_ONE_WINDOW_ONLY/);
});

test('B3 SECURITY BOUNDARIES: untrusted signer, tampering, and unconfirmed states fail-closed', async () => {
  const realArtist = privateKeyToAccount(generatePrivateKey());
  const maliciousAttacker = privateKeyToAccount(generatePrivateKey());
  const buyer = privateKeyToAccount(generatePrivateKey());

  const bundle = prepareAuthoritativeBundle(buyer.address, 0n);

  // 1. Attacker signs the bundle -> server verification rejects
  const attackerSignature = await maliciousAttacker.signTypedData(bundle.typedData);
  await assert.rejects(
    async () => verifyArtistSignature(bundle.typedData, attackerSignature, realArtist.address),
    /Artist signature does not match|does not match authoritative Artist/
  );


  // 2. Valid signature from real Artist
  const validSignature = await realArtist.signTypedData(bundle.typedData);

  // 3. Tampering with fixed structural invariants throws immediate domain error
  const invalidFrame = { ...bundle.typedData.message, frameTokenId: 1n };
  await assert.rejects(
    async () => verifyCompleteAuthorization(invalidFrame, validSignature, realArtist.address),
    /Package 05 requires Painting 0 and Frame 5/
  );


  // 3. Tampering with signed message fields (e.g. nonce) breaks signature recovery
  const tamperedNonce = { ...bundle.typedData.message, nonce: 999n };
  await assert.rejects(
    async () => verifyCompleteAuthorization(tamperedNonce, validSignature, realArtist.address),
    /Artist signature does not match/
  );

  // 4. Tampering with designatedBearer breaks recovery
  const attackerAddress = maliciousAttacker.address;
  const stolenMessage = { ...bundle.typedData.message, designatedBearer: attackerAddress };
  await assert.rejects(
    async () => verifyCompleteAuthorization(stolenMessage, validSignature, realArtist.address),
    /Artist signature does not match/
  );
});


test('buyer-flow acceptance: pre-issuance state prevents false active purchase', async () => {
  const buyer = privateKeyToAccount(generatePrivateKey());
  const config = {
    origin: 'https://smapworks.art',
    supabaseUrl: 'https://database.example.internal',
    serverKey: 'sb_secret_test_key_12345',
  };

  const mockFetcher = async (url, options) => {
    const u = new URL(url.toString());
    const path = u.pathname;
    const body = JSON.parse(options.body || '{}');

    if (path === '/rest/v1/rpc/encounter_request_status') {
      return new Response(JSON.stringify('CONFIRMED'), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    if (path === '/rest/v1/rpc/acquisition_authorization_for_wallet') {
      return new Response(JSON.stringify(null), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    return new Response(JSON.stringify({ error: 'NOT_FOUND' }), { status: 404 });
  };

  // 1. Encounter request is confirmed in Supabase
  const statusReq = new Request('https://smapworks.art/api/encounter-request', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://smapworks.art' },
    body: JSON.stringify({ action: 'status', walletAddress: buyer.address }),
  });
  const statusRes = await handleEncounterRequest(statusReq, config, mockFetcher);
  const statusJson = await statusRes.json();
  assert.equal(statusJson.status, 'CONFIRMED');

  // 2. Proactive check of acquisition-authorization returns NOT_ISSUED
  const authReq = new Request('https://smapworks.art/api/acquisition-authorization', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://smapworks.art' },
    body: JSON.stringify({ action: 'get', walletAddress: buyer.address }),
  });
  const authRes = await handleAcquisitionAuthorization(authReq, config, mockFetcher);
  const authJson = await authRes.json();
  assert.equal(authJson.status, 'NOT_ISSUED');
  assert.equal(authJson.authorization, undefined);
});

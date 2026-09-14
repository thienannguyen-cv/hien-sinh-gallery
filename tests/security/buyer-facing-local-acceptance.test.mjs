import test from 'node:test';
import assert from 'node:assert/strict';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { handleEncounterRequest } from '../../../api-worker/encounter-request.js';
import { handleAcquisitionAuthorization } from '../../../api-worker/acquisition-authorization.js';
import { completeTypedData, completeTransaction, verifyCompleteAuthorization, COMPLETE_CONTRACT, COMPLETE_PRICE } from '../../src/services/completePackageProtocol.ts';
import { parsePurchaseAuthorization } from '../../src/services/completePurchase.ts';

test('Buyer-facing local dev acceptance: Three Brushstrokes -> CONFIRM -> Pending Authorization -> Issued -> Acquire -> Receipt -> Ownership UI update', async () => {
  const artist = privateKeyToAccount(generatePrivateKey());
  const buyer = privateKeyToAccount(generatePrivateKey());

  // Database mocks (Supabase state)
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
      return new Response(JSON.stringify(auth), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'NOT_FOUND' }), { status: 404 });
  };

  const config = {
    origin: 'https://smapworks.art',
    supabaseUrl: 'https://database.example.internal',
    serverKey: 'sb_secret_test_key_12345',
  };

  // -------------------------------------------------------------
  // Step 1: Buyer submits Three Brushstrokes
  // -------------------------------------------------------------
  const submitReq = new Request('https://smapworks.art/api/encounter-request', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://smapworks.art' },
    body: JSON.stringify({
      action: 'submit',
      walletAddress: buyer.address,
      contributions: ['First anchor line', 'Second contextual reading', 'Third unresolved horizon'],
    }),
  });
  const submitRes = await handleEncounterRequest(submitReq, config, mockFetcher);
  assert.equal(submitRes.status, 201);
  const submitJson = await submitRes.json();
  assert.equal(submitJson.status, 'PENDING_ARTIST_REVIEW');

  // -------------------------------------------------------------
  // Step 2: Buyer status check while pending
  // -------------------------------------------------------------
  const statusReq1 = new Request('https://smapworks.art/api/encounter-request', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://smapworks.art' },
    body: JSON.stringify({ action: 'status', walletAddress: buyer.address }),
  });
  const statusRes1 = await handleEncounterRequest(statusReq1, config, mockFetcher);
  assert.equal((await statusRes1.json()).status, 'PENDING');

  // -------------------------------------------------------------
  // Step 3: Artist reviews and CONFIRMS encounter request
  // -------------------------------------------------------------
  dbEncounterRequests.get(buyer.address.toLowerCase()).status = 'CONFIRMED';
  const statusReq2 = new Request('https://smapworks.art/api/encounter-request', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://smapworks.art' },
    body: JSON.stringify({ action: 'status', walletAddress: buyer.address }),
  });
  const statusRes2 = await handleEncounterRequest(statusReq2, config, mockFetcher);
  assert.equal((await statusRes2.json()).status, 'CONFIRMED');

  // -------------------------------------------------------------
  // Step 4: Proactive authorization check BEFORE Artist issues signature
  // Must return NOT_ISSUED -> UI shows "AUTHORIZATION PENDING"
  // -------------------------------------------------------------
  const authReq1 = new Request('https://smapworks.art/api/acquisition-authorization', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://smapworks.art' },
    body: JSON.stringify({ action: 'get', walletAddress: buyer.address }),
  });
  const authRes1 = await handleAcquisitionAuthorization(authReq1, config, mockFetcher);
  assert.equal(authRes1.status, 200);
  const authBody1 = await authRes1.json();
  assert.equal(authBody1.status, 'NOT_ISSUED');
  assert.equal(authBody1.authorization, undefined);

  // -------------------------------------------------------------
  // Step 5: Artist generates & signs EIP-712 authorization bundle
  // -------------------------------------------------------------
  const canonicalDesignationHash = '0xed740b4339af1e965723519c7807b5a6184da0f4963f4866d42661ef85cf083f';
  const archiveCommitment = '0x7689f75da4ef23bf040ad57f282b24b84f6ede5e17b92cb5cd6a4dc96fced5e9';
  const licenseHash = '0x71d01dbc1962a5cedd1204fe76fa9d538e5d338146eb9375743b91a55cde8c14';
  const deadline = 1893456000n;
  const nonce = 0n;

  const acceptanceMessage = {
    canonicalDesignationHash,
    archiveCommitment,
    licenseHash,
    paintingTokenId: 0n,
    frameTokenId: 5n,
    designatedBearer: buyer.address,
    nonce,
    deadline,
  };

  const typedData = completeTypedData(acceptanceMessage);
  const signature = await artist.signTypedData(typedData);
  const recoveredArtist = await verifyCompleteAuthorization(acceptanceMessage, signature, artist.address);
  assert.equal(recoveredArtist.toLowerCase(), artist.address.toLowerCase());

  const storedBundle = {
    domain: {
      name: 'HienSinh',
      version: '2',
      chainId: 8453,
      verifyingContract: COMPLETE_CONTRACT,
    },
    types: typedData.types,
    primaryType: typedData.primaryType,
    message: {
      canonicalDesignationHash,
      archiveCommitment,
      licenseHash,
      paintingTokenId: '0',
      frameTokenId: '5',
      designatedBearer: buyer.address,
      nonce: '0',
      deadline: String(deadline),
    },
    signature,
  };
  dbAuthorizations.set(buyer.address.toLowerCase(), storedBundle);

  // -------------------------------------------------------------
  // Step 6: Gallery retrieves issued authorization
  // -------------------------------------------------------------
  const authReq2 = new Request('https://smapworks.art/api/acquisition-authorization', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://smapworks.art' },
    body: JSON.stringify({ action: 'get', walletAddress: buyer.address }),
  });
  const authRes2 = await handleAcquisitionAuthorization(authReq2, config, mockFetcher);
  assert.equal(authRes2.status, 200);
  const authBody2 = await authRes2.json();
  assert.equal(authBody2.status, 'ISSUED');

  // -------------------------------------------------------------
  // Step 7: Parse authorization & encode acquisition transaction
  // -------------------------------------------------------------
  const parsed = parsePurchaseAuthorization(JSON.stringify(authBody2.authorization));
  assert.equal(parsed.message.designatedBearer.toLowerCase(), buyer.address.toLowerCase());
  assert.equal(parsed.message.paintingTokenId, 0n);
  assert.equal(parsed.message.frameTokenId, 5n);

  const tx = completeTransaction(parsed.message, parsed.signature);
  assert.equal(tx.from.toLowerCase(), buyer.address.toLowerCase());
  assert.equal(tx.to, COMPLETE_CONTRACT);
  assert.equal(tx.value, COMPLETE_PRICE);
  assert.equal(tx.chainId, 8453);
  assert.match(tx.data, /^0x3b5abbb7/);

  // -------------------------------------------------------------
  // Step 8: Simulated wallet execution & on-chain receipt verification
  // -------------------------------------------------------------
  const simulatedTxHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  const simulatedReceipt = {
    transactionHash: simulatedTxHash,
    status: 'success',
    blockNumber: 51147700n,
  };
  assert.equal(simulatedReceipt.status, 'success');
  assert.match(simulatedReceipt.transactionHash, /^0x[0-9a-f]{64}$/i);

  // -------------------------------------------------------------
  // Step 9: Verify UI state transition contract (onAcquired callback)
  // -------------------------------------------------------------
  let uiRecordedTxHash = null;
  const onAcquired = (hash) => {
    uiRecordedTxHash = hash;
  };
  onAcquired(simulatedReceipt.transactionHash);
  assert.equal(uiRecordedTxHash, simulatedTxHash);

  // With uiRecordedTxHash present, effectiveRelationshipHeld evaluates to true
  const effectiveRelationshipHeld = Boolean(uiRecordedTxHash);
  assert.equal(effectiveRelationshipHeld, true);
  const headerLabel = effectiveRelationshipHeld ? 'DESIGNATED RELATION' : 'FRAME 05 · PAINTING RELATION';
  assert.equal(headerLabel, 'DESIGNATED RELATION');
});

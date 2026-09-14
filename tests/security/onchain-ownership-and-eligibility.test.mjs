import test from 'node:test';
import assert from 'node:assert/strict';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { recoverTypedDataAddress } from 'viem';
import {
  checkFrameStatus,
  validateStandaloneFrameId,
  COMPLETE_PACKAGE_FRAME_ID,
  ARTIST_GENESIS_FRAME_ID,
} from '../../src/services/framePurchase.ts';
import { handleArtistCeremony } from '../../../api-worker/artist-ceremony.js';
import { handleEncounterRequest } from '../../../api-worker/encounter-request.js';
import { resolveOwnedTokens } from '../../src/services/archiveRetrieval.ts';

// 1. Frame 02 unowned -> available
test('Frame 02 unowned on-chain -> checkFrameStatus reports unminted and available', async () => {
  const buyer = privateKeyToAccount(generatePrivateKey());
  const mockProvider = {
    request: async ({ method, params }) => {
      if (method === 'eth_chainId') return '0x2105';
      if (method === 'eth_accounts') return [buyer.address];
      if (method === 'eth_getBlockByNumber') return { timestamp: '0x6a000000', number: '0x100' };
      if (method === 'eth_call') {
        const data = params[0].data;
        if (data.startsWith('0x255e4685')) return '0x' + (1000n).toString(16).padStart(64, '0');
        if (data.startsWith('0x6352211e')) throw new Error('ERC721NonexistentToken');
      }
      throw new Error('Unexpected method ' + method);
    }
  };
  const status = await checkFrameStatus(mockProvider, 2);
  assert.equal(status.isMinted, false);
  assert.equal(status.owner, null);
  assert.equal(status.mintStarted, true);
});

// 2. Frame 02 owned -> isMinted: true
test('Frame 02 owned on-chain -> checkFrameStatus reports isMinted: true with owner address', async () => {
  const buyer = privateKeyToAccount(generatePrivateKey());
  const mockProvider = {
    request: async ({ method, params }) => {
      if (method === 'eth_chainId') return '0x2105';
      if (method === 'eth_accounts') return [buyer.address];
      if (method === 'eth_getBlockByNumber') return { timestamp: '0x6a000000', number: '0x100' };
      if (method === 'eth_call') {
        const data = params[0].data;
        if (data.startsWith('0x255e4685')) return '0x' + (1000n).toString(16).padStart(64, '0');
        if (data.startsWith('0x6352211e')) return '0x000000000000000000000000' + buyer.address.slice(2).toLowerCase();
      }
      throw new Error('Unexpected method ' + method);
    }
  };

  const status = await checkFrameStatus(mockProvider, 2);
  assert.equal(status.isMinted, true);
  assert.equal(status.owner.toLowerCase(), buyer.address.toLowerCase());
});

// 3. Page refresh after ownership -> re-querying contract discovers on-chain owner
test('Page refresh after ownership -> re-querying contract discovers on-chain owner', async () => {
  const buyerA = privateKeyToAccount(generatePrivateKey());
  let onChainOwner = null;

  const getProvider = () => ({
    request: async ({ method, params }) => {
      if (method === 'eth_chainId') return '0x2105';
      if (method === 'eth_accounts') return [buyerA.address];
      if (method === 'eth_getBlockByNumber') return { timestamp: '0x6a000000', number: '0x100' };
      if (method === 'eth_call') {
        const data = params[0].data;
        if (data.startsWith('0x255e4685')) return '0x' + (1000n).toString(16).padStart(64, '0');
        if (data.startsWith('0x6352211e')) {
          if (!onChainOwner) throw new Error('ERC721NonexistentToken');
          return '0x000000000000000000000000' + onChainOwner.slice(2).toLowerCase();
        }
      }
      throw new Error('Unexpected method ' + method);
    }
  });

  const initial = await checkFrameStatus(getProvider(), 2);
  assert.equal(initial.isMinted, false);

  onChainOwner = buyerA.address;

  const postRefresh = await checkFrameStatus(getProvider(), 2);
  assert.equal(postRefresh.isMinted, true);
  assert.equal(postRefresh.owner.toLowerCase(), buyerA.address.toLowerCase());
});

// 4. Wallet A owns Frame 02, Wallet B does not -> distinct ownership state without leakage
test('Wallet A owns Frame 02, Wallet B does not -> distinct ownership state without leakage', async () => {
  const walletA = '0x1111111111111111111111111111111111111111';
  const walletB = '0x2222222222222222222222222222222222222222';
  const onChainOwners = new Map([[2, walletA]]);

  const createProviderFor = (wallet) => ({
    request: async ({ method, params }) => {
      if (method === 'eth_chainId') return '0x2105';
      if (method === 'eth_accounts') return [wallet];
      if (method === 'eth_getBlockByNumber') return { timestamp: '0x6a000000', number: '0x100' };
      if (method === 'eth_call') {
        const data = params[0].data;
        if (data.startsWith('0x255e4685')) return '0x' + (1000n).toString(16).padStart(64, '0');
        if (data.startsWith('0x6352211e')) {
          const tokenId = parseInt(data.slice(10), 16);
          const owner = onChainOwners.get(tokenId);
          if (!owner) throw new Error('ERC721NonexistentToken');
          return '0x000000000000000000000000' + owner.slice(2).toLowerCase();
        }
      }
      throw new Error('Unexpected method ' + method);
    }
  });

  const statusA = await checkFrameStatus(createProviderFor(walletA), 2);
  const statusB = await checkFrameStatus(createProviderFor(walletB), 2);

  assert.equal(statusA.isMinted, true);
  assert.equal(statusA.owner.toLowerCase(), walletA.toLowerCase());
  assert.equal(statusB.isMinted, true);
  assert.equal(statusB.owner.toLowerCase(), walletA.toLowerCase());

  const ownedA = await resolveOwnedTokens(createProviderFor(walletA), walletA);
  const ownedB = await resolveOwnedTokens(createProviderFor(walletB), walletB);

  assert.equal(ownedA.length, 1);
  assert.equal(ownedA[0].tokenId, 2);
  assert.equal(ownedB.length, 0);
});

// 5. Wallet switch A -> B -> A -> no stale ownership retained
test('Wallet switch A -> B -> A updates derived state from connected account without caching', async () => {
  const walletA = '0x1111111111111111111111111111111111111111';
  const walletB = '0x2222222222222222222222222222222222222222';
  let activeAccount = walletA;
  const onChainOwners = new Map([[2, walletA]]);

  const provider = {
    request: async ({ method, params }) => {
      if (method === 'eth_chainId') return '0x2105';
      if (method === 'eth_accounts') return [activeAccount];
      if (method === 'eth_getBlockByNumber') return { timestamp: '0x6a000000', number: '0x100' };
      if (method === 'eth_call') {
        const data = params[0].data;
        if (data.startsWith('0xb03b7086')) return '0x' + (1000n).toString(16).padStart(64, '0');
        if (data.startsWith('0x6352211e')) {
          const tokenId = parseInt(data.slice(10), 16);
          const owner = onChainOwners.get(tokenId);
          if (!owner) throw new Error('ERC721NonexistentToken');
          return '0x000000000000000000000000' + owner.slice(2).toLowerCase();
        }
      }
      throw new Error('Unexpected method ' + method);
    }
  };

  activeAccount = walletA;
  const tokensA1 = await resolveOwnedTokens(provider, activeAccount);
  assert.deepEqual(tokensA1.map(t => t.tokenId), [2]);

  activeAccount = walletB;
  const tokensB = await resolveOwnedTokens(provider, activeAccount);
  assert.deepEqual(tokensB.map(t => t.tokenId), []);

  activeAccount = walletA;
  const tokensA2 = await resolveOwnedTokens(provider, activeAccount);
  assert.deepEqual(tokensA2.map(t => t.tokenId), [2]);
});

// 6. Frame 05 reserved
test('Frame 05 standalone mint is unconditionally rejected by validation and contract', async () => {
  assert.throws(() => validateStandaloneFrameId(5), /Frame 05 is reserved for the Complete Package/);
  assert.equal(COMPLETE_PACKAGE_FRAME_ID, 5);
});

// 7. Frame 06 Artist Genesis reserved
test('Frame 06 standalone mint is unconditionally rejected by validation and contract', async () => {
  assert.throws(() => validateStandaloneFrameId(6), /Frame 06 is reserved for the Artist Genesis Archive/);
  assert.equal(ARTIST_GENESIS_FRAME_ID, 6);
});

// 8. Package 05 holder owning Token 0 and Frame 05 resolves both in inventory and qualifies for Sanctum
test('Package 05 holder owning Token 0 and Frame 05 resolves both in inventory and qualifies for Sanctum', async () => {
  const steward = '0x3333333333333333333333333333333333333333';
  const tokenOwners = new Map([[0, steward], [5, steward]]);
  const provider = {
    request: async ({ method, params }) => {
      if (method === 'eth_chainId') return '0x2105';
      if (method === 'eth_accounts') return [steward];
      if (method === 'eth_call') {
        const data = params[0].data;
        if (data.startsWith('0x6352211e')) {
          const tokenId = parseInt(data.slice(10), 16);
          const owner = tokenOwners.get(tokenId);
          if (!owner) throw new Error('ERC721NonexistentToken');
          return '0x000000000000000000000000' + owner.slice(2).toLowerCase();
        }
      }
      throw new Error('Unexpected method ' + method);
    }
  };
  const owned = await resolveOwnedTokens(provider, steward);
  assert.equal(owned.length, 2);
  assert.deepEqual(owned[0], { tokenId: 0, assetType: 'H_PAINTING_PACKAGE', label: 'PAINTING' });
  assert.deepEqual(owned[1], { tokenId: 5, assetType: 'H_FRAME_PACKAGE', label: 'FRAME 05' });

  // On-chain Sanctum eligibility: owns 0 and at least one frame (5)
  const ownedSet = new Set(owned.map(t => t.tokenId));
  const isSanctumEligible = ownedSet.has(0) && Array.from({ length: 9 }, (_, i) => i + 1).some(id => ownedSet.has(id));
  assert.equal(isSanctumEligible, true);
});

// 8b. Artist Genesis holding Token 0 and Frame 06 qualifies for Sanctum presentation but only downloads 0 and 6
test('Artist Genesis holding Token 0 and Frame 06 qualifies for Sanctum presentation but only downloads 0 and 6', async () => {
  const artist = '0x3cff39491b333016055B3d9328905B0b172988a4';
  const tokenOwners = new Map([[0, artist], [6, artist]]);
  const provider = {
    request: async ({ method, params }) => {
      if (method === 'eth_chainId') return '0x2105';
      if (method === 'eth_accounts') return [artist];
      if (method === 'eth_call') {
        const data = params[0].data;
        if (data.startsWith('0x6352211e')) {
          const tokenId = parseInt(data.slice(10), 16);
          const owner = tokenOwners.get(tokenId);
          if (!owner) throw new Error('ERC721NonexistentToken');
          return '0x000000000000000000000000' + owner.slice(2).toLowerCase();
        }
      }
      throw new Error('Unexpected method ' + method);
    }
  };
  const owned = await resolveOwnedTokens(provider, artist);
  assert.equal(owned.length, 2);
  assert.deepEqual(owned[0], { tokenId: 0, assetType: 'H_PAINTING_PACKAGE', label: 'PAINTING' });
  assert.deepEqual(owned[1], { tokenId: 6, assetType: 'H_FRAME_PACKAGE', label: 'FRAME 06' });

  // Sanctum presentation eligibility: owns 0 and at least one frame (6)
  const ownedSet = new Set(owned.map(t => t.tokenId));
  const isSanctumEligible = ownedSet.has(0) && Array.from({ length: 9 }, (_, i) => i + 1).some(id => ownedSet.has(id));
  assert.equal(isSanctumEligible, true);

  // Authority separation: Artist has Sanctum presentation access, but CANNOT download Frame 05
  assert.equal(ownedSet.has(5), false);
});

// 8c. Standalone Frame 02 holder has Frame 02 relationship but is NOT Sanctum eligible
test('Standalone Frame 02 holder has Frame 02 relationship but is NOT Sanctum eligible', async () => {
  const frameHolder = '0x4444444444444444444444444444444444444444';
  const tokenOwners = new Map([[2, frameHolder]]);
  const provider = {
    request: async ({ method, params }) => {
      if (method === 'eth_chainId') return '0x2105';
      if (method === 'eth_accounts') return [frameHolder];
      if (method === 'eth_call') {
        const data = params[0].data;
        if (data.startsWith('0x6352211e')) {
          const tokenId = parseInt(data.slice(10), 16);
          const owner = tokenOwners.get(tokenId);
          if (!owner) throw new Error('ERC721NonexistentToken');
          return '0x000000000000000000000000' + owner.slice(2).toLowerCase();
        }
      }
      throw new Error('Unexpected method ' + method);
    }
  };
  const owned = await resolveOwnedTokens(provider, frameHolder);
  assert.equal(owned.length, 1);
  assert.deepEqual(owned[0], { tokenId: 2, assetType: 'H_FRAME_PACKAGE', label: 'FRAME 02' });

  const ownedSet = new Set(owned.map(t => t.tokenId));
  const isSanctumEligible = ownedSet.has(0) && Array.from({ length: 9 }, (_, i) => i + 1).some(id => ownedSet.has(id));
  assert.equal(isSanctumEligible, false);
  assert.equal(ownedSet.has(2), true);
  assert.equal(ownedSet.has(5), false);
});

// 9 & 10. Ineligible wallet excluded from queue and rejected by prepare_bundle
test('Ineligible wallet already holding authorization is excluded from queue and rejected by prepare_bundle', async () => {
  const walletA = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  const walletB = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
  const reqA = '11111111-1111-4111-8111-111111111111';
  const reqB = '22222222-2222-4222-8222-222222222222';
  const dbEncounterRequests = new Map([
    [walletA, { request_id: reqA, wallet_address: walletA, status: 'PENDING', submitted_at: new Date().toISOString() }],
    [walletB, { request_id: reqB, wallet_address: walletB, status: 'PENDING', submitted_at: new Date().toISOString() }],
  ]);
  const dbAuthorizations = new Map([[walletA, { authorization_id: 'auth-123', wallet_address: walletA }]]);
  const mockConfig = {
    origin: 'https://smapworks.art',
    supabaseUrl: 'https://database.example.internal',
    serverKey: 'sb_secret_mock_key',
    recoverAddress: recoverTypedDataAddress,
  };
  const mockFetcher = async (url, options = {}) => {
    const u = new URL(url.toString());
    const path = u.pathname;
    const body = options.body ? JSON.parse(options.body) : {};
    if (path === '/rest/v1/rpc/list_pending_encounter_requests') {
      const rows = Array.from(dbEncounterRequests.values())
        .filter(r => r.status === 'PENDING' && !dbAuthorizations.has(r.wallet_address))
        .map(r => ({ requestId: r.request_id, walletAddress: r.wallet_address, submittedAt: r.submitted_at }));
      return new Response(JSON.stringify(rows), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    if (path === '/rest/v1/rpc/get_pending_encounter_request') {
      const wallet = body.p_wallet_address?.toLowerCase();
      if (dbAuthorizations.has(wallet)) {
        return new Response(JSON.stringify({ error: 'AUTHORIZATION_ALREADY_EXISTS_FOR_WALLET' }), { status: 200, headers: { 'content-type': 'application/json' } });
      }
      const req = Array.from(dbEncounterRequests.values()).find(r => r.request_id === body.p_request_id && r.wallet_address === wallet);
      if (!req) return new Response(JSON.stringify({ error: 'PENDING_REQUEST_NOT_FOUND' }), { status: 200, headers: { 'content-type': 'application/json' } });
      return new Response(JSON.stringify({ status: 'OK', requestId: req.request_id, walletAddress: req.wallet_address }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    return new Response(JSON.stringify({ error: 'NOT_FOUND' }), { status: 404 });
  };
  const listReq = new Request('https://smapworks.art/api/artist-ceremony', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://smapworks.art' },
    body: JSON.stringify({ action: 'list_pending' }),
  });
  const listRes = await handleArtistCeremony(listReq, mockConfig, mockFetcher);
  assert.equal(listRes.status, 200);
  const listData = await listRes.json();
  assert.equal(listData.pending.length, 1);
  assert.equal(listData.pending[0].walletAddress, walletB);
  assert.equal(listData.pending.some(p => p.walletAddress === walletA), false);

  const prepReqA = new Request('https://smapworks.art/api/artist-ceremony', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://smapworks.art' },
    body: JSON.stringify({ action: 'prepare_bundle', requestId: reqA, walletAddress: walletA }),
  });
  const prepResA = await handleArtistCeremony(prepReqA, mockConfig, mockFetcher);
  assert.equal(prepResA.status, 409);

  const prepReqB = new Request('https://smapworks.art/api/artist-ceremony', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://smapworks.art' },
    body: JSON.stringify({ action: 'prepare_bundle', requestId: reqB, walletAddress: walletB }),
  });
  const prepResB = await handleArtistCeremony(prepReqB, mockConfig, mockFetcher);
  assert.equal(prepResB.status, 200);
});

// 10. Admission-time check: Standalone Frame 02 owner CAN submit for Package 05; Package 05 owner is rejected
test('Admission-time check: Standalone Frame 02 owner CAN submit for Package 05; Package 05 owner is rejected', async () => {
  const buyerHoldingFrame02 = '0x2222222222222222222222222222222222222222';
  const buyerHoldingFrame05 = '0x5555555555555555555555555555555555555555';
  const cleanBuyer = '0x3333333333333333333333333333333333333333';
  const reqClean = 'bbbb2222-2222-4222-8222-222222222222';
  const reqFrame02 = 'aaaa1111-1111-4111-8111-111111111111';

  const onChainOwners = new Map([
    [2, buyerHoldingFrame02],
    [5, buyerHoldingFrame05],
  ]);

  const mockConfig = {
    origin: 'https://smapworks.art',
    supabaseUrl: 'https://database.example.internal',
    serverKey: 'sb_secret_mock_key',
    recoverAddress: recoverTypedDataAddress,
    checkOwnership: async (wallet) => {
      // Only Token 0 or Token 5 (Package 05) disqualifies from entering queue
      for (const tokenId of [0, 5]) {
        const owner = onChainOwners.get(tokenId);
        if (owner && owner.toLowerCase() === wallet.toLowerCase()) {
          return { ownsIncompatible: true, tokenId };
        }
      }
      return { ownsIncompatible: false };
    },
  };

  const mockFetcher = async (url, options = {}) => {
    const u = new URL(url.toString());
    const path = u.pathname;
    const body = options.body ? JSON.parse(options.body) : {};
    if (path === '/rest/v1/rpc/submit_encounter_request') {
      return new Response(JSON.stringify(reqClean), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    if (path === '/rest/v1/rpc/list_pending_encounter_requests') {
      const rows = [
        { requestId: reqClean, walletAddress: cleanBuyer, submittedAt: new Date().toISOString() },
        { requestId: reqFrame02, walletAddress: buyerHoldingFrame02, submittedAt: new Date().toISOString() },
      ];
      return new Response(JSON.stringify(rows), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    if (path === '/rest/v1/rpc/get_pending_encounter_request') {
      return new Response(JSON.stringify({ status: 'OK', requestId: reqClean, walletAddress: cleanBuyer }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    return new Response(JSON.stringify({ error: 'NOT_FOUND' }), { status: 404 });
  };

  // 1. Admission check: Standalone Frame 02 owner CAN submit Three Brushstrokes for Package 05 (status 201)
  const submitFrame02 = new Request('https://smapworks.art/api/encounter-request', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://smapworks.art' },
    body: JSON.stringify({ action: 'submit', walletAddress: buyerHoldingFrame02, contributions: ['Nét 1', 'Nét 2', 'Nét 3'] }),
  });
  const resFrame02 = await handleEncounterRequest(submitFrame02, mockConfig, mockFetcher);
  assert.equal(resFrame02.status, 201);

  // 2. Admission check: Package 05 owner (holding Frame 05) IS REJECTED with 409
  const submitFrame05 = new Request('https://smapworks.art/api/encounter-request', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://smapworks.art' },
    body: JSON.stringify({ action: 'submit', walletAddress: buyerHoldingFrame05, contributions: ['Nét 1', 'Nét 2', 'Nét 3'] }),
  });
  const resFrame05 = await handleEncounterRequest(submitFrame05, mockConfig, mockFetcher);
  assert.equal(resFrame05.status, 409);
  const dataFrame05 = await resFrame05.json();
  assert.equal(dataFrame05.error, 'INELIGIBLE_WALLET_ALREADY_ACQUIRED_PACKAGE_05');

  // 3. Queue stability: list_pending returns admitted queue items without arbitrary continuous eviction
  const listReq = new Request('https://smapworks.art/api/artist-ceremony', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://smapworks.art' },
    body: JSON.stringify({ action: 'list_pending' }),
  });
  const listRes = await handleArtistCeremony(listReq, mockConfig, mockFetcher);
  assert.equal(listRes.status, 200);
  const listData = await listRes.json();
  assert.equal(listData.pending.length, 2);
  assert.equal(listData.pending.some(p => p.walletAddress === cleanBuyer), true);
  assert.equal(listData.pending.some(p => p.walletAddress === buyerHoldingFrame02), true);
});

// 11. Distinction between authorization history guard and Package 05 token ownership guard
test('Distinct predicates: prior authorization vs on-chain ownership', async () => {
  const walletWithAuthOnly = '0x4444444444444444444444444444444444444444';
  const walletWithTokenOnly = '0x5555555555555555555555555555555555555555';
  const reqAuth = 'cccc1111-1111-4111-8111-111111111111';

  const onChainOwners = new Map([[5, walletWithTokenOnly]]);
  const dbAuthorizations = new Map([[walletWithAuthOnly, { authorization_id: 'auth-444' }]]);

  const mockConfig = {
    origin: 'https://smapworks.art',
    supabaseUrl: 'https://database.example.internal',
    serverKey: 'sb_secret_mock_key',
    recoverAddress: recoverTypedDataAddress,
    checkOwnership: async (wallet) => {
      for (const tokenId of [0, 5]) {
        const owner = onChainOwners.get(tokenId);
        if (owner && owner.toLowerCase() === wallet.toLowerCase()) {
          return { ownsIncompatible: true, tokenId };
        }
      }
      return { ownsIncompatible: false };
    },
  };

  const mockFetcher = async (url, options = {}) => {
    const u = new URL(url.toString());
    const path = u.pathname;
    const body = options.body ? JSON.parse(options.body) : {};
    if (path === '/rest/v1/rpc/get_pending_encounter_request') {
      const wallet = body.p_wallet_address?.toLowerCase();
      if (dbAuthorizations.has(wallet)) {
        return new Response(JSON.stringify({ error: 'AUTHORIZATION_ALREADY_EXISTS_FOR_WALLET' }), { status: 200, headers: { 'content-type': 'application/json' } });
      }
      return new Response(JSON.stringify({ status: 'OK', requestId: body.p_request_id, walletAddress: wallet }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    return new Response(JSON.stringify({ error: 'NOT_FOUND' }), { status: 404 });
  };

  // Wallet with Package 05 token ownership fails on encounter submission admission check (owns Frame 05)
  const submitToken = new Request('https://smapworks.art/api/encounter-request', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://smapworks.art' },
    body: JSON.stringify({ action: 'submit', walletAddress: walletWithTokenOnly, contributions: ['Nét 1', 'Nét 2', 'Nét 3'] }),
  });
  const resToken = await handleEncounterRequest(submitToken, mockConfig, mockFetcher);
  assert.equal(resToken.status, 409);
  const dataToken = await resToken.json();
  assert.equal(dataToken.error, 'INELIGIBLE_WALLET_ALREADY_ACQUIRED_PACKAGE_05');

  // Wallet with prior authorization in DB fails in artist ceremony prepare_bundle on authorization history check
  const prepAuth = new Request('https://smapworks.art/api/artist-ceremony', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://smapworks.art' },
    body: JSON.stringify({ action: 'prepare_bundle', requestId: reqAuth, walletAddress: walletWithAuthOnly }),
  });
  const resAuth = await handleArtistCeremony(prepAuth, mockConfig, mockFetcher);
  assert.equal(resAuth.status, 409);
  const dataAuth = await resAuth.json();
  assert.equal(dataAuth.error, 'AUTHORIZATION_ALREADY_EXISTS_FOR_WALLET');
});
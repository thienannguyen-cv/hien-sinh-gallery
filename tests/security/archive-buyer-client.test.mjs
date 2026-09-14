import test from 'node:test';
import assert from 'node:assert/strict';
import { privateKeyToAccount, generatePrivateKey } from 'viem/accounts';
import { createTransmissionService } from '../../supabase/functions/_shared/transmission-service.ts';
import { createTransmissionHandler } from '../../supabase/functions/_shared/transmission-http.ts';
import { retrievePackage, resolveOwnedTokens, ARCHIVE_CONTRACT } from '../../src/services/archiveRetrieval.ts';
import { proxyArchiveRequest } from '../../../api-worker/archive-proxy.js';

async function fixture({ chain = '0x2105', tamperFile = false, notOwner = false, switchAccount = false } = {}) {
  const wallet = privateKeyToAccount(generatePrivateKey());
  const otherWallet = privateKeyToAccount(generatePrivateKey());
  const origin = 'https://smapworks.art';
  const bytes = new TextEncoder().encode('synthetic package bytes');
  const hash = Buffer.from(await crypto.subtle.digest('SHA-256', bytes)).toString('hex');
  let currentAccount = wallet.address, posts = 0;
  const service = createTransmissionService({
    now: () => new Date(),
    readOnChainAccess: async () => ({
      owner: notOwner ? otherWallet.address : wallet.address,
      completePackageId: 5,
      completePackageTokenId: 0,
      canonicalDesignationHash: 'd'.repeat(64),
      archiveCommitment: '0'.repeat(64),
      authorizationBlockNumber: '42',
      authorizationBlockHash: 'e'.repeat(64),
    }),
    getAsset: async (tokenId, assetType) => ({
      tokenId,
      assetType,
      assetHash: hash,
      archiveCommitment: 'c'.repeat(64),
      filePath: 'synthetic.bin',
    }),
    createSignedUrl: async () => 'https://storage.example/synthetic',
    writeAuditLog: async () => {},
  }, { origin, chainId: 8453, contractAddress: ARCHIVE_CONTRACT, publishedArchiveCommitment: 'c'.repeat(64) });

  const handler = createTransmissionHandler({
    allowedOrigins: new Set([origin]),
    configured: true,
    verifyChain: async () => {},
    serviceForOrigin: () => service,
  });

  const provider = {
    request: async ({ method }) => {
      if (method === 'eth_accounts') {
        if (switchAccount) return ['0x1111111111111111111111111111111111111111'];
        return [currentAccount];
      }
      if (method === 'eth_chainId') return chain;
      throw new Error(`Unexpected provider call: ${method}`);
    },
  };

  const fetcher = async (url, init) => {
    if (String(url).startsWith('https://storage.example/')) return new Response(tamperFile ? 'changed bytes' : bytes);
    assert.equal(url, '/api/transmit-artwork'); posts++;
    const request = new Request(origin + url, { ...init, headers: { ...init.headers, origin } });
    return proxyArchiveRequest(request, { origin, endpoint: 'https://edge.example/transmit-artwork' }, async (upstream, params) => {
      return handler(new Request(upstream, params));
    });
  };

  const stages = [];
  return {
    run: (tokenId = 0) => retrievePackage({
      provider, address: wallet.address, tokenId,
      assetType: tokenId === 0 ? 'H_PAINTING_PACKAGE' : 'H_FRAME_PACKAGE',
      origin, signal: new AbortController().signal, stage: s => stages.push(s), fetcher,
    }),
    posts: () => posts,
    stages,
    bytes,
  };
}

test('buyer client → same-origin proxy → handler/service verifies on-chain ownership and package bytes directly', async () => {
  const f = await fixture();
  const result = await f.run();
  assert.equal(f.posts(), 1);
  assert.equal(result.filename, 'Hien-Sinh-Painting.zip');
  assert.deepEqual(new Uint8Array(await result.blob.arrayBuffer()), f.bytes);
  assert.deepEqual(f.stages, ['verifying-ownership', 'downloading', 'verified']);
});

test('Frame05 gets its own named package through ownership-based retrieval', async () => {
  const f = await fixture();
  assert.equal((await f.run(5)).filename, 'Hien-Sinh-Frame-05.zip');
});

test('wrong network blocks before any request is sent', async () => {
  const f = await fixture({ chain: '0x1' });
  await assert.rejects(f.run(), /Select Base/);
  assert.equal(f.posts(), 0);
});

test('account mismatch on-chain fails closed with 403', async () => {
  const f = await fixture({ notOwner: true });
  await assert.rejects(f.run(), /not the current owner/);
  assert.equal(f.posts(), 1);
});

test('changed downloaded bytes are rejected instead of saved', async () => {
  const f = await fixture({ tamperFile: true });
  await assert.rejects(f.run(), /File verification failed/);
  assert.equal(f.stages.includes('verified'), false);
});

test('proxy fails closed for missing config, wrong origin and oversized bodies', async () => {
  const origin = 'https://smapworks.art';
  const request = (originValue, body = '{}') => new Request(origin + '/api/transmit-artwork', {
    method: 'POST', headers: { origin: originValue, 'content-type': 'application/json' }, body,
  });
  const unused = async () => { throw new Error('Unexpected upstream request'); };
  assert.equal((await proxyArchiveRequest(request(origin), { origin }, unused)).status, 503);
  assert.equal((await proxyArchiveRequest(request('https://other.example'), { origin }, unused)).status, 403);
  assert.equal((await proxyArchiveRequest(request(origin, 'a'.repeat(8193)), { origin, endpoint: 'https://edge.example' }, unused)).status, 413);
});

test('resolveOwnedTokens discovers held tokens on Base for connected wallet', async () => {
  const buyerWallet = '0x1234567890abcdef1234567890abcdef12345678';
  const otherWallet = '0x9999999999999999999999999999999999999999';
  const tokenOwners = new Map([
    [0, buyerWallet], // Owns Painting
    [2, otherWallet],
    [5, buyerWallet], // Owns Frame 05
  ]);

  const mockProvider = {
    request: async ({ method, params }) => {
      if (method === 'eth_chainId') return '0x2105';
      if (method === 'eth_accounts') return [buyerWallet];
      if (method === 'eth_call') {
        const to = params[0].to.toLowerCase();
        assert.equal(to, ARCHIVE_CONTRACT.toLowerCase());
        const data = params[0].data;
        assert.equal(data.slice(0, 10), '0x6352211e'); // ownerOf(uint256)
        const tokenId = parseInt(data.slice(10), 16);
        const owner = tokenOwners.get(tokenId);
        if (!owner) throw new Error('ERC721: invalid token ID');
        return '0x000000000000000000000000' + owner.toLowerCase().replace('0x', '');
      }
      throw new Error(`Unexpected RPC method: ${method}`);
    },
  };

  const owned = await resolveOwnedTokens(mockProvider, buyerWallet);
  assert.equal(owned.length, 2);
  assert.deepEqual(owned[0], { tokenId: 0, assetType: 'H_PAINTING_PACKAGE', label: 'PAINTING' });
  assert.deepEqual(owned[1], { tokenId: 5, assetType: 'H_FRAME_PACKAGE', label: 'FRAME 05' });

  // Disconnected or un-owned wallet returns empty array
  const empty = await resolveOwnedTokens(mockProvider, '0x0000000000000000000000000000000000000001');
  assert.deepEqual(empty, []);
});

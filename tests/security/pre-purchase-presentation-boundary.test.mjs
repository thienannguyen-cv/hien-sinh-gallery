import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import smapworksWorker from '../../cloudflare/smapworks/_worker.js';
import { handleAcquisitionAuthorization } from '../../cloudflare/api-worker/acquisition-authorization.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const galleryRoot = path.resolve(__dirname, '../..');

const BASELINE_HASH = 'dc897efc99468a1482e736d4d8f05b0b55555244c835d9731c6a208e908ea260';
const INVITED_512_HASH = '78e49014256c39102f0e3dc6b3a30098076276b63029a2395ac275156f95cce1';

function sha256(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

// Load real asset bytes for mock env.ASSETS
const baselineBytes = await readFile(path.join(galleryRoot, 'archive_assets/intersection-frame.png'));
const invited512Bytes = await readFile(path.join(galleryRoot, 'archive_assets/condensed_masterpiece_512.png'));

// Ensure the local asset files match the cryptographic designation
assert.equal(sha256(baselineBytes), BASELINE_HASH, 'baseline bytes must match canonical hash');
assert.equal(sha256(invited512Bytes), INVITED_512_HASH, '512 bytes must match canonical hash');

function createMockEnv(authorizedWallets = new Set()) {
  const secretKey = 'sb_secret_test_mock_key_production_grade_verification_12345';
  const supabaseUrl = 'https://mock.supabase.co';

  const mockAssets = {
    async fetch(request) {
      const url = new URL(request.url);
      if (url.pathname === '/_internal_assets/frame-curator-baseline.png') {
        return new Response(baselineBytes, {
          status: 200,
          headers: { 'content-type': 'image/png' },
        });
      }
      if (url.pathname === '/_internal_assets/frame-curator-invited.png') {
        return new Response(invited512Bytes, {
          status: 200,
          headers: { 'content-type': 'image/png' },
        });
      }
      return new Response('Not Found', { status: 404 });
    },
  };

  const mockSupabaseFetch = async (url, options) => {
    const urlStr = url.toString();
    if (urlStr.includes('/rest/v1/rpc/acquisition_authorization_for_wallet')) {
      const body = JSON.parse(options.body);
      const wallet = body.p_wallet_address?.toLowerCase();
      if (authorizedWallets.has(wallet)) {
        return new Response(JSON.stringify({
          wallet_address: wallet,
          artist_signature: '0x' + 'ff'.repeat(65),
          price_eth: '4.29',
          valid_until: '2026-12-31T23:59:59Z',
          confirmed_at: '2026-09-15T00:00:00Z',
        }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      } else {
        return new Response('null', {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      }
    }
    return new Response('Not Found', { status: 404 });
  };

  return {
    secretKey,
    env: {
      SUPABASE_URL: supabaseUrl,
      SUPABASE_SECRET_KEY: secretKey,
      SUPABASE_ANON_KEY: secretKey,
      ASSETS: mockAssets,
      fetcher: mockSupabaseFetch,
    },
    mockSupabaseFetch,
  };
}

test('Criterion 1: PENDING wallet receives NOT_ISSUED and no cookie is emitted', async () => {
  const pendingWallet = '0x1111111111111111111111111111111111111111';
  const { env, mockSupabaseFetch } = createMockEnv(new Set()); // empty set, no authorized wallets

  // Query acquisition authorization
  const authReq = new Request('https://smapworks.art/api/acquisition-authorization', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'https://smapworks.art',
    },
    body: JSON.stringify({ action: 'get', walletAddress: pendingWallet }),
  });
  const authRes = await handleAcquisitionAuthorization(
    authReq,
    { origin: 'https://smapworks.art', supabaseUrl: env.SUPABASE_URL, serverKey: env.SUPABASE_SECRET_KEY },
    mockSupabaseFetch
  );
  assert.equal(authRes.status, 200);
  const authData = await authRes.json();
  assert.equal(authData.status, 'NOT_ISSUED');
  assert.equal(authRes.headers.get('set-cookie'), null, 'No cookie must be set');

  // Ambient GET frame curator image returns baseline
  const imgReq = new Request('https://smapworks.art/api/frame-curator-image');
  const imgRes = await smapworksWorker.fetch(imgReq, env);
  assert.equal(imgRes.status, 200);
  assert.equal(imgRes.headers.get('cache-control'), 'private, no-store');
  const imgBuf = Buffer.from(await imgRes.arrayBuffer());
  assert.equal(sha256(imgBuf), BASELINE_HASH);
});

test('Criterion 2: Artist signature -> ISSUED authorization without cookie dependency', async () => {
  const confirmedWallet = '0x2222222222222222222222222222222222222222';
  const { env, mockSupabaseFetch } = createMockEnv(new Set([confirmedWallet]));

  // Query acquisition authorization for confirmed wallet
  const authReq = new Request('https://smapworks.art/api/acquisition-authorization', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'https://smapworks.art',
    },
    body: JSON.stringify({ action: 'get', walletAddress: confirmedWallet }),
  });
  const authRes = await handleAcquisitionAuthorization(
    authReq,
    { origin: 'https://smapworks.art', supabaseUrl: env.SUPABASE_URL, serverKey: env.SUPABASE_SECRET_KEY },
    mockSupabaseFetch
  );
  assert.equal(authRes.status, 200);
  const authData = await authRes.json();
  assert.equal(authData.status, 'ISSUED');
  assert.ok(authData.authorization);
  assert.equal(authRes.headers.get('set-cookie'), null, 'No cookie must be set on ISSUED');

  // Confirmed wallet presenting x-wallet-address receives invited 512x512 condensed masterpiece
  const imgReq = new Request('https://smapworks.art/api/frame-curator-image', {
    headers: { 'x-wallet-address': confirmedWallet },
  });
  const imgRes = await smapworksWorker.fetch(imgReq, env);
  assert.equal(imgRes.status, 200);
  assert.equal(imgRes.headers.get('cache-control'), 'private, no-store');
  const imgBuf = Buffer.from(await imgRes.arrayBuffer());
  assert.equal(sha256(imgBuf), INVITED_512_HASH, 'Confirmed wallet must receive invited 512x512 presentation');
});

test('Criterion 3: Stranger wallet receives NOT_ISSUED and baseline 1024 image', async () => {
  const confirmedWallet = '0x2222222222222222222222222222222222222222';
  const strangerWallet = '0x3333333333333333333333333333333333333333';
  const { env, mockSupabaseFetch } = createMockEnv(new Set([confirmedWallet]));

  // Stranger queries authorization -> NOT_ISSUED
  const authReq = new Request('https://smapworks.art/api/acquisition-authorization', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'https://smapworks.art',
    },
    body: JSON.stringify({ action: 'get', walletAddress: strangerWallet }),
  });
  const authRes = await handleAcquisitionAuthorization(
    authReq,
    { origin: 'https://smapworks.art', supabaseUrl: env.SUPABASE_URL, serverKey: env.SUPABASE_SECRET_KEY },
    mockSupabaseFetch
  );
  assert.equal(authRes.status, 200);
  const authData = await authRes.json();
  assert.equal(authData.status, 'NOT_ISSUED');

  // Ambient GET frame curator image -> baseline
  const imgReq = new Request('https://smapworks.art/api/frame-curator-image');
  const imgRes = await smapworksWorker.fetch(imgReq, env);
  assert.equal(imgRes.status, 200);
  const imgBuf = Buffer.from(await imgRes.arrayBuffer());
  assert.equal(sha256(imgBuf), BASELINE_HASH);

  // Stranger passing its unconfirmed wallet address -> baseline
  const strangerImgReq = new Request('https://smapworks.art/api/frame-curator-image', {
    headers: { 'x-wallet-address': strangerWallet },
  });
  const strangerImgRes = await smapworksWorker.fetch(strangerImgReq, env);
  assert.equal(strangerImgRes.status, 200);
  const strangerImgBuf = Buffer.from(await strangerImgRes.arrayBuffer());
  assert.equal(sha256(strangerImgBuf), BASELINE_HASH, 'Stranger wallet must fail closed to baseline');
});

test('Criterion 4: Sanctum Steward presentation endpoint delivers 512x512', async () => {
  const { env } = createMockEnv();
  const req = new Request('https://smapworks.art/api/steward-image');
  const res = await smapworksWorker.fetch(req, env);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('cache-control'), 'private, no-store');
  const buf = Buffer.from(await res.arrayBuffer());
  assert.equal(sha256(buf), INVITED_512_HASH);
});

test('Criterion 5: Query params, headers spoofing, and invalid methods fail closed', async () => {
  const confirmedWallet = '0x2222222222222222222222222222222222222222';
  const unconfirmedWallet = '0x9999999999999999999999999999999999999999';
  const { env } = createMockEnv(new Set([confirmedWallet]));

  // 1. Query parameter injection must return 400 Bad Request
  const q1 = await smapworksWorker.fetch(new Request('https://smapworks.art/api/frame-curator-image?wallet=' + confirmedWallet), env);
  assert.equal(q1.status, 400);

  const q2 = await smapworksWorker.fetch(new Request('https://smapworks.art/api/frame-curator-image?preview=true'), env);
  assert.equal(q2.status, 400);

  // 2. Unconfirmed client header spoofing must fail closed to baseline
  const spoofedHeaderReq = new Request('https://smapworks.art/api/frame-curator-image', {
    headers: {
      'x-wallet-address': unconfirmedWallet,
      'x-frame-curator-entitlement': 'INVITED_FRAME_CURATOR_FULL_PRESENTATION',
    },
  });
  const spoofedRes = await smapworksWorker.fetch(spoofedHeaderReq, env);
  assert.equal(spoofedRes.status, 200);
  assert.equal(sha256(Buffer.from(await spoofedRes.arrayBuffer())), BASELINE_HASH);

  // 3. Invalid HTTP Method must return 405 Method Not Allowed
  const postReq = new Request('https://smapworks.art/api/frame-curator-image', { method: 'POST' });
  const postRes = await smapworksWorker.fetch(postReq, env);
  assert.equal(postRes.status, 405);
});

import assert from 'node:assert/strict';
import test from 'node:test';
import authorityWorker from '../../../three-brushstrokes-authority-worker/worker.js';

const env = {
  THREE_BRUSHSTROKES_UPSTREAM_URL: 'https://supabase.example/functions/v1/three-brushstrokes-authority',
  THREE_BRUSHSTROKES_WORKER_AUTH_CURRENT: 'local-test-worker-secret',
};

async function withFetch(fake, action) {
  const original = globalThis.fetch;
  globalThis.fetch = fake;
  try { return await action(); } finally { globalThis.fetch = original; }
}

test('public submission adapter strips the session token and emits a secure opaque cookie', async () => {
  let forwarded;
  const response = await withFetch(async (_url, init) => {
    forwarded = init;
    return new Response(JSON.stringify({ submissionId: 's-1', status: 'PENDING_ARTIST_REVIEW', sessionToken: 'opaque-server-token', sessionExpiresAt: 'future' }), { status: 201 });
  }, () => authorityWorker.fetch(new Request('https://smapworks.art/api/three-brushstrokes', {
    method: 'POST',
    headers: { origin: 'https://smapworks.art', 'content-type': 'application/json' },
    body: JSON.stringify({ action: 'submit' }),
  }), env));
  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { submissionId: 's-1', status: 'PENDING_ARTIST_REVIEW' });
  const cookie = response.headers.get('set-cookie') ?? '';
  assert.match(cookie, /^__Host-hs-frame-session=opaque-server-token;/);
  assert.match(cookie, /HttpOnly; Secure; SameSite=Strict/);
  assert.equal(forwarded.headers['x-hs-3b-signature'].length, 64);
  assert.equal(forwarded.headers['x-hs-3b-signature'].includes(env.THREE_BRUSHSTROKES_WORKER_AUTH_CURRENT), false);
});

test('adapter rejects malformed or cross-origin public requests before the upstream authority', async () => {
  let called = false;
  const fake = async () => { called = true; return new Response('{}'); };
  const method = await withFetch(fake, () => authorityWorker.fetch(new Request('https://smapworks.art/api/three-brushstrokes', { method: 'GET' }), env));
  assert.equal(method.status, 405);
  const crossOrigin = await withFetch(fake, () => authorityWorker.fetch(new Request('https://smapworks.art/api/three-brushstrokes', {
    method: 'POST', headers: { origin: 'https://evil.example', 'content-type': 'application/json' }, body: '{}',
  }), env));
  assert.equal(crossOrigin.status, 403);
  assert.equal(called, false);
});

test('missing, forged, or query-derived client state never elevates frame image entitlement', async () => {
  const absent = await authorityWorker.fetch(new Request('https://smapworks.art/api/frame-curator-image?role=STEWARD'), env);
  assert.deepEqual(await absent.json(), { entitlement: 'BASELINE' });
  const forged = await withFetch(async () => new Response(JSON.stringify({ entitlement: 'BASELINE' })), () => authorityWorker.fetch(new Request('https://smapworks.art/api/frame-curator-image?invited=true', {
    headers: { cookie: '__Host-hs-frame-session=forged-local-value' },
  }), env));
  assert.deepEqual(await forged.json(), { entitlement: 'BASELINE' });
});

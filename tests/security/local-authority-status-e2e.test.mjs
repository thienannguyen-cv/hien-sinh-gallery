import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { privateKeyToAccount } from 'viem/accounts';

const port = 3013;
const base = `http://127.0.0.1:${port}`;
const origin = 'http://127.0.0.1:5174';
const baselineHash = 'dc897efc99468a1482e736d4d8f05b0b55555244c835d9731c6a208e908ea260';
const invitedHash = '78e49014256c39102f0e3dc6b3a30098076276b63029a2395ac275156f95cce1';
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const account = privateKeyToAccount(`0x${'41'.repeat(32)}`);
const galleryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function startAdapter() {
  const child = spawn(process.execPath, ['dev-adapter.mjs'], { cwd: galleryRoot, env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '';
  child.stdout.on('data', chunk => { output += String(chunk); });
  child.stderr.on('data', chunk => { output += String(chunk); });
  return { child, output: () => output };
}
async function waitFor(fn, child, timeoutMs = 30000) {
  // Startup competes with other test processes on Windows. Wait for readiness,
  // not a two-second performance deadline; keep all authority assertions intact.
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const value = fn();
    if (value) return value;
    if (child?.exitCode !== null && child?.exitCode !== undefined) {
      throw new Error(`fixture exited before readiness (code ${child.exitCode})`);
    }
    await new Promise(resolve => setTimeout(resolve, 25));
  }
  // Adapter output can contain an ephemeral review credential. Never echo it.
  throw new Error(`fixture readiness timeout after ${timeoutMs}ms`);
}
async function json(path, init = {}) { const response = await fetch(`${base}${path}`, init); return { response, body: await response.json() }; }
async function createSubmission() {
  const contributions = ['fixture-one', 'fixture-two', 'fixture-three'];
  const commitmentSha256 = sha(JSON.stringify({ version: 1, contributions }));
  const { body: challenge } = await json('/api/three-brushstrokes', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'issue_challenge', walletAddress: account.address, commitmentSha256, chainId: 1, origin }) });
  const signature = await account.signTypedData(challenge.typedData);
  const clientTypedDataDigest = sha(JSON.stringify(challenge.typedData));
  const { response, body } = await json('/api/three-brushstrokes', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'submit', walletAddress: account.address, nonce: challenge.nonce, signature, contributions, chainId: 1, origin, clientTypedDataDigest }) });
  assert.equal(response.status, 201);
  return { submissionId: body.submissionId, cookie: response.headers.get('set-cookie').split(';')[0] };
}
async function status(cookie) { return json('/api/three-brushstrokes-status', { headers: { cookie } }); }
async function image(cookie = '') { const response = await fetch(`${base}/api/frame-curator-image`, { headers: cookie ? { cookie } : {} }); return { response, hash: sha(Buffer.from(await response.arrayBuffer())) }; }

test('corrected local authority status converges through confirm, invitation, revocation, and negative decision', async () => {
  const adapter = startAdapter();
  try {
    const ready = () => adapter.output().includes(`running on port ${port}`);
    await waitFor(ready, adapter.child);
    const pending = await createSubmission();
    const token = await waitFor(() => adapter.output().match(new RegExp(`LOCAL_ARTIST_REVIEW_CREDENTIAL submission=${pending.submissionId} expires_at=[^ ]+ credential=([^\\s]+)`))?.[1]);
    let result = await status(pending.cookie); assert.equal(result.body.status, 'PENDING_ARTIST_REVIEW');
    let frame = await image(pending.cookie); assert.equal(frame.hash, baselineHash); assert.equal(frame.response.headers.get('cache-control'), 'private, no-store');
    result = await json('/api/local-artist-review', { method: 'POST', headers: { 'content-type': 'application/json', 'x-local-artist-review': token }, body: JSON.stringify({ submissionId: pending.submissionId, action: 'confirm' }) });
    assert.equal(result.body.status, 'STEWARDSHIP_INVITATION_ISSUED'); assert.equal(result.body.invitationIssued, true);
    result = await status(pending.cookie); assert.equal(result.body.status, 'STEWARDSHIP_INVITATION_ISSUED'); assert.equal(result.body.invitationIssued, true);
    frame = await image(pending.cookie); assert.equal(frame.hash, invitedHash);
    // Re-entry/reload is another authoritative read, not browser-local state.
    result = await status(pending.cookie); assert.equal(result.body.status, 'STEWARDSHIP_INVITATION_ISSUED');
    // Disconnect does not erase a server-backed session; forged client state does not grant bytes.
    frame = await image(pending.cookie); assert.equal(frame.hash, invitedHash);
    frame = await image('hs-frame-session=forged'); assert.equal(frame.hash, baselineHash);
    frame = await image(); assert.equal(frame.hash, baselineHash);
    result = await json('/api/local-artist-review', { method: 'POST', headers: { 'content-type': 'application/json', 'x-local-artist-review': token }, body: JSON.stringify({ submissionId: pending.submissionId, action: 'revoke_invitation' }) });
    assert.equal(result.body.revoked, true);
    frame = await image(pending.cookie); assert.equal(frame.hash, baselineHash);

    const negative = await createSubmission();
    const negativeToken = await waitFor(() => adapter.output().match(new RegExp(`LOCAL_ARTIST_REVIEW_CREDENTIAL submission=${negative.submissionId} expires_at=[^ ]+ credential=([^\\s]+)`))?.[1]);
    result = await json('/api/local-artist-review', { method: 'POST', headers: { 'content-type': 'application/json', 'x-local-artist-review': negativeToken }, body: JSON.stringify({ submissionId: negative.submissionId, action: 'do_not_confirm' }) });
    assert.equal(result.body.status, 'ENCOUNTER_EVIDENCE_NOT_CONFIRMED'); assert.equal(result.body.invitationIssued, false);
    result = await status(negative.cookie); assert.equal(result.body.status, 'ENCOUNTER_EVIDENCE_NOT_CONFIRMED');
    frame = await image(negative.cookie); assert.equal(frame.hash, baselineHash);
  } finally { adapter.child.kill(); }
});

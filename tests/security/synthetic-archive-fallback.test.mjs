import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import http from 'node:http';
import {
  PAINTING_CANONICAL_PATHS,
  getFrameCanonicalPaths,
  resolveCanonicalMemberPaths,
  generateSyntheticZip,
  listZipEntries,
  readZipEntry,
  handleSyntheticTransmission,
  setOwnershipVerifierForTesting,
  setAuthorizationVerifierForTesting,
  getSyntheticDownload,
} from '../../dev-archive-fallback.mjs';
import { proxyArchiveRequest } from '../../../api-worker/archive-proxy.js';

test('Token 0 resolves exactly the 16 expected canonical member paths', () => {
  const paths = resolveCanonicalMemberPaths(0, 'H_PAINTING_PACKAGE');
  assert.equal(paths.length, 16, 'Token 0 must have exactly 16 paths');
  assert.deepEqual([...paths].sort(), [...PAINTING_CANONICAL_PATHS].sort());

  const expected16 = [
    'PACKAGE-MANIFEST.json',
    'READ-ME-FIRST.md',
    '_reveal/ARCHIVE-MAP.md',
    '_reveal/CARE-VERIFICATION.md',
    '_reveal/README.en.md',
    '_reveal/README.md',
    '_reveal/effective-verbal-context.md',
    '_reveal/painting/Manifesto_Curatorial_Statement.md',
    '_reveal/painting/PROVENANCE.md',
    '_reveal/painting/The_Ritual_Prompts.md',
    '_reveal/painting/condense_masterpiece.py',
    '_reveal/painting/condensed_masterpiece.png',
    '_reveal/painting/seeds/logo-banner-offset.svg',
    '_reveal/painting/seeds/logo-mark.svg',
    '_reveal/record-schemas/ACCESSION-RECORD.schema.json',
    '_reveal/record-schemas/SUCCESSION-RECORD.schema.json',
  ];
  assert.deepEqual([...paths].sort(), [...expected16].sort());

  // Also accepts H_CORE
  const pathsCore = resolveCanonicalMemberPaths(0, 'H_CORE');
  assert.equal(pathsCore.length, 16);
});

test('Each Frame token (1..9) resolves exactly its 11 expected canonical member paths', () => {
  const expected11 = [
    'PACKAGE-MANIFEST.json',
    'READ-ME-FIRST.md',
    '_reveal/README.en.md',
    '_reveal/README.md',
    '_reveal/effective-verbal-context.md',
    '_reveal/frame/FRAME-CURATOR-CONTINUATION.md',
    '_reveal/frame/TRAJECTORY-TEMPLATE.md',
    '_reveal/frame/frame-template.en.md',
    '_reveal/frame/frame-template.md',
    '_reveal/frame/logo-banner-offset.svg',
    '_reveal/frame/logo-mark.svg',
  ];

  for (let tokenId = 1; tokenId <= 9; tokenId++) {
    const paths = resolveCanonicalMemberPaths(tokenId, 'H_FRAME_PACKAGE');
    assert.equal(paths.length, 11, `Frame ${tokenId} must have exactly 11 paths`);
    assert.deepEqual([...paths].sort(), [...expected11].sort());
    assert.deepEqual([...paths].sort(), [...getFrameCanonicalPaths(tokenId)].sort());
  }
});

test('Asset type and token ID mismatches are strictly rejected', () => {
  assert.throws(() => resolveCanonicalMemberPaths(0, 'H_FRAME_PACKAGE'), /Asset type mismatch/);
  assert.throws(() => resolveCanonicalMemberPaths(1, 'H_PAINTING_PACKAGE'), /Asset type mismatch/);
  assert.throws(() => resolveCanonicalMemberPaths(5, 'H_CORE'), /Asset type mismatch/);
  assert.throws(() => resolveCanonicalMemberPaths(10, 'H_FRAME_PACKAGE'), /Invalid token ID/);
  assert.throws(() => resolveCanonicalMemberPaths(-1, 'H_FRAME_PACKAGE'), /Invalid token ID/);
});

test('Synthetic ZIP contains exactly the expected member paths and assetHash equals actual ZIP SHA-256', () => {
  // Test Token 0
  const p = generateSyntheticZip(0, 'H_PAINTING_PACKAGE');
  assert.equal(p.filename, 'Hien-Sinh-Painting.zip');
  const pEntries = listZipEntries(p.zipBuffer);
  assert.equal(pEntries.length, 16);
  assert.deepEqual([...pEntries].sort(), [...PAINTING_CANONICAL_PATHS].sort());

  const computedHash0 = crypto.createHash('sha256').update(p.zipBuffer).digest('hex');
  assert.equal(p.assetHash, computedHash0, 'assetHash must equal SHA-256 of actual served zip buffer');

  // Test Frame 05
  const f5 = generateSyntheticZip(5, 'H_FRAME_PACKAGE');
  assert.equal(f5.filename, 'Hien-Sinh-Frame-05.zip');
  const f5Entries = listZipEntries(f5.zipBuffer);
  assert.equal(f5Entries.length, 11);
  assert.deepEqual([...f5Entries].sort(), [...getFrameCanonicalPaths(5)].sort());

  const computedHash5 = crypto.createHash('sha256').update(f5.zipBuffer).digest('hex');
  assert.equal(f5.assetHash, computedHash5, 'assetHash must equal SHA-256 of actual served zip buffer');
});

test('ZIP members are explicitly marked TEST_FALLBACK_NOT_CANONICAL and not real hashes', () => {
  const p = generateSyntheticZip(0, 'H_PAINTING_PACKAGE');
  const readme = readZipEntry(p.zipBuffer, 'READ-ME-FIRST.md').toString('utf8');
  assert.match(readme, /TEST_FALLBACK_NOT_CANONICAL/);
  assert.match(readme, /Canonical membership != canonical bytes/);

  const manifestRaw = readZipEntry(p.zipBuffer, 'PACKAGE-MANIFEST.json').toString('utf8');
  const manifest = JSON.parse(manifestRaw);
  assert.equal(manifest.status, 'TEST_FALLBACK_NOT_CANONICAL');
  assert.equal(manifest.package_type, 'painting');
  assert.equal(manifest.token_scope, 0);
  assert.equal(manifest.frame_token_id, null);
  assert.equal(manifest.files.length, 15);

  // Check that member hashes are NOT the canonical roots
  const pngEntry = manifest.files.find(f => f.path === '_reveal/painting/condensed_masterpiece.png');
  assert.ok(pngEntry);
  assert.notEqual(
    pngEntry.sha256,
    '190dfcfc8439c1613c149e72088c0bd32eefa66f2ded7cfbc0f250640b146d8e',
    'Synthetic member must NOT pretend to have canonical H_CORE hash'
  );
});

test('Frame-specific XX identity is preserved in synthetic ZIP members', () => {
  for (let id = 1; id <= 9; id++) {
    const f = generateSyntheticZip(id, 'H_FRAME_PACKAGE');
    const xx = String(id).padStart(2, '0');
    assert.equal(f.filename, `Hien-Sinh-Frame-${xx}.zip`);

    const continuation = readZipEntry(f.zipBuffer, '_reveal/frame/FRAME-CURATOR-CONTINUATION.md').toString('utf8');
    assert.match(continuation, new RegExp(`Frame ${xx}`));
    assert.match(continuation, new RegExp(`\\*\\*FRAME ${xx}\\*\\*`));
    assert.match(continuation, /TEST_FALLBACK_NOT_CANONICAL/);

    const readmeVi = readZipEntry(f.zipBuffer, '_reveal/README.md').toString('utf8');
    assert.match(readmeVi, new RegExp(`Frame ${xx}`));

    const readmeEn = readZipEntry(f.zipBuffer, '_reveal/README.en.md').toString('utf8');
    assert.match(readmeEn, new RegExp(`Frame ${xx}`));

    const manifest = JSON.parse(readZipEntry(f.zipBuffer, 'PACKAGE-MANIFEST.json').toString('utf8'));
    assert.equal(manifest.token_scope, id);
    assert.equal(manifest.frame_token_id, id);
  }
});

test('Ownership gate: grants owner and denies non-owner wallet', async () => {
  const ownerAddress = '0x1111111111111111111111111111111111111111';
  const strangerAddress = '0x2222222222222222222222222222222222222222';

  setOwnershipVerifierForTesting((addr, tokenId) => {
    return addr.toLowerCase() === ownerAddress.toLowerCase() && tokenId === 5;
  });

  try {
    // Non-owner wallet request
    await assert.rejects(
      () => handleSyntheticTransmission(
        { address: strangerAddress, tokenId: 5, assetType: 'H_FRAME_PACKAGE' },
        'http://127.0.0.1:3001'
      ),
      (err) => {
        assert.equal(err.message, 'NOT_CURRENT_OWNER');
        assert.equal(err.status, 403);
        return true;
      }
    );

    // Owner wallet request
    const result = await handleSyntheticTransmission(
      { address: ownerAddress, tokenId: 5, assetType: 'H_FRAME_PACKAGE' },
      'http://127.0.0.1:3001'
    );

    assert.equal(result.status, 'TRANSMISSION_GRANTED');
    assert.match(result.signedUrl, /^http:\/\/127\.0\.0\.1:3001\/local-archive-download\/[a-f0-9-]+$/);
    assert.equal(result.archiveCommitment, 'TEST_FALLBACK_NOT_CANONICAL');
    assert.equal(result.disclaimer, 'TEST_FALLBACK_NOT_CANONICAL');

    const downloadId = result.signedUrl.split('/').pop();
    const stored = getSyntheticDownload(downloadId);
    assert.ok(stored);
    assert.equal(stored.filename, 'Hien-Sinh-Frame-05.zip');
    assert.equal(stored.assetHash, result.assetHash);
    assert.equal(crypto.createHash('sha256').update(stored.buffer).digest('hex'), result.assetHash);
  } finally {
    setOwnershipVerifierForTesting(null);
  }
});

test('Painting #0 entitlement in fallback: requires BOTH ownership and acquisition authorization', async () => {
  const ownerAddress = '0x1111111111111111111111111111111111111111';

  setOwnershipVerifierForTesting((addr, tokenId) => {
    return addr.toLowerCase() === ownerAddress.toLowerCase() && tokenId === 0;
  });

  try {
    // 1. Owner WITHOUT authorization history -> rejected with ACQUISITION_AUTHORIZATION_REQUIRED
    setAuthorizationVerifierForTesting(() => false);
    await assert.rejects(
      () => handleSyntheticTransmission(
        { address: ownerAddress, tokenId: 0, assetType: 'H_PAINTING_PACKAGE' },
        'http://127.0.0.1:3001'
      ),
      (err) => {
        assert.equal(err.message, 'ACQUISITION_AUTHORIZATION_REQUIRED');
        assert.equal(err.status, 403);
        return true;
      }
    );

    // 2. Owner WITH authorization history -> granted
    setAuthorizationVerifierForTesting((addr) => addr.toLowerCase() === ownerAddress.toLowerCase());
    const res = await handleSyntheticTransmission(
      { address: ownerAddress, tokenId: 0, assetType: 'H_PAINTING_PACKAGE' },
      'http://127.0.0.1:3001'
    );
    assert.equal(res.status, 'TRANSMISSION_GRANTED');
    assert.match(res.signedUrl, /^http:\/\/127\.0\.0\.1:3001\/local-archive-download\/[a-f0-9-]+$/);
  } finally {
    setOwnershipVerifierForTesting(null);
    setAuthorizationVerifierForTesting(null);
  }
});

test('Production proxy behavior is preserved unchanged when ARCHIVE_TRANSMISSION_LOCAL_URL is configured', async () => {
  const origin = 'http://127.0.0.1:5174';
  const localUpstream = 'http://127.0.0.1:55325/transmit-artwork';
  let proxiedRequestReceived = false;

  const mockUpstreamFetcher = async (url, init) => {
    proxiedRequestReceived = true;
    assert.equal(url, localUpstream);
    return new Response(JSON.stringify({ status: 'PROXIED_PRODUCTION_RESPONSE' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };

  const request = new Request('http://127.0.0.1:3001/api/transmit-artwork', {
    method: 'POST',
    headers: {
      origin,
      'content-type': 'application/json',
      'content-length': '50',
    },
    body: JSON.stringify({ action: 'transmit', address: '0x1111111111111111111111111111111111111111', tokenId: 0, assetType: 'H_PAINTING_PACKAGE' }),
  });

  const response = await proxyArchiveRequest(
    request,
    { origin, endpoint: localUpstream, local: true },
    mockUpstreamFetcher
  );

  assert.equal(response.status, 200);
  const json = await response.json();
  assert.equal(json.status, 'PROXIED_PRODUCTION_RESPONSE');
  assert.equal(proxiedRequestReceived, true);
});

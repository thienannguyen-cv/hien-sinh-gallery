import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Candidate paths
const CANDIDATE_ROOT = path.resolve(__dirname, '../../..');
const PACKAGES_DIR = path.join(CANDIDATE_ROOT, 'operator/canonical-packages');
const MASTER_MANIFEST_PATH = path.join(PACKAGES_DIR, 'CANONICAL-RELEASE-ARTIFACT-MANIFEST.json');

// Root commitments
const ROOT_COMMITMENTS_CANDIDATES = [
  path.join(CANDIDATE_ROOT, '00_PUBLIC/ROOT-COMMITMENTS.json'),
  path.resolve(CANDIDATE_ROOT, '../../00_PUBLIC/ROOT-COMMITMENTS.json'),
  'C:/Users/Admin/Downloads/Commercial Images/_Package/Hien Sinh/00_PUBLIC/ROOT-COMMITMENTS.json',
];
let rootCommitmentsPath = ROOT_COMMITMENTS_CANDIDATES.find(p => fs.existsSync(p));
const ROOT_COMMITMENTS = JSON.parse(fs.readFileSync(rootCommitmentsPath, 'utf8'));

// Constitutive manifest
const CONSTITUTIVE_MANIFEST_CANDIDATES = [
  path.join(CANDIDATE_ROOT, 'manifests/constitutive.manifest.json'),
  path.resolve(CANDIDATE_ROOT, '../manifests/constitutive.manifest.json'),
  'C:/Users/Admin/Downloads/Commercial Images/_Package/Hien Sinh/_operator_DO-NOT-PUBLISH/manifests/constitutive.manifest.json',
];
let constitutiveManifestPath = CONSTITUTIVE_MANIFEST_CANDIDATES.find(p => fs.existsSync(p));
const CONSTITUTIVE_MANIFEST = JSON.parse(fs.readFileSync(constitutiveManifestPath, 'utf8'));

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function extractZip(buf) {
  const entries = new Map();
  let pos = 0;
  while (pos < buf.length - 4) {
    if (buf.readUInt32LE(pos) === 0x02014b50) {
      const nameLen = buf.readUInt16LE(pos + 28);
      const extraLen = buf.readUInt16LE(pos + 30);
      const commentLen = buf.readUInt16LE(pos + 32);
      const name = buf.toString('utf8', pos + 46, pos + 46 + nameLen);
      const localOffset = buf.readUInt32LE(pos + 42);
      const size = buf.readUInt32LE(pos + 24);
      const crc = buf.readUInt32LE(pos + 16);

      const localNameLen = buf.readUInt16LE(localOffset + 26);
      const localExtraLen = buf.readUInt16LE(localOffset + 28);
      const dataStart = localOffset + 30 + localNameLen + localExtraLen;
      const data = buf.subarray(dataStart, dataStart + size);

      const computedCrc = zlib.crc32(data);
      if (computedCrc !== crc) {
        throw new Error(`CRC32 mismatch for ${name}`);
      }

      entries.set(name, data);
      pos += 46 + nameLen + extraLen + commentLen;
    } else {
      pos++;
    }
  }
  return entries;
}

test('Canonical Release Artifact Manifest exists and contains exactly 10 packages', () => {
  assert.ok(fs.existsSync(MASTER_MANIFEST_PATH), 'Master manifest must exist');
  const manifest = JSON.parse(fs.readFileSync(MASTER_MANIFEST_PATH, 'utf8'));
  assert.equal(manifest.package_count, 10);
  assert.equal(manifest.packages.length, 10);
  assert.equal(manifest.release_id, 'hien-sinh-pre-release-2026-09-02');
  assert.equal(manifest.canonical_roots.H_CORE, ROOT_COMMITMENTS.roots.H_CORE);
  assert.equal(manifest.canonical_roots.H_CONSTITUTIVE, ROOT_COMMITMENTS.roots.H_CONSTITUTIVE);
});

test('All 10 canonical ZIP files exist with verified transport SHA-256 digests', () => {
  const manifest = JSON.parse(fs.readFileSync(MASTER_MANIFEST_PATH, 'utf8'));

  const expectedFilenames = [
    'Hien-Sinh-Painting.zip',
    ...Array.from({ length: 9 }, (_, i) => `Hien-Sinh-Frame-${String(i + 1).padStart(2, '0')}.zip`)
  ];

  for (const pkg of manifest.packages) {
    assert.ok(expectedFilenames.includes(pkg.filename), `Unexpected package filename: ${pkg.filename}`);
    const zipPath = path.join(PACKAGES_DIR, pkg.filename);
    assert.ok(fs.existsSync(zipPath), `ZIP file missing: ${pkg.filename}`);
    const zipBuf = fs.readFileSync(zipPath);
    assert.equal(zipBuf.length, pkg.bytes, `File size mismatch for ${pkg.filename}`);
    const computedTransportHash = sha256(zipBuf);
    assert.equal(computedTransportHash, pkg.transport_sha256, `Transport SHA-256 mismatch for ${pkg.filename}`);
  }
});

test('Painting package (Token 0) extracts exactly 16 members and verifies H_CORE & H_CONSTITUTIVE', () => {
  const manifest = JSON.parse(fs.readFileSync(MASTER_MANIFEST_PATH, 'utf8'));
  const paintingPkg = manifest.packages.find(p => p.token_id === 0);
  assert.ok(paintingPkg, 'Painting package record must exist');
  assert.equal(paintingPkg.file_count, 16);
  assert.equal(paintingPkg.asset_type, 'H_PAINTING_PACKAGE');

  const zipBuf = fs.readFileSync(path.join(PACKAGES_DIR, paintingPkg.filename));
  const entries = extractZip(zipBuf);
  assert.equal(entries.size, 16);

  // 1. Verify H_CORE
  const corePng = entries.get('_reveal/painting/condensed_masterpiece.png');
  assert.ok(corePng, 'condensed_masterpiece.png must be present');
  const coreHash = sha256(corePng);
  assert.equal(coreHash, ROOT_COMMITMENTS.roots.H_CORE, 'H_CORE hash must match exactly');

  // 2. Verify H_CONSTITUTIVE
  const constitutiveRecords = CONSTITUTIVE_MANIFEST.files.map(f => {
    const d = entries.get(f.path);
    assert.ok(d, `Constitutive member ${f.path} must be present`);
    return {
      bytes: d.length,
      path: f.path,
      sha256: sha256(d)
    };
  });

  function pyCanonicalJson(val) {
    const sortedKeys = (obj) => {
      if (typeof obj !== 'object' || obj === null) return obj;
      if (Array.isArray(obj)) return obj.map(sortedKeys);
      const sorted = {};
      for (const k of Object.keys(obj).sort()) {
        sorted[k] = sortedKeys(obj[k]);
      }
      return sorted;
    };
    return JSON.stringify(sortedKeys(val)) + '\n';
  }

  const constitutivePayload = {
    algorithm: 'sha256(canonical-json-v1)',
    files: constitutiveRecords
  };
  const constitutiveHash = sha256(Buffer.from(pyCanonicalJson(constitutivePayload), 'utf8'));
  assert.equal(constitutiveHash, ROOT_COMMITMENTS.roots.H_CONSTITUTIVE, 'H_CONSTITUTIVE hash must match');

  // 3. Verify zero frame or validation leakage
  for (const [entryPath] of entries) {
    assert.ok(!entryPath.includes('/frame/'), `Painting must not leak frame files: ${entryPath}`);
    assert.ok(!entryPath.includes('/validation/'), `Painting must not leak validation files: ${entryPath}`);
    assert.ok(!entryPath.includes('_operator'), `Painting must not leak operator files: ${entryPath}`);
  }

  // 4. Verify no synthetic fallback markers
  const readme = entries.get('READ-ME-FIRST.md').toString('utf8');
  assert.ok(!readme.includes('TEST_FALLBACK_NOT_CANONICAL'), 'Must not contain synthetic markers');
});

test('Each Frame package (Tokens 1..9) extracts exactly 11 members with isolated Frame identity and zero painting leaks', () => {
  const manifest = JSON.parse(fs.readFileSync(MASTER_MANIFEST_PATH, 'utf8'));

  for (let id = 1; id <= 9; id++) {
    const xx = String(id).padStart(2, '0');
    const framePkg = manifest.packages.find(p => p.token_id === id);
    assert.ok(framePkg, `Frame ${xx} package record must exist`);
    assert.equal(framePkg.file_count, 11);
    assert.equal(framePkg.asset_type, 'H_FRAME_PACKAGE');

    const zipBuf = fs.readFileSync(path.join(PACKAGES_DIR, framePkg.filename));
    const entries = extractZip(zipBuf);
    assert.equal(entries.size, 11);

    // 1. Verify Frame continuation identity
    const continuation = entries.get('_reveal/frame/FRAME-CURATOR-CONTINUATION.md').toString('utf8');
    assert.match(continuation, new RegExp(`Frame ${xx}`));
    assert.match(continuation, new RegExp(`\\*\\*FRAME ${xx}\\*\\*`));

    // 2. Verify zero painting, validation, or operator leakage
    for (const [entryPath] of entries) {
      assert.ok(!entryPath.includes('/painting/'), `Frame ${xx} must not leak painting files: ${entryPath}`);
      assert.ok(!entryPath.includes('/validation/'), `Frame ${xx} must not leak validation files: ${entryPath}`);
      assert.ok(!entryPath.includes('_operator'), `Frame ${xx} must not leak operator files: ${entryPath}`);
    }

    // 3. Verify member hash matches manifest exactly
    for (const m of framePkg.members) {
      const data = entries.get(m.path);
      assert.ok(data, `Missing member: ${m.path}`);
      assert.equal(data.length, m.bytes);
      assert.equal(sha256(data), m.sha256);
    }

    // 4. Verify no synthetic markers
    const readme = entries.get('READ-ME-FIRST.md').toString('utf8');
    assert.ok(!readme.includes('TEST_FALLBACK_NOT_CANONICAL'), 'Must not contain synthetic markers');
  }
});

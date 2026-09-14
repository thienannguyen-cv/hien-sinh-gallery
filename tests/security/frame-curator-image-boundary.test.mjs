import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import imageWorker from '../../../frame-curator-image-worker/worker.js';

const candidateRoot = new URL('../../../', import.meta.url);
const readCandidate = relativePath => readFile(new URL(relativePath, candidateRoot));

const designation = JSON.parse(await readCandidate('frame-curator-image-worker/ASSET-DESIGNATION.json'));

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function imageBinding(objects) {
  return {
    async get(key) {
      const value = objects[key];
      return value ? { body: new Blob([value]).stream(), httpMetadata: { contentType: 'image/png' } } : null;
    },
  };
}

test('Owner-designated local source bytes match the immutable image designation', async () => {
  const [baseline, invited] = await Promise.all([
    readCandidate(designation.baseline.sourcePath),
    readCandidate(designation.invited.sourcePath),
  ]);
  assert.equal(sha256(baseline), designation.baseline.sha256);
  assert.equal(sha256(invited), designation.invited.sha256);
});

test('server-authorized endpoint returns baseline without a valid internal entitlement', async () => {
  const baseline = Buffer.from('baseline');
  const invited = Buffer.from('invited');
  const env = {
    FRAME_CURATOR_IMAGES: imageBinding({
      [designation.baseline.objectKey]: baseline,
      [designation.invited.objectKey]: invited,
    }),
    FRAME_INVITATION_AUTHORITY: { async fetch() { return Response.json({ entitlement: 'DENIED' }); } },
  };
  const request = new Request('https://smapworks.art/api/frame-curator-image', {
    headers: { 'x-frame-curator-entitlement': 'INVITED_FRAME_CURATOR_FULL_PRESENTATION' },
  });
  const result = await imageWorker.fetch(request, env);
  assert.equal(result.status, 200);
  assert.equal(await result.text(), 'baseline');
  assert.equal(result.headers.get('cache-control'), 'private, no-store');
});

test('only the internal verified entitlement selects the invited presentation', async () => {
  const baseline = Buffer.from('baseline');
  const invited = Buffer.from('invited');
  const env = {
    FRAME_CURATOR_IMAGES: imageBinding({
      [designation.baseline.objectKey]: baseline,
      [designation.invited.objectKey]: invited,
    }),
    FRAME_INVITATION_AUTHORITY: {
      async fetch() { return Response.json({ entitlement: 'INVITED_FRAME_CURATOR_FULL_PRESENTATION' }); },
    },
  };
  const result = await imageWorker.fetch(new Request('https://smapworks.art/api/frame-curator-image'), env);
  assert.equal(result.status, 200);
  assert.equal(await result.text(), 'invited');
});

test('query parameters cannot select a presentation', async () => {
  const result = await imageWorker.fetch(
    new Request('https://smapworks.art/api/frame-curator-image?presentation=invited'),
    {},
  );
  assert.equal(result.status, 400);
});

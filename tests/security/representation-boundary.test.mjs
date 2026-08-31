import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import test from 'node:test';

const CANONICAL_PAINTING_HASH = '190dfcfc8439c1613c149e72088c0bd32eefa66f2ded7cfbc0f250640b146d8e';
const source = relativePath => readFile(new URL(`../../${relativePath}`, import.meta.url), 'utf8');
const fileBuffer = relativePath => readFile(new URL(`../../${relativePath}`, import.meta.url));

test('PUBLIC and Frame presentation never render canonical Painting material', async () => {
  const [threshold, atelier] = await Promise.all([
    source('src/components/gallery/ThresholdHall.tsx'),
    source('src/components/gallery/AtelierGallery.tsx'),
  ]);

  assert.match(threshold, /<PublicEncounterRepresentation\s*\/>/);
  assert.match(atelier, /<FrameSymbol\s+frameId=\{frame\.id\}\s*\/>/);
  assert.doesNotMatch(atelier, /condensed_masterpiece|supabase|reviewRevealed|isReviewRevealed|unlock/i);
});

test('browser-public assets contain one transformed encounter representation only', async () => {
  const publicBuf = await fileBuffer('public/assets/intersection-public.png');
  const publicHash = createHash('sha256').update(publicBuf).digest('hex');
  assert.notEqual(publicHash, CANONICAL_PAINTING_HASH, 'intersection-public.png must not equal H_CORE');
  const assetNames = await readdir(new URL('../../public/assets/', import.meta.url));
  assert.deepEqual(assetNames.sort(), ['frame-cover-banner.svg', 'intersection-public.png']);
});

test('IntersectionEnvironment never selects a relationship-specific browser asset', async () => {
  const intersectionEnv = await source('src/components/gallery/IntersectionEnvironment.tsx');
  assert.match(intersectionEnv, /\/assets\/intersection-public\.png/);
  assert.doesNotMatch(intersectionEnv, /intersection-frame\.png|intersection-allowed\.png|condensed_masterpiece_512\.png/);
});

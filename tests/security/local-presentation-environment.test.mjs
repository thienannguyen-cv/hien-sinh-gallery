import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('local presentation requires a signed dev-server environment and loopback; role selects a perspective', async () => {
  const [environment, canvas, vite] = await Promise.all([
    readFile(new URL('../../src/security/useLocalPresentationEnvironment.ts', import.meta.url), 'utf8'),
    readFile(new URL('../../src/components/GalleryCanvas.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../../vite.config.ts', import.meta.url), 'utf8'),
  ]);

  assert.match(environment, /__HIEN_SINH_LOCAL_PRESENTATION_ENABLED__/);
  assert.match(environment, /!import\.meta\.env\.DEV/);
  assert.match(environment, /LOCAL_HOSTS\.has\(window\.location\.hostname\)/);
  assert.match(environment, /params\.get\('role'\)/);
  assert.match(environment, /normalizePerspective\(params\.get\('role'\)\) \?\? 'PUBLIC'/);
  assert.match(environment, /trim\(\)\.toUpperCase\(\)/);
  assert.doesNotMatch(environment, /params\.get\('presentation'\)/);
  assert.match(vite, /verifyLocalPresentationEnvironment/);
  assert.match(vite, /command === 'serve'/);
  assert.match(vite, /HIEN_SINH_LOCAL_PRESENTATION_PUBLIC_KEY_SPKI/);
  assert.match(vite, /HIEN_SINH_LOCAL_PRESENTATION_SIGNATURE/);
  assert.match(canvas, /useLocalPresentationEnvironment/);
  assert.doesNotMatch(canvas, /ExperienceReviewGate|useExperienceReview/);
});

test('STEWARD presentation remains the held Package 05 relation without creating a premium spatial tier', async () => {
  const [environment, canvas, interior] = await Promise.all([
    readFile(new URL('../../src/security/useLocalPresentationEnvironment.ts', import.meta.url), 'utf8'),
    readFile(new URL('../../src/components/GalleryCanvas.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../../src/components/gallery/FrameInterior.tsx', import.meta.url), 'utf8'),
  ]);

  assert.match(environment, /requested === 'STEWARD'.*completePackageId/s);
  assert.match(canvas, /activePerspective === 'STEWARD'[\s\S]*activeFrameIsComplete[\s\S]*activeFrameHeld/);
  assert.match(canvas, /curatorRole=\{completeStewardRelation \? 'STEWARD' : 'PRACTITIONER'\}/);
  assert.doesNotMatch(canvas, /SanctumGallery|ring === 2|setRing\(2\)/);
  assert.match(interior, /\{relationshipHeld && \(/);
  assert.doesNotMatch(interior, /DESCEND TO SANCTUM|RESUME SESSION|TRANSACTION CONFIRMED|rehearseAcquisition/);
  assert.match(interior, /TRANSACTION OPENS AFTER VERIFIED DEPLOYMENT/);
  assert.match(interior, /\{!relationshipHeld && isCompletePackage && accessionStep === 'brushstrokes' && \(/);
});

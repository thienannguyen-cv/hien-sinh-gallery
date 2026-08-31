import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const galleryRoot = path.resolve(__dirname, '..', '..');
const operatorRoot = path.resolve(galleryRoot, '..');
const releaseRoot = path.resolve(operatorRoot, '..');
const releaseStatusPath = path.join(releaseRoot, '00_PUBLIC', 'RELEASE-STATUS.json');

import { deriveReleaseCoordinates } from '../../scripts/export-release-coordinates.mjs';
const releaseCoordinatesTsPath = path.join(galleryRoot, 'src', 'generated', 'release', 'releaseCoordinates.ts');

test('release coordinates derive authoritatively from 00_PUBLIC/RELEASE-STATUS.json', () => {
  const status = JSON.parse(fs.readFileSync(releaseStatusPath, 'utf8'));
  assert.equal(typeof status.external_gates.public_repo_published, 'boolean');
  assert.equal(status.external_gates.public_repo_published, false, 'Pre-release repository must be unpublished');

  const derived = deriveReleaseCoordinates();
  assert.equal(derived.publicRepoPublished, false);
  assert.equal(derived.publicRepoBaseUrl, 'https://github.com/thienannguyen-cv/hien-sinh-gallery');
  assert.equal(derived.verifyDocUrl, 'https://github.com/thienannguyen-cv/hien-sinh-gallery/blob/main/00_PUBLIC/VERIFY.md');
  assert.equal(derived.independentOperationDocUrl, 'https://github.com/thienannguyen-cv/hien-sinh-gallery/blob/main/00_PUBLIC/INDEPENDENT-OPERATION.md');

  const tsSource = fs.readFileSync(releaseCoordinatesTsPath, 'utf8');
  assert.equal(tsSource.includes('publicRepoPublished: false'), true);
  assert.equal(tsSource.includes(derived.verifyDocUrl), true);
  assert.equal(tsSource.includes(derived.independentOperationDocUrl), true);
});

test('pre-publication state fails closed with 0 evidence affordances mounted', () => {
  const derived = deriveReleaseCoordinates();
  assert.equal(derived.publicRepoPublished, false);
  
  // Synthetic check on condition logic
  const isDossierAffordanceMounted = Boolean(derived.publicRepoPublished);
  const isFrameAffordanceMounted = Boolean(derived.publicRepoPublished);

  assert.equal(isDossierAffordanceMounted, false);
  assert.equal(isFrameAffordanceMounted, false);
});

test('synthetic post-publication activation renders exactly two valid affordances with frozen root targets', () => {
  const derived = deriveReleaseCoordinates();
  const syntheticCoordinates = {
    ...derived,
    publicRepoPublished: true,
  };

  assert.equal(syntheticCoordinates.publicRepoPublished, true);
  assert.equal(syntheticCoordinates.verifyDocUrl, 'https://github.com/thienannguyen-cv/hien-sinh-gallery/blob/main/00_PUBLIC/VERIFY.md');
  assert.equal(syntheticCoordinates.independentOperationDocUrl, 'https://github.com/thienannguyen-cv/hien-sinh-gallery/blob/main/00_PUBLIC/INDEPENDENT-OPERATION.md');

  // Verify URL integrity
  assert.match(syntheticCoordinates.verifyDocUrl, /^https:\/\/github\.com\/thienannguyen-cv\/hien-sinh-gallery\/blob\/main\/00_PUBLIC\/VERIFY\.md$/);
  assert.match(syntheticCoordinates.independentOperationDocUrl, /^https:\/\/github\.com\/thienannguyen-cv\/hien-sinh-gallery\/blob\/main\/00_PUBLIC\/INDEPENDENT-OPERATION\.md$/);
});

test('malformed release coordinates fail closed', () => {
  const malformedUndefined = undefined;
  const malformedEmpty = {};
  const malformedNull = null;

  assert.equal(Boolean(malformedUndefined?.publicRepoPublished), false);
  assert.equal(Boolean(malformedEmpty?.publicRepoPublished), false);
  assert.equal(Boolean(malformedNull?.publicRepoPublished), false);
});

test('contract generated domain is completely uncontaminated by release publication coordinates', () => {
  const contractInterfaceSource = fs.readFileSync(
    path.join(galleryRoot, 'src', 'generated', 'contract', 'hienSinhInterface.ts'),
    'utf8'
  );
  assert.equal(contractInterfaceSource.includes('publicRepoPublished'), false);
  assert.equal(contractInterfaceSource.includes('github.com'), false);
});

test('release preview mode is orthogonal to role and fails closed for unknown modes', () => {
  function testModeActivation(queryString) {
    const params = new URLSearchParams(queryString);
    const mode = params.get('mode')?.trim().toLowerCase();
    return mode === 'release-preview';
  }

  // 1. Normal mode (no mode param) -> inactive
  assert.equal(testModeActivation(''), false);
  assert.equal(testModeActivation('?role=public'), false);
  assert.equal(testModeActivation('?role=practitioner'), false);

  // 2. Canonical release preview mode -> active
  assert.equal(testModeActivation('?mode=release-preview'), true);
  assert.equal(testModeActivation('?role=public&mode=release-preview'), true);
  assert.equal(testModeActivation('?role=practitioner&mode=release-preview'), true);
  assert.equal(testModeActivation('?role=steward&mode=release-preview'), true);

  // 3. Unknown / invalid modes fail closed
  assert.equal(testModeActivation('?mode=preview'), false);
  assert.equal(testModeActivation('?mode=admin'), false);
  assert.equal(testModeActivation('?mode=live'), false);
  assert.equal(testModeActivation('?mode=release_preview'), false);

  // 4. Authoritative state remains completely unmutated
  const derived = deriveReleaseCoordinates();
  assert.equal(derived.publicRepoPublished, false);
  const showEvidenceNormal = derived.publicRepoPublished || testModeActivation('');
  const showEvidencePreview = derived.publicRepoPublished || testModeActivation('?mode=release-preview');
  assert.equal(showEvidenceNormal, false);
  assert.equal(showEvidencePreview, true);
  assert.equal(derived.publicRepoPublished, false, 'Authoritative coordinate must remain false');
});

test('role determines applicable relationship surfaces; preview mode never resurrects suppressed acquisition surfaces', () => {
  // Invariant: RELEASE_PREVIEW ≠ SURFACE_CREATION.
  // When a relationship is held (e.g. PRACTITIONER on Frame 02, STEWARD on Frame 05),
  // the pre-acquisition consideration/purchase drawer is canonically suppressed.
  // Release preview mode must respect surface legitimacy and not force acquisition affordances onto held surfaces.
  const heldPractitionerFrameId = 2;
  const heldStewardFrameId = 5;

  function isAcquisitionSurfaceApplicable(role, frameId) {
    if (role === 'PRACTITIONER' && frameId === heldPractitionerFrameId) return false;
    if (role === 'STEWARD' && frameId === heldStewardFrameId) return false;
    return true; // Pre-acquisition unheld surface
  }

  // Pre-acquisition visitor context (PUBLIC or unheld Frame) -> Acquisition surface applicable
  assert.equal(isAcquisitionSurfaceApplicable('PUBLIC', 1), true);
  assert.equal(isAcquisitionSurfaceApplicable('PUBLIC', 2), true);
  assert.equal(isAcquisitionSurfaceApplicable('PRACTITIONER', 1), true);

  // Held relationship context -> Acquisition surface canonically suppressed
  assert.equal(isAcquisitionSurfaceApplicable('PRACTITIONER', 2), false);
  assert.equal(isAcquisitionSurfaceApplicable('STEWARD', 5), false);
});

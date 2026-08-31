import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const galleryRoot = new URL('../../', import.meta.url);
const source = relativePath => readFile(new URL(relativePath, galleryRoot), 'utf8');

test('canonical Dossier Section 07 is preserved across Vietnamese and English master documents', async () => {
  const [dossierVn, dossierEn, infoRooms] = await Promise.all([
    source('../../00_PUBLIC/HIEN-SINH_dossier.md'),
    source('../../00_PUBLIC/HIEN-SINH_dossier.en.md'),
    source('src/components/gallery/InformationRooms.tsx'),
  ]);

  // Vietnamese canonical master
  assert.match(dossierVn, /## Cuộc gặp Giám tuyển và Phẩm giá của Curator/);
  assert.match(dossierVn, /### Tầng gặp gỡ công khai \(PUBLIC Encounter\)/);
  assert.match(dossierVn, /### Cấu trúc Văn phòng Giám tuyển/);
  assert.match(dossierVn, /### Bảy phẩm giá Hiến pháp \(The Seven Dignities\)/);
  assert.match(dossierVn, /Nhãn quan[\s\S]*Thính giác[\s\S]*Tiết chế[\s\S]*Hiếu khách[\s\S]*Công chính[\s\S]*Trung thành với dấu vết[\s\S]*Giữ ngưỡng/);

  // English derived access rendering
  assert.match(dossierEn, /## The Curatorial Encounter and the Dignities of the Curator/);
  assert.match(dossierEn, /### The Public Encounter/);
  assert.match(dossierEn, /### Architecture of the Curatorial Office/);
  assert.match(dossierEn, /### The Seven Dignities/);
  assert.match(dossierEn, /Sight[\s\S]*Hearing[\s\S]*Restraint[\s\S]*Hospitality[\s\S]*Justice[\s\S]*Fidelity[\s\S]*Threshold/);

  // Derived UI presentation in InformationRooms.tsx
  assert.match(infoRooms, /index="07"/);
  assert.match(infoRooms, /The curatorial encounter and dignities of the Curator/i);
  assert.match(infoRooms, /PUBLIC ENCOUNTER/);
  assert.match(infoRooms, /CURATORIAL OFFICE/);
  assert.match(infoRooms, /THE SEVEN DIGNITIES/);
  assert.match(infoRooms, /dossier-room__item-list/);
  assert.doesNotMatch(infoRooms, /<ul|<li/);
});

test('STEWARD and PRACTITIONER roles maintain visual continuity and dynamic unmasking', async () => {
  const [canvas, interior, intersection, adapter] = await Promise.all([
    source('src/components/GalleryCanvas.tsx'),
    source('src/components/gallery/FrameInterior.tsx'),
    source('src/components/gallery/IntersectionEnvironment.tsx'),
    source('dev-adapter.mjs'),
  ]);

  // GalleryCanvas provides steward image endpoint
  assert.match(canvas, /completeStewardRelation \? '\/api\/steward-image' : null/);
  assert.match(canvas, /stewardImageUrl=\{completeStewardRelation \? '\/api\/steward-image' : null\}/);

  // FrameInterior uses stewardImageUrl on outer card and forwards to ArchiveCuratorTerminal
  assert.match(interior, /backgroundImage:\s*`url\(\$\{\s*stewardImageUrl\s*\|\|\s*'\/assets\/intersection-public\.png'\s*\}\)`/);
  assert.match(interior, /<ArchiveCuratorTerminal[\s\S]*stewardImageUrl=\{stewardImageUrl\}/);

  // IntersectionEnvironment defines isPractitioner and handles dynamic corner unmasking
  assert.match(intersection, /const isPractitioner = role === 'PRACTITIONER';/);
  assert.match(intersection, /isPractitioner[\s\S]*'\/api\/practitioner-image'/);
  assert.match(intersection, /practitionerTrMaskOpacity/);
  assert.match(intersection, /practitionerBlMaskOpacity/);
  assert.match(intersection, /publicTlMaskOpacity/);
  assert.match(intersection, /publicBrMaskOpacity/);

  // Dev adapter endpoints and context paths
  assert.match(adapter, /\/steward-image/);
  assert.match(adapter, /\/practitioner-image/);
  assert.match(adapter, /archive_assets\/curator-contexts\/v2\/core\/CONTEXT-CORE\.vi\.md/);
});

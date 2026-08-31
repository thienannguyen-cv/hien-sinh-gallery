import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('public interface keeps production systems and transient staging labels out of exhibition copy', async () => {
  const files = await Promise.all([
    readFile(new URL('../../src/components/gallery/InformationRooms.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../../src/components/gallery/AtelierGallery.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../../src/components/gallery/FrameInterior.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../../src/components/gallery/ThresholdHall.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../../src/components/gallery/GalleryStatusBar.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../../src/components/gallery/CuratorTerminal.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../../src/components/gallery/ArchiveCuratorTerminal.tsx', import.meta.url), 'utf8'),
  ]);
  const interfaceSource = files.join('\n');

  assert.doesNotMatch(interfaceSource, /Gemini|Antigravity/i);
  assert.doesNotMatch(interfaceSource, /pre[- ]?release/i);
  assert.doesNotMatch(interfaceSource, /The entrance hall|Speak with the Curator to learn about/i);
  assert.match(
    files[0],
    /What is the origin of value: the artist, the brush, or the observer(?:&rsquo;|’|'|&#39;)s perception\?/i,
  );
});

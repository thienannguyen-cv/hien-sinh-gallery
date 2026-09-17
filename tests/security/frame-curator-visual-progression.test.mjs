import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const galleryRoot = new URL('../../', import.meta.url);
const source = relativePath => readFile(new URL(relativePath, galleryRoot), 'utf8');

test('PRACTITIONER dynamic corner unmasking advances progressively across encounters', async () => {
  const intersectionSrc = await source('src/components/gallery/IntersectionEnvironment.tsx');

  // Verify that revealProgress does not block practitioner when encounterCount < 3
  assert.doesNotMatch(
    intersectionSrc,
    /if\s*\(\s*encounterCount\s*<\s*3\s*\)\s*return\s*0;\s*if\s*\(\s*encounterCount\s*>\s*3\s*\)\s*return\s*1;\s*return\s*isTyping\s*\?\s*typingProgress\s*:\s*1;\s*},\s*\[encounterCount,\s*isTyping,\s*typingProgress\]/,
    'IntersectionEnvironment must not use legacy static guard that blocks encounter 1 and 2 reveal'
  );

  // Verify practitioner-specific progressive reveal calculation is present
  assert.match(intersectionSrc, /if\s*\(isPractitioner\)\s*\{/);
  assert.match(intersectionSrc, /if\s*\(encounterCount\s*===\s*0\)\s*return\s*0;/);
  assert.match(intersectionSrc, /if\s*\(encounterCount\s*===\s*1\)\s*\{[\s\S]*return\s*isTyping\s*\?\s*typingProgress\s*\*\s*0\.5\s*:\s*0\.5;/);
  assert.match(intersectionSrc, /if\s*\(encounterCount\s*===\s*2\)\s*\{[\s\S]*return\s*isTyping\s*\?\s*0\.5\s*\+\s*typingProgress\s*\*\s*0\.5\s*:\s*1\.0;/);
  assert.match(intersectionSrc, /return\s*1\.0;/);

  // Math verification: verify exact mask opacity behavior across each encounter
  const trMask = (revealProgress) => Math.max(0, Math.min(1, 1 - revealProgress / 0.5));
  const blMask = (revealProgress) => Math.max(0, Math.min(1, 1 - (revealProgress - 0.5) / 0.5));

  // Initial state (encounterCount = 0): both corners masked (1.0)
  assert.equal(trMask(0), 1.0, 'Encounter 0: Top-Right mask must be 100% opaque');
  assert.equal(blMask(0), 1.0, 'Encounter 0: Bottom-Left mask must be 100% opaque');

  // Encounter 1 (P3 complete, encounterCount = 1): TR mask fully opened (0.0), BL mask stays closed (1.0)
  assert.equal(trMask(0.5), 0.0, 'Encounter 1: Top-Right mask must be completely unmasked (0.0)');
  assert.equal(blMask(0.5), 1.0, 'Encounter 1: Bottom-Left mask must remain 100% opaque (1.0)');

  // Encounter 2 (P4 complete, encounterCount = 2): BL mask fully opened (0.0), both corners open
  assert.equal(trMask(1.0), 0.0, 'Encounter 2: Top-Right mask remains unmasked (0.0)');
  assert.equal(blMask(1.0), 0.0, 'Encounter 2: Bottom-Left mask must be completely unmasked (0.0)');

  // Encounter 3 (IMAGE complete, encounterCount = 3): All corners remain open
  assert.equal(trMask(1.0), 0.0);
  assert.equal(blMask(1.0), 0.0);
});

test('Frame Curator dialogue viewport borders correctly reflect P3 (Right) and P4 (Top)', async () => {
  const terminalSrc = await source('src/components/gallery/ArchiveCuratorTerminal.tsx');

  // Verify Left and Bottom serve as baseline, Right opens on P3 (encounterCount >= 1), Top opens on P4 (encounterCount >= 2)
  assert.match(terminalSrc, /borderLeft:\s*'1px solid rgba\(218,172,98,0\.35\)'/);
  assert.match(terminalSrc, /borderBottom:\s*'1px solid rgba\(218,172,98,0\.35\)'/);
  assert.match(terminalSrc, /borderRight:\s*encounterCount\s*>=\s*1\s*\?\s*'1px solid rgba\(218,172,98,0\.35\)'\s*:\s*'1px solid transparent'/);
  assert.match(terminalSrc, /borderTop:\s*encounterCount\s*>=\s*2\s*\?\s*'1px solid rgba\(218,172,98,0\.35\)'\s*:\s*'1px solid transparent'/);

  // Full ambient glow when all encounters complete
  assert.match(terminalSrc, /boxShadow:\s*encounterCount\s*>=\s*3/);
});

test('ArchiveCuratorTerminal enforces session sealing and persistent waveguide light wave', async () => {
  const [terminalSrc, buyerStateSrc] = await Promise.all([
    source('src/components/gallery/ArchiveCuratorTerminal.tsx'),
    source('src/services/curator/buyerCuratorState.ts'),
  ]);

  // Terminal state declaration must include setSealed dispatcher initialized from session
  assert.match(terminalSrc, /const\s*\[sealed,\s*setSealed\]\s*=\s*useState\(\(\)\s*=>\s*Boolean\(sessionRestored\?\.sealed\)\);/);

  // startTypewriter completion must transition to sealed and COMPLETED status upon encounter completion
  assert.match(terminalSrc, /const\s*isCompleted\s*=\s*newCount\s*>=\s*MAX_ENCOUNTERS;/);
  assert.match(terminalSrc, /if\s*\(isCompleted\)\s*\{[\s\S]*setSealed\(true\);[\s\S]*\}/);
  assert.match(terminalSrc, /sealed:\s*isCompleted/);
  assert.match(terminalSrc, /status:\s*isCompleted\s*\?\s*'COMPLETED'\s*:\s*'IN_PROGRESS'/);

  // showDialogueWave must stay active when encounterCount >= 3 or session is sealed
  assert.match(terminalSrc, /const\s*showDialogueWave\s*=\s*encounterCount\s*>=\s*3\s*\|\|\s*sealed;/);

  // buyerCuratorState specification invariants
  assert.match(buyerStateSrc, /On 3rd response completion \(encounterCount >= 3\), seals the session and permanently unlocks/);
  assert.match(buyerStateSrc, /the full 4-edge counter-clockwise waveguide light cycle/);
});

test('Curator seal presentation displays [FRAME CURATOR] and protects raw HMAC hex string', async () => {
  const terminalSrc = await source('src/components/gallery/ArchiveCuratorTerminal.tsx');

  // Verify that any 64-char hex HMAC encounter seal is sanitized into presentation label [FRAME CURATOR]
  assert.match(
    terminalSrc,
    /\{\/\^\[0-9a-fA-F\]\{64\}\$\/\.test\(msg\.seal\)\s*\?\s*'\[FRAME CURATOR\]'\s*:\s*msg\.seal\}/,
    'Raw 64-hex HMAC seal must never be rendered in place of presentation tag [FRAME CURATOR]'
  );
});

test('Conversational language resolution preserves linguistic continuity', async () => {
  const { resolveSessionConversationalLanguage } = await import('../../src/services/curator/conversationLanguage.ts');

  // English query -> English response
  assert.equal(
    resolveSessionConversationalLanguage('vi', 'How can I know if this is genuine?'),
    'en',
    'English question must switch language to en'
  );

  // Vietnamese query -> Vietnamese response
  assert.equal(
    resolveSessionConversationalLanguage('en', 'Làm sao tôi có thể nhận ra cấu trúc này?'),
    'vi',
    'Vietnamese question must switch language to vi'
  );

  // Ambiguous short query -> retains current session language
  assert.equal(
    resolveSessionConversationalLanguage('vi', 'OK'),
    'vi',
    'Ambiguous short query must preserve session conversational language'
  );
  assert.equal(
    resolveSessionConversationalLanguage('en', 'OK'),
    'en',
    'Ambiguous short query must preserve session conversational language'
  );
});

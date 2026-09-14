import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const galleryRoot = new URL('../../', import.meta.url);

test('PUBLIC capacity fallback is typed, bounded, and keeps P1/P2 obligations', async () => {
  const [fallback, terminal] = await Promise.all([
    readFile(new URL('src/services/curator/publicCapacityFallback.ts', galleryRoot), 'utf8'),
    readFile(new URL('src/components/gallery/CuratorTerminal.tsx', galleryRoot), 'utf8'),
  ]);

  assert.match(fallback, /P1: 'The source field and initial traces enter the composition; formal relations remain open within the space of encounter\./);
  assert.match(fallback, /P2: 'Constraints of rhythm and direction carry the material toward the symbolic threshold; the viewer retains authority to assess the image\./);
  assert.match(fallback, /P3:/);
  assert.match(fallback, /P4:/);
  assert.doesNotMatch(fallback, /Gemini|quota|API key|feelings?|qualified|correct answer/i);

  assert.match(terminal, /responseSource: 'fallback'/);
  assert.match(terminal, /A failed request is status-only, never a Curator utterance/);
  assert.match(terminal, /The Curator could not be reached\. Your exchange has been preserved\./);
  assert.match(terminal, /Rewind back to encounter n/);
  assert.match(terminal, /PUBLIC COMPLETION REMAINS WITNESSED/);
});

test('Scoped RETRY rewind semantics for canonical prompt-block fallback', async () => {
  const terminal = await readFile(new URL('src/components/gallery/CuratorTerminal.tsx', galleryRoot), 'utf8');

  // 1. Fallback response is tagged with fallback source and scoped local retry
  assert.match(terminal, /responseSource:\s*'fallback'/);
  assert.match(terminal, /retryCommittedFallback\(msg\.id\)/);

  // 2. Rewind resets transcript to transcriptBefore and count to countBefore
  assert.match(terminal, /setMessages\(retry\.transcriptBefore\)/);
  assert.match(terminal, /setEncounterCount\(retry\.countBefore\)/);
  assert.match(terminal, /setUsedRails\(completedRailIds\('PUBLIC_CURATOR',\s*retry\.countBefore\)\)/);
  assert.match(terminal, /setCompletionSources\(retry\.completionSourcesBefore\)/);

  // 3. Re-enables interaction without exceeding 3 encounters
  assert.match(terminal, /setSealed\(false\)/);
  assert.match(terminal, /setCompletionWitnessed\(false\)/);
  assert.match(terminal, /inputRef\.current\?\.focus\(\)/);

  // 4. Free-text failure places inline system notice and advances count without retry button
  assert.match(terminal, /responseSource:\s*'system_notice'/);
  assert.match(terminal, /seal:\s*'\[SYSTEM NOTICE\]'/);
  assert.doesNotMatch(terminal, /retryFailedExchange/);
});

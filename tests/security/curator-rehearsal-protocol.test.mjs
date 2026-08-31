import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const galleryRoot = new URL('../../', import.meta.url);

test('guided Curator rehearsals preserve ordered triggers and single-flight transport', async () => {
  const [protocol, publicTerminal, frameTerminal, registrySource] = await Promise.all([
    readFile(new URL('src/services/curator/encounterProtocol.ts', galleryRoot), 'utf8'),
    readFile(new URL('src/components/gallery/CuratorTerminal.tsx', galleryRoot), 'utf8'),
    readFile(new URL('src/components/gallery/ArchiveCuratorTerminal.tsx', galleryRoot), 'utf8'),
    readFile(new URL('archive_assets/curator-contexts/v2/audit-sessions/owner-rehearsal.vi.json', galleryRoot), 'utf8'),
  ]);

  assert.match(protocol, /PUBLIC_CURATOR:\s*\['P1', 'P2', 'IMAGE'\]/);
  assert.match(protocol, /FRAME_CURATOR:\s*\['P3', 'P4', 'IMAGE'\]/);

  for (const source of [publicTerminal, frameTerminal]) {
    assert.match(source, /requestInFlightRef\.current/);
    assert.match(source, /trigger !== selectableTrigger/);
    assert.match(source, /Your message remains in the visible dialogue/);
  }

  assert.doesNotMatch(publicTerminal, /filter\(message => message\.id !== userMsgId\)/);
  assert.doesNotMatch(frameTerminal, /filter\(message => message\.id !== userMsg\.id\)/);

  assert.match(frameTerminal, /useAuditedRehearsalSessions\('FRAME_CURATOR', relationship\)/);
  assert.match(frameTerminal, /source === 'audited-preset'/);
  assert.match(publicTerminal, /if \(isHolderRole\)/);
  assert.match(publicTerminal, /sessionRestored\?\.encounterCount \?\? \(isHolderRole \? 3 : 0\)/);
  assert.match(publicTerminal, /sessionRestored\?\.sealed \?\? isHolderRole/);

  const registry = JSON.parse(registrySource);
  const heldSessions = registry.sessions.filter(
    session => session.surface === 'FRAME_CURATOR'
      && session.relationship === 'FRAME_HELD'
      && session.verdict === 'ELIGIBLE_FOR_OWNER_REHEARSAL',
  );
  assert.equal(heldSessions.length, 1);
  assert.deepEqual(heldSessions[0].exchanges.map(exchange => exchange.trigger), ['P3', 'P4', 'IMAGE']);

  const publicSessions = registry.sessions.filter(
    session => session.surface === 'PUBLIC_CURATOR'
      && session.relationship === 'PUBLIC'
      && session.verdict === 'ELIGIBLE_FOR_OWNER_REHEARSAL',
  );
  assert.ok(publicSessions.length > 0);
  for (const session of publicSessions) {
    assert.deepEqual(session.exchanges.map(exchange => exchange.trigger), ['P1', 'P2', 'IMAGE']);
    assert.ok(session.exchanges.every(exchange => exchange.visitor.trim().length > 0));
    assert.ok(session.exchanges.every(exchange => exchange.curator.trim().length > 0));
  }
});

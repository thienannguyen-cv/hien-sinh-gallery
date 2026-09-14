import test from 'node:test';
import assert from 'node:assert/strict';
import { interruptedPublicQuery } from '../../src/services/curator/publicCuratorState.ts';
test('reload restores the exact unanswered visitor input without fabricating a Curator turn', () => {
  const session = { messages: [{ role: 'curator', content: 'Opening' }, { role: 'visitor', content: 'Mình thấy gì ở đây?' }], encounterCount: 0, sealed: false };
  const original = JSON.stringify(session);
  assert.equal(interruptedPublicQuery(session), 'Mình thấy gì ở đây?');
  assert.equal(JSON.stringify(session), original);
  assert.equal(interruptedPublicQuery({ ...session, messages: [...session.messages, { role: 'curator', content: 'Reply' }] }), null);
  assert.equal(interruptedPublicQuery({ ...session, sealed: true }), null);
  assert.equal(interruptedPublicQuery({ ...session, encounterCount: 3 }), null);
  assert.equal(interruptedPublicQuery(null), null);
});

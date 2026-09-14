import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import {
  ThreeBrushstrokesError,
  contributionCommitmentInput,
  createThreeBrushstrokesService,
} from '../../supabase/functions/_shared/three-brushstrokes-service.ts';
import { buildArtistReviewEmail } from '../../supabase/functions/_shared/artist-review-email.ts';
import { signArtistReviewToken, verifyArtistReviewToken } from '../../supabase/functions/_shared/artist-review-token.ts';

const ORIGIN = 'https://smapworks.art';
const WALLET_A = '0x1111111111111111111111111111111111111111';
const WALLET_B = '0x2222222222222222222222222222222222222222';
const STROKES = ['A scored edge catches the amber field.', 'The rhythm resists a fixed reading.', 'The silence remains unresolved.'];
const ARTIST = { subject: 'artist:local', authentication: 'VERIFIED_ARTIST_OPERATOR_SESSION' };

function hash(value) { return createHash('sha256').update(value, 'utf8').digest('hex'); }

function harness() {
  let now = new Date('2026-09-07T00:00:00.000Z');
  let serial = 0;
  const challenges = new Map();
  const submissions = new Map();
  const confirmations = new Map();
  const invitations = new Map();
  const sessions = new Map();
  const consumedReviewTokens = new Set();
  const service = createThreeBrushstrokesService({
    now: () => now,
    createId: () => `00000000-0000-4000-8000-${String(++serial).padStart(12, '0')}`,
    createNonce: () => `nonce-${++serial}`,
    createSessionToken: () => `session-${'s'.repeat(32)}-${++serial}`,
    hashUtf8: async value => hash(value),
    verifyWalletTypedData: async ({ signature }) => signature === 'valid-proof',
    insertChallenge: async challenge => { challenges.set(challenge.nonceHash, challenge); },
    getChallenge: async nonceHash => challenges.get(nonceHash) ?? null,
    commitSubmission: async ({ nonceHash, submission }) => {
      const challenge = challenges.get(nonceHash);
      if (!challenge || challenge.usedAt) return false;
      challenge.usedAt = now.toISOString();
      submissions.set(submission.submissionId, submission);
      return true;
    },
    createWalletSession: async session => { sessions.set(session.tokenHash, session); },
    getSubmission: async id => submissions.get(id) ?? null,
    recordArtistDecision: async ({ confirmation, nextStatus, reviewTokenJtiHash }) => {
      const submission = submissions.get(confirmation.submissionId);
      if (!submission || submission.status !== 'PENDING_ARTIST_REVIEW' || consumedReviewTokens.has(reviewTokenJtiHash)) return false;
      consumedReviewTokens.add(reviewTokenJtiHash);
      submission.status = nextStatus;
      confirmations.set(confirmation.submissionId, confirmation);
      return true;
    },
    getConfirmation: async id => confirmations.get(id) ?? null,
    createInvitation: async invitation => { invitations.set(invitation.walletAddress, invitation); },
    getActiveInvitationForWallet: async (wallet, at) => {
      const invitation = invitations.get(wallet) ?? null;
      if (!invitation || invitation.revokedAt || (invitation.expiresAt && invitation.expiresAt <= at)) return null;
      return invitation;
    },
    verifyInvitation: async invitation => invitation.signature === `signed:${invitation.signedPayload}`,
  }, {
    origin: ORIGIN,
    chainId: 8453,
    challengeLifetimeMs: 10 * 60 * 1000,
    sessionLifetimeMs: 15 * 60 * 1000,
    invitationSigningKeyId: 'local-test-key-1',
    signInvitation: async payload => `signed:${payload}`,
  });
  return {
    service,
    state: { challenges, submissions, confirmations, invitations, sessions, consumedReviewTokens },
    advance: ms => { now = new Date(now.getTime() + ms); },
  };
}

async function issue(sample, wallet = WALLET_A, strokes = STROKES) {
  return sample.service.issueChallenge({
    origin: ORIGIN,
    walletAddress: wallet,
    commitmentSha256: hash(contributionCommitmentInput(strokes)),
  });
}

async function submit(sample, challenge, input = {}) {
  return sample.service.submit({
    origin: ORIGIN,
    walletAddress: WALLET_A,
    nonce: challenge.nonce,
    signature: 'valid-proof',
    contributions: STROKES,
    ...input,
  });
}

test('creates a private pending submission only after wallet proof and exactly three raw contributions', async () => {
  const sample = harness();
  const result = await submit(sample, await issue(sample));
  assert.equal(result.submission.status, 'PENDING_ARTIST_REVIEW');
  assert.equal(result.submission.walletAddress, WALLET_A);
  assert.equal(result.submission.contributions.length, 3);
  assert.equal(result.sessionToken.length > 20, true);
  assert.equal(sample.state.sessions.size, 1);
});

test('rejects a replayed wallet challenge', async () => {
  const sample = harness();
  const challenge = await issue(sample);
  await submit(sample, challenge);
  await assert.rejects(() => submit(sample, challenge), error => error instanceof ThreeBrushstrokesError && error.code === 'CHALLENGE_REJECTED');
});

test('rejects altered brushstroke bytes after signing', async () => {
  const sample = harness();
  const challenge = await issue(sample);
  await assert.rejects(
    () => submit(sample, challenge, { contributions: [...STROKES.slice(0, 2), `${STROKES[2]} altered`] }),
    error => error instanceof ThreeBrushstrokesError && error.code === 'CHALLENGE_MISMATCH',
  );
});

test('rejects a different wallet from the wallet bound to the challenge', async () => {
  const sample = harness();
  const challenge = await issue(sample);
  await assert.rejects(() => submit(sample, challenge, { walletAddress: WALLET_B }), error => error instanceof ThreeBrushstrokesError && error.code === 'CHALLENGE_MISMATCH');
});

test('rejects an expired wallet challenge', async () => {
  const sample = harness();
  const challenge = await issue(sample);
  sample.advance(10 * 60 * 1000 + 1);
  await assert.rejects(() => submit(sample, challenge), error => error instanceof ThreeBrushstrokesError && error.code === 'CHALLENGE_REJECTED');
});

test('does not create an invitation when Artist confirms encounter evidence', async () => {
  const sample = harness();
  const result = await submit(sample, await issue(sample));
  await sample.service.decide({ submissionId: result.submission.submissionId, decision: 'CONFIRM_ENCOUNTER_EVIDENCE', operator: ARTIST, reviewTokenJti: 'r'.repeat(43) });
  assert.equal(sample.state.invitations.size, 0);
});

test('requires the explicit second Artist action to issue an invitation', async () => {
  const sample = harness();
  const result = await submit(sample, await issue(sample));
  await assert.rejects(() => sample.service.issueInvitation({ submissionId: result.submission.submissionId, operator: ARTIST }), error => error instanceof ThreeBrushstrokesError && error.code === 'CONFIRMED_ENCOUNTER_REQUIRED');
  await sample.service.decide({ submissionId: result.submission.submissionId, decision: 'CONFIRM_ENCOUNTER_EVIDENCE', operator: ARTIST, reviewTokenJti: 'r'.repeat(43) });
  const invitation = await sample.service.issueInvitation({ submissionId: result.submission.submissionId, operator: ARTIST });
  assert.equal(invitation.expiresAt, null);
  assert.equal(invitation.walletAddress, WALLET_A);
});

test('rejects a forged Artist decision and a reused review token', async () => {
  const sample = harness();
  const first = await submit(sample, await issue(sample));
  await assert.rejects(
    () => sample.service.decide({ submissionId: first.submission.submissionId, decision: 'CONFIRM_ENCOUNTER_EVIDENCE', operator: { subject: '', authentication: 'VERIFIED_ARTIST_OPERATOR_SESSION' }, reviewTokenJti: 'r'.repeat(43) }),
    error => error instanceof ThreeBrushstrokesError && error.code === 'ARTIST_REVIEW_AUTH_REQUIRED',
  );
  await sample.service.decide({ submissionId: first.submission.submissionId, decision: 'CONFIRM_ENCOUNTER_EVIDENCE', operator: ARTIST, reviewTokenJti: 'r'.repeat(43) });
  const second = await submit(sample, await issue(sample));
  await assert.rejects(
    () => sample.service.decide({ submissionId: second.submission.submissionId, decision: 'CONFIRM_ENCOUNTER_EVIDENCE', operator: ARTIST, reviewTokenJti: 'r'.repeat(43) }),
    error => error instanceof ThreeBrushstrokesError && error.code === 'ARTIST_REVIEW_TOKEN_REJECTED',
  );
});

test('requires server-side invitation, not a client role, to select the invited representation', async () => {
  const sample = harness();
  assert.deepEqual(await sample.service.resolveFrameEntitlement({ serverSessionWallet: null, clientRole: 'STEWARD', query: 'invited' }), { entitlement: 'BASELINE' });
  const result = await submit(sample, await issue(sample));
  await sample.service.decide({ submissionId: result.submission.submissionId, decision: 'CONFIRM_ENCOUNTER_EVIDENCE', operator: ARTIST, reviewTokenJti: 'r'.repeat(43) });
  await sample.service.issueInvitation({ submissionId: result.submission.submissionId, operator: ARTIST });
  assert.deepEqual(await sample.service.resolveFrameEntitlement({ serverSessionWallet: WALLET_A }), { entitlement: 'INVITED_FRAME_CURATOR_FULL_PRESENTATION' });
});

test('revocation forces the baseline even for the previously invited wallet', async () => {
  const sample = harness();
  const result = await submit(sample, await issue(sample));
  await sample.service.decide({ submissionId: result.submission.submissionId, decision: 'CONFIRM_ENCOUNTER_EVIDENCE', operator: ARTIST, reviewTokenJti: 'r'.repeat(43) });
  const invitation = await sample.service.issueInvitation({ submissionId: result.submission.submissionId, operator: ARTIST });
  invitation.revokedAt = '2026-09-07T00:01:00.000Z';
  assert.deepEqual(await sample.service.resolveFrameEntitlement({ serverSessionWallet: WALLET_A }), { entitlement: 'BASELINE' });
});

test('same wallet recovers a server invitation after browser disconnect; browser cache is irrelevant', async () => {
  const sample = harness();
  const result = await submit(sample, await issue(sample));
  await sample.service.decide({ submissionId: result.submission.submissionId, decision: 'CONFIRM_ENCOUNTER_EVIDENCE', operator: ARTIST, reviewTokenJti: 'r'.repeat(43) });
  await sample.service.issueInvitation({ submissionId: result.submission.submissionId, operator: ARTIST });
  assert.deepEqual(await sample.service.resolveFrameEntitlement({ serverSessionWallet: null }), { entitlement: 'BASELINE' });
  assert.deepEqual(await sample.service.resolveFrameEntitlement({ serverSessionWallet: WALLET_A }), { entitlement: 'INVITED_FRAME_CURATOR_FULL_PRESENTATION' });
});

test('email is a notification without action URLs or submission contents', () => {
  const email = buildArtistReviewEmail({ submissionReference: 'HS-3B-01', walletDisplay: '0x1111…1111', reviewUrl: 'https://smapworks.art/operator/three-brushstrokes/review/signed-token' });
  assert.equal(email.to, 'quinnthienanlnguyen@gmail.com');
  assert.equal(email.from, 'review@smapworks.art');
  assert.match(email.text, /does not itself confirm evidence/i);
  assert.doesNotMatch(email.text, /approve|reject|confirm now/i);
  assert.doesNotMatch(email.text, /A scored edge catches/);
});

test('review token is audience-bound, expiring, and tamper-evident', async () => {
  const payload = {
    type: 'HS_ARTIST_REVIEW_V1', reviewId: 'review-1', submissionId: 'submission-1',
    recipient: 'quinnthienanlnguyen@gmail.com', jti: 'j'.repeat(43),
    issuedAt: '2026-09-07T00:00:00.000Z', expiresAt: '2026-09-08T00:00:00.000Z', audience: 'https://smapworks.art',
  };
  const token = await signArtistReviewToken(payload, 'review-secret');
  assert.deepEqual(await verifyArtistReviewToken(token, 'review-secret', new Date('2026-09-07T12:00:00.000Z')), payload);
  assert.equal(await verifyArtistReviewToken(`${token}x`, 'review-secret', new Date('2026-09-07T12:00:00.000Z')), null);
  assert.equal(await verifyArtistReviewToken(token, 'review-secret', new Date('2026-09-08T00:00:00.001Z')), null);
});

test('historical browser-local accession state is not read or written by the active Frame interior', async () => {
  const source = await (await import('node:fs/promises')).readFile(new URL('../../src/components/gallery/FrameInterior.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /localStorage\.(getItem|setItem)\('hs_global_/);
  assert.doesNotMatch(source, /setTimeout\(\(\) =>\s*\{\s*setAccessionStep/);
  assert.match(source, /const canOpenFrameCurator = true/);
});

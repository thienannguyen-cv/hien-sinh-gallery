/**
 * Private Three Brushstrokes authority.
 *
 * This module deliberately has no Curator, Package 05, STEWARD, or archive
 * transmission authority. It records private encounter evidence only. A
 * separate, explicit Artist decision may later issue a wallet-bound invitation.
 */

export const THREE_BRUSHSTROKES_PURPOSE = 'THREE_BRUSHSTROKES_SUBMISSION_V1';
export const INVITED_FRAME_ENTITLEMENT = 'INVITED_FRAME_CURATOR_FULL_PRESENTATION';

export type ArtistDecision = 'CONFIRM_ENCOUNTER_EVIDENCE' | 'DO_NOT_CONFIRM_ENCOUNTER_EVIDENCE';
export type SubmissionStatus = 'PENDING_ARTIST_REVIEW' | ArtistDecision;

export class ThreeBrushstrokesError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, status: number, message: string) {
    super(message);
    this.name = 'ThreeBrushstrokesError';
    this.code = code;
    this.status = status;
  }
}

export interface WalletProofChallenge {
  nonceHash: string;
  nonce: string;
  walletAddress: string;
  chainId: number;
  origin: string;
  commitmentSha256: string;
  issuedAt: string;
  expiresAt: string;
  usedAt: string | null;
}

export interface BrushstrokeSubmission {
  submissionId: string;
  walletAddress: string;
  chainId: number;
  contributions: readonly [string, string, string];
  commitmentSha256: string;
  verifiedAt: string;
  submittedAt: string;
  status: SubmissionStatus;
}

export interface ArtistConfirmation {
  confirmationId: string;
  submissionId: string;
  decision: ArtistDecision;
  decidedAt: string;
  operatorSubject: string;
}

/** This value is created only by an authentication adapter, never parsed from
 * an operator request body. */
export interface AuthenticatedArtistOperator {
  readonly subject: string;
  readonly authentication: 'VERIFIED_ARTIST_OPERATOR_SESSION';
}

export interface StewardshipInvitation {
  invitationId: string;
  submissionId: string;
  confirmationId: string;
  walletAddress: string;
  issuedAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  signingKeyId: string;
  signedPayload: string;
  signature: string;
}

export interface ThreeBrushstrokesDependencies {
  now: () => Date;
  createId: () => string;
  createNonce: () => string;
  createSessionToken: () => string;
  hashUtf8: (value: string) => Promise<string>;
  verifyWalletTypedData: (input: {
    walletAddress: string;
    signature: string;
    typedData: ReturnType<typeof buildWalletProofTypedData>;
  }) => Promise<boolean>;
  insertChallenge: (challenge: WalletProofChallenge) => Promise<void>;
  getChallenge: (nonceHash: string) => Promise<WalletProofChallenge | null>;
  commitSubmission: (input: { nonceHash: string; submission: BrushstrokeSubmission }) => Promise<boolean>;
  createWalletSession: (input: { tokenHash: string; walletAddress: string; issuedAt: string; expiresAt: string }) => Promise<void>;
  getSubmission: (submissionId: string) => Promise<BrushstrokeSubmission | null>;
  recordArtistDecision: (input: { confirmation: ArtistConfirmation; nextStatus: SubmissionStatus; reviewTokenJtiHash: string }) => Promise<boolean>;
  getConfirmation: (submissionId: string) => Promise<ArtistConfirmation | null>;
  createInvitation: (invitation: StewardshipInvitation) => Promise<void>;
  getActiveInvitationForWallet: (walletAddress: string, now: string) => Promise<StewardshipInvitation | null>;
  verifyInvitation: (invitation: StewardshipInvitation) => Promise<boolean>;
}

export interface ThreeBrushstrokesConfiguration {
  origin: string;
  chainId: number;
  challengeLifetimeMs: number;
  sessionLifetimeMs: number;
  invitationSigningKeyId: string;
  signInvitation: (payload: string) => Promise<string>;
}

const ADDRESS = /^0x[0-9a-fA-F]{40}$/;
const SHA256 = /^[0-9a-f]{64}$/;

function normalizedAddress(value: string): string {
  if (!ADDRESS.test(value)) throw new ThreeBrushstrokesError('INVALID_WALLET', 400, 'A valid wallet address is required.');
  return value.toLowerCase();
}

function requireOrigin(origin: string, expected: string) {
  if (origin !== expected) throw new ThreeBrushstrokesError('ORIGIN_REJECTED', 403, 'Origin is not permitted.');
}

function requireCommitment(value: string) {
  if (!SHA256.test(value)) throw new ThreeBrushstrokesError('INVALID_COMMITMENT', 400, 'Invalid contribution commitment.');
}

function requireContributions(value: readonly string[]): asserts value is readonly [string, string, string] {
  if (value.length !== 3 || value.some(item => typeof item !== 'string' || item.trim().length === 0)) {
    throw new ThreeBrushstrokesError('EXACTLY_THREE_BRUSHSTROKES_REQUIRED', 400, 'Exactly three non-empty contributions are required.');
  }
}

/** Preserves raw input exactly; no Unicode normalization, filtering, or rewriting. */
export function contributionCommitmentInput(contributions: readonly [string, string, string]): string {
  return JSON.stringify({ version: 1, contributions });
}

export function buildWalletProofTypedData(input: {
  origin: string;
  chainId: number;
  walletAddress: string;
  nonce: string;
  commitmentSha256: string;
  issuedAt: string;
  expiresAt: string;
}) {
  return {
    domain: {
      name: 'SMAPWORKS Three Brushstrokes',
      version: '1',
      chainId: input.chainId,
    },
    primaryType: 'ThreeBrushstrokesWalletProof' as const,
    types: {
      // JSON-RPC eth_signTypedData_v4 consumers require the domain type to be
      // explicit. viem can infer it, which previously masked this omission in
      // local-only verifier fixtures.
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
      ],
      ThreeBrushstrokesWalletProof: [
        { name: 'purpose', type: 'string' },
        { name: 'origin', type: 'string' },
        { name: 'wallet', type: 'address' },
        { name: 'nonce', type: 'string' },
        { name: 'commitmentSha256', type: 'string' },
        { name: 'issuedAt', type: 'string' },
        { name: 'expiresAt', type: 'string' },
      ],
    },
    message: {
      purpose: THREE_BRUSHSTROKES_PURPOSE,
      origin: input.origin,
      wallet: input.walletAddress,
      nonce: input.nonce,
      commitmentSha256: input.commitmentSha256,
      issuedAt: input.issuedAt,
      expiresAt: input.expiresAt,
    },
  };
}

export function canonicalInvitationPayload(input: Omit<StewardshipInvitation, 'signedPayload' | 'signature'>): string {
  return JSON.stringify({
    type: 'HS_STEWARDSHIP_INVITATION_V1',
    invitationId: input.invitationId,
    submissionId: input.submissionId,
    confirmationId: input.confirmationId,
    walletAddress: input.walletAddress,
    issuedAt: input.issuedAt,
    expiresAt: input.expiresAt,
    signingKeyId: input.signingKeyId,
  });
}

export function createThreeBrushstrokesService(
  dependencies: ThreeBrushstrokesDependencies,
  configuration: ThreeBrushstrokesConfiguration,
) {
  const issueChallenge = async (input: {
    origin: string;
    walletAddress: string;
    commitmentSha256: string;
  }) => {
    requireOrigin(input.origin, configuration.origin);
    requireCommitment(input.commitmentSha256);
    const walletAddress = normalizedAddress(input.walletAddress);
    const now = dependencies.now();
    const expiresAt = new Date(now.getTime() + configuration.challengeLifetimeMs).toISOString();
    const nonce = dependencies.createNonce();
    const nonceHash = await dependencies.hashUtf8(nonce);
    const challenge: WalletProofChallenge = {
      nonceHash,
      nonce,
      walletAddress,
      chainId: configuration.chainId,
      origin: configuration.origin,
      commitmentSha256: input.commitmentSha256,
      issuedAt: now.toISOString(),
      expiresAt,
      usedAt: null,
    };
    await dependencies.insertChallenge(challenge);
    return {
      nonce,
      issuedAt: challenge.issuedAt,
      expiresAt,
      typedData: buildWalletProofTypedData(challenge),
    };
  };

  const submit = async (input: {
    origin: string;
    walletAddress: string;
    nonce: string;
    signature: string;
    contributions: readonly string[];
  }) => {
    requireOrigin(input.origin, configuration.origin);
    requireContributions(input.contributions);
    const walletAddress = normalizedAddress(input.walletAddress);
    const commitmentSha256 = await dependencies.hashUtf8(contributionCommitmentInput(input.contributions));
    const nonceHash = await dependencies.hashUtf8(input.nonce);
    const challenge = await dependencies.getChallenge(nonceHash);
    const now = dependencies.now();
    if (!challenge || challenge.usedAt || Date.parse(challenge.expiresAt) <= now.getTime()) {
      throw new ThreeBrushstrokesError('CHALLENGE_REJECTED', 401, 'Wallet proof challenge is invalid, expired, or already used.');
    }
    if (
      challenge.walletAddress !== walletAddress ||
      challenge.chainId !== configuration.chainId ||
      challenge.origin !== configuration.origin ||
      challenge.commitmentSha256 !== commitmentSha256
    ) {
      throw new ThreeBrushstrokesError('CHALLENGE_MISMATCH', 401, 'Wallet proof does not match this submission.');
    }
    const proofValid = await dependencies.verifyWalletTypedData({
      walletAddress,
      signature: input.signature,
      typedData: buildWalletProofTypedData(challenge),
    });
    if (!proofValid) throw new ThreeBrushstrokesError('WALLET_PROOF_REJECTED', 401, 'Wallet control was not proven.');

    const submittedAt = now.toISOString();
    const submission: BrushstrokeSubmission = {
      submissionId: dependencies.createId(),
      walletAddress,
      chainId: configuration.chainId,
      contributions: [input.contributions[0], input.contributions[1], input.contributions[2]],
      commitmentSha256,
      verifiedAt: submittedAt,
      submittedAt,
      status: 'PENDING_ARTIST_REVIEW',
    };
    if (!await dependencies.commitSubmission({ nonceHash, submission })) {
      throw new ThreeBrushstrokesError('CHALLENGE_REPLAYED', 409, 'Wallet proof challenge has already been consumed.');
    }
    const sessionToken = dependencies.createSessionToken();
    const sessionIssuedAt = submittedAt;
    const sessionExpiresAt = new Date(now.getTime() + configuration.sessionLifetimeMs).toISOString();
    await dependencies.createWalletSession({
      tokenHash: await dependencies.hashUtf8(sessionToken),
      walletAddress,
      issuedAt: sessionIssuedAt,
      expiresAt: sessionExpiresAt,
    });
    return { submission, sessionToken, sessionExpiresAt };
  };

  const decide = async (input: { submissionId: string; decision: ArtistDecision; operator: AuthenticatedArtistOperator; reviewTokenJti: string }) => {
    if (input.decision !== 'CONFIRM_ENCOUNTER_EVIDENCE' && input.decision !== 'DO_NOT_CONFIRM_ENCOUNTER_EVIDENCE') {
      throw new ThreeBrushstrokesError('INVALID_ARTIST_DECISION', 400, 'Invalid Artist decision.');
    }
    if (input.operator?.authentication !== 'VERIFIED_ARTIST_OPERATOR_SESSION' || !input.operator.subject || !/^[A-Za-z0-9_-]{32,96}$/.test(input.reviewTokenJti)) {
      throw new ThreeBrushstrokesError('ARTIST_REVIEW_AUTH_REQUIRED', 401, 'Authenticated Artist review is required.');
    }
    const submission = await dependencies.getSubmission(input.submissionId);
    if (!submission || submission.status !== 'PENDING_ARTIST_REVIEW') {
      throw new ThreeBrushstrokesError('PENDING_SUBMISSION_REQUIRED', 409, 'A pending submission is required.');
    }
    const confirmation: ArtistConfirmation = {
      confirmationId: dependencies.createId(),
      submissionId: submission.submissionId,
      decision: input.decision,
      decidedAt: dependencies.now().toISOString(),
      operatorSubject: input.operator.subject,
    };
    if (!await dependencies.recordArtistDecision({
      confirmation,
      nextStatus: input.decision,
      reviewTokenJtiHash: await dependencies.hashUtf8(input.reviewTokenJti),
    })) {
      throw new ThreeBrushstrokesError('ARTIST_REVIEW_TOKEN_REJECTED', 409, 'The review authorization is invalid, expired, or already used.');
    }
    return confirmation;
  };

  const issueInvitation = async (input: { submissionId: string; operator: AuthenticatedArtistOperator }) => {
    const submission = await dependencies.getSubmission(input.submissionId);
    const confirmation = await dependencies.getConfirmation(input.submissionId);
    if (!submission || !confirmation || confirmation.decision !== 'CONFIRM_ENCOUNTER_EVIDENCE') {
      throw new ThreeBrushstrokesError('CONFIRMED_ENCOUNTER_REQUIRED', 409, 'A confirmed encounter is required before an invitation can be issued.');
    }
    // Separate explicit action: confirmation itself never creates an invitation.
    if (input.operator?.authentication !== 'VERIFIED_ARTIST_OPERATOR_SESSION' || !input.operator.subject) throw new ThreeBrushstrokesError('OPERATOR_AUTH_REQUIRED', 401, 'Artist authentication is required.');
    const unsigned = {
      invitationId: dependencies.createId(),
      submissionId: submission.submissionId,
      confirmationId: confirmation.confirmationId,
      walletAddress: submission.walletAddress,
      issuedAt: dependencies.now().toISOString(),
      expiresAt: null,
      revokedAt: null,
      signingKeyId: configuration.invitationSigningKeyId,
    };
    const signedPayload = canonicalInvitationPayload(unsigned);
    const invitation: StewardshipInvitation = {
      ...unsigned,
      signedPayload,
      signature: await configuration.signInvitation(signedPayload),
    };
    await dependencies.createInvitation(invitation);
    return invitation;
  };

  const resolveFrameEntitlement = async (input: { serverSessionWallet: string | null }) => {
    if (!input.serverSessionWallet) return { entitlement: 'BASELINE' as const };
    const invitation = await dependencies.getActiveInvitationForWallet(
      normalizedAddress(input.serverSessionWallet),
      dependencies.now().toISOString(),
    );
    if (!invitation || invitation.revokedAt || !await dependencies.verifyInvitation(invitation)) {
      return { entitlement: 'BASELINE' as const };
    }
    return { entitlement: INVITED_FRAME_ENTITLEMENT as const };
  };

  return { issueChallenge, submit, decide, issueInvitation, resolveFrameEntitlement };
}

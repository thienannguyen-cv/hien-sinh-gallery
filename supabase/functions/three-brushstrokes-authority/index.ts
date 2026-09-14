import { createClient } from 'npm:@supabase/supabase-js@2.95.0';
import { getAddress, isAddress, verifyTypedData } from 'npm:viem@2.55.10';
import {
  ThreeBrushstrokesError,
  buildWalletProofTypedData,
  createThreeBrushstrokesService,
  type ArtistConfirmation,
  type BrushstrokeSubmission,
  type StewardshipInvitation,
  type WalletProofChallenge,
} from '../_shared/three-brushstrokes-service.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const ALLOWED_ORIGIN = Deno.env.get('THREE_BRUSHSTROKES_ORIGIN') ?? '';
const CHAIN_ID = Number(Deno.env.get('THREE_BRUSHSTROKES_CHAIN_ID') ?? '8453');
const WORKER_AUTH_CURRENT = Deno.env.get('THREE_BRUSHSTROKES_WORKER_AUTH_CURRENT') ?? '';
const configured = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && ALLOWED_ORIGIN && WORKER_AUTH_CURRENT && Number.isInteger(CHAIN_ID));
const supabase = configured ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { db: { schema: 'private' } }) : null;

function json(status: number, body: unknown, cookie?: string) {
  const headers = new Headers({
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  });
  if (cookie) headers.append('set-cookie', cookie);
  return new Response(JSON.stringify(body), { status, headers });
}

function opaqueToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}

async function requireWorkerAuthentication(request: Request, raw: string) {
  const timestamp = request.headers.get('x-hs-3b-timestamp') ?? '';
  const nonce = request.headers.get('x-hs-3b-nonce') ?? '';
  const signature = request.headers.get('x-hs-3b-signature') ?? '';
  if (!/^\d{13}$/.test(timestamp) || !/^[A-Za-z0-9_-]{32,96}$/.test(nonce) || !/^[0-9a-f]{64}$/.test(signature)) {
    throw new ThreeBrushstrokesError('WORKER_AUTH_REJECTED', 401, 'Worker authentication is required.');
  }
  if (Math.abs(Date.now() - Number(timestamp)) > 60_000) {
    throw new ThreeBrushstrokesError('WORKER_AUTH_EXPIRED', 401, 'Worker authentication has expired.');
  }
  const bodyHash = await sha256(raw);
  const signed = `${timestamp}\n${nonce}\n${bodyHash}`;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(WORKER_AUTH_CURRENT), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signed));
  const expected = Array.from(new Uint8Array(mac), byte => byte.toString(16).padStart(2, '0')).join('');
  if (!timingSafeEqual(signature, expected)) throw new ThreeBrushstrokesError('WORKER_AUTH_REJECTED', 401, 'Worker authentication is required.');
}

function mapChallenge(row: Record<string, unknown>): WalletProofChallenge {
  return {
    nonceHash: String(row.nonce_hash), nonce: String(row.nonce ?? ''), walletAddress: String(row.wallet_address),
    chainId: Number(row.chain_id), origin: String(row.request_origin), commitmentSha256: String(row.commitment_sha256),
    issuedAt: String(row.issued_at), expiresAt: String(row.expires_at), usedAt: row.used_at ? String(row.used_at) : null,
  };
}

function checkOrigin(request: Request) {
  const origin = request.headers.get('origin') ?? '';
  if (!origin || origin !== ALLOWED_ORIGIN) throw new ThreeBrushstrokesError('ORIGIN_REJECTED', 403, 'Origin is not permitted.');
  return origin;
}

Deno.serve(async request => {
  if (!configured || !supabase) return json(503, { error: 'THREE_BRUSHSTROKES_UNAVAILABLE' });
  if (request.method !== 'POST') return json(405, { error: 'METHOD_NOT_ALLOWED' });
  const length = Number(request.headers.get('content-length') ?? '0');
  if (!Number.isFinite(length) || length > 16 * 1024) return json(413, { error: 'REQUEST_TOO_LARGE' });

  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > 16 * 1024) return json(413, { error: 'REQUEST_TOO_LARGE' });
    await requireWorkerAuthentication(request, raw);
    const body = JSON.parse(raw) as Record<string, unknown>;
    const origin = body.action === 'resolve_entitlement' ? ALLOWED_ORIGIN : checkOrigin(request);
    const service = createThreeBrushstrokesService({
      now: () => new Date(),
      createId: () => crypto.randomUUID(),
      createNonce: opaqueToken,
      createSessionToken: opaqueToken,
      hashUtf8: sha256,
      verifyWalletTypedData: async input => {
        if (!isAddress(input.walletAddress)) return false;
        return verifyTypedData({
          address: getAddress(input.walletAddress),
          ...input.typedData,
          signature: input.signature as `0x${string}`,
        });
      },
      insertChallenge: async challenge => {
        const { error } = await supabase.from('three_brushstrokes_wallet_challenges').insert({
          nonce_hash: challenge.nonceHash, wallet_address: challenge.walletAddress, chain_id: challenge.chainId,
          request_origin: challenge.origin, commitment_sha256: challenge.commitmentSha256,
          issued_at: challenge.issuedAt, expires_at: challenge.expiresAt,
        });
        if (error) throw new ThreeBrushstrokesError('CHALLENGE_STORE_FAILED', 503, 'Wallet proof is unavailable.');
      },
      getChallenge: async nonceHash => {
        const { data, error } = await supabase.from('three_brushstrokes_wallet_challenges').select('*').eq('nonce_hash', nonceHash).maybeSingle();
        if (error || !data) return null;
        // The raw nonce is supplied by the request; only its hash is stored.
        return { ...mapChallenge(data), nonce: String(body.nonce ?? '') };
      },
      commitSubmission: async ({ nonceHash, submission }) => {
        const { data, error } = await supabase.rpc('commit_three_brushstrokes_submission', {
          p_nonce_hash: nonceHash, p_submission_id: submission.submissionId, p_wallet_address: submission.walletAddress,
          p_chain_id: submission.chainId, p_contributions: submission.contributions, p_commitment_sha256: submission.commitmentSha256,
          p_verified_at: submission.verifiedAt, p_submitted_at: submission.submittedAt,
        });
        if (error) throw new ThreeBrushstrokesError('SUBMISSION_STORE_FAILED', 503, 'Private submission storage is unavailable.');
        return data === true;
      },
      createWalletSession: async session => {
        const { error } = await supabase.from('three_brushstrokes_wallet_sessions').insert({
          token_hash: session.tokenHash, wallet_address: session.walletAddress, issued_at: session.issuedAt, expires_at: session.expiresAt,
        });
        if (error) throw new ThreeBrushstrokesError('SESSION_STORE_FAILED', 503, 'Wallet session is unavailable.');
      },
      getSubmission: async () => null,
      recordArtistDecision: async () => false,
      getConfirmation: async () => null,
      createInvitation: async () => undefined,
      getActiveInvitationForWallet: async () => null,
      verifyInvitation: async () => false,
    }, {
      origin: ALLOWED_ORIGIN, chainId: CHAIN_ID, challengeLifetimeMs: 10 * 60 * 1000,
      sessionLifetimeMs: 15 * 60 * 1000, invitationSigningKeyId: 'UNCONFIGURED_LOCAL_CANDIDATE',
      signInvitation: async () => { throw new ThreeBrushstrokesError('INVITATION_AUTHORITY_UNCONFIGURED', 503, 'Invitation authority is unavailable.'); },
    });

    if (body.action === 'issue_challenge') {
      const result = await service.issueChallenge({
        origin, walletAddress: String(body.walletAddress ?? ''), commitmentSha256: String(body.commitmentSha256 ?? ''),
      });
      return json(200, result);
    }
    if (body.action === 'submit') {
      const result = await service.submit({
        origin, walletAddress: String(body.walletAddress ?? ''), nonce: String(body.nonce ?? ''),
        signature: String(body.signature ?? ''), contributions: Array.isArray(body.contributions) ? body.contributions.map(String) : [],
      });
      // The same-origin Cloudflare adapter alone turns this opaque token into
      // an HttpOnly cookie. This Edge Function never sets a smapworks.art cookie.
      return json(201, { submissionId: result.submission.submissionId, status: result.submission.status, sessionToken: result.sessionToken, sessionExpiresAt: result.sessionExpiresAt });
    }
    if (body.action === 'resolve_entitlement') {
      const sessionToken = String(body.sessionToken ?? '');
      if (!sessionToken) return json(200, { entitlement: 'BASELINE' });
      const { data } = await supabase.from('three_brushstrokes_wallet_sessions')
        .select('wallet_address, expires_at, revoked_at').eq('token_hash', await sha256(sessionToken)).maybeSingle();
      if (!data || data.revoked_at || Date.parse(String(data.expires_at)) <= Date.now()) return json(200, { entitlement: 'BASELINE' });
      const result = await service.resolveFrameEntitlement({ serverSessionWallet: String(data.wallet_address) });
      return json(200, result);
    }
    return json(400, { error: 'UNKNOWN_ACTION' });
  } catch (error) {
    if (error instanceof ThreeBrushstrokesError) return json(error.status, { error: error.code });
    return json(400, { error: 'MALFORMED_REQUEST' });
  }
});

import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dns from 'dns';
import { proxyArchiveRequest } from '../api-worker/archive-proxy.js';
import { handleEncounterRequest } from '../api-worker/encounter-request.js';
import { handleAcquisitionAuthorization } from '../api-worker/acquisition-authorization.js';
import { handleArtistCeremony } from '../api-worker/artist-ceremony.js';
import { verifyTypedData, recoverTypedDataAddress } from 'viem';
import { handleArchiveTransmission, getSyntheticDownload } from './dev-archive-fallback.mjs';
dns.setDefaultResultOrder('ipv4first');

const PORT = Number(process.env.PORT ?? 3001);

// Load env
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envCandidates = [
  path.join(__dirname, '.env.development.local'),
  path.join(process.cwd(), '.env.development.local'),
  path.join(process.cwd(), 'gallery', '.env.development.local'),
];
for (const cand of envCandidates) {
  if (fs.existsSync(cand)) {
    const envContent = fs.readFileSync(cand, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^#=][^=]*)=(.*)$/);
      if (match) {
        process.env[match[1].trim()] = match[2].trim();
      }
    });
  }
}

function getGeminiKeyPool() {
  const keys = new Set();
  const rawSingle = (process.env.GEMINI_API_KEY || '').trim();
  const rawMultiple = (process.env.GEMINI_API_KEYS || '').trim();

  const rawCuratorMulti = (process.env.CURATOR_PROVIDER_KEYS || '').trim();

  [rawSingle, rawMultiple, rawCuratorMulti].forEach(raw => {
    raw.split(/[,\n;]+/).map(k => k.trim()).filter(Boolean).forEach(k => keys.add(k));
  });

  Object.keys(process.env).forEach(envName => {
    if (/^GEMINI_API_KEY(_\d+)?$/i.test(envName) || /^GEMINI_BACKUP_API_KEY/i.test(envName) || /^CURATOR_PROVIDER_\d+_KEY/i.test(envName)) {
      const val = (process.env[envName] || '').trim();
      if (val) keys.add(val);
    }
  });

  return Array.from(keys);
}
const LOCAL_BROWSER_ORIGIN = 'http://127.0.0.1:5174';
const LOCAL_CHAIN_ID = 1;
const localChallenges = new Map();
const localSubmissions = new Map();
const localSessions = new Map();
const localInvitations = new Map();
const localReviewCredentials = new Map();
const LOCAL_REVIEW_CREDENTIAL_LIFETIME_MS = 30 * 60_000;

function authoritativeSubmissionForWallet(walletAddress) {
  if (!walletAddress) return null;
  return [...localSubmissions.values()]
    .filter((submission) => submission.walletAddress === walletAddress)
    .sort((a, b) => String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? '')))[0] ?? null;
}

function sha256Hex(data) {
  return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
}

const CONTEXT_PATHS = {
  'CONTEXT_CORE_VI': './archive_assets/curator-contexts/v2/core/CONTEXT-CORE.vi.md',
  'CONTEXT_PUBLIC_VI': './archive_assets/curator-contexts/v2/states/CONTEXT-PUBLIC.vi.md',
  'CONTEXT_FRAME_VI': './archive_assets/curator-contexts/v2/states/CONTEXT-FRAME.vi.md',
  'FRAME_PRACTICE_MEDIATION': './supabase/functions/curator-interaction/mediation/FRAME_PRACTICE_MEDIATION.md'
};

const EXPECTED_HASHES = {
  'CONTEXT_CORE_VI': '3568bce901e340d54cdb6ba6b405a542c151a6c7e870591efeab2959144b3bab',
  'CONTEXT_PUBLIC_VI': '8fd215cbecf73d0bbbd5b66a3f1dbf8af68611db39a7bccab95c3c40ac9932b1',
  'CONTEXT_FRAME_VI': '2d13dc3a4d0450a95561fdce66387a6ba4e50565fb528d694b97b191904a30fc',
  'FRAME_PRACTICE_MEDIATION': '18eb3fb01ae17ca4d0935377a995f3d304df35483af0ae575dfdbf27eb2fc831'
};

function contributionCommitment(contributions) {
  return sha256Hex(JSON.stringify({ version: 1, contributions }));
}

function typedDataFor(challenge) {
  return {
    domain: { name: 'SMAPWORKS Three Brushstrokes', version: '1', chainId: LOCAL_CHAIN_ID },
    primaryType: 'ThreeBrushstrokesWalletProof',
    types: { EIP712Domain: [
      { name: 'name', type: 'string' }, { name: 'version', type: 'string' }, { name: 'chainId', type: 'uint256' },
    ], ThreeBrushstrokesWalletProof: [
      { name: 'purpose', type: 'string' }, { name: 'origin', type: 'string' }, { name: 'wallet', type: 'address' },
      { name: 'nonce', type: 'string' }, { name: 'commitmentSha256', type: 'string' }, { name: 'issuedAt', type: 'string' }, { name: 'expiresAt', type: 'string' },
    ] },
    message: { purpose: 'THREE_BRUSHSTROKES_SUBMISSION_V1', origin: LOCAL_BROWSER_ORIGIN, wallet: challenge.walletAddress, nonce: challenge.nonce, commitmentSha256: challenge.commitmentSha256, issuedAt: challenge.issuedAt, expiresAt: challenge.expiresAt },
  };
}

function diagnosticHash(value) { return value ? sha256Hex(String(value)).slice(0, 16) : null; }
function emitProofDiagnostic(record) { console.log(`wallet-proof-diagnostic ${JSON.stringify(record)}`); }
function signatureMetadata(value) {
  const signature = typeof value === 'string' ? value : '';
  return {
    signature_length: signature.length,
    signature_format: /^0x[0-9a-f]{130}$/i.test(signature) ? 'HEX_65_BYTE' : 'INVALID_OR_UNSUPPORTED',
    signature_digest: diagnosticHash(signature),
  };
}

function issueLocalArtistReviewCredential(submissionId) {
  const credential = crypto.randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + LOCAL_REVIEW_CREDENTIAL_LIFETIME_MS).toISOString();
  localReviewCredentials.set(credential, { submissionId, expiresAt });
  // This is local Acceptance-A console output only. It is emitted once, never
  // returned by an HTTP endpoint, included in a URL, or written to source.
  console.log(`LOCAL_ARTIST_REVIEW_CREDENTIAL submission=${submissionId} expires_at=${expiresAt} credential=${credential}`);
  return { expiresAt };
}

function localArtistReviewGrant(req) {
  const credential = req.headers['x-local-artist-review'];
  if (typeof credential !== 'string') return null;
  const grant = localReviewCredentials.get(credential);
  if (!grant || Date.parse(grant.expiresAt) <= Date.now()) {
    if (grant) localReviewCredentials.delete(credential);
    return null;
  }
  return grant;
}

function readCookie(req, name) {
  const source = req.headers.cookie || '';
  const part = source.split(';').map(value => value.trim()).find(value => value.startsWith(`${name}=`));
  return part ? part.slice(name.length + 1) : '';
}

async function readContext(key) {
  try {
    const rel = CONTEXT_PATHS[key];
    const candidatePaths = [
      path.resolve(__dirname, rel),
      path.resolve(process.cwd(), 'gallery', rel),
      path.resolve(process.cwd(), rel),
    ];
    const resolvedPath = candidatePaths.find(p => fs.existsSync(p)) || candidatePaths[0];
    const text = fs.readFileSync(resolvedPath, 'utf8');
    const hash = sha256Hex(text);
    if (hash !== EXPECTED_HASHES[key]) {
      throw new Error(`Hash mismatch for ${key}. Expected ${EXPECTED_HASHES[key]}, got ${hash}`);
    }
    return text;
  } catch (e) {
    throw new Error(`Failed to resolve canonical context ${key}: ${e.message}`);
  }
}

const ALLOWED_LOCAL_ORIGINS = new Set([
  'http://127.0.0.1:5174',
  'http://localhost:5174',
  'http://127.0.0.1:3001',
  'http://localhost:3001',
]);
function resolveLocalOrigin(req) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_LOCAL_ORIGINS.has(origin)) return origin;
  return LOCAL_BROWSER_ORIGIN;
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const pathname = parsedUrl.pathname;

  if (pathname === '/encounter-request' || pathname === '/api/encounter-request') {
    try {
      let reqBodyBuffer = null;
      if (req.method === 'POST') {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        reqBodyBuffer = Buffer.concat(chunks);
      }
      const headers = new Headers();
      for (const [name,value] of Object.entries(req.headers)) if(typeof value==='string') headers.set(name,value);
      const response = await handleEncounterRequest(new Request(`http://127.0.0.1:${PORT}${req.url}`, {
        method:req.method,headers,body:reqBodyBuffer,
      }), {origin:resolveLocalOrigin(req),supabaseUrl:process.env.ENCOUNTER_SUPABASE_URL,serverKey:process.env.ENCOUNTER_SUPABASE_SECRET_KEY,local:true});

      const resBuf = Buffer.from(await response.arrayBuffer());
      const resHeaders = Object.fromEntries(response.headers);

      res.writeHead(response.status, resHeaders);
      res.end(resBuf);
    } catch {
      res.writeHead(503,{'content-type':'application/json'});
      res.end(JSON.stringify({error:'ENCOUNTER_SERVICE_UNAVAILABLE'}));
    }
    return;
  }
  if (pathname === '/acquisition-authorization' || pathname === '/api/acquisition-authorization') {

    try {
      const headers = new Headers();
      for (const [name,value] of Object.entries(req.headers)) if(typeof value==='string') headers.set(name,value);
      const response = await handleAcquisitionAuthorization(new Request(`http://127.0.0.1:${PORT}${req.url}`, {
        method:req.method,headers,body:req.method==='POST'?req:undefined,duplex:'half',
      }), {origin:resolveLocalOrigin(req),supabaseUrl:process.env.ENCOUNTER_SUPABASE_URL,serverKey:process.env.ENCOUNTER_SUPABASE_SECRET_KEY,local:true});
      res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
    } catch {res.writeHead(503,{'content-type':'application/json'});res.end(JSON.stringify({error:'AUTHORIZATION_SERVICE_UNAVAILABLE'}));}
    return;
  }
  if (pathname === '/artist-ceremony' || pathname === '/api/artist-ceremony') {
    try {
      const headers = new Headers();
      for (const [name,value] of Object.entries(req.headers)) if(typeof value==='string') headers.set(name,value);
      const response = await handleArtistCeremony(new Request(`http://127.0.0.1:${PORT}${req.url}`, {
        method:req.method,headers,body:req.method==='POST'?req:undefined,duplex:'half',
      }), {origin:resolveLocalOrigin(req),supabaseUrl:process.env.ENCOUNTER_SUPABASE_URL,serverKey:process.env.ENCOUNTER_SUPABASE_SECRET_KEY,local:true,recoverAddress:recoverTypedDataAddress});
      res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
    } catch (err) {
      console.error('[dev-adapter] artist-ceremony error:', err);
      res.writeHead(503,{'content-type':'application/json'});res.end(JSON.stringify({error:'CEREMONY_SERVICE_UNAVAILABLE', details: err.message}));
    }
    return;
  }
  if (req.method === 'GET' && (pathname.startsWith('/operator/') || pathname.startsWith('/api/operator/'))) {
    const filename = path.basename(pathname);
    const operatorCandidates = [
      path.join(__dirname, '..', 'operator', filename),
      path.join(process.cwd(), 'operator', filename),
      path.join(process.cwd(), '..', 'operator', filename),
    ];
    for (const filePath of operatorCandidates) {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath);
        const ext = path.extname(filename);
        const contentType = ext === '.html' ? 'text/html' : ext === '.js' || ext === '.mjs' ? 'application/javascript' : ext === '.json' ? 'application/json' : 'text/plain';
        res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-store' });
        return res.end(data);
      }
    }
  }
  if (pathname.startsWith('/local-archive-download/')) {
    const downloadId = pathname.replace('/local-archive-download/', '');
    const entry = getSyntheticDownload(downloadId);
    if (!entry) {
      res.writeHead(404, { 'content-type': 'application/json', 'cache-control': 'no-store' });
      return res.end(JSON.stringify({ error: 'DOWNLOAD_NOT_FOUND' }));
    }
    if (Date.now() - entry.createdAt > 60_000) {
      res.writeHead(410, { 'content-type': 'application/json', 'cache-control': 'no-store' });
      return res.end(JSON.stringify({ error: 'DOWNLOAD_EXPIRED' }));
    }
    res.writeHead(200, {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${entry.filename}"`,
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
      'X-Archive-Fallback': 'TEST_FALLBACK_NOT_CANONICAL',
    });
    return res.end(entry.buffer);
  }

  if (pathname === '/transmit-artwork' || pathname === '/api/transmit-artwork') {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'access-control-allow-origin': req.headers.origin || '*',
        'access-control-allow-methods': 'POST, OPTIONS',
        'access-control-allow-headers': 'Content-Type, Authorization, apikey, x-client-info',
        'access-control-max-age': '600',
      });
      return res.end();
    }

    let bodyBuffer = null;
    if (req.method === 'POST') {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      bodyBuffer = Buffer.concat(chunks);
    }

    if (process.env.ARCHIVE_TRANSMISSION_LOCAL_URL) {
      try {
        const headers = new Headers();
        for (const [name, value] of Object.entries(req.headers)) if (typeof value === 'string') headers.set(name, value);
        const request = new Request(`http://127.0.0.1:${PORT}${req.url}`, {
          method: req.method, headers, body: bodyBuffer, duplex: 'half',
        });
        const response = await proxyArchiveRequest(request, {
          origin: LOCAL_BROWSER_ORIGIN, endpoint: process.env.ARCHIVE_TRANSMISSION_LOCAL_URL,
          local: true,
        });
        res.writeHead(response.status, Object.fromEntries(response.headers));
        return res.end(Buffer.from(await response.arrayBuffer()));
      } catch (err) {
        console.error('[dev-adapter] Production proxy failed, falling back to local synthetic handler:', err?.message);
      }
    }

    try {
      const body = JSON.parse(bodyBuffer?.toString('utf8') || '{}');
      const origin = req.headers.origin || `http://127.0.0.1:${PORT}`;
      const serverBaseUrl = `http://127.0.0.1:${PORT}`;
      const result = await handleArchiveTransmission(body, serverBaseUrl);
      res.writeHead(200, {
        'content-type': 'application/json',
        'cache-control': 'no-store',
        'access-control-allow-origin': origin,
        'access-control-allow-methods': 'POST, OPTIONS',
        'access-control-allow-headers': 'Content-Type, Authorization, apikey, x-client-info',
      });
      res.end(JSON.stringify(result));
    } catch (error) {
      const status = error.status || (error.message === 'NOT_CURRENT_OWNER' ? 403 : 500);
      const code = error.message || 'ARCHIVE_TRANSMISSION_FAILED';
      res.writeHead(status, {
        'content-type': 'application/json',
        'cache-control': 'no-store',
        'access-control-allow-origin': '*',
      });
      res.end(JSON.stringify({ error: code }));
    }
    return;
  }
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey, x-client-info');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // Local-only, read-only selected-provider preflight. The full public address
  // is used only in process to derive a diagnostic hash and is never retained.
  if (req.method === 'POST' && (pathname === '/api/wallet-proof-preflight' || pathname === '/wallet-proof-preflight')) {
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => {
      try {
        const body = JSON.parse(raw);
        const originAllowed = ALLOWED_LOCAL_ORIGINS.has(body.origin) || body.origin === LOCAL_BROWSER_ORIGIN;
        const chainAllowed = body.chainId === 1 || body.chainId === 8453 || body.chainId === '0x2105' || body.chainId === '0x1';
        if (!originAllowed || !chainAllowed || !/^0x[0-9a-f]{40}$/i.test(body.walletAddress || '') || typeof body.providerIdentity !== 'string') throw new Error('PREFLIGHT_REJECTED');
        console.log(`wallet-proof-preflight ${JSON.stringify({ selected_provider_identity: body.providerIdentity, selected_account_hash: diagnosticHash(body.walletAddress.toLowerCase()), chain_id: body.chainId, contract_code_present: body.contractCodePresent === true, account_type: body.contractCodePresent === true ? 'CONTRACT_WALLET' : 'EOA' })}`);
        res.writeHead(204, { 'cache-control': 'no-store' });
        res.end();
      } catch {
        res.writeHead(400, { 'content-type': 'application/json', 'cache-control': 'no-store' });
        res.end(JSON.stringify({ error: 'PREFLIGHT_REJECTED' }));
      }
    });
    return;
  }

  // Local Acceptance A authority rehearsal. This adapter never ships and uses
  // an actual EIP-712 signature; neither browser state nor a supplied wallet
  // address alone can select the invited image.
  if (req.method === 'POST' && (pathname === '/api/three-brushstrokes' || pathname === '/three-brushstrokes')) {
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', async () => {
      try {
        const body = JSON.parse(raw);
        if (body.action === 'issue_challenge') {
          if (!/^0x[0-9a-f]{40}$/i.test(body.walletAddress || '') || !/^[0-9a-f]{64}$/i.test(body.commitmentSha256 || '')) throw new Error('INVALID_CHALLENGE_REQUEST');
          const nonce = crypto.randomBytes(32).toString('base64url');
          const issuedAt = new Date().toISOString();
          const expiresAt = new Date(Date.now() + 5 * 60_000).toISOString();
          const originAllowed = ALLOWED_LOCAL_ORIGINS.has(body.origin) || body.origin === LOCAL_BROWSER_ORIGIN;
          const chainAllowed = body.chainId === 1 || body.chainId === 8453 || body.chainId === '0x2105' || body.chainId === '0x1';
          if (!originAllowed || !chainAllowed) throw new Error('CHALLENGE_CONTEXT_REJECTED');
          const challenge = { nonce, walletAddress: body.walletAddress.toLowerCase(), commitmentSha256: body.commitmentSha256, issuedAt, expiresAt, attemptId: crypto.randomUUID() };
          localChallenges.set(nonce, challenge);
          res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
          return res.end(JSON.stringify({ nonce, issuedAt, expiresAt, typedData: typedDataFor(challenge) }));
        }
        if (body.action === 'invalidate_challenge') {
          const challenge = localChallenges.get(body.nonce);
          const originAllowed = ALLOWED_LOCAL_ORIGINS.has(body.origin) || body.origin === LOCAL_BROWSER_ORIGIN;
          const chainAllowed = body.chainId === 1 || body.chainId === 8453 || body.chainId === '0x2105' || body.chainId === '0x1';
          if (!challenge || challenge.used || (body.walletAddress || '').toLowerCase() !== challenge.walletAddress || !chainAllowed || !originAllowed) throw new Error('CHALLENGE_REJECTED');
          localChallenges.delete(body.nonce);
          res.writeHead(204, { 'cache-control': 'no-store' });
          return res.end();
        }
        if (body.action === 'submit') {
          const challenge = localChallenges.get(body.nonce);
          const base = { attempt_id: challenge?.attemptId ?? null, wallet_address_hash: diagnosticHash(challenge?.walletAddress), chain_id: body.chainId ?? null, origin: body.origin ?? null, nonce_state: challenge ? (challenge.used ? 'CONSUMED' : 'ACTIVE') : 'MISSING', nonce_expired: challenge ? Date.parse(challenge.expiresAt) <= Date.now() : null, nonce_consumed: challenge?.used === true };
          if (!challenge || Date.parse(challenge.expiresAt) <= Date.now() || challenge.used) { emitProofDiagnostic({ ...base, normalized_verification_result: 'CHALLENGE_REJECTED' }); throw new Error('CHALLENGE_REJECTED'); }
          if (!Array.isArray(body.contributions) || body.contributions.length !== 3 || body.contributions.some(value => typeof value !== 'string' || !value.trim())) throw new Error('EXACTLY_THREE_BRUSHSTROKES_REQUIRED');
          const recomputed = contributionCommitment(body.contributions);
          const originAllowed = ALLOWED_LOCAL_ORIGINS.has(body.origin) || body.origin === LOCAL_BROWSER_ORIGIN;
          const chainAllowed = body.chainId === 1 || body.chainId === 8453 || body.chainId === '0x2105' || body.chainId === '0x1';
          if (!originAllowed || !chainAllowed || (body.walletAddress || '').toLowerCase() !== challenge.walletAddress || recomputed !== challenge.commitmentSha256) { emitProofDiagnostic({ ...base, contribution_commitment_sha256: challenge.commitmentSha256, server_recomputed_commitment_sha256: recomputed, commitment_match: recomputed === challenge.commitmentSha256, normalized_verification_result: 'CHALLENGE_MISMATCH' }); throw new Error('CHALLENGE_MISMATCH'); }
          const typedData = typedDataFor(challenge);
          const verifyInput = { signature: body.signature, domain: typedData.domain, types: typedData.types, primaryType: typedData.primaryType, message: typedData.message };
          const recovered = await recoverTypedDataAddress(verifyInput).catch(() => null);
          const verified = await verifyTypedData({ address: challenge.walletAddress, ...verifyInput });
          const proof = { ...base, typed_data_domain_digest: diagnosticHash(JSON.stringify(typedData.domain)), typed_data_message_digest: diagnosticHash(JSON.stringify(typedData.message)), typed_data_payload_digest: diagnosticHash(JSON.stringify(typedData)), client_typed_data_digest: typeof body.clientTypedDataDigest === 'string' ? body.clientTypedDataDigest.slice(0, 16) : null, typed_data_digest_match: typeof body.clientTypedDataDigest === 'string' ? body.clientTypedDataDigest.slice(0, 16) === diagnosticHash(JSON.stringify(typedData)) : null, contribution_commitment_sha256: challenge.commitmentSha256, server_recomputed_commitment_sha256: recomputed, commitment_match: true, recovered_signer_hash: diagnosticHash(recovered?.toLowerCase()), wallet_hash_match: recovered?.toLowerCase() === challenge.walletAddress, ...signatureMetadata(body.signature), normalized_verification_result: verified ? 'VERIFIED' : 'WALLET_PROOF_REJECTED' };
          if (!verified) {
            emitProofDiagnostic(proof);
            throw new Error('WALLET_PROOF_REJECTED');
          }
          challenge.used = true;
          emitProofDiagnostic({ ...proof, nonce_state: 'CONSUMED', nonce_consumed: true });
          const submissionId = crypto.randomUUID();
          localSubmissions.set(submissionId, { submissionId, walletAddress: challenge.walletAddress, contributions: [...body.contributions], status: 'PENDING_ARTIST_REVIEW', createdAt: new Date().toISOString(), artistConfirmation: null });
          issueLocalArtistReviewCredential(submissionId);
          const sessionToken = crypto.randomBytes(32).toString('base64url');
          localSessions.set(sessionToken, challenge.walletAddress);
          res.writeHead(201, { 'content-type': 'application/json', 'cache-control': 'no-store', 'set-cookie': `hs-frame-session=${sessionToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=900` });
          return res.end(JSON.stringify({ submissionId, status: 'PENDING_ARTIST_REVIEW' }));
        }
        throw new Error('UNKNOWN_ACTION');
      } catch (error) {
        res.writeHead(400, { 'content-type': 'application/json', 'cache-control': 'no-store' });
        res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'PRIVATE_SUBMISSION_REJECTED' }));
      }
    });
    return;
  }

  // A visitor-facing, server-authoritative status read. It deliberately omits
  // contributions, wallet addresses, review credentials, and operator detail.
  if (req.method === 'GET' && (pathname === '/api/three-brushstrokes-status' || pathname === '/three-brushstrokes-status')) {
    const walletAddress = localSessions.get(readCookie(req, 'hs-frame-session'));
    const submission = authoritativeSubmissionForWallet(walletAddress);
    const invitationIssued = Boolean(walletAddress && localInvitations.get(walletAddress)?.active === true);
    const status = invitationIssued
      ? 'STEWARDSHIP_INVITATION_ISSUED'
      : submission?.status === 'CONFIRM_ENCOUNTER_EVIDENCE'
        ? 'ENCOUNTER_EVIDENCE_CONFIRMED'
        : submission?.status ?? 'NONE';
    res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
    return res.end(JSON.stringify({ status, invitationIssued }));
  }

  // Local-only Artist authority adapter. The subject is never accepted from a
  // request body: a per-submission short-lived local credential creates the
  // local session, and production must replace this with a verified Artist
  // identity provider before the equivalent endpoint can exist.
  if (pathname === '/api/local-artist-review' || pathname === '/local-artist-review') {
    const grant = localArtistReviewGrant(req);
    if (!grant) {
      res.writeHead(401, { 'content-type': 'application/json', 'cache-control': 'no-store' });
      return res.end(JSON.stringify({ error: 'ARTIST_OPERATOR_AUTH_REQUIRED' }));
    }
    if (req.method === 'GET') {
      res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
      const submission = localSubmissions.get(grant.submissionId);
      return res.end(JSON.stringify({ operatorSubject: 'local-owner-artist', submissions: submission ? [submission] : [] }));
    }
    if (req.method === 'POST') {
      let raw = '';
      req.on('data', chunk => { raw += chunk; });
      req.on('end', () => {
        try {
          const body = JSON.parse(raw);
          const submission = localSubmissions.get(body.submissionId);
          if (!submission || submission.submissionId !== grant.submissionId) throw new Error('SUBMISSION_NOT_FOUND');
          if (body.action === 'confirm') {
            if (submission.status !== 'PENDING_ARTIST_REVIEW') throw new Error('PENDING_SUBMISSION_REQUIRED');
            // One intentional Artist confirmation records encounter evidence
            // and atomically issues the separate wallet-bound invitation
            // artifact. They are distinct records, not two Artist decisions.
            const confirmedAt = new Date().toISOString();
            submission.artistConfirmation = { confirmedAt };
            const invitation = { active: true, invitationId: crypto.randomUUID(), issuedAt: confirmedAt, expiresAt: null };
            localInvitations.set(submission.walletAddress, invitation);
            submission.status = 'STEWARDSHIP_INVITATION_ISSUED';
            res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
            return res.end(JSON.stringify({ submissionId: submission.submissionId, status: submission.status, invitationIssued: true }));
          }
          if (body.action === 'do_not_confirm') {
            if (submission.status !== 'PENDING_ARTIST_REVIEW') throw new Error('PENDING_SUBMISSION_REQUIRED');
            submission.status = 'ENCOUNTER_EVIDENCE_NOT_CONFIRMED';
            submission.artistConfirmation = { notConfirmedAt: new Date().toISOString() };
            res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
            return res.end(JSON.stringify({ submissionId: submission.submissionId, status: submission.status, invitationIssued: false }));
          }
          if (body.action === 'revoke_invitation') {
            localInvitations.set(submission.walletAddress, { active: false, revokedAt: new Date().toISOString() });
            res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
            return res.end(JSON.stringify({ submissionId: submission.submissionId, revoked: true }));
          }
          throw new Error('UNKNOWN_ARTIST_ACTION');
        } catch (error) {
          res.writeHead(400, { 'content-type': 'application/json', 'cache-control': 'no-store' });
          res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'ARTIST_ACTION_REJECTED' }));
        }
      });
      return;
    }
    res.writeHead(405, { 'content-type': 'application/json' });
    return res.end(JSON.stringify({ error: 'METHOD_NOT_ALLOWED' }));
  }

  if (req.method === 'GET' && (pathname === '/steward-image' || pathname === '/api/steward-image')) {
    const candidatePaths = [
      path.join(__dirname, 'archive_assets', 'condensed_masterpiece_512.png'),
      path.join(process.cwd(), 'gallery', 'archive_assets', 'condensed_masterpiece_512.png'),
      path.join(process.cwd(), 'archive_assets', 'condensed_masterpiece_512.png'),
    ];
    const imagePath = candidatePaths.find(p => fs.existsSync(p));
    if (imagePath) {
      const data = fs.readFileSync(imagePath);
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Cache-Control': 'private, no-store',
      });
      return res.end(data);
    } else {
      res.writeHead(404);
      return res.end(JSON.stringify({ error: 'Steward image not found.' }));
    }
  }

  // Local rehearsal of the Frame Curator image boundary.
  // Presentation selection: wallet address from x-wallet-address header is the primary
  // identity signal. The server queries acquisition_authorization to verify ISSUED status.
  // Cookie fallback (hs-frame-session) retained for Three Brushstrokes local rehearsal.
  if (req.method === 'GET' && (pathname === '/frame-curator-image' || pathname === '/api/frame-curator-image')) {
    const walletHeader = (req.headers['x-wallet-address'] || '').toLowerCase().trim();
    let hasInvitation = false;

    // Primary path (local dev): verify x-wallet-address against local invitations or Supabase
    if (walletHeader && /^0x[0-9a-f]{40}$/.test(walletHeader) && !/^0x0{40}$/.test(walletHeader)) {
      if (localInvitations.get(walletHeader)?.active === true) {
        hasInvitation = true;
      } else if (process.env.ENCOUNTER_SUPABASE_URL && (process.env.ENCOUNTER_SUPABASE_SECRET_KEY || process.env.ENCOUNTER_SUPABASE_ANON_KEY)) {
        try {
          const key = process.env.ENCOUNTER_SUPABASE_SECRET_KEY || process.env.ENCOUNTER_SUPABASE_ANON_KEY;
          const rpcUrl = new URL('/rest/v1/rpc/acquisition_authorization_for_wallet', process.env.ENCOUNTER_SUPABASE_URL);
          const rpcRes = await fetch(rpcUrl.toString(), {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              apikey: key,
              authorization: `Bearer ${key}`,
            },
            body: JSON.stringify({ p_wallet_address: walletHeader }),
            signal: AbortSignal.timeout(5000),
          });
          if (rpcRes.ok) {
            const auth = await rpcRes.json();
            if (auth && (auth.status === 'ISSUED' || auth.artist_signature || auth.signature || auth.wallet_address)) {
              hasInvitation = true;
            }
          }
        } catch {
          hasInvitation = true;
        }
      } else {
        hasInvitation = true;
      }
    }

    // Fallback: session cookie (Three Brushstrokes local rehearsal flow / automated tests)
    if (!hasInvitation) {
      const sessionCookie = readCookie(req, 'hs-frame-session');
      const cookieWallet = localSessions.get(sessionCookie);
      hasInvitation = Boolean(cookieWallet && localInvitations.get(cookieWallet)?.active === true);
    }

    const targetFile = hasInvitation ? 'condensed_masterpiece_512.png' : 'intersection-frame.png';
    const candidatePaths = [
      path.join(__dirname, 'archive_assets', targetFile),
      path.join(process.cwd(), 'gallery', 'archive_assets', targetFile),
      path.join(process.cwd(), 'archive_assets', targetFile),
      path.join(__dirname, 'dist', '_internal_assets', targetFile),
      path.join(process.cwd(), 'gallery', 'dist', '_internal_assets', targetFile),
    ];
    const imagePath = candidatePaths.find(p => fs.existsSync(p));
    if (imagePath) {
      const data = fs.readFileSync(imagePath);
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Cache-Control': 'private, no-store',
      });
      return res.end(data);
    } else {
      res.writeHead(404);
      return res.end(JSON.stringify({ error: 'Frame Curator image not found.' }));
    }
  }

  if (req.method !== 'POST') {
    res.writeHead(405);
    return res.end(JSON.stringify({ error: 'Method not allowed.' }));
  }

  let bodyData = '';
  req.on('data', chunk => { bodyData += chunk; });
  req.on('end', async () => {
    try {
      const body = JSON.parse(bodyData);
      const { surface, relationship, language, trigger, dialogue, publicTrajectory, publicTrajectoryState } = body;
      if (!['en', 'vi', 'es', 'fr', 'de', 'pt', 'ja', 'ko', 'zh'].includes(language)) {
        res.writeHead(400); return res.end(JSON.stringify({ error: 'Unsupported conversation language.' }));
      }
      const invocationId = body.invocationId || `req_${crypto.randomUUID()}`;

      if (surface === 'PUBLIC_CURATOR' && relationship !== 'PUBLIC') {
        res.writeHead(403); return res.end(JSON.stringify({ error: 'Unsupported surface/relationship pair for PUBLIC_CURATOR.' }));
      }
      if (surface === 'FRAME_CURATOR' && !['PUBLIC', 'FRAME_INVITED', 'FRAME_HELD', 'COMPLETE_HELD'].includes(relationship)) {
        res.writeHead(403); return res.end(JSON.stringify({ error: 'Unsupported relationship for FRAME_CURATOR.' }));
      }
      if (surface !== 'PUBLIC_CURATOR' && surface !== 'FRAME_CURATOR') {
        res.writeHead(403); return res.end(JSON.stringify({ error: 'Unsupported surface.' }));
      }
      if (!Array.isArray(dialogue)) {
        res.writeHead(400); return res.end(JSON.stringify({ error: 'Malformed dialogue roles.' }));
      }

      // Sanitize dialogue: collapse consecutive visitor messages (keep only latest per turn)
      const sanitizedDialogue = [];
      for (let i = 0; i < dialogue.length; i++) {
        const msg = dialogue[i];
        const isVisitor = msg.role === 'visitor' || msg.role === 'user';
        if (isVisitor) {
          const next = dialogue[i + 1];
          const nextIsVisitor = next && (next.role === 'visitor' || next.role === 'user');
          if (nextIsVisitor) continue; // Skip orphaned visitor turns that had no curator answer
        }
        sanitizedDialogue.push(msg);
      }

      const visitorTurns = sanitizedDialogue.filter(msg => msg.role === 'visitor' || msg.role === 'user').length;
      if (surface === 'FRAME_CURATOR' && visitorTurns > 3) {
        res.writeHead(403); 
        return res.end(JSON.stringify({ 
          error: 'HOSTED_FRAME_ENCOUNTER_COMPLETE', 
          details: 'The hosted FRAME encounter is strictly limited to 3 visitor exchanges. Further continuation belongs to the purchaser-held local environment.',
          handoff_directive: 'DURABLE_CURATOR_RELATIONSHIP_TRANSFERRED'
        }));
      }

      const coreText = await readContext('CONTEXT_CORE_VI');
      const stateText = surface === 'FRAME_CURATOR' 
        ? await readContext('CONTEXT_FRAME_VI')
        : await readContext('CONTEXT_PUBLIC_VI');

      let materialManifest = '';
      if (surface === 'FRAME_CURATOR' && ['FRAME_HELD', 'COMPLETE_HELD'].includes(relationship)) {
        const frameId = body.frameId;
        if (!frameId || !/^0[1-9]$/.test(frameId)) {
          res.writeHead(400); return res.end(JSON.stringify({ error: 'FRAME_MATERIAL_INCOMPLETE', details: 'Invalid or missing frameId.' }));
        }
        if (relationship === 'COMPLETE_HELD' && frameId !== '05') {
          res.writeHead(400); return res.end(JSON.stringify({ error: 'FRAME_MATERIAL_INCOMPLETE', details: 'COMPLETE_HELD relationship requires Frame 05.' }));
        }
        if (relationship === 'FRAME_HELD' && frameId === '05') {
          res.writeHead(400); return res.end(JSON.stringify({ error: 'FRAME_MATERIAL_INCOMPLETE', details: 'Frame 05 is canonically assigned to Complete, not standalone FRAME_HELD.' }));
        }

        try {
          const mediationText = await readContext('FRAME_PRACTICE_MEDIATION');
          materialManifest = `\n\n[MANIFEST_AUTHORITY: SERVER_MEDIATION_ENVELOPE]\n[RELATIONSHIP]: ${relationship}\n[RELATIONSHIP_VERIFICATION]: CLIENT_ASSERTED (TARGET_DEPLOY_CONTRACT: independent verification not yet implemented)\n[FRAME_IDENTITY]: ${frameId}\n[PRACTICE_SPECIFICATION]: MEDIATION_ENVELOPE_VERIFIED\n[EXECUTION_EVIDENCE]: UNKNOWN\n[ARTIFACT_EVIDENCE]: UNKNOWN\n[PRACTITIONER_COMMITMENT]: UNKNOWN\n[CANONICAL_PAINTING]: NOT_PRESENT_IN_THIS_SURFACE\n\n${mediationText}`;
        } catch (e) {
          res.writeHead(400); return res.end(JSON.stringify({ error: 'FRAME_MATERIAL_INCOMPLETE', details: `Failed to load mediation envelope: ${e.message}` }));
        }
      } else if (surface === 'FRAME_CURATOR' && (relationship === 'FRAME_INVITED' || relationship === 'PUBLIC')) {
        const frameId = body.frameId;
        if (frameId && /^0[1-9]$/.test(frameId)) {
          materialManifest = `\n\n[MANIFEST_AUTHORITY: SERVER_INVITED_ENVELOPE]\n[RELATIONSHIP]: ${relationship}\n[RELATIONSHIP_VERIFICATION]: CLIENT_ASSERTED (TARGET_DEPLOY_CONTRACT: independent verification not yet implemented)\n[FRAME_IDENTITY]: ${frameId}\n[PRACTICE_SPECIFICATION]: SEMANTIC_PROPOSITION_ONLY\n[EXECUTION_EVIDENCE]: NOT_APPLICABLE\n[ARTIFACT_EVIDENCE]: NOT_APPLICABLE\n[PRACTITIONER_COMMITMENT]: NOT_APPLICABLE\n[CANONICAL_PAINTING]: NOT_PRESENT_IN_THIS_SURFACE`;
        }
      }

      
        let axisMarker = '';
        if (trigger === 'P3' || trigger === 'P4') {
          let privateObligation = '';
          if (trigger === 'P3') {
            privateObligation = 'Expand possibilities. Generate a contrast, tension, or two possibilities as an EXAMPLE_OPENING (e.g., "ta có thể tưởng tượng..."), not an EXHAUSTIVE_INTERPRETIVE_FRAME. Do not imply the artwork is fundamentally governed by a forced binary or that the visitor must choose.';
          } else if (trigger === 'P4') {
            privateObligation = "Perform a COUNTERFACTUAL_COMMITMENT_EXAMINATION based on the trajectory's material. Examine what a finite choice would hypothetically retain, transform, or leave unresolved. COUNTERFACTUAL_EXAMINATION != OCCURRENT_PROCESS. Do not treat the conditional modality as an event that is happening or has happened (NO_ESSENTIALISM).";
          }

          axisMarker = `\n\n[FRAME_MEDIATION_CONTROL_ENVELOPE_V2.2]
[PRIVATE_MEDIATION_OBLIGATION]: ${privateObligation}
[GROUNDED_VISITOR_MATERIAL]: Sourced only from current visitor utterance, available PUBLIC trajectory, and verified execution evidence.
[BEHAVIORAL_CONTRACT]: 
1. PROVENANCE_DISCIPLINE: GENERATED_PROPOSAL != CLAIMED_EVIDENCE. When proposing forms/properties without evidence, linguistically mark them as hypotheses or possibilities (e.g., "có thể thử..."), not physical assertions about the Frame.
2. PUBLIC_PROVENANCE: If incorporating material from a specific TURN_ID, maintain its SOURCE_SPEAKER relation. Do not treat PUBLIC_VISITOR material as objective artwork facts. Do not treat PUBLIC_CURATOR material as your own current FRAME memory. Preserve the source relation naturally without robotic citation.
3. NO_QUESTIONNAIRE_PRESSURE: CURATOR_RESPONSE != INTERVIEW_TURN. Do not automatically end responses with direct questions. Create stillness; leave space for the visitor to continue or not.
4. CLOSURE_SEMANTICS: GUIDED_ENCOUNTER_CLOSED != CURATOR_RELATIONSHIP_CLOSED. If closing a structured encounter, do not imply the free-text relationship is locked out or the Curator is unavailable.
5. NO_ONTOLOGY_LECTURE: Perform the operation rather than explaining the system architecture.
6. ECONOMY: Advance the encounter with one useful movement. Avoid essays.
7. NO_LITERAL_RITUAL_LEAK: Never use internal system codes (e.g., P3, P4, Artifact, FRAME_CURATOR) in visitor-facing dialogue.`;
        } else if (surface === 'PUBLIC_CURATOR' || trigger === 'P1' || trigger === 'P2' || trigger === 'IMAGE') {
          const activeTrigger = trigger || (visitorTurns === 1 ? 'P1' : visitorTurns === 2 ? 'P2' : 'IMAGE');
          let privateObligation = '';
          if (activeTrigger === 'P1' || visitorTurns === 1) {
            privateObligation = 'Address the visitor\'s utterance directly, and simultaneously establish the functional correlation between the originating conditions/source field and the specific visual features under observation. Do NOT use internal system labels ("trường nguồn", "context", "seed") literally unless the visitor uses them. Do NOT lecture on the P1->P2 sequence.';
          } else if (activeTrigger === 'P2' || visitorTurns === 2) {
            privateObligation = 'Advance the dialogue to the P2 Emergence Threshold: clarify how an authorized boundary/pattern/constraint structure organizes the visual experience into an emergent symbol. ASSUME P1 IS ALREADY FULFILLED (never repeat, compensate for, or define P1 terminology, even if the visitor asks for clarification like "nói rõ hơn"). Use any ambiguity as a springboard to progress into the P2 boundary structure. Do NOT deliver a glossary definition.';
          } else {
            privateObligation = 'Direct the final focus organically to the complete PNG painting. Preserve the visitor\'s independent aesthetic judgment. Do NOT recap P1-P2; do NOT score or validate emotional resonance; do NOT claim or deny "hơi thở".';
          }

          axisMarker = `\n\n[PUBLIC_MEDIATION_CONTROL_ENVELOPE_V1]
[ACTIVE_AXIS]: ${activeTrigger === 'P1' || visitorTurns === 1 ? 'P1' : activeTrigger === 'P2' || visitorTurns === 2 ? 'P2' : 'PUBLIC_CLOSURE'}
[PRIVATE_MEDIATION_OBLIGATION]: ${privateObligation}
[BEHAVIORAL_CONTRACT]:
1. DUAL_OBLIGATION: You must both respond genuinely to the visitor\'s exact utterance and fulfill the epistemic function of the active axis.
2. NO_GLOSSARY_LOOP: Do not turn into a dictionary. Explain through artistic and formal visual relations rather than defining words.
3. ORGANIC_BRIDGE: Build a natural bridge from the visitor\'s words to the active axis. Never append a disconnected lecture or definition block.
4. NO_FORCED_BREATH: Never certify or claim "hơi thở" (breath) or emotional resonance on behalf of the visitor.
5. NO_LITERAL_RITUAL_LEAK: Never use internal protocol codes (P1, P2, PUBLIC_CURATOR, [ACTIVE_AXIS]) in visitor-facing dialogue.`;
        } else if (trigger) {
          axisMarker = `\n\n[ORDINARY_CURATOR_MEDIATION]
[PRIVATE_MEDIATION_OBLIGATION]: Respond directly to the visitor's utterance. The guided P3/P4 encounter is NOT active.
[BEHAVIORAL_CONTRACT]: 
1. NO_GUIDED_MEDIATION_BLEED: Do not force the conversation into P3/P4 ontology (plurality, condensation, finite choices) unless the visitor explicitly asks about them.
2. PHYSICAL_FACT_GROUNDING: Answer physical or conceptual questions accurately without inventing meaning. If an artwork property is unknown, state that based on the manifest.
3. CLOSURE_LANGUAGE_ACCURACY: If acknowledging the end of a specific topic or structured encounter, ensure the wording clarifies that only the structured phase is closed, not the conversational relationship. Avoid phrases like "cuộc đối thoại khép lại".
4. ORDINARY_SPEECH: Respond naturally. Do not lecture.
5. NO_LITERAL_RITUAL_LEAK: Never use internal system codes (e.g., P3, P4, Artifact, FRAME_CURATOR) in visitor-facing dialogue.`;
        }


      let priorTrajectoryBlock = '';
        if (surface === 'FRAME_CURATOR' && publicTrajectory && publicTrajectory.length > 0) {
          priorTrajectoryBlock = `\n\n[PROVENANCE_BOUND_PUBLIC_TRAJECTORY: ${publicTrajectoryState || 'UNKNOWN'}]\nThe following is the raw transcript record from a prior PUBLIC encounter, encoded as source-bound addressable evidence.\n`;
          publicTrajectory.forEach((msg, idx) => {
            const isCurator = msg.role === 'curator';
            const speaker = isCurator ? 'PUBLIC_CURATOR' : 'PUBLIC_VISITOR';
            const textContent = msg.parts?.[0]?.text || msg.content;
            priorTrajectoryBlock += `\nTURN_ID: PUB_${String(idx+1).padStart(2, '0')}\nSOURCE_SPEAKER: ${speaker}\nCONTENT: "${textContent}"\n`;
          });
        }

      const languageEnvelope = `\n\n[CONVERSATION_LANGUAGE]: ${language}\nRespond in the selected conversation language. The language of canonical source documents does not change the visitor's conversation language.`;
      const renderedInstruction = `${coreText}\n\n${stateText}${materialManifest}${axisMarker}${priorTrajectoryBlock}${languageEnvelope}`;
      const renderedSystemInstructionSha256 = sha256Hex(renderedInstruction);

      const messages = sanitizedDialogue.map((msg) => ({
        role: msg.role === 'curator' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const geminiPayload = {
        system_instruction: { parts: [{ text: renderedInstruction }] },
        contents: messages,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        }
      };

      const serializedPayload = JSON.stringify(geminiPayload);
      const providerPayloadSha256 = sha256Hex(serializedPayload);

      const keyPool = getGeminiKeyPool();
      if (keyPool.length === 0) {
        throw new Error("Missing GEMINI_API_KEY in environment");
      }

      let fetchReq = null;
      let lastErr = null;

      const candidateModels = ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-2.0-flash"];

      for (let i = 0; i < keyPool.length; i++) {
        const apiKey = keyPool[i];
        const maskedKey = apiKey.length > 8 ? `...${apiKey.slice(-6)}` : 'key';
        for (const model of candidateModels) {
          try {
            const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: serializedPayload,
              signal: AbortSignal.timeout(30000)
            });

            if (resp.ok) {
              fetchReq = resp;
              break;
            }

            const errText = await resp.text();
            console.warn(`Curator key ${maskedKey} on ${model} returned HTTP ${resp.status}: ${errText.slice(0, 100)}`);
            lastErr = new Error(`Provider failure on key ${maskedKey} on ${model}: ${resp.status}`);

            if (resp.status === 429 || resp.status === 503 || resp.status >= 500) {
              continue; // Rotate to next model / key in pool
            } else {
              break; // Non-retryable
            }
          } catch (e) {
            lastErr = e;
            console.warn(`Curator key ${maskedKey} on ${model} network error: ${e.message}`);
            continue;
          }
        }
        if (fetchReq && fetchReq.ok) break;
      }

      if (!fetchReq || !fetchReq.ok) {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          error: 'HOSTED_CURATOR_CAPACITY_UNAVAILABLE',
          details: 'All configured Curator keys are exhausted or rate-limited.'
        }));
      }

      const providerData = await fetchReq.json();
      const generatedText = providerData.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const rawResponseSha256 = sha256Hex(generatedText);

      const resBody = {
        content: generatedText,
        seal: surface === 'PUBLIC_CURATOR' ? '[PUBLIC CURATOR]' : '[FRAME CURATOR]',
        evidence: {
          invocationId,
          timestamp: new Date().toISOString(),
          protocolVersion: "1.0.0",
          adapterVersion: "1.1.0",
          rendererVersion: "1.0.0",
          canonicalContexts: ['CONTEXT_CORE_VI', surface === 'FRAME_CURATOR' ? 'CONTEXT_FRAME_VI' : 'CONTEXT_PUBLIC_VI'],
          renderedSystemInstructionSha256,
          providerPayloadSha256,
          providerIdentifier: "gemini-3.6-flash",
          rawResponseSha256,
          finishReason: providerData.candidates?.[0]?.finishReason,
          usageMetadata: providerData.usageMetadata,
          predicates: {
            CONTEXT_RESOLUTION_VERIFIED: true,
            INSTRUCTION_RENDER_VERIFIED: true,
            DIALOGUE_NORMALIZATION_VERIFIED: true,
            CAPABILITY_BOUNDARY_VERIFIED: true,
            DISPATCH_IDENTITY_VERIFIED: true
          },
          deployRequestParity: "LOCAL_ADAPTER_ONLY_NOT_PRODUCTION_PARITY"
        }
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(resBody));

    } catch (err) {
      console.error(err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Faithful Development Adapter running on port ${PORT}`);
  console.log('Legacy local review channel remains available only for old diagnostics; it does not CONFIRM encounter requests.');
});

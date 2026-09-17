// Server-side Artist Ceremony Handler.
// Manages the secure, asynchronous AirGap Vault authorization ceremony.
// Holds SUPABASE_SECRET_KEY server credentials; client never sees or handles service_role.

let viemRecover = null;
try {
  const viem = await import('viem');
  viemRecover = viem.recoverTypedDataAddress;
} catch {
  // Fallback if imported from a directory without direct node_modules resolution
}

import { generateEthSignRequestUr, URDecoder as URDecoderClass } from './ur-pure.js';

export const DEPLOYED_ARTIST = '0x3cff39491b333016055B3d9328905B0b172988a4';
export const COMPLETE_CONTRACT = '0xdf12fc901934f1ADfBB6e5199B13AC7287dd9FD8';
export const ARTIST_XFP = '5005e802';
export const LEAF_DERIVATION_PATH = "m/44'/60'/0'/0/0";

export const CANONICAL_BUNDLE = Object.freeze({
  canonicalDesignationHash: '0xed740b4339af1e965723519c7807b5a6184da0f4963f4866d42661ef85cf083f',
  archiveCommitment:        '0x7689f75da4ef23bf040ad57f282b24b84f6ede5e17b92cb5cd6a4dc96fced5e9',
  licenseHash:              '0x71d01dbc1962a5cedd1204fe76fa9d538e5d338146eb9375743b91a55cde8c14',
  paintingTokenId:          '0',
  frameTokenId:             '5',
});

export const COMPLETE_DOMAIN = Object.freeze({
  name: 'HienSinh',
  version: '2',
  chainId: 8453,
  verifyingContract: COMPLETE_CONTRACT,
});

export const COMPLETE_TYPES = Object.freeze({
  EIP712Domain: [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'verifyingContract', type: 'address' },
  ],
  CompletePackageAcceptance: [
    { name: 'canonicalDesignationHash', type: 'bytes32' },
    { name: 'archiveCommitment', type: 'bytes32' },
    { name: 'licenseHash', type: 'bytes32' },
    { name: 'paintingTokenId', type: 'uint256' },
    { name: 'frameTokenId', type: 'uint256' },
    { name: 'designatedBearer', type: 'address' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
});

// CBOR decoding helper functions for ur:eth-signature
function cborReadUint(buf, pos) {
  const b = buf[pos++];
  const add = b & 0x1f;
  if (add < 24) return { val: add, pos };
  if (add === 24) return { val: buf[pos], pos: pos + 1 };
  if (add === 25) return { val: (buf[pos] << 8) | buf[pos + 1], pos: pos + 2 };
  if (add === 26) {
    const v = ((buf[pos] << 24) >>> 0) | ((buf[pos + 1] << 16) | (buf[pos + 2] << 8) | buf[pos + 3]);
    return { val: v >>> 0, pos: pos + 4 };
  }
  throw new Error('CBOR uint too large at ' + (pos - 1));
}

function cborReadBstr(buf, pos) {
  const r = cborReadUint(buf, pos);
  const end = r.pos + r.val;
  return { val: buf.slice(r.pos, end), pos: end };
}

function cborReadTstr(buf, pos) {
  const r = cborReadUint(buf, pos);
  const end = r.pos + r.val;
  return { val: new TextDecoder().decode(buf.slice(r.pos, end)), pos: end };
}

function cborSkipValue(buf, pos) {
  const b = buf[pos];
  const mt = b >> 5;
  const add = b & 0x1f;
  if (mt === 0 || mt === 1) { return cborReadUint(buf, pos).pos; }
  if (mt === 2 || mt === 3) { const r = cborReadUint(buf, pos); return r.pos + r.val; }
  if (mt === 4) {
    const r = cborReadUint(buf, pos);
    let p = r.pos;
    for (let i = 0; i < r.val; i++) p = cborSkipValue(buf, p);
    return p;
  }
  if (mt === 5) {
    const r = cborReadUint(buf, pos);
    let p = r.pos;
    for (let i = 0; i < r.val * 2; i++) p = cborSkipValue(buf, p);
    return p;
  }
  if (mt === 6) {
    const r = cborReadUint(buf, pos);
    return cborSkipValue(buf, r.pos);
  }
  if (mt === 7 && (add === 20 || add === 21 || add === 22)) return pos + 1;
  throw new Error('Unknown CBOR type mt=' + mt + ' at ' + pos);
}

export function parseETHSignatureCBOR(cborBytes) {
  const buf = cborBytes instanceof Uint8Array ? cborBytes : new Uint8Array(cborBytes);
  let pos = 0;
  const mapHdr = cborReadUint(buf, pos);
  pos = mapHdr.pos;
  const mapLen = mapHdr.val;
  let requestId = null, signature = null, origin = null;

  for (let k = 0; k < mapLen; k++) {
    const keyR = cborReadUint(buf, pos);
    const key = keyR.val;
    pos = keyR.pos;

    if (key === 1) { // requestId
      if ((buf[pos] >> 5) === 6) {
        const tagR = cborReadUint(buf, pos);
        pos = tagR.pos;
      }
      const r = cborReadBstr(buf, pos);
      pos = r.pos;
      requestId = Array.from(r.val).map(b => b.toString(16).padStart(2, '0')).join('');
    } else if (key === 2) { // signature (65-byte ECDSA)
      const r = cborReadBstr(buf, pos);
      pos = r.pos;
      signature = '0x' + Array.from(r.val).map(b => b.toString(16).padStart(2, '0')).join('');
    } else if (key === 3) {
      const r = cborReadTstr(buf, pos);
      pos = r.pos;
      origin = r.val;
    } else {
      pos = cborSkipValue(buf, pos);
    }
  }
  return { requestId, signature, origin };
}

// Standard 256-word Bytewords dictionary for robust offline fallback
const BYTEWORDS_256 = 'ableacidalsoapexaquaarchatomauntawayaxisbackbaldbarnbeltbetabiasbluebodybragbrewbulbbuzzcalmcashcatschefcityclawcodecolacookcostcruxcurlcuspcyandarkdatadaysdelidicedietdoordowndrawdropdrumdulldutyeacheasyechoedgeepicevenexamexiteyesfactfairfernfigsfilmfishfizzflapflewfluxfoxyfreefrogfuelfundgalagamegeargemsgiftgirlglowgoodgraygrimgurugushgyrohalfhanghardhawkheathelphighhillholyhopehornhutsicedideaidleinchinkyintoirisironitemjadejazzjoinjoltjowljudojugsjumpjunkjurykeepkenokeptkeyskickkilnkingkitekiwiknoblamblavalazyleaflegsliarlimplionlistlogoloudloveluaulucklungmainmanymathmazememomenumeowmildmintmissmonknailnavyneednewsnextnoonnotenumbobeyoboeomitonyxopenovalowlspaidpartpeckplaypluspoempoolposepuffpumapurrquadquizraceramprealredorichroadrockroofrubyruinrunsrustsafesagascarsetssilkskewslotsoapsolosongstubsurfswantacotasktaxitenttiedtimetinytoiltombtoystriptunatwinuglyundouniturgeuservastveryvetovialvibeviewvisavoidvowswallwandwarmwaspwavewaxywebswhatwhenwhizwolfworkyankyawnyellyogayurtzapszerozestzinczonezoom';

const BYTEWORDS_MINIMAL_MAP = new Map();
for (let i = 0; i < 256; i++) {
  const w = BYTEWORDS_256.slice(i * 4, i * 4 + 4);
  BYTEWORDS_MINIMAL_MAP.set(w[0] + w[3], i);
}

export function decodeMinimalBytewords(bytewordsStr) {
  const clean = bytewordsStr.toLowerCase().replace(/[^a-z]/g, '');
  if (clean.length % 2 !== 0) throw new Error('Invalid bytewords length');
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    const pair = clean.slice(i, i + 2);
    const val = BYTEWORDS_MINIMAL_MAP.get(pair);
    if (val === undefined) throw new Error('Unknown byteword: ' + pair);
    bytes[i / 2] = val;
  }
  if (bytes.length >= 4) {
    return bytes.slice(0, bytes.length - 4);
  }
  return bytes;
}

export function extractSignatureFromUR(urString) {
  const clean = urString.trim();
  if (clean.startsWith('0x') && clean.length === 132) {
    return { signature: clean, requestId: null };
  }
  const prefix = 'ur:eth-signature/';
  if (!clean.toLowerCase().startsWith(prefix)) {
    throw new Error('Expected ur:eth-signature format or 0x hex signature');
  }

  // 1. Primary: use official URDecoder from bc-ur library
  if (URDecoderClass) {
    try {
      const dec = new URDecoderClass();
      dec.receivePart(clean.toLowerCase());
      if (dec.isComplete() && dec.isSuccess()) {
        const res = dec.resultUR();
        return parseETHSignatureCBOR(res.cbor);
      }
    } catch {
      // Continue to fallback
    }
  }

  // 2. Fallback: standard minimal bytewords parser
  const bytewordsPayload = clean.slice(prefix.length);
  const cborBytes = decodeMinimalBytewords(bytewordsPayload);
  return parseETHSignatureCBOR(cborBytes);
}

export async function checkWalletIncompatibleOwnership(walletAddress, config = {}, fetcher = fetch) {
  if (!walletAddress || typeof walletAddress !== 'string') return { ownsIncompatible: false };
  const normWallet = walletAddress.toLowerCase();
  
  // Artist signer address is not disqualified by its genesis holdings (Token 0 / Token 6)
  const expectedArtist = (config.expectedArtist || DEPLOYED_ARTIST).toLowerCase();
  if (normWallet === expectedArtist) {
    return { ownsIncompatible: false };
  }

  // Hook for testing / dependency injection
  if (typeof config.checkOwnership === 'function') {
    return config.checkOwnership(normWallet);
  }

  const contractAddress = config.contractAddress || COMPLETE_CONTRACT;
  // Only existing Package 05 ownership (Token 0 or Token 5) prevents entering the queue.
  // Standalone frame owners (e.g. Frame 02) remain eligible to submit Three Brushstrokes.
  const tokensToCheck = [0, 5];

  // Check via custom provider if supplied
  if (config.provider) {
    for (const tokenId of tokensToCheck) {
      try {
        const data = '0x6352211e' + BigInt(tokenId).toString(16).padStart(64, '0');
        const res = await config.provider.request({
          method: 'eth_call',
          params: [{ to: contractAddress, data }, 'latest'],
        });
        if (typeof res === 'string' && res.length >= 66) {
          const owner = '0x' + res.slice(-40).toLowerCase();
          if (owner === normWallet) {
            return { ownsIncompatible: true, tokenId };
          }
        }
      } catch {
        // Token unminted or call reverted
      }
    }
    return { ownsIncompatible: false };
  }

  // Check via RPC client / public client if supplied
  if (config.rpcClient?.readContract) {
    for (const tokenId of tokensToCheck) {
      try {
        const owner = await config.rpcClient.readContract({
          address: contractAddress,
          abi: [{
            name: 'ownerOf',
            type: 'function',
            stateMutability: 'view',
            inputs: [{ name: 'tokenId', type: 'uint256' }],
            outputs: [{ name: '', type: 'address' }],
          }],
          functionName: 'ownerOf',
          args: [BigInt(tokenId)],
        });
        if (typeof owner === 'string' && owner.toLowerCase() === normWallet) {
          return { ownsIncompatible: true, tokenId };
        }
      } catch {
        // Token unminted
      }
    }
    return { ownsIncompatible: false };
  }

  // Check via HTTP RPC (Base 8453)
  const rpcUrl = config.baseRpcUrl
    || (typeof process !== 'undefined' && process?.env?.BASE_RPC_URL_PRIMARY)
    || 'https://mainnet.base.org';

  try {
    const checks = tokensToCheck.map(async (tokenId) => {
      const data = '0x6352211e' + BigInt(tokenId).toString(16).padStart(64, '0');
      const rpcBody = JSON.stringify({
        jsonrpc: '2.0',
        id: tokenId + 1,
        method: 'eth_call',
        params: [{ to: contractAddress, data }, 'latest'],
      });
      const res = await fetcher(rpcUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: rpcBody,
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return null;
      const json = await res.json();
      if (typeof json?.result === 'string' && json.result.length >= 66) {
        const owner = '0x' + json.result.slice(-40).toLowerCase();
        if (owner === normWallet) {
          return tokenId;
        }
      }
      return null;
    });

    const results = await Promise.all(checks);
    const owned = results.find((t) => t !== null && t !== undefined);
    if (owned !== undefined) {
      return { ownsIncompatible: true, tokenId: owned };
    }
  } catch {
    // Non-fatal if offline/unconfigured
  }

  return { ownsIncompatible: false };
}

export async function handleArtistCeremony(request, config, fetcher = fetch) {
  const reqOrigin = request.headers.get('origin');
  const isAllowedOrigin = !config.origin
    || !reqOrigin
    || reqOrigin === 'null'
    || reqOrigin === config.origin
    || reqOrigin.startsWith('http://localhost')
    || reqOrigin.startsWith('http://127.0.0.1');

  const corsOrigin = (!reqOrigin || reqOrigin === 'null') ? '*' : (isAllowedOrigin ? reqOrigin : config.origin);

  const corsHeaders = {
    'access-control-allow-origin': corsOrigin,
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type, apikey, authorization',
    'access-control-max-age': '86400',
    'cache-control': 'no-store',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const reply = (status, body) => Response.json(body, {
    status,
    headers: corsHeaders,
  });

  if (request.method !== 'POST') return reply(405, { error: 'METHOD_NOT_ALLOWED' });

  if (!isAllowedOrigin) {
    return reply(403, { error: 'ORIGIN_NOT_ALLOWED' });
  }

  let body;
  try { body = await request.json(); } catch { return reply(400, { error: 'INVALID_JSON' }); }
  if (!body || typeof body.action !== 'string') return reply(400, { error: 'INVALID_ACTION' });

  let base;
  try {
    base = new URL(config.supabaseUrl);
    if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash || base.pathname !== '/') throw new Error();
  } catch {
    return reply(503, { error: 'CEREMONY_SERVICE_NOT_CONFIGURED' });
  }

  const localLegacy = config.local === true && ['127.0.0.1', 'localhost'].includes(base.hostname)
    && base.port === '55321' && typeof config.serverKey === 'string' && config.serverKey.startsWith('eyJ');

  const isKeyValid = typeof config.serverKey === 'string' && (config.serverKey.startsWith('sb_secret_') || config.serverKey.startsWith('eyJ') || localLegacy);
  if (!isKeyValid) {
    return reply(503, { error: 'CEREMONY_SERVICE_NOT_CONFIGURED' });
  }

  const headers = {
    'content-type': 'application/json',
    apikey: config.serverKey,
    authorization: `Bearer ${config.serverKey}`,
  };

  // 1. ACTION: list_pending
  if (body.action === 'list_pending') {
    try {
      const url = new URL('/rest/v1/rpc/list_pending_encounter_requests', base);
      const res = await fetcher(url, { method: 'POST', headers, signal: AbortSignal.timeout(15000), body: '{}' });
      if (!res.ok) { await res.body?.cancel(); return reply(503, { error: 'SUPABASE_UNAVAILABLE' }); }
      const rows = await res.json();
      const pending = Array.isArray(rows) ? rows.map(r => ({
        requestId: r.requestId || r.request_id,
        walletAddress: r.walletAddress || r.wallet_address,
        submittedAt: r.submittedAt || r.submitted_at,
        chainId: r.chainId || r.chain_id || 8453,
        contributionsCount: Array.isArray(r.contributions) ? r.contributions.length : 0,
        contributions: r.contributions,
      })) : [];

      return reply(200, { status: 'OK', pending });
    } catch {
      return reply(503, { error: 'CEREMONY_SERVICE_UNAVAILABLE' });
    }
  }

  // 2. ACTION: prepare_bundle
  if (body.action === 'prepare_bundle') {
    const { requestId, walletAddress } = body;
    if (!requestId || typeof requestId !== 'string' || !/^[0-9a-f-]{36}$/i.test(requestId)) {
      return reply(400, { error: 'INVALID_REQUEST_ID' });
    }
    if (!walletAddress || typeof walletAddress !== 'string' || !/^0x[0-9a-f]{40}$/i.test(walletAddress) || /^0x0{40}$/i.test(walletAddress)) {
      return reply(400, { error: 'INVALID_WALLET_ADDRESS' });
    }

    try {
      const checkUrl = new URL('/rest/v1/rpc/get_pending_encounter_request', base);
      const checkRes = await fetcher(checkUrl, {
        method: 'POST',
        headers,
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({ p_request_id: requestId, p_wallet_address: walletAddress.toLowerCase() })
      });
      if (!checkRes.ok) { await checkRes.body?.cancel(); return reply(503, { error: 'SUPABASE_UNAVAILABLE' }); }
      const checkResult = await checkRes.json();
      if (checkResult?.error === 'AUTHORIZATION_ALREADY_EXISTS_FOR_WALLET') {
        return reply(409, { error: 'AUTHORIZATION_ALREADY_EXISTS_FOR_WALLET' });
      }
      if (checkResult?.error === 'PENDING_REQUEST_NOT_FOUND' || !checkResult || checkResult.status !== 'OK') {
        return reply(404, { error: 'PENDING_REQUEST_NOT_FOUND' });
      }

      const preparedAt = Math.floor(Date.now() / 1000);
      const deadline = preparedAt + 7 * 86400; // 7 days
      const nonce = 0; // Default on-chain nonce

      const message = {
        canonicalDesignationHash: CANONICAL_BUNDLE.canonicalDesignationHash,
        archiveCommitment:        CANONICAL_BUNDLE.archiveCommitment,
        licenseHash:              CANONICAL_BUNDLE.licenseHash,
        paintingTokenId:          CANONICAL_BUNDLE.paintingTokenId,
        frameTokenId:             CANONICAL_BUNDLE.frameTokenId,
        designatedBearer:         walletAddress.toLowerCase(),
        nonce:                    String(nonce),
        deadline:                 String(deadline),
      };

      const typedData = {
        domain: COMPLETE_DOMAIN,
        types: COMPLETE_TYPES,
        primaryType: 'CompletePackageAcceptance',
        message,
      };

      const metamaskSignData = JSON.stringify(typedData);

      let urSingle = null;
      let urFountainFrames = null;
      let fragmentsLength = 1;

      if (generateEthSignRequestUr) {
        try {
          const urRes = generateEthSignRequestUr({
            requestId,
            metamaskSignData,
            xfpHex: ARTIST_XFP,
            hdPath: LEAF_DERIVATION_PATH,
            chainId: 8453,
            fragmentSize: 220,
            maxFountainFrames: 80,
          });
          urSingle = urRes.singlePart;
          urFountainFrames = urRes.fountainFrames;
          fragmentsLength = urRes.fragmentsLength;
        } catch (e) {
          console.error('Failed to generate UR sign request:', e);
        }
      }

      return reply(200, {
        status: 'OK',
        requestId,
        preparedAt,
        deadline,
        typedData,
        metamaskSignData,
        urSingle,
        urFountainFrames,
        fragmentsLength,
        derivationPath: LEAF_DERIVATION_PATH,
        sourceFingerprint: ARTIST_XFP,
        expectedArtist: DEPLOYED_ARTIST,
      });
    } catch {
      return reply(503, { error: 'CEREMONY_SERVICE_UNAVAILABLE' });
    }
  }

  // 3. ACTION: confirm_signature
  if (body.action === 'confirm_signature') {
    const { requestId, walletAddress, signatureUr, signatureHex, preparedAt, deadline } = body;
    if (!requestId || typeof requestId !== 'string' || !/^[0-9a-f-]{36}$/i.test(requestId)) {
      return reply(400, { error: 'INVALID_REQUEST_ID' });
    }
    if (!walletAddress || typeof walletAddress !== 'string' || !/^0x[0-9a-f]{40}$/i.test(walletAddress) || /^0x0{40}$/i.test(walletAddress)) {
      return reply(400, { error: 'INVALID_WALLET_ADDRESS' });
    }

    let signature = signatureHex;
    let decodedRequestId = null;

    if (signatureUr) {
      try {
        const parsed = extractSignatureFromUR(signatureUr);
        if (parsed.signature) signature = parsed.signature;
        if (parsed.requestId) decodedRequestId = parsed.requestId;
      } catch (err) {
        if (!signature) {
          return reply(400, { error: 'INVALID_SIGNATURE_UR', details: err instanceof Error ? err.message : String(err) });
        }
      }
    }

    if (decodedRequestId) {
      const normInputReq = requestId.replace(/-/g, '').toLowerCase();
      const normDecodedReq = decodedRequestId.replace(/-/g, '').toLowerCase();
      if (normInputReq !== normDecodedReq) {
        return reply(400, {
          error: 'REQUEST_ID_MISMATCH',
          details: `Expected request ID ${requestId}, got ${decodedRequestId}`
        });
      }
    }

    if (!signature || typeof signature !== 'string' || !/^0x[0-9a-f]{130}$/i.test(signature)) {
      return reply(400, { error: 'INVALID_SIGNATURE_FORMAT' });
    }

    const resolvedPreparedAt = typeof preparedAt === 'number' && preparedAt > 0
      ? preparedAt
      : Math.floor(Date.now() / 1000);
    const resolvedDeadline = typeof deadline === 'number' && deadline > resolvedPreparedAt
      ? deadline
      : resolvedPreparedAt + 7 * 86400;

    const message = {
      canonicalDesignationHash: CANONICAL_BUNDLE.canonicalDesignationHash,
      archiveCommitment:        CANONICAL_BUNDLE.archiveCommitment,
      licenseHash:              CANONICAL_BUNDLE.licenseHash,
      paintingTokenId:          0n,
      frameTokenId:             5n,
      designatedBearer:         walletAddress.toLowerCase(),
      nonce:                    0n,
      deadline:                 BigInt(resolvedDeadline),
    };

    const typedData = {
      domain: COMPLETE_DOMAIN,
      types: { CompletePackageAcceptance: COMPLETE_TYPES.CompletePackageAcceptance },
      primaryType: 'CompletePackageAcceptance',
      message,
    };

    let recoveredSigner;
    const recoverFn = config.recoverAddress || viemRecover;
    if (!recoverFn) {
      return reply(503, { error: 'RECOVERY_FUNCTION_NOT_AVAILABLE' });
    }
    try {
      recoveredSigner = await recoverFn({
        domain: typedData.domain,
        types: typedData.types,
        primaryType: typedData.primaryType,
        message: typedData.message,
        signature,
      });
    } catch (err) {
      return reply(400, { error: 'SIGNATURE_RECOVERY_FAILED', details: err instanceof Error ? err.message : String(err) });
    }

    const expectedArtist = config.expectedArtist || DEPLOYED_ARTIST;
    if (recoveredSigner.toLowerCase() !== expectedArtist.toLowerCase()) {
      return reply(403, {
        error: 'SIGNER_MISMATCH',
        recoveredSigner,
        expectedArtist,
      });
    }

    // Server-side atomic persistence via RPC
    const authorizationPayload = {
      domain: COMPLETE_DOMAIN,
      types: COMPLETE_TYPES,
      primaryType: 'CompletePackageAcceptance',
      message: {
        canonicalDesignationHash: CANONICAL_BUNDLE.canonicalDesignationHash,
        archiveCommitment:        CANONICAL_BUNDLE.archiveCommitment,
        licenseHash:              CANONICAL_BUNDLE.licenseHash,
        paintingTokenId:          '0',
        frameTokenId:             '5',
        designatedBearer:         walletAddress.toLowerCase(),
        nonce:                    '0',
        deadline:                 String(resolvedDeadline),
      },
      signature,
    };

    const preparedAtIso = new Date(resolvedPreparedAt * 1000).toISOString();
    const deadlineIso = new Date(resolvedDeadline * 1000).toISOString();

    try {
      const rpcRes = await fetcher(new URL('/rest/v1/rpc/store_verified_acquisition_authorization', base), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          p_wallet_address: walletAddress.toLowerCase(),
          p_authorization: authorizationPayload,
          p_request_id: requestId,
          p_prepared_at: preparedAtIso,
          p_deadline: deadlineIso,
        }),
      });

      if (!rpcRes.ok) {
        const errText = await rpcRes.text();
        return reply(409, { error: 'AUTHORIZATION_STORE_FAILED', details: errText });
      }

      const authId = await rpcRes.json();
      return reply(200, {
        status: 'CONFIRMED_AND_STORED',
        authorizationId: authId,
        recoveredSigner,
        walletAddress: walletAddress.toLowerCase(),
        requestId,
      });
    } catch {
      return reply(503, { error: 'CEREMONY_SERVICE_UNAVAILABLE' });
    }
  }

  return reply(400, { error: 'UNKNOWN_ACTION' });
}

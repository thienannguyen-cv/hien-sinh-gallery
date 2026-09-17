import { checkWalletIncompatibleOwnership } from './artist-ceremony.js';

// Unsigned encounter submission. Supabase confirmation is an address-level
// Artist decision; this route grants no wallet session or private asset access.
export async function handleEncounterRequest(request, config, fetcher = fetch) {
  const reply = (status, body) => Response.json(body,{status,headers:{'cache-control':'no-store'}});
  if (request.method !== 'POST') return reply(405,{error:'METHOD_NOT_ALLOWED'});
  if (request.headers.get('origin') !== config.origin) return reply(403,{error:'ORIGIN_NOT_ALLOWED'});
  if (new URL(request.url).search) return reply(400,{error:'QUERY_NOT_ALLOWED'});
  if (!request.headers.get('content-type')?.startsWith('application/json')) return reply(415,{error:'JSON_REQUIRED'});
  let text = '', count = 0;
  const reader = request.body?.getReader(); if (!reader) return reply(400,{error:'INVALID_REQUEST'});
  const decoder = new TextDecoder();
  try {
    while(true) {const part=await reader.read();if(part.done)break;count+=part.value.length;
      if(count>65536){await reader.cancel();return reply(413,{error:'REQUEST_TOO_LARGE'});}text+=decoder.decode(part.value,{stream:true});}
    text+=decoder.decode();
  } finally {reader.releaseLock();}
  let body;try{body=JSON.parse(text);}catch{return reply(400,{error:'INVALID_JSON'});}
  if(!body || typeof body.walletAddress!=='string' || !/^0x[0-9a-f]{40}$/i.test(body.walletAddress)
    || /^0x0{40}$/i.test(body.walletAddress)) return reply(400,{error:'INVALID_WALLET'});
  if(!['submit','status'].includes(body.action)) return reply(400,{error:'INVALID_ACTION'});
  const allowed = body.action==='submit' ? ['action','walletAddress','contributions'] : ['action','walletAddress'];
  if(Object.keys(body).some(k=>!allowed.includes(k))) return reply(400,{error:'UNEXPECTED_FIELD'});
  if(body.action==='submit' && (!Array.isArray(body.contributions) || body.contributions.length!==3
    || body.contributions.some(v=>typeof v!=='string' || !v.trim() || v.length>4000))) return reply(400,{error:'THREE_CONTRIBUTIONS_REQUIRED'});

  // Admission-time ownership check: a wallet owning an existing frame/package cannot enter the queue
  if (body.action === 'submit') {
    const check = await checkWalletIncompatibleOwnership(body.walletAddress, config, fetcher);
    if (check.ownsIncompatible) {
      return reply(409, {
        error: 'INELIGIBLE_WALLET_ALREADY_ACQUIRED_PACKAGE_05',
        details: `Wallet ${body.walletAddress} already owns token ${check.tokenId} (Package 05 component).`
      });
    }
  }
  let base;
  try{base=new URL(config.supabaseUrl);if(base.protocol!=='https:' || base.username || base.password || base.search || base.hash || base.pathname!=='/')throw new Error();}
  catch{return reply(503,{error:'ENCOUNTER_NOT_CONFIGURED'});}
  const localLegacy = config.local === true && ['127.0.0.1','localhost'].includes(base.hostname)
    && base.port === '55321' && typeof config.serverKey === 'string' && config.serverKey.startsWith('eyJ');
  const isKeyValid = typeof config.serverKey === 'string' && (config.serverKey.startsWith('sb_secret_') || config.serverKey.startsWith('eyJ') || localLegacy);
  if(!isKeyValid) return reply(503,{error:'ENCOUNTER_NOT_CONFIGURED'});
  const name=body.action==='submit'?'submit_encounter_request':'encounter_request_status';
  const payload={p_wallet_address:body.walletAddress.toLowerCase()};
  if(body.action==='submit')payload.p_contributions=body.contributions;
  try {
    const response = await fetcher(new URL(`/rest/v1/rpc/${name}`, base), {
      method: 'POST', redirect: 'manual', signal: AbortSignal.timeout(15000),
      headers: { 'content-type': 'application/json', apikey: config.serverKey, authorization: `Bearer ${config.serverKey}` },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return reply(503, { error: 'ENCOUNTER_SERVICE_UNAVAILABLE', rpcStatus: response.status, details: errText });
    }
    const result = await response.json();
    if (body.action === 'status') {
      if (!['NONE', 'PENDING', 'CONFIRMED', 'DECLINED', 'REVOKED'].includes(result)) {
        return reply(503, { error: 'ENCOUNTER_SERVICE_UNAVAILABLE', details: 'INVALID_STATUS: ' + String(result) });
      }
      return reply(200, { status: result });
    }
    if (typeof result !== 'string' || !/^[0-9a-f-]{36}$/i.test(result)) {
      return reply(503, { error: 'ENCOUNTER_SERVICE_UNAVAILABLE', details: 'INVALID_REQUEST_ID' });
    }
    return reply(201, { requestId: result, status: 'PENDING_ARTIST_REVIEW' });
  } catch (err) {
    return reply(503, { error: 'ENCOUNTER_SERVICE_UNAVAILABLE', details: err?.message || String(err) });
  }
}

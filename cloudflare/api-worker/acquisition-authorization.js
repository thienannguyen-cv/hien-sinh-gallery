// Read-only delivery of a wallet-bound acquisition authorization. The Worker
// never holds an Artist private key and cannot generate an Artist signature.

export async function handleAcquisitionAuthorization(request, config, fetcher = fetch) {
  const reply = (status, body) => Response.json(body, {
    status,
    headers: { 'cache-control': 'no-store' },
  });
  if (request.method !== 'POST') return reply(405, { error: 'METHOD_NOT_ALLOWED' });
  if (request.headers.get('origin') !== config.origin) return reply(403, { error: 'ORIGIN_NOT_ALLOWED' });
  if (new URL(request.url).search || !request.headers.get('content-type')?.startsWith('application/json')) return reply(400, { error: 'INVALID_REQUEST' });
  let body; try { body = await request.json(); } catch { return reply(400, { error: 'INVALID_JSON' }); }
  if (!body || Object.keys(body).length !== 2 || body.action !== 'get' || typeof body.walletAddress !== 'string'
    || !/^0x[0-9a-f]{40}$/i.test(body.walletAddress) || /^0x0{40}$/i.test(body.walletAddress)) return reply(400, { error: 'INVALID_REQUEST' });
  let base; try { base = new URL(config.supabaseUrl); if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash || base.pathname !== '/') throw new Error(); }
  catch { return reply(503, { error: 'AUTHORIZATION_NOT_CONFIGURED' }); }
  const localLegacy = config.local === true && ['127.0.0.1', 'localhost'].includes(base.hostname) && base.port === '55321' && typeof config.serverKey === 'string' && config.serverKey.startsWith('eyJ');
  const isKeyValid = typeof config.serverKey === 'string' && (config.serverKey.startsWith('sb_secret_') || config.serverKey.startsWith('eyJ') || localLegacy);
  if (!isKeyValid) return reply(503, { error: 'AUTHORIZATION_NOT_CONFIGURED' });
  try {
    const response = await fetcher(new URL('/rest/v1/rpc/acquisition_authorization_for_wallet', base), {
      method: 'POST', redirect: 'manual', signal: AbortSignal.timeout(15000),
      headers: { 'content-type': 'application/json', apikey: config.serverKey, authorization: `Bearer ${config.serverKey}` },
      body: JSON.stringify({ p_wallet_address: body.walletAddress.toLowerCase() }),
    });
    if (!response.ok) { await response.body?.cancel(); return reply(503, { error: 'AUTHORIZATION_SERVICE_UNAVAILABLE' }); }
    const authorization = await response.json();
    return reply(200, authorization ? { status: 'ISSUED', authorization } : { status: 'NOT_ISSUED' });
  } catch { return reply(503, { error: 'AUTHORIZATION_SERVICE_UNAVAILABLE' }); }
}

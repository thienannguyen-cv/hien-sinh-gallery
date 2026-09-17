// Same-origin transport only. Wallet ownership is checked by the archive service.
export async function proxyArchiveRequest(request, configuration, fetcher = fetch) {
  const reply = (status, error) => new Response(JSON.stringify({ error }), {
    status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
  if (request.method !== 'POST') return reply(405, 'METHOD_NOT_ALLOWED');
  if (request.headers.get('origin') !== configuration.origin) return reply(403, 'ORIGIN_NOT_ALLOWED');
  if (new URL(request.url).search) return reply(400, 'QUERY_NOT_ALLOWED');
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return reply(415, 'INVALID_CONTENT_TYPE');
  let upstream;
  try {
    upstream = new URL(configuration.endpoint);
    const local = configuration.local === true && upstream.protocol === 'http:'
      && upstream.hostname === '127.0.0.1' && upstream.port === '55325';
    if ((!local && upstream.protocol !== 'https:') || upstream.username || upstream.password || upstream.search || upstream.hash) throw new Error();
  } catch { return reply(503, 'ARCHIVE_NOT_CONFIGURED'); }
  if (Number(request.headers.get('content-length')) > 8192) return reply(413, 'REQUEST_TOO_LARGE');
  const reader = request.body?.getReader();
  if (!reader) return reply(400, 'INVALID_REQUEST');
  const chunks = []; let length = 0;
  try {
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      length += part.value.byteLength;
      if (length > 8192) { await reader.cancel(); return reply(413, 'REQUEST_TOO_LARGE'); }
      chunks.push(part.value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  const headers = { 'content-type': 'application/json', origin: configuration.origin };
  if (configuration.anonKey) headers.apikey = configuration.anonKey;
  try {
    const response = await fetcher(upstream.href, {
      method: 'POST', headers, body: bytes, redirect: 'manual', signal: AbortSignal.timeout(30000),
    });
    if (!response.headers.get('content-type')?.includes('application/json')) {
      await response.body?.cancel();
      return reply(502, 'ARCHIVE_SERVICE_UNAVAILABLE');
    }
    return new Response(response.body, { status: response.status, headers: {
      'content-type': 'application/json', 'cache-control': 'no-store',
    } });
  } catch { return reply(503, 'ARCHIVE_SERVICE_UNAVAILABLE'); }
}

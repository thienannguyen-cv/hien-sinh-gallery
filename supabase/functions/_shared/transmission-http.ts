import { ArchiveAccessError, type createTransmissionService } from './transmission-service.ts';

type Service = ReturnType<typeof createTransmissionService>;

export function createTransmissionHandler(configuration: {
  allowedOrigins: ReadonlySet<string>;
  configured: boolean;
  verifyChain: () => Promise<void>;
  serviceForOrigin: (origin: string) => Service;
}) {
  return async (request: Request): Promise<Response> => {
    let origin = '';
    try { origin = new URL(request.headers.get('origin') ?? '').origin; } catch { /* rejected below */ }
    const permitted = configuration.allowedOrigins.has(origin);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Vary': 'Origin',
      ...(permitted ? {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
        'Access-Control-Max-Age': '600',
      } : {}),
    };
    const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers });
    if (!permitted) return json(403, { error: 'ORIGIN_NOT_ALLOWED' });
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'POST') return json(405, { error: 'METHOD_NOT_ALLOWED' });
    if (!configuration.configured) return json(503, { error: 'ARCHIVE_NOT_CONFIGURED' });
    let body;
    try { body = await request.json(); } catch { return json(400, { error: 'INVALID_REQUEST' }); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return json(400, { error: 'INVALID_REQUEST' });
    if (body.action && body.action !== 'transmit' && body.action !== 'request_transmission') return json(400, { error: 'UNKNOWN_ACTION' });
    try {
      await configuration.verifyChain();
      const service = configuration.serviceForOrigin(origin);
      const input = { address: body.address, tokenId: body.tokenId, assetType: body.assetType };
      const result = await service.transmit(input);
      return json(200, result);
    } catch (error) {
      if (error instanceof ArchiveAccessError) return json(error.status, { error: error.code });
      return json(500, { error: 'ARCHIVE_TRANSMISSION_FAILED' });
    }
  };
}

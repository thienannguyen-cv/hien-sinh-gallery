/**
 * smapworks.art — Cloudflare Worker entry point with exact API routes and SPA fallback.
 *
 * Exact route boundaries:
 *   - /api/frame-curator-image: Delivers the Owner-designated Frame Curator baseline presentation
 *     with strict private, uncacheable headers (Cache-Control: private, no-store).
 *     Query parameters and client role flags are rejected with 400.
 *
 * Cloudflare Static Assets serves all static files from dist/.
 * When a request has no corresponding static asset (e.g. cold GET /gallery),
 * env.ASSETS.fetch(request) returns 404.
 * In that case, this worker falls back to fetching "/" (dist/index.html) with HTTP 200,
 * allowing React Router to handle client-side routing.
 *
 * Production invariant:
 *   __HIEN_SINH_LOCAL_PRESENTATION_ENABLED__ = false (compile-time in Vite bundle)
 *   No ?role=, ?perspective=, or ?preview= query parameter confers any privilege.
 */

const IMAGE_PATH = '/api/frame-curator-image';
const BASELINE_INTERNAL_PATH = '/_internal_assets/frame-curator-baseline.png';

function textResponse(status, message) {
  return new Response(message, {
    status,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  });
}

async function handleFrameCuratorImage(request, env) {
  const url = new URL(request.url);
  if (url.search) {
    return textResponse(400, 'Query parameters are not accepted.');
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return textResponse(405, 'Method not allowed.');
  }

  const internalUrl = new URL(BASELINE_INTERNAL_PATH, request.url);
  try {
    const assetResponse = await env.ASSETS.fetch(new Request(internalUrl.toString(), request));
    if (!assetResponse.ok) {
      return textResponse(503, 'Frame Curator presentation is unavailable.');
    }

    const headers = new Headers({
      'content-type': 'image/png',
      'cache-control': 'private, no-store',
      'vary': 'Cookie',
      'x-content-type-options': 'nosniff',
    });

    return new Response(request.method === 'HEAD' ? null : assetResponse.body, {
      status: 200,
      headers,
    });
  } catch {
    return textResponse(503, 'Frame Curator presentation is unavailable.');
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. Exact-route: Frame Curator image delivery boundary
    if (url.pathname === IMAGE_PATH) {
      return handleFrameCuratorImage(request, env);
    }

    // 2. Block direct public access to internal assets
    if (url.pathname.startsWith('/_internal_assets/')) {
      return textResponse(404, 'Not found.');
    }

    // 3. Static asset delivery with SPA fallback
    try {
      const response = await env.ASSETS.fetch(request);
      if (response.status === 404) {
        // SPA Fallback: serve root index.html for client-side navigation
        const rootUrl = new URL('/', request.url);
        return await env.ASSETS.fetch(new Request(rootUrl.toString(), request));
      }
      return response;
    } catch (err) {
      // Fallback on any asset fetch exception
      const rootUrl = new URL('/', request.url);
      return await env.ASSETS.fetch(new Request(rootUrl.toString(), request));
    }
  },
};

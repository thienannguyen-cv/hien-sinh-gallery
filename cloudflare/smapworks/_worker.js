/**
 * smapworks.art — Cloudflare Worker entry point with exact API routes and SPA fallback.
 *
 * Exact route boundaries:
 *   - /api/frame-curator-image (and /frame-curator-image): Delivers the Owner-designated Frame Curator
 *     baseline presentation (1024x1024) or invited presentation (512x512) with private cache headers.
 *   - /api/steward-image (and /steward-image): Delivers the designated Steward presentation
 *     (512x512 condensed masterpiece) for eligible on-chain stewards in the Sanctum environment.
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

import { proxyArchiveRequest } from '../../../api-worker/archive-proxy.js';
import { handleEncounterRequest } from '../../../api-worker/encounter-request.js';
import { handleAcquisitionAuthorization } from '../../../api-worker/acquisition-authorization.js';
import { handleArtistCeremony } from '../../../api-worker/artist-ceremony.js';

const CANONICAL_ORIGIN = 'https://smapworks.art';
const FRAME_CURATOR_IMAGE_PATHS = new Set(['/api/frame-curator-image', '/frame-curator-image']);
const STEWARD_IMAGE_PATHS = new Set(['/api/steward-image', '/steward-image']);
const BASELINE_INTERNAL_PATH = '/_internal_assets/frame-curator-baseline.png';
const STEWARD_512_INTERNAL_PATH = '/_internal_assets/frame-curator-invited.png';

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

async function resolvePresentation(request, env) {
  // If an internal authority service binding is configured, check for invited session.
  if (env.FRAME_INVITATION_AUTHORITY && typeof env.FRAME_INVITATION_AUTHORITY.fetch === 'function') {
    try {
      const verdict = await env.FRAME_INVITATION_AUTHORITY.fetch(request);
      if (verdict.ok) {
        const payload = await verdict.json();
        if (payload?.entitlement === 'INVITED_FRAME_CURATOR_FULL_PRESENTATION') {
          return 'invited';
        }
      }
    } catch {
      return 'baseline';
    }
  }
  return 'baseline';
}

async function handleFrameCuratorImage(request, env) {
  const url = new URL(request.url);
  if (url.search) {
    return textResponse(400, 'Query parameters are not accepted.');
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return textResponse(405, 'Method not allowed.');
  }

  const presentation = await resolvePresentation(request, env);
  const internalPath = presentation === 'invited' ? STEWARD_512_INTERNAL_PATH : BASELINE_INTERNAL_PATH;
  const internalUrl = new URL(internalPath, request.url);

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

async function handleStewardImage(request, env) {
  const url = new URL(request.url);
  if (url.search) {
    return textResponse(400, 'Query parameters are not accepted.');
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return textResponse(405, 'Method not allowed.');
  }

  const internalUrl = new URL(STEWARD_512_INTERNAL_PATH, request.url);

  try {
    const assetResponse = await env.ASSETS.fetch(new Request(internalUrl.toString(), request));
    if (!assetResponse.ok) {
      return textResponse(503, 'Steward presentation is unavailable.');
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
    return textResponse(503, 'Steward presentation is unavailable.');
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. Exact-route: Frame Curator image delivery boundary
    if (FRAME_CURATOR_IMAGE_PATHS.has(url.pathname)) {
      return handleFrameCuratorImage(request, env);
    }

    // 2. Exact-route: Steward image delivery boundary (512x512)
    if (STEWARD_IMAGE_PATHS.has(url.pathname)) {
      return handleStewardImage(request, env);
    }

    // 3. API Route: Encounter Request (Status & Submission)
    if (url.pathname === '/api/encounter-request' || url.pathname === '/encounter-request') {
      return handleEncounterRequest(request, {
        origin: CANONICAL_ORIGIN,
        supabaseUrl: env.SUPABASE_URL,
        serverKey: env.SUPABASE_SECRET_KEY,
      });
    }

    // 4. API Route: Acquisition Authorization
    if (url.pathname === '/api/acquisition-authorization' || url.pathname === '/acquisition-authorization') {
      return handleAcquisitionAuthorization(request, {
        origin: CANONICAL_ORIGIN,
        supabaseUrl: env.SUPABASE_URL,
        serverKey: env.SUPABASE_SECRET_KEY,
      });
    }

    // 5. API Route: Artist Ceremony
    if (url.pathname === '/api/artist-ceremony' || url.pathname === '/artist-ceremony') {
      return handleArtistCeremony(request, {
        origin: CANONICAL_ORIGIN,
        supabaseUrl: env.SUPABASE_URL,
        serverKey: env.SUPABASE_SECRET_KEY,
      });
    }

    // 6. API Route: Transmit Artwork (Archive Proxy)
    if (url.pathname === '/api/transmit-artwork' || url.pathname === '/transmit-artwork') {
      return proxyArchiveRequest(request, {
        origin: CANONICAL_ORIGIN,
        endpoint: env.ARCHIVE_TRANSMISSION_URL,
        anonKey: env.SUPABASE_ANON_KEY,
      });
    }

    // 7. Block direct public access to internal assets
    if (url.pathname.startsWith('/_internal_assets/')) {
      return textResponse(404, 'Not found.');
    }

    // 8. Static asset delivery with SPA fallback
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

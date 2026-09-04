/**
 * smapworks.art — Cloudflare Worker entry point with SPA fallback.
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
export default {
  async fetch(request, env) {
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

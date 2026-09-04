/**
 * smapworks.art — Cloudflare Worker entry point.
 *
 * All SPA routing is delegated to the Static Assets binding.
 * wrangler.toml sets not_found_handling = "single-page-application" which
 * causes Cloudflare to return dist/index.html for any path that has no
 * matching static asset (e.g. a cold direct GET /gallery).
 *
 * React then handles /gallery client-side via window.location.pathname.
 *
 * Production invariant: __HIEN_SINH_LOCAL_PRESENTATION_ENABLED__ is
 * compile-time false. No ?role= / ?perspective= / ?preview= query parameter
 * grants any privilege in the production bundle.
 *
 * Route behaviour (all served as SPA, no server-side split):
 *   /            → index.html → SMapWorksRoot
 *   /gallery     → index.html → GalleryCanvas
 *   /gallery/    → index.html → GalleryCanvas
 *   /gallery?*   → index.html → GalleryCanvas (no query authority in prod)
 *   *.js *.css … → static asset served directly from dist/
 */
export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  },
};

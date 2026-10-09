/**
 * Cloudflare Worker for the clinician portal — the Vercel replacement.
 *
 * Serves dist/ via the ASSETS binding (SPA fallback is configured in
 * wrangler.jsonc) and sets the headers vercel.json used to. Every host gets the
 * same strict CSP (no inline/eval script) — the API reference moved to the
 * Blume docs site (`omaya-api-docs` Worker), so nothing here needs a looser
 * policy. vercel.json stays the source for Vercel until the cutover is done —
 * keep the two in step until it is deleted.
 */

export interface Env {
  ASSETS: Fetcher;
}

const CONNECT_SRC =
  "connect-src 'self' https://backend-api.omayacare.com wss://call-service.omayacare.com https://*.ingest.de.sentry.io";

const APP_CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  CONNECT_SRC,
  "worker-src 'self' blob:",
].join("; ");

const SECURITY_HEADERS: Record<string, string> = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
};

// Vite's hashed output (/assets/name-HASH8.ext) never changes under the same
// name; index.html and everything in public/ must revalidate so a deploy is
// visible immediately (a cached index.html would point at deleted chunks).
const HASHED_ASSET = /^\/assets\/[^/]+-[\w-]{8}\.\w+$/;

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const res = await env.ASSETS.fetch(req);
    const out = new Response(res.body, res);

    for (const [k, v] of Object.entries(SECURITY_HEADERS)) out.headers.set(k, v);
    out.headers.set("Content-Security-Policy", APP_CSP);
    // A missing chunk gets the SPA fallback (index.html, 200) — never let that
    // be cached as immutable under the chunk's name. A 304 must carry the same
    // Cache-Control as the 200, or revalidation would downgrade the cached entry.
    const isHashedAsset =
      HASHED_ASSET.test(url.pathname) &&
      (res.ok || res.status === 304) &&
      !res.headers.get("Content-Type")?.startsWith("text/html");
    out.headers.set(
      "Cache-Control",
      isHashedAsset ? "public, max-age=31536000, immutable" : "public, max-age=0, must-revalidate",
    );
    return out;
  },
} satisfies ExportedHandler<Env>;

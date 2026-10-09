/**
 * Sign-in gate for the Omaya API docs — the same rule the old Scalar page
 * enforced: a portal account whose email is on the backend's `docs_access`
 * allowlist.
 *
 * Blume emits a static site with no auth of its own, so this Worker runs in
 * front of every request (`run_worker_first`) and serves dist/ from the
 * ASSETS binding only to a signed-in reader. Sign-in never trusts anything
 * local: the email + password go server-side to the backend's
 * `POST /auth/sign-in`, and the resulting token is used once to fetch the
 * gated `GET /openapi.json` — 200 means the account is on `docs_access`, 403
 * means it isn't. The backend token is then discarded; the reader gets this
 * Worker's own HMAC-signed session cookie, scoped to the docs host.
 *
 * Removing someone from `docs_access` locks them out when their docs session
 * expires (SESSION_TTL_SECONDS); rotating DOCS_SESSION_SECRET ends every
 * session at once.
 */

export interface Env {
  ASSETS: Fetcher;
  /** Backend base URL for this tier, e.g. https://backend-api.omayacare.com */
  BACKEND_URL: string;
  /** `wrangler secret put DOCS_SESSION_SECRET` — 32+ random bytes. */
  DOCS_SESSION_SECRET: string;
}

const COOKIE = "omaya_docs_session";
const SESSION_TTL_SECONDS = 12 * 60 * 60;
const SIGN_IN_PATH = "/_auth/sign-in";
const SIGN_OUT_PATH = "/_auth/sign-out";
// Served without a session so the sign-in page can render its branding.
const PUBLIC_PATHS = new Set(["/logo.png", "/favicon.ico", "/robots.txt"]);

const SECURITY_HEADERS: Record<string, string> = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Robots-Tag": "noindex, nofollow",
};

const encoder = new TextEncoder();

function b64url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (const b of arr) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

async function sign(secret: string, payload: string): Promise<string> {
  const mac = await crypto.subtle.sign("HMAC", await hmacKey(secret), encoder.encode(payload));
  return `${b64url(encoder.encode(payload))}.${b64url(mac)}`;
}

/** The session's email, or null when the cookie is missing, forged or expired. */
async function readSession(secret: string, cookieHeader: string | null): Promise<string | null> {
  const raw = cookieHeader
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1);
  if (!raw) return null;
  const [body, mac] = raw.split(".");
  if (!body || !mac) return null;
  try {
    const payload = atob(body.replace(/-/g, "+").replace(/_/g, "/"));
    const macBytes = Uint8Array.from(atob(mac.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
    const ok = await crypto.subtle.verify("HMAC", await hmacKey(secret), macBytes, encoder.encode(payload));
    if (!ok) return null;
    const { email, exp } = JSON.parse(payload) as { email: string; exp: number };
    return exp > Date.now() / 1000 ? email : null;
  } catch {
    return null;
  }
}

/** Only same-site relative paths — never `//host` or a scheme (open redirect). */
function safeNext(next: string | null): string {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/";
}

function withHeaders(res: Response, extra: Record<string, string> = {}): Response {
  const out = new Response(res.body, res);
  for (const [k, v] of Object.entries({ ...SECURITY_HEADERS, ...extra })) out.headers.set(k, v);
  return out;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function signInPage(next: string, error = "", status = 200): Response {
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sign in · Omaya API</title><link rel="icon" href="/favicon.ico">
<style>
:root{--accent:#7a2850;--fg:#0a0a0a;--muted:#5a5a5a;--bg:#fafafa;--card:#fff;--border:#e5e5e5}
@media (prefers-color-scheme:dark){:root{--accent:#c45a8a;--fg:#f5f5f5;--muted:#a3a3a3;--bg:#0a0a0a;--card:#171717;--border:#2a2a2a}}
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:16px;background:var(--bg);color:var(--fg);font:15px/1.5 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
main{width:100%;max-width:380px;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:28px}
img{height:32px;margin-bottom:16px}h1{font-size:20px;margin:0 0 4px}p{margin:0 0 20px;color:var(--muted)}
label{display:block;font-weight:600;margin:12px 0 4px}input{width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:transparent;color:inherit;font:inherit}
button{width:100%;margin-top:20px;padding:11px;border:0;border-radius:8px;background:var(--accent);color:#fff;font:inherit;font-weight:600;cursor:pointer}
.err{margin:0 0 4px;padding:10px 12px;border-radius:8px;background:rgba(196,48,48,.1);color:#c43030}
</style></head><body><main>
<img src="/logo.png" alt="Omaya">
<h1>Omaya API reference</h1>
<p>Sign in with your Omaya portal account. Access is limited to the API-docs allowlist.</p>
${error ? `<p class="err" role="alert">${escapeHtml(error)}</p>` : ""}
<form method="post" action="${SIGN_IN_PATH}">
<input type="hidden" name="next" value="${escapeHtml(next)}">
<label for="email">Email</label><input id="email" name="email" type="email" autocomplete="username" required autofocus>
<label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required>
<button type="submit">Sign in</button>
</form></main></body></html>`;
  return withHeaders(new Response(html, { status, headers: { "Content-Type": "text/html; charset=utf-8" } }), {
    "Cache-Control": "no-store",
    "Content-Security-Policy":
      "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
  });
}

/** Backend sign-in + docs_access check. Returns an error message, or null when allowed. */
async function checkAccess(env: Env, email: string, password: string, clientIp: string | null): Promise<string | null> {
  const backend = env.BACKEND_URL.replace(/\/+$/, "");
  const signIn = await fetch(`${backend}/auth/sign-in`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(clientIp ? { "X-Forwarded-For": clientIp } : {}),
    },
    body: JSON.stringify({ email, password }),
  });
  if (signIn.status === 401) return "Invalid email or password.";
  if (signIn.status === 423) return "This account is temporarily locked after too many failed attempts.";
  if (signIn.status === 429) return "Too many sign-in attempts. Try again in a few minutes.";
  if (signIn.status === 403) return "This account has been suspended.";
  if (!signIn.ok) return "Sign-in is unavailable right now. Try again shortly.";

  // The token is in the body today; the cookie-auth migration will move it
  // to Set-Cookie only, so read either.
  const body = (await signIn.json().catch(() => ({}))) as { token?: string };
  const cookieToken = signIn.headers
    .get("set-cookie")
    ?.match(/(?:^|[,\s])omaya_session=([^;]+)/)?.[1];
  const token = body.token ?? cookieToken;
  if (!token) return "Sign-in is unavailable right now. Try again shortly.";

  const gate = await fetch(`${backend}/openapi.json`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  // Don't read the spec body — the status is the answer.
  gate.body?.cancel();
  if (gate.status === 403) return "Your account isn't on the API documentation allowlist. Ask an Omaya administrator to add you.";
  if (!gate.ok) return "Sign-in is unavailable right now. Try again shortly.";
  return null;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);

    if (url.pathname === SIGN_OUT_PATH) {
      return withHeaders(new Response(null, { status: 303, headers: { Location: SIGN_IN_PATH } }), {
        "Set-Cookie": `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
        "Cache-Control": "no-store",
      });
    }

    if (url.pathname === SIGN_IN_PATH) {
      if (req.method === "GET") return signInPage(safeNext(url.searchParams.get("next")));
      if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

      const form = await req.formData();
      const email = String(form.get("email") ?? "").trim().toLowerCase();
      const password = String(form.get("password") ?? "");
      const next = safeNext(String(form.get("next") ?? "/"));
      if (!email || !password) return signInPage(next, "Enter your email and password.", 400);

      const denied = await checkAccess(env, email, password, req.headers.get("CF-Connecting-IP"));
      if (denied) return signInPage(next, denied, 401);

      const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
      const session = await sign(env.DOCS_SESSION_SECRET, JSON.stringify({ email, exp }));
      return withHeaders(new Response(null, { status: 303, headers: { Location: next } }), {
        "Set-Cookie": `${COOKIE}=${session}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}`,
        "Cache-Control": "no-store",
      });
    }

    if (!PUBLIC_PATHS.has(url.pathname)) {
      const email = await readSession(env.DOCS_SESSION_SECRET, req.headers.get("Cookie"));
      if (!email) {
        const next = encodeURIComponent(url.pathname + url.search);
        return withHeaders(new Response(null, { status: 302, headers: { Location: `${SIGN_IN_PATH}?next=${next}` } }), {
          "Cache-Control": "no-store",
        });
      }
    }

    // Gated content: never let a shared cache keep a copy.
    return withHeaders(await env.ASSETS.fetch(req), { "Cache-Control": "private, no-cache" });
  },
} satisfies ExportedHandler<Env>;

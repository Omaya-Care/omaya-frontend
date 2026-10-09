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
// The sign-in page's own assets (public/_auth/: fonts, logo, hero photo) —
// copied from the portal so the page matches its login screen.
const PUBLIC_PREFIX = "/_auth/";

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

// Mirrors the portal's login screen (frontend AuthShell + Login.tsx): logo
// mark + wordmark over the form on the left, the hero photo with the
// "built in collaboration" card on the right (hidden below 1024px).
const SIGN_IN_CSS = `
@font-face{font-family:"Nb international pro webfont";font-weight:400;font-display:swap;src:url(/_auth/nb-international-pro-400.woff2) format("woff2")}
@font-face{font-family:"Nb international pro webfont";font-weight:700;font-display:swap;src:url(/_auth/nb-international-pro-700.woff2) format("woff2")}
*,*::before,*::after{box-sizing:border-box}
html,body{margin:0;overscroll-behavior:none}
body{font-family:"Nb international pro webfont",Arial,sans-serif;color:hsl(224 71% 4%);background:#fff;-webkit-font-smoothing:antialiased}
.shell{height:100vh;height:100dvh;overflow:hidden;display:grid;grid-template-columns:2fr 3fr;background:#fff}
.left{height:100%;overflow-y:auto;overscroll-behavior:none;display:flex;align-items:center;justify-content:center;padding:40px 32px}
.panel{width:100%;max-width:24rem}
.mark{display:flex;justify-content:center;margin-bottom:24px}.mark img{height:64px;width:auto;display:block}
.brand{text-align:center;margin-bottom:32px}.brand img{height:28px;width:auto;display:block;margin:0 auto 8px}
.sub{font-size:14px;line-height:20px;color:#6B7280;margin:4px 0 0}
form{display:flex;flex-direction:column;gap:20px}
.field{display:flex;flex-direction:column}
label{font-size:14px;line-height:20px;font-weight:500;color:#374151;margin:0 0 6px 2px}
input{height:40px;width:100%;border-radius:6px;border:1px solid hsl(220 13% 88%);background:#fff;padding:8px 12px;font:inherit;font-size:14px;color:#0F172A;outline:none;transition:box-shadow .15s}
input::placeholder{color:#9CA3AF}
input:focus{border-color:transparent;box-shadow:0 0 0 2px #fff,0 0 0 4px #7a2850}
.pw{position:relative}.pw input{padding-right:40px}
.eye{position:absolute;right:12px;top:50%;transform:translateY(-50%);padding:4px;border:0;background:none;color:#9CA3AF;cursor:pointer;display:flex}
.eye:hover{color:#7a2850}.eye:focus{outline:none}.eye svg{width:20px;height:20px}
.submit{width:100%;height:44px;border:0;border-radius:6px;background:#7a2850;color:#fff;font:inherit;font-size:14px;font-weight:600;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background-color .15s}
.submit:hover{background:#5d1f3d}.submit:active{background:#4a1830}
.submit:focus{outline:none;box-shadow:0 0 0 2px #fff,0 0 0 4px #7a2850}
.submit:disabled{opacity:.6;cursor:not-allowed}
.spin{display:none;width:16px;height:16px;margin-right:8px;animation:spin 1s linear infinite}
.busy .spin{display:block}@keyframes spin{to{transform:rotate(360deg)}}
.alert{position:relative;width:100%;margin-bottom:12px;border-radius:8px;border:1px solid #fecaca;background:#fef2f2;color:#991b1b;padding:16px 16px 16px 44px;font-size:14px;line-height:20px}
.alert svg{position:absolute;left:16px;top:16px;width:16px;height:16px}
.alert strong{display:block;font-weight:500;margin-bottom:4px;line-height:1}
.links{margin-top:24px;text-align:center}
.links a,.foot a{font-size:14px;text-underline-offset:4px;text-decoration:none;transition:color .15s}
.links a{font-weight:500;color:#6B7280}.links a:hover{color:#7a2850;text-decoration:underline}
.foot{margin-top:32px;padding-top:24px;border-top:1px solid hsl(220 13% 88%);text-align:center;font-size:14px;color:#6B7280}
.foot p{margin:0}.foot a{font-weight:500;color:#7a2850}.foot a:hover{text-decoration:underline}
.photo{position:relative;overflow:hidden;height:100%;width:100%;border-radius:24px 0 0 24px}
.photo>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:scaleX(-1)}
.collab{position:absolute;bottom:24px;right:24px;z-index:1;width:20rem;max-width:calc(100% - 3rem);border-radius:16px;background:rgba(255,255,255,.85);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);box-shadow:0 20px 25px -5px rgba(0,0,0,.1),0 8px 10px -6px rgba(0,0,0,.1),0 0 0 1px rgba(0,0,0,.05);padding:16px;display:flex;align-items:center;gap:12px}
.avatars{display:flex;align-items:center;flex-shrink:0}
.avatars img{width:36px;height:36px;border-radius:9999px;object-fit:cover;object-position:top;box-shadow:0 0 0 2px #fff;flex-shrink:0}
.avatars img+img{margin-left:-12px}
.collab h4{margin:0;font-size:12px;font-weight:500;line-height:1.375;color:#374151}
@media (max-width:1023px){.shell{grid-template-columns:1fr}.photo{display:none}}
`;

const EYE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>`;
const EYE_OFF = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>`;
const ALERT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`;
const SPINNER = `<svg class="spin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`;

// Show-password toggle + the busy state on submit — the page's only script,
// allowed by its exact hash in the CSP (no 'unsafe-inline').
const SIGN_IN_SCRIPT = `(()=>{const pw=document.getElementById("password"),eye=document.getElementById("eye"),on=${JSON.stringify(EYE)},off=${JSON.stringify(EYE_OFF)};eye.addEventListener("click",()=>{const show=pw.type==="password";pw.type=show?"text":"password";eye.innerHTML=show?off:on;eye.setAttribute("aria-label",show?"Hide password":"Show password")});document.querySelector("form").addEventListener("submit",()=>{const b=document.getElementById("submit");b.disabled=true;b.classList.add("busy")})})();`;

let scriptHash: Promise<string> | undefined;
function signInScriptHash(): Promise<string> {
  scriptHash ??= crypto.subtle
    .digest("SHA-256", encoder.encode(SIGN_IN_SCRIPT))
    .then((d) => `'sha256-${btoa(String.fromCharCode(...new Uint8Array(d)))}'`);
  return scriptHash;
}

async function signInPage(next: string, error = "", status = 200, email = ""): Promise<Response> {
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sign in · Omaya API</title><link rel="icon" href="/favicon.ico">
<link rel="preload" href="/_auth/nb-international-pro-400.woff2" as="font" type="font/woff2" crossorigin>
<style>${SIGN_IN_CSS}</style></head><body>
<div class="shell">
<div class="left"><div class="panel">
<div class="mark"><img src="/_auth/logo-mark.svg" alt="Omaya Care"></div>
<div class="brand"><img src="/_auth/wordmark.svg" alt="Omaya Care"><p class="sub">Sign in to the API reference</p></div>
<form method="post" action="${SIGN_IN_PATH}">
${error ? `<div class="alert" role="alert">${ALERT_ICON}<div><strong>Error</strong>${escapeHtml(error)}</div></div>` : ""}
<input type="hidden" name="next" value="${escapeHtml(next)}">
<div class="field"><label for="email">Email address</label><input id="email" name="email" type="email" placeholder="name@hospital.com" autocomplete="email" value="${escapeHtml(email)}" required${email ? "" : " autofocus"}></div>
<div class="field"><label for="password">Password</label><div class="pw"><input id="password" name="password" type="password" placeholder="••••••••" autocomplete="current-password" required${email ? " autofocus" : ""}><button type="button" id="eye" class="eye" aria-label="Show password">${EYE}</button></div></div>
<button type="submit" id="submit" class="submit">${SPINNER}Sign In</button>
</form>
<div class="links"><a href="https://app.omayacare.com/forgot-password">Forgot password?</a></div>
<div class="foot"><p>Need access? <a href="https://omayacare.com/contact" target="_blank" rel="noopener noreferrer">Contact the Omaya team</a></p></div>
</div></div>
<div class="photo"><img src="/_auth/hero-mother.jpg" alt="Mother holding newborn while on a phone call">
<div class="collab"><div class="avatars"><img src="/_auth/team-1.jpeg" alt="" loading="lazy" decoding="async"><img src="/_auth/team-2.jpeg" alt="" loading="lazy" decoding="async"><img src="/_auth/team-3.jpeg" alt="" loading="lazy" decoding="async"></div><h4>Built in collaboration with top professionals</h4></div></div>
</div>
<script>${SIGN_IN_SCRIPT}</script>
</body></html>`;
  return withHeaders(new Response(html, { status, headers: { "Content-Type": "text/html; charset=utf-8" } }), {
    "Cache-Control": "no-store",
    "Content-Security-Policy": `default-src 'none'; img-src 'self'; font-src 'self'; style-src 'unsafe-inline'; script-src ${await signInScriptHash()}; form-action 'self'; base-uri 'none'; frame-ancestors 'none'`,
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
      if (req.method === "GET") return await signInPage(safeNext(url.searchParams.get("next")));
      if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

      const form = await req.formData();
      const email = String(form.get("email") ?? "").trim().toLowerCase();
      const password = String(form.get("password") ?? "");
      const next = safeNext(String(form.get("next") ?? "/"));
      if (!email || !password) return await signInPage(next, "Enter your email and password.", 400, email);

      // A backend that's down or unreachable throws from fetch — show the
      // sign-in page's "unavailable" message rather than a bare 500.
      const denied = await checkAccess(env, email, password, req.headers.get("CF-Connecting-IP")).catch(
        () => "Sign-in is unavailable right now. Try again shortly.",
      );
      if (denied) return await signInPage(next, denied, 401, email);

      const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
      const session = await sign(env.DOCS_SESSION_SECRET, JSON.stringify({ email, exp }));
      return withHeaders(new Response(null, { status: 303, headers: { Location: next } }), {
        "Set-Cookie": `${COOKIE}=${session}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}`,
        "Cache-Control": "no-store",
      });
    }

    if (!PUBLIC_PATHS.has(url.pathname) && !url.pathname.startsWith(PUBLIC_PREFIX)) {
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

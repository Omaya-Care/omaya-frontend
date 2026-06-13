# Omaya Hospital Portal

> The clinician-facing web app for Omaya — hospital staff (midwives, admins) use it to monitor discharged mothers, review AI voice-call outcomes, and act on severity escalations.

This is the **hospital portal SPA**. It is distinct from the internal ops dashboard (`../internal-dashboard`), which is for the Omaya team. This app talks **only** to the backend portal API — it has no direct connection to the call-service.

## Stack

- **React 19** + **TypeScript 5.7** + **Vite 6**
- **Tailwind CSS 3**
- **React Router 7** (`react-router-dom`) — client-side routing
- **TanStack Query 5** (`@tanstack/react-query`) — server state / data fetching
- **axios** — HTTP client (JWT bearer auth)
- **@scalar/api-reference-react** — renders the team-gated API docs page

Brand color: `#93406B`. Severity strings used throughout: `crisis` / `elevated` / `monitor` / `routine` (plus `inactive`). See `docs/AI_CONTEXT.md` for the full design system, severity SLAs/colors, and coding rules.

## Quickstart

```bash
pnpm install                 # repo uses pnpm (pnpm-lock.yaml); npm install also works
cp .env.example .env         # then set VITE_API_BASE_URL (defaults to http://localhost:8000)
pnpm dev                     # Vite dev server
```

Point `VITE_API_BASE_URL` at a running backend portal API (local FastAPI on `http://localhost:8000` by default).

## Routes

| Route | Page | Access |
|-------|------|--------|
| `/` | `SignIn` | Public |
| `/activate`, `/reset` | `SetupPassword` | Public (from invite / reset link) |
| `/forgot-password` | `ForgotPassword` | Public |
| `/change-password` | `ChangePassword` | Public |
| `/dashboard` | `Dashboard` | Protected (requires session) |
| `/mothers` | `Mothers` | Protected |
| `/calls` | `Calls` | Protected |
| `/staff` | `Staff` | Protected |
| `/settings` | `Settings` | Protected |
| `/docs` | API reference (Scalar) | Protected + server-side `docs_access` allowlist |

`AddMother` and `NewDischarge` are not routes — they are lazy-loaded drawer panels rendered inside the app shell (opened from the dashboard's "New discharge" action).

A separate `docs.*` host (a Vercel alias of this same project) funnels everything to sign-in + the gated `/docs` reference, so it never exposes the app surface.

### Authentication

First login is **invite-link first** (clinicians receive an activation link → `SetupPassword`), with link-based password reset (`ForgotPassword` → `SetupPassword`). Sessions use a **JWT bearer** token sent on API requests.

## Environment

One build-time variable:

| Var | Purpose |
|-----|---------|
| `VITE_API_BASE_URL` | Base URL of the backend portal API. Prod: `https://backend-api.omayacare.com` |

It is a Vite `VITE_`-prefixed var, so it is **inlined into the bundle at build time and is public** — never put secrets in it. The call-service OpenAPI spec is reached only through the backend's team-gated docs proxy, so there is intentionally no `VITE_CALL_SERVICE_URL`.

## Scripts

```bash
pnpm dev        # vite dev server
pnpm build      # tsc -b && vite build  -> dist/
pnpm preview    # serve the production build locally
pnpm lint       # eslint .
pnpm doctor     # npx react-doctor@latest (lint/health scan)
```

## Deploy

Deployed to **Vercel via git integration** — pushing to `main` triggers a production build. `vercel.json` provides the SPA rewrites (all paths → `index.html`) and security headers (HSTS, `X-Frame-Options: DENY`, `nosniff`, Referrer-Policy, Permissions-Policy, and a report-only CSP).

- **Production host:** `app.omayacare.com`
- **Before the build runs**, set `VITE_API_BASE_URL` in the Vercel **Production** environment (it is inlined at build time — changing it requires a rebuild).
- There is **no GitHub Actions build**. `react-doctor.yml` is only a lint/health scan, not a deploy pipeline.

## API docs

The live, team-gated API reference is served by the backend at **`https://backend-api.omayacare.com`** and surfaced in-app at `/docs` (or via the `docs.*` host). Access requires a signed-in clinician whose email is on the backend `docs_access` allowlist; non-allowlisted users get a "no access" state.

## Reference

See [`docs/AI_CONTEXT.md`](docs/AI_CONTEXT.md) for the full project context, design system, brand/severity rules, and coding conventions.

# omaya-api-docs

> The Omaya team's API reference: a static [Blume](https://www.npmjs.com/package/blume) site
> for the backend, ops and call-service APIs, served by a Cloudflare Worker with its own
> sign-in gate.

**Team-only.** Blume has no sign-in, and every file in `dist/` (the full API specs included)
is readable by whoever reaches it. The gate Worker in `worker/index.ts` is what keeps it
private: you sign in with your Omaya portal account, and only accounts on the backend's
`docs_access` allowlist get in. See [Access control](#access-control).

**Status:** not cut over. `docs.omayacare.com` still serves the old Scalar page from the
`omaya-frontend` Worker. Intended GitHub repo: `Omaya-Care/omaya-api-docs` (no remote yet).

## What's in it

Three OpenAPI references, each on its own route. The header **API** dropdown switches between
them, and each route scopes the sidebar to its own operations.

| Reference | Route | Spec | Source |
|---|---|---|---|
| Backend | `/backend` | `specs/backend.json` | backend spec, everything outside `/ops` |
| Ops | `/ops` | `specs/ops.json` | backend `/ops/*` (internal dashboard, `platform_admin`) |
| Call Service | `/call-service` | `specs/call-service.json` | call-service spec |

The references are configured in `blume.config.ts`. The landing page is `docs/index.mdx`.

Each operation has a **Try it** panel. It sends the request from your browser straight to the
selected server, so you paste a Bearer token (a portal JWT for Backend and Ops, the internal
token for call-service routes that need auth). The target service's `CORS_ORIGINS` must allow
the docs origin.

## Local development

**Prerequisites:** Node.js 22.19+, pnpm, and sibling `backend/` and `call-service/` checkouts
with `uv sync` already run (the export imports each service's FastAPI app).

```bash
pnpm install
pnpm specs:local   # export all three specs into specs/
pnpm dev           # blume dev server
```

`pnpm specs:local` runs `scripts/export-local-specs.sh`, which calls each service's
`scripts/export_openapi.py`. Override the defaults with environment variables:

| Variable | Default | Purpose |
|---|---|---|
| `BACKEND_DIR` | `../backend` | backend checkout to export from (for example a worktree) |
| `CALL_SERVICE_DIR` | `../call-service` | call-service checkout to export from |
| `TIER` | `local` | which `servers` Try it targets: `local`, `staging` or `prod` |

```bash
BACKEND_DIR=../.worktrees/backend--blume-docs TIER=staging pnpm specs:local
```

The specs in `specs/*.json` are gitignored. They are build inputs, never committed.

Other scripts:

```bash
pnpm build          # blume build → dist/
pnpm check          # blume validate
pnpm cf:dev         # wrangler dev: serve dist/ through the sign-in gate
pnpm cf:typecheck   # tsc over worker/
pnpm cf:deploy      # wrangler deploy (CI does this; see below)
```

### Running the gate locally

`pnpm dev` serves the site with no gate. To test sign-in, build first, then run the Worker
in front of `dist/`:

1. Create `.dev.vars` (gitignored) in this directory:

   ```bash
   DOCS_SESSION_SECRET=<32+ random bytes, e.g. openssl rand -base64 32>
   BACKEND_URL=http://localhost:8080
   ```

2. Run a local backend with a portal account. To be let in, that account's email must be in
   `docs_access`.
3. Build and serve:

   ```bash
   pnpm build
   pnpm cf:dev
   ```

`pnpm cf:dev` serves the last `pnpm build`, so rebuild after you change specs or pages.

## Build and deploy

The live `/openapi.json` routes are auth-gated and Blume can't attach credentials when it
fetches a spec, so the specs are exported from code at build time. Nothing stores them
between runs:

1. A push to `staging` or `main` in **backend** or **call-service** runs that repo's
   `.github/workflows/docs-dispatch.yml`. It uploads nothing. It runs
   `gh workflow run deploy.yml -R Omaya-Care/omaya-api-docs -f tier=<branch>`.
2. `.github/workflows/deploy.yml` here checks out `Omaya-Care/bloom-backend` and
   `Omaya-Care/omaya-call-service` at the tier's branch, runs each one's
   `scripts/export_openapi.py` (no database or secrets needed) into `specs/`, runs
   `pnpm build`, and deploys the tier's Worker. It also runs on a push to `main` or `staging`
   here, and by hand (`workflow_dispatch`).

| Tier | Services built from | Try it targets | Worker | Host |
|---|---|---|---|---|
| `main` | `main` | prod servers | `omaya-api-docs` | `docs.omayacare.com` |
| `staging` | `staging` | staging servers | `omaya-api-docs-staging` | `docs-staging.omayacare.com` |

Both Workers come from `wrangler.jsonc` (`--env staging` for staging), each with its own
`BACKEND_URL` var. `workers_dev` and preview URLs are off.

The reference is only as fresh as the last successful run for its tier. If a run fails, the
site keeps serving the previous build.

### Required secrets

GitHub Actions secrets, under **Settings → Secrets and variables → Actions** in each repo:

| Repo | Secret | Scope |
|---|---|---|
| `omaya-api-docs` | `CLOUDFLARE_API_TOKEN` | Workers Scripts: Edit |
| `omaya-api-docs` | `CLOUDFLARE_ACCOUNT_ID` | the Cloudflare account |
| `omaya-api-docs` | `DOCS_SOURCE_TOKEN` | fine-grained PAT: Contents read on `bloom-backend` and `omaya-call-service` only |
| backend, call-service | `DOCS_DISPATCH_TOKEN` | fine-grained PAT: Actions read/write on `omaya-api-docs` only |

Worker secret, set once per Worker with Wrangler before its first deploy:

```bash
wrangler secret put DOCS_SESSION_SECRET                 # omaya-api-docs
wrangler secret put DOCS_SESSION_SECRET --env staging   # omaya-api-docs-staging
```

Without `DOCS_SESSION_SECRET` the gate fails closed: nobody gets in.

## Access control

`worker/index.ts` runs first on every request (`run_worker_first: true` in `wrangler.jsonc`),
so no page, search index or spec is served without a session.

How sign-in works:

1. A request without a valid session redirects to `/_auth/sign-in`. You sign in with your
   Omaya portal email and password.
2. The Worker sends them server-side to the backend's `POST /auth/sign-in`, then calls
   `GET /openapi.json` with the token it gets back. `200` means you're on `docs_access` and
   you're in. `403` means you aren't.
3. The Worker throws the backend token away. You get the Worker's own session cookie,
   `omaya_docs_session`: HMAC-SHA256-signed, `HttpOnly`, `Secure`, `SameSite=Lax`, scoped to
   the docs host, valid for 12 hours.

`/_auth/sign-out` clears the cookie. Only `/logo.png`, `/favicon.ico` and `/robots.txt` are
public, so the sign-in page can show its branding.

What this means in practice:

- **`docs_access` decides who reads the docs.** Grant or revoke access there (the ops
  dashboard's Team page). The table and the backend's gated `/openapi.json` are load-bearing
  for this site, so don't retire them.
- **Readers need a portal account** (a clinician row), the same as the old Scalar page.
- **Revocation isn't instant.** Removing someone from `docs_access` takes effect when their
  docs session expires, within 12 hours. Rotating `DOCS_SESSION_SECRET` ends every session at
  once.
- **The cookie-auth migration doesn't break sign-in.** The Worker reads the token from the
  sign-in response body and falls back to the `omaya_session` `Set-Cookie`, so removing the
  body token (phase 3) is safe.
- **Known caveat: sign-in rate limiting.** The Worker forwards your `CF-Connecting-IP` as
  `X-Forwarded-For`. If the backend sets `TRUSTED_PROXY_IPS`, its per-IP sign-in limit may key
  on the Worker's egress IP instead of yours, so all docs sign-ins could share one bucket.
  Not verified against prod.

The gate itself is server-to-server and needs no CORS. Only **Try it** calls the services from
your browser, so add the docs origin to a service's `CORS_ORIGINS` only if Try it must work
against it.

Cutover order:

1. Set `DOCS_SESSION_SECRET` on the Worker.
2. Deploy the Worker, with no route yet.
3. Only if Try it must work from the browser: add `https://docs.omayacare.com` (and
   `https://docs-staging.omayacare.com`) to the backend's `CORS_ORIGINS`.
4. Route `docs.omayacare.com` to `omaya-api-docs`.
5. Merge the frontend change (`54325e9`) that redirects the portal's `/docs` here.

## Supply-chain policy

`pnpm-workspace.yaml` keeps the same hardening as `frontend/`: `minimumReleaseAge: 10080`
(7 days) and `trustPolicy: no-downgrade`.

It also has four pinned `trustPolicyExclude` entries, approved 2026-10-09: transitive
dependencies of Blume 2.1.0 that were published without the provenance attestation earlier
versions carried.

```yaml
trustPolicyExclude:
  - chokidar@4.0.3
  - '@pierre/theme@2.0.0'
  - undici-types@6.21.0
  - semver@6.3.1
```

**Review these on every Blume upgrade.** Keep exact versions only, never a blanket opt-out,
and drop any entry the new lockfile no longer needs.

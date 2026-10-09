# omaya-api-docs

> The Omaya team's API reference: a static [Blume](https://www.npmjs.com/package/blume) site
> for the backend, ops and call-service APIs, served behind Cloudflare Access.

**Team-only.** Blume has no sign-in, and every file in `dist/` (the full API specs included)
is readable by whoever reaches the host. Cloudflare Access is the only gate. See
[Access](#access-control).

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
pnpm build       # blume build → dist/
pnpm check       # blume validate
pnpm cf:deploy   # wrangler deploy (CI does this; see below)
```

## Build and deploy

The live `/openapi.json` routes are auth-gated and Blume can't attach credentials when it
fetches a spec, so CI exports the specs from code and ships them through R2:

1. A push to `staging` or `main` in **backend** or **call-service** runs that repo's
   `.github/workflows/publish-openapi.yml`. It runs `scripts/export_openapi.py` (no database or
   secrets needed), uploads the JSON to R2 at `omaya-api-docs-specs/<tier>/`, and dispatches
   `deploy.yml` here with that tier.
2. `.github/workflows/deploy.yml` pulls `backend.json`, `ops.json` and `call-service.json` for the
   tier from R2, runs `pnpm build`, and deploys the tier's Worker. It also runs on a push to
   `main` or `staging` here, and by hand (`workflow_dispatch`).

| Tier | R2 prefix | Worker | Host |
|---|---|---|---|
| `main` | `omaya-api-docs-specs/main/` | `omaya-api-docs` | `docs.omayacare.com` |
| `staging` | `omaya-api-docs-specs/staging/` | `omaya-api-docs-staging` | `docs-staging.omayacare.com` |

Both Workers come from `wrangler.jsonc` (`--env staging` for staging). They are static-assets
Workers with `workers_dev` and preview URLs off.

The reference is only as fresh as the last successful run for its tier. If a publish or
deploy fails, the site keeps serving the previous specs.

### Required secrets

Set these under **Settings → Secrets and variables → Actions** in each repo.

| Repo | Secret | Scope |
|---|---|---|
| `omaya-api-docs` | `CLOUDFLARE_API_TOKEN` | Workers Scripts: Edit + R2: Read |
| `omaya-api-docs` | `CLOUDFLARE_ACCOUNT_ID` | the Cloudflare account |
| backend, call-service | `DOCS_R2_API_TOKEN` | R2 Object Read & Write on `omaya-api-docs-specs` only |
| backend, call-service | `CLOUDFLARE_ACCOUNT_ID` | the Cloudflare account |
| backend, call-service | `DOCS_DISPATCH_TOKEN` | fine-grained PAT: Actions read/write on `omaya-api-docs` only |

## Access control

Cloudflare Access (an email allowlist) must cover both `docs.omayacare.com` and
`docs-staging.omayacare.com`.

**Never attach a route, custom domain or `workers.dev` URL to either Worker before the Access
application covers that hostname.** The specs are in `dist/` and would be public.

The Access list is separate from the backend's `docs_access` table, which still gates the live
`/openapi.json` routes. Granting someone the docs means adding them in Cloudflare Access.

Cutover order: Access application → R2 bucket + Workers → route `docs.omayacare.com` to
`omaya-api-docs` → merge the frontend change that redirects the portal's `/docs` here.

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

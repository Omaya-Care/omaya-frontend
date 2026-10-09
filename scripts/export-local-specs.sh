#!/bin/sh
# Export all three specs from the sibling service checkouts into specs/ for a
# local `pnpm dev`. CI's deploy.yml does the same per tier from the services'
# tier branches.
#   BACKEND_DIR / CALL_SERVICE_DIR override the checkouts (e.g. a worktree).
#   TIER=local|staging|prod picks the `servers` the Try it panel targets.
set -eu
here=$(cd "$(dirname "$0")/.." && pwd)
backend=${BACKEND_DIR:-$here/../backend}
call=${CALL_SERVICE_DIR:-$here/../call-service}
tier=${TIER:-local}

(cd "$backend" && OMAYA_ENV=dev uv run python scripts/export_openapi.py --out-dir "$here/specs" --tier "$tier")
(cd "$call" && OMAYA_ENV=dev uv run python scripts/export_openapi.py --out-dir "$here/specs" --tier "$tier")

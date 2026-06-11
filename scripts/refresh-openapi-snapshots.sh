#!/usr/bin/env bash
#
# Regenerate the bundled OpenAPI snapshots that Docs.tsx falls back to when
# VITE_API_BASE_URL / VITE_CALL_SERVICE_URL are unset (local dev, preview, or
# before the services are deployed). When those env vars ARE set the docs page
# pulls each service's live /openapi.json, so these files only matter offline —
# but they silently go stale otherwise (they did, for the whole portal build).
#
# Re-run this whenever the backend or call-service API surface changes, then
# review + commit the diff in frontend/public/openapi/.
#
# Requires each sibling service's local venv (../backend/.venv,
# ../call-service/.venv) — i.e. run from a full monorepo checkout.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUT="$ROOT/frontend/public/openapi"

dump() { # <service-subdir> <OMAYA_ENV> <output-filename>
  (
    cd "$ROOT/$1"
    OMAYA_ENV="$2" .venv/bin/python - "$OUT/$3" <<'PY'
import json
import sys

from app.main import app

spec = app.openapi()
with open(sys.argv[1], "w") as f:
    json.dump(spec, f, indent=2)
    f.write("\n")
print(f"  {sys.argv[1].split('/')[-1]}: {len(spec['paths'])} paths")
PY
  )
}

echo "Regenerating OpenAPI snapshots into frontend/public/openapi/ →"
dump backend      dev  portal-backend.json
dump call-service test call-service.json
echo "Done. Review the diff and commit."

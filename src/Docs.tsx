import { useEffect, useState } from 'react'
import type { AxiosError } from 'axios'
import { ApiReferenceReact } from '@scalar/api-reference-react'
import '@scalar/api-reference-react/style.css'
import '@fontsource-variable/geist/index.css'
import { api } from './lib/api'
import { AuthCard } from './components/auth/AuthCard'
import { Button } from './components/ui/Button'
import DocsLoading from './components/DocsLoading'

// The portal spec (/openapi.json) is team-gated — it's fetched WITH the
// Bearer JWT and rendered client-side, so there's no public snapshot to
// leak. Defaults to the local backend in dev (matches lib/api.ts).
const PORTAL_BASE = (
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'
).replace(/\/+$/, '')

// Server picker (rendered above Authentication): which base URL "Test Request"
// targets. Localhost for a locally-running service; the deployment domain
// (EC2 / Dokploy) for production. Each service points at its own hosting.
const PORTAL_SERVERS = [
  { url: 'http://localhost:8000', description: 'Local dev' },
  { url: 'https://backend-api.omayacare.com', description: 'Production' },
]
const CALL_SERVERS = [
  { url: 'http://localhost:8081', description: 'Local dev' },
  { url: 'https://call-service.omayacare.com', description: 'Production' },
]

const OMAYA_CUSTOM_CSS = `
:root {
  --scalar-font: "Geist Variable", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.light-mode {
  --scalar-color-accent: #7a2850;
  --scalar-background-accent: rgba(122, 40, 80, 0.12);
  --scalar-link-color: #7a2850;
  --scalar-link-color-hover: #7a2850;
  --scalar-color-1: #0a0a0a;
  --scalar-color-2: #3a3a3a;
  --scalar-sidebar-color-1: #0a0a0a;
  --scalar-sidebar-color-2: #3a3a3a;
}

.dark-mode {
  --scalar-color-accent: #c45a8a;
  --scalar-background-accent: rgba(196, 90, 138, 0.18);
  --scalar-link-color: #c45a8a;
  --scalar-link-color-hover: #e07ba8;
}

@supports (color: color(display-p3 1 1 1)) {
  .light-mode {
    --scalar-color-accent: color(display-p3 0.478 0.157 0.314);
  }
  .dark-mode {
    --scalar-color-accent: color(display-p3 0.769 0.353 0.541);
  }
}

.light-mode .scalar-app .section-header,
.light-mode .scalar-app .operation-title,
.light-mode .scalar-app .markdown h1,
.light-mode .scalar-app .markdown h2,
.light-mode .scalar-app .markdown h3,
.light-mode .scalar-app .markdown h4,
.light-mode .scalar-app .markdown h5,
.light-mode .scalar-app .markdown h6 {
  color: #7a2850;
}

.dark-mode .scalar-app .section-header,
.dark-mode .scalar-app .operation-title,
.dark-mode .scalar-app .markdown h1,
.dark-mode .scalar-app .markdown h2,
.dark-mode .scalar-app .markdown h3,
.dark-mode .scalar-app .markdown h4,
.dark-mode .scalar-app .markdown h5,
.dark-mode .scalar-app .markdown h6 {
  color: #7a2850;
}

.scalar-app .document-selector {
  background: var(--scalar-background-1);
  border: 1px solid var(--scalar-border-color);
  border-radius: 10px;
  padding: 10px 14px 12px;
  margin: 12px 12px 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.scalar-app .document-selector::before {
  content: 'API';
  display: block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--scalar-color-accent);
  margin-bottom: 2px;
}

.scalar-app .document-selector > button {
  color: var(--scalar-color-1);
  font-weight: 700;
  font-size: 15px;
}

.scalar-app .document-selector > button svg {
  color: var(--scalar-color-accent);
}
`

type Phase = 'loading' | 'forbidden' | 'error' | 'ready'

export default function Docs() {
  const [phase, setPhase] = useState<Phase>('loading')
  const [portalSpec, setPortalSpec] = useState<Record<string, unknown> | null>(
    null,
  )
  const [callSpec, setCallSpec] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        // Team-gated: the Bearer JWT rides via the api interceptor. A 403
        // here means the signed-in email isn't on the docs_access allowlist.
        const portal = await api.get(`${PORTAL_BASE}/openapi.json`)
        if (!active) return
        setPortalSpec(portal.data)
        // Call-service spec via the backend's team-gated proxy (best-effort):
        // the call-service gates its own /openapi.json behind the internal
        // secret, so we fetch it through the backend, not directly.
        try {
          const call = await api.get(`${PORTAL_BASE}/call-service.openapi.json`)
          if (active) setCallSpec(call.data)
        } catch {
          /* call-service unreachable — show the portal source only */
        }
        if (active) setPhase('ready')
      } catch (err) {
        if (!active) return
        const status = (err as AxiosError).response?.status
        setPhase(status === 403 ? 'forbidden' : 'error')
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  if (phase === 'loading') return <DocsLoading />

  if (phase === 'forbidden') {
    return (
      <AuthCard
        title="No access"
        subtitle="Your account isn't on the API documentation allowlist. Ask an Omaya administrator to add you."
      >
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => window.location.assign('/')}
        >
          Back to sign in
        </Button>
      </AuthCard>
    )
  }

  if (phase === 'error') {
    return (
      <AuthCard
        title="Couldn't load the docs"
        subtitle="The API spec couldn't be loaded. Check that the backend is reachable and try again."
      >
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </AuthCard>
    )
  }

  // Extracted to a const so the per-source `servers` + `content` aren't
  // subject to TS's excess-property check against Scalar's
  // `SourceConfiguration` type — both are consumed at runtime.
  const sources = [
    {
      slug: 'omaya-portal-backend',
      title: 'Omaya Portal Backend',
      content: portalSpec,
      servers: PORTAL_SERVERS,
      default: true,
      agent: { disabled: true },
    },
    ...(callSpec
      ? [
          {
            slug: 'omaya-call-service',
            title: 'Omaya Call Service',
            content: callSpec,
            servers: CALL_SERVERS,
            agent: { disabled: true },
          },
        ]
      : []),
  ]
  return (
    <ApiReferenceReact
      configuration={{
        sources,
        theme: 'default',
        layout: 'modern',
        // Lock to light mode (default + no toggle).
        forceDarkModeState: 'light',
        hideDarkModeToggle: true,
        defaultOpenAllTags: false,
        customCss: OMAYA_CUSTOM_CSS,
        _integration: 'fastapi',
      }}
    />
  )
}

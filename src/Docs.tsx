import { ApiReferenceReact } from '@scalar/api-reference-react'
import '@scalar/api-reference-react/style.css'
import '@fontsource-variable/geist/index.css'

// Falls back to the bundled snapshots in public/openapi/ so the docs
// host renders before the backend + call-service are deployed.
const PORTAL_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '')
const CALL_BASE = import.meta.env.VITE_CALL_SERVICE_URL?.replace(/\/+$/, '')

const PORTAL_OPENAPI_URL = PORTAL_BASE
  ? `${PORTAL_BASE}/openapi.json`
  : '/openapi/portal-backend.json'
const CALL_SERVICE_OPENAPI_URL = CALL_BASE
  ? `${CALL_BASE}/openapi.json`
  : '/openapi/call-service.json'

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
.light-mode .scalar-app .markdown h1,
.light-mode .scalar-app .markdown h2,
.light-mode .scalar-app .markdown h3,
.light-mode .scalar-app .markdown h4,
.light-mode .scalar-app .markdown h5,
.light-mode .scalar-app .markdown h6 {
  color: #8e4585;
}

.dark-mode .scalar-app .section-header,
.dark-mode .scalar-app .markdown h1,
.dark-mode .scalar-app .markdown h2,
.dark-mode .scalar-app .markdown h3,
.dark-mode .scalar-app .markdown h4,
.dark-mode .scalar-app .markdown h5,
.dark-mode .scalar-app .markdown h6 {
  color: #c073b8;
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

export default function Docs() {
  return (
    <ApiReferenceReact
      configuration={{
        sources: [
          {
            slug: 'omaya-portal-backend',
            title: 'Omaya Portal Backend',
            url: PORTAL_OPENAPI_URL,
            default: true,
            agent: { disabled: true },
          },
          {
            slug: 'omaya-call-service',
            title: 'Omaya Call Service',
            url: CALL_SERVICE_OPENAPI_URL,
            agent: { disabled: true },
          },
        ],
        theme: 'default',
        layout: 'modern',
        hideDarkModeToggle: false,
        defaultOpenAllTags: false,
        customCss: OMAYA_CUSTOM_CSS,
        _integration: 'fastapi',
      }}
    />
  )
}

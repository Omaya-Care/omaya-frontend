import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initSentry } from './lib/sentry'

// No-op unless VITE_SENTRY_DSN is set. Must run before the app renders so
// errors during the initial mount are captured.
initSentry()

// Both the app host and the docs.* host render <App/>; App routes the docs
// host to the gated API reference internally. The docs host stays out of
// StrictMode (matching the original setup) to avoid double-invoked effects
// in the heavy Scalar embed.
const isDocsHost = window.location.hostname.startsWith('docs.')

createRoot(document.getElementById('root')!).render(
  isDocsHost ? (
    <App />
  ) : (
    <StrictMode>
      <App />
    </StrictMode>
  ),
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

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

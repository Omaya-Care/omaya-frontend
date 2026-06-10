import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import DocsLoading from './components/DocsLoading.tsx'

// docs.omayacare.com (and docs.localhost in dev) serves the Scalar API
// reference. Everything else gets the dashboard app. Lazy-loaded so the
// heavy Scalar bundle (and its global CSS) never ships with the main app.
// Mirrors the Vercel setup where docs.* is an alias of the same project.
const Docs = lazy(() => import('./Docs'))
const isDocsHost = window.location.hostname.startsWith('docs.')

createRoot(document.getElementById('root')!).render(
  isDocsHost ? (
    <Suspense fallback={<DocsLoading />}>
      <Docs />
    </Suspense>
  ) : (
    <StrictMode>
      <App />
    </StrictMode>
  ),
)

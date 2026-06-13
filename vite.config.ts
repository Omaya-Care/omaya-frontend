import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from '@sentry/vite-plugin'

// Sentry release = portal@<vercel-sha>, injected as the build-time constant
// __SENTRY_RELEASE__ so the runtime SDK and the uploaded source maps agree.
// VERCEL_GIT_COMMIT_SHA is exposed by Vercel at build (NOT VITE_-prefixed, so
// it never reaches the bundle on its own).
const sha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local'
const release = `portal@${sha}`

// Source-map upload only runs when SENTRY_AUTH_TOKEN is present (Vercel prod
// build). Local/preview builds without the token still build cleanly, and we
// only emit maps when we're going to upload+delete them — so dist/*.map is
// never served publicly.
const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN

// https://vite.dev/config/
export default defineConfig({
  define: {
    __SENTRY_RELEASE__: JSON.stringify(release),
  },
  build: {
    sourcemap: Boolean(sentryAuthToken),
  },
  plugins: [
    react(),
    sentryAuthToken
      ? sentryVitePlugin({
          org: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,
          authToken: sentryAuthToken,
          release: { name: release },
          // Delete maps after upload so Vercel never serves them publicly.
          sourcemaps: { filesToDeleteAfterUpload: ['./dist/**/*.map'] },
        })
      : undefined,
  ],
})

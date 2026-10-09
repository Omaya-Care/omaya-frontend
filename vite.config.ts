// defineConfig from vitest/config (not vite) so the `test` block below typechecks.
import { defineConfig } from 'vitest/config'
import path from 'path'
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from '@sentry/vite-plugin'

// Sentry release = portal@<sha>, injected as the build-time constant
// __SENTRY_RELEASE__ so the runtime SDK and the uploaded source maps agree.
// The SHA comes from whichever CI built it: Vercel (VERCEL_GIT_COMMIT_SHA),
// GitHub Actions (GITHUB_SHA — the Cloudflare deploy), or an explicit GIT_SHA.
// None are VITE_-prefixed, so they never reach the bundle on their own.
const sha =
  (process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA ?? process.env.GIT_SHA)?.slice(0, 7) ??
  'local'
const release = `portal@${sha}`

// Source-map upload only runs when SENTRY_AUTH_TOKEN is present (the prod
// build). Local/preview builds without the token still build cleanly, and we
// only emit maps when we're going to upload+delete them — so dist/*.map is
// never served publicly.
const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Local dev is exercised through a cloudflared quick tunnel (its
    // hostname rotates on every restart) — without this, Vite 6 rejects the
    // tunnel host with a "Blocked request" 403. Dev-only; the config is
    // ignored at build.
    host: true,
    allowedHosts: [
      'itself-structured-trader-motherboard.trycloudflare.com',
      '.trycloudflare.com',
      'localhost',
    ],
  },
  define: {
    __SENTRY_RELEASE__: JSON.stringify(release),
  },
  // Strip chatty/PHI-prone console output + debugger from production bundles so
  // PHI can never leak to a clinic-workstation console. Keep console.error/warn
  // so Sentry's runtime console breadcrumbs (warn/error) still fire — `pure`
  // lets the minifier drop log/debug/info (return value always unused). Dev
  // (vite serve) keeps everything.
  esbuild:
    command === 'build'
      ? { drop: ['debugger'], pure: ['console.log', 'console.debug', 'console.info'] }
      : {},
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
          // Delete maps after upload so they are never served publicly.
          sourcemaps: { filesToDeleteAfterUpload: ['./dist/**/*.map'] },
        })
      : undefined,
  ],
  test: {
    // jsdom, not node: the response interceptor reads window.location and
    // clearSession() touches localStorage.
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    // The Sentry plugin is build-only and needs no token here; excluding e2e-ish
    // dirs keeps `pnpm test` to unit scope.
    exclude: ['node_modules', 'dist'],
  },
}))

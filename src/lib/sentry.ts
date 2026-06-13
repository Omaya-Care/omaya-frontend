import * as Sentry from "@sentry/react";
import { useEffect } from "react";
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from "react-router-dom";

// Build-time release string, injected by vite.config.ts (`__SENTRY_RELEASE__`)
// as `portal@<vercel-sha>`. Declared here so TS knows the global exists.
declare const __SENTRY_RELEASE__: string | undefined;

// PHI redaction shared by beforeBreadcrumb + beforeSend. Mother-scoped URLs
// (e.g. /mothers/<uuid>) and long digit runs (phone-ish) get collapsed to :id.
const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
const LONG_DIGITS_RE = /\d{5,}/g;

function redactIds(text: string): string {
  return text.replace(UUID_RE, ":id").replace(LONG_DIGITS_RE, ":id");
}

function redactUrl(url: string): string {
  // Drop the query string (can carry link tokens) + redact path id segments.
  const path = url.split("?")[0];
  return redactIds(path);
}

/**
 * Initialize Sentry for the hospital-portal SPA.
 *
 * A no-op when VITE_SENTRY_DSN is unset (local dev), so calling it
 * unconditionally from main.tsx is always safe.
 *
 * PHI guard: this portal renders mother identifiers and clinical data, so
 * Session Replay is deliberately NOT enabled (it would record PHI into the
 * DOM snapshots), `sendDefaultPii` is left false, and beforeBreadcrumb/
 * beforeSend strip query strings + redact UUID/long-digit id segments out of
 * fetch/console/navigation breadcrumbs and event URLs/messages.
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  // Default 0 = errors only, no performance tracing. Set VITE_SENTRY_TRACES_SAMPLE_RATE
  // (0.0–1.0) per deploy to turn tracing on.
  const tracesSampleRate = Number(
    import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? "0",
  );

  Sentry.init({
    dsn,
    release: typeof __SENTRY_RELEASE__ !== "undefined" ? __SENTRY_RELEASE__ : undefined,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT ?? import.meta.env.MODE,
    integrations: [
      // React Router v7 (library mode, <Routes>) — gives errors/breadcrumbs
      // parameterized route names. Tracing stays off; this adds context, not spans.
      Sentry.reactRouterV7BrowserTracingIntegration({
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
    ],
    tracesSampleRate: Number.isFinite(tracesSampleRate) ? tracesSampleRate : 0,
    sendDefaultPii: false,
    initialScope: { tags: { component: "portal-frontend" } },
    beforeBreadcrumb(crumb) {
      if (crumb.category === "console") {
        // Drop chatty logs; keep warn/error but redact + truncate.
        if (crumb.level === "log" || crumb.level === "debug") return null;
        if (typeof crumb.message === "string") {
          crumb.message = redactIds(crumb.message).slice(0, 500);
        }
        return crumb;
      }
      if (crumb.category === "fetch" || crumb.category === "xhr") {
        if (crumb.data?.url) crumb.data.url = redactUrl(String(crumb.data.url));
        delete crumb.data?.request_body;
        delete crumb.data?.response_body;
        return crumb;
      }
      if (crumb.category === "navigation") {
        if (crumb.data?.from) crumb.data.from = redactUrl(String(crumb.data.from));
        if (crumb.data?.to) crumb.data.to = redactUrl(String(crumb.data.to));
        return crumb;
      }
      return crumb;
    },
    beforeSend(event) {
      if (event.request?.url) event.request.url = redactUrl(event.request.url);
      if (event.request?.query_string) event.request.query_string = "[scrubbed]";
      for (const ex of event.exception?.values ?? []) {
        if (ex.value) ex.value = redactIds(ex.value);
      }
      if (typeof event.message === "string") event.message = redactIds(event.message);
      return event;
    },
  });
}

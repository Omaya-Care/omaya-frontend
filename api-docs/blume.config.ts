import { defineConfig } from "blume";
import { openapi } from "blume/reference";

// Omaya API docs — team-only. Privacy is the sign-in gate in worker/index.ts
// (portal account + the backend's docs_access allowlist), not anything in
// this site: Blume has no sign-in, and every file in dist/ is readable by
// whoever reaches it. Never serve dist/ except through that Worker.
//
// The specs are build inputs in specs/, exported from the services' code by
// CI's deploy-api-docs.yml (or `pnpm specs:local`), because the live /openapi.json
// routes are auth-gated and Blume can't attach credentials when it fetches a
// spec.
const API_REFERENCES = [
  {
    label: "Backend",
    route: "/backend",
    spec: "./specs/backend.json",
    icon: "server",
    description: "Portal, auth, and internal ingest endpoints",
  },
  {
    label: "Ops",
    route: "/ops",
    spec: "./specs/ops.json",
    icon: "shield",
    description: "Omaya-team ops endpoints behind admin.omayacare.com",
  },
  {
    label: "Call Service",
    route: "/call-service",
    spec: "./specs/call-service.json",
    icon: "phone",
    description: "Telephony runtime health and gateway endpoints",
  },
];

export default defineConfig({
  title: "Omaya API",
  description: "Team-only API reference for the Omaya backend, ops, and call-service.",
  logo: "/logo.png",

  theme: {
    accent: { light: "#7a2850", dark: "#c45a8a" },
    mode: "light",
  },

  reference: API_REFERENCES.map(({ route, spec }) => openapi({ route, spec })),

  navigation: {
    // One header dropdown switches between the three APIs; each reference's
    // route scopes the sidebar to its own operations.
    selectors: [
      {
        kind: "product",
        label: "API",
        items: API_REFERENCES.map(({ label, route, icon, description }) => ({
          label,
          path: route,
          icon,
          description,
        })),
      },
    ],
    tabs: API_REFERENCES.map(({ label, route }) => ({ label, path: route })),
  },

  // Everything sits behind the sign-in gate, so outside services can't
  // follow a link in — hide the actions that would hand one out.
  ai: { openInChat: false },
});

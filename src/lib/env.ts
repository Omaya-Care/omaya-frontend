/** Deploy tier this bundle was built for. Vite inlines it at build time:
 *  the staging workflow sets VITE_SENTRY_ENVIRONMENT=staging. */
const DEPLOY_ENV = import.meta.env.VITE_SENTRY_ENVIRONMENT ?? import.meta.env.MODE;

/** "Call now" is staging-only (and local dev) — never offered on prod.
 *  Fail-closed: any build not explicitly staging/dev hides it. */
export const CALL_NOW_ENABLED = import.meta.env.DEV || DEPLOY_ENV === "staging";

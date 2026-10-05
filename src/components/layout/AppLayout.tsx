import { useCallback, useEffect, useState } from "react";
import * as Sentry from "@sentry/react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAlerts } from "@/hooks/useAlerts";
import { setBaseTitle, useEscalationSound } from "@/hooks/useEscalationSound";
import { Sidebar } from "./Sidebar";
import { useSeenAlerts } from "@/hooks/useSeenAlerts";
import { getClinician, isExpertAccount } from "@/lib/auth";
import { NotificationsPanel } from "./NotificationsPanel";
import { AlertSoundPrompt } from "./AlertSoundPrompt";
import { LiveAlertsPausedBanner } from "./LiveAlertsPaused";
import { BELL_ID } from "./NotificationToaster";

/** In-panel fallback for a page render crash. Like App's top-level one it
 *  shows NO error detail in the DOM (that goes to Sentry); unlike it, the
 *  frame — sidebar, bell, chime and the alert poller — keeps running. */
function PageErrorFallback({ resetError }: { resetError: () => void }) {
  const navigate = useNavigate();
  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-3 px-6 py-24 text-center">
      <h1 className="text-base font-semibold text-gray-900">This page hit an unexpected error</h1>
      <p className="text-sm text-muted-foreground">Live alerts are still running. Try the dashboard or reload.</p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Already on /dashboard? The pathname key won't change, so reset.
            resetError();
            navigate("/dashboard");
          }}
        >
          Go to dashboard
        </Button>
        <Button size="sm" onClick={() => window.location.reload()}>
          Reload
        </Button>
      </div>
    </div>
  );
}

/** Authenticated app frame — mounted once as a layout route, so the sidebar
 *  (and its collapsed/menu state) persists across page navigations. Pages
 *  render into the inset white panel via <Outlet />. */
export function AppLayout() {
  const [panelOpen, setPanelOpen] = useState(false);
  const closePanel = useCallback(() => setPanelOpen(false), []);

  // Mobile nav drawer (below `md`). Remembered as the path it was opened on,
  // so any navigation closes it without an effect.
  const { pathname } = useLocation();
  const [drawerOpenAt, setDrawerOpenAt] = useState<string | null>(null);
  const drawerOpen = drawerOpenAt === pathname;
  const closeDrawer = useCallback(() => setDrawerOpenAt(null), []);
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeDrawer();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen, closeDrawer]);

  // Open alerts are the notifications. Polled here (not in the panel) so the
  // chime + toast fire on a new alert whether or not the drawer is open. A 403
  // (role lacks `escalate`) stops the poll and shows no alerts — they carry PHI.
  // An expert-roster account never polls: it has no hospital alerts.
  const { data: alerts, loading, failed, forbidden, stale, lastSuccessAt } = useAlerts("open", !isExpertAccount());
  // No chime baseline until a poll has actually succeeded: seeding it from a
  // failed first load ([]) would re-announce every open alert on recovery.
  // The first good poll seeds silently, exactly like a fresh sign-in (open
  // alerts show via the badge); a MID-session outage keeps the old baseline,
  // so the recovery poll still chimes for anything that arrived meanwhile.
  const { audioBlocked, unlock } = useEscalationSound(
    forbidden || loading || lastSuccessAt === null ? undefined : alerts,
  );
  const visibleAlerts = forbidden ? [] : alerts;
  // The badge counts only notifications not yet opened from the panel.
  const { seen, markSeen, unseenCount: count } = useSeenAlerts(visibleAlerts);

  // Browser tab title — scoped to the signed-in hospital while in the app.
  // Same stored-profile source the sidebar reads.
  const hospitalName = getClinician()?.hospital_name ?? "";
  // A paused live feed is also announced in the tab strip, so a background
  // tab shows it at a glance until the feed recovers.
  useEffect(() => {
    const base = hospitalName ? `Omaya Care | ${hospitalName}` : "Omaya Care";
    setBaseTitle(stale ? `⚠ Alerts paused — ${base}` : base);
    return () => setBaseTitle("Omaya Care");
  }, [hospitalName, stale]);

  return (
    // dvh, not vh: on iOS Safari 100vh runs under the browser toolbar, so the
    // bottom of the scrolling panel could never be reached.
    <div className="flex h-dvh bg-[#FAFAFA] font-sans">
      {/* Mobile drawer backdrop. */}
      <div
        aria-hidden="true"
        onClick={closeDrawer}
        className={`fixed inset-0 z-30 bg-black/30 transition-opacity duration-200 md:hidden ${
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <Sidebar mobileOpen={drawerOpen} onMobileClose={closeDrawer} />
      <div className="relative my-2 ml-2 mr-2 flex min-w-0 flex-1 flex-col md:ml-0">
        {/* Mobile top bar — menu + logo; the bell floats over its right end. */}
        <div className="flex h-12 shrink-0 items-center gap-2 pr-12 md:hidden">
          <button
            type="button"
            onClick={() => setDrawerOpenAt(pathname)}
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            className="flex size-10 items-center justify-center rounded-md text-black transition-colors hover:bg-black/[0.04]"
          >
            <Menu size={20} strokeWidth={1.75} />
          </button>
          <Link to="/dashboard" className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="block h-6 w-6 shrink-0 bg-[#7A2850] [mask:url(/brand/omaya-logo-mark-white.svg)_center/contain_no-repeat]"
            />
            <span className="sr-only">Omaya Care</span>
            <span
              aria-hidden="true"
              className="relative top-[3px] block h-4 w-[116px] bg-[#7A2850] [mask:url(/brand/omaya-care-wordmark-black.svg)_left_center/contain_no-repeat]"
            />
          </Link>
        </div>
        <LiveAlertsPausedBanner stale={stale} lastSuccessAt={lastSuccessAt} />
        <main className="min-h-0 flex-1 overflow-y-auto rounded-2xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.03)]">
          {/* A page crash stays inside the panel; keyed on the path so
              navigating away clears it. */}
          <Sentry.ErrorBoundary
            key={pathname}
            fallback={({ resetError }) => <PageErrorFallback resetError={resetError} />}
          >
            <Outlet />
          </Sentry.ErrorBoundary>
        </main>
        <Button
          id={BELL_ID}
          variant="outline"
          size="icon"
          onClick={() => setPanelOpen((o) => !o)}
          aria-expanded={panelOpen}
          aria-label={
            stale ? "Notifications — live alerts paused" : count > 0 ? `Notifications, ${count} new` : "Notifications"
          }
          className="bell-trigger absolute right-0 top-1 rounded-full border-border text-muted-foreground md:right-4 md:top-4"
        >
          <Bell className="bell-swing" />
          {stale && (
            <span
              aria-hidden="true"
              className="absolute -left-0.5 -top-0.5 h-[11px] w-[11px] rounded-full border-2 border-white bg-red-600"
            />
          )}
          {!forbidden && count > 0 && (
            <span className="absolute -right-0.5 -top-0.5 h-[15px] min-w-[15px] rounded-full bg-[#7A2850] px-1 text-center text-[9px] font-bold leading-[15px] text-white">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Button>
      </div>
      <NotificationsPanel
        open={panelOpen}
        onClose={closePanel}
        alerts={visibleAlerts}
        loading={loading}
        failed={failed}
        stale={stale}
        lastSuccessAt={lastSuccessAt}
        forbidden={forbidden}
        audioBlocked={audioBlocked}
        unlock={unlock}
        seen={seen}
        onSeen={markSeen}
      />
      <AlertSoundPrompt unlock={unlock} />
    </div>
  );
}

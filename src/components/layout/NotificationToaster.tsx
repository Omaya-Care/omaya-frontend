import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert, X, type LucideIcon } from "lucide-react";
import {
  DISPLAY_MS,
  dismissNotification,
  getNotificationsSnapshot,
  subscribeNotifications,
  type AppNotification,
  type NotificationKind,
} from "@/lib/notify";
import { cn } from "@/lib/utils";

/** id of the bell button alert toasts fly into (rendered by AppLayout). */
export const BELL_ID = "notifications-bell";

const FLY_MS = 450;

const ICONS: Record<NotificationKind, { icon: LucideIcon; className: string }> = {
  success: { icon: CircleCheck, className: "text-[#7A2850]" },
  error: { icon: CircleAlert, className: "text-red-600" },
  warning: { icon: TriangleAlert, className: "text-amber-600" },
  info: { icon: Info, className: "text-gray-500" },
  alert: { icon: TriangleAlert, className: "text-red-600" },
};

function ringBell() {
  const bell = document.getElementById(BELL_ID);
  const icon = bell?.querySelector("svg");
  if (!icon) return;
  icon.classList.remove("bell-ring");
  void icon.getBoundingClientRect(); // restart the animation
  icon.classList.add("bell-ring");
}

function Toast({ item }: { item: AppNotification }) {
  const ref = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  const [flyTo, setFlyTo] = useState<{ x: number; y: number } | null>(null);
  // Only a new-escalation alert lands in the bell (the panel lists alerts);
  // anything else — an error, a "saved" — just fades out, no bell ring.
  const [fading, setFading] = useState(false);
  const fliesToBell = item.kind === "alert";
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // After DISPLAY_MS, fly into the bell. Hovering pauses the countdown so a
  // clinician reading a toast doesn't have it snatched away mid-sentence.
  useEffect(() => {
    if (paused || flyTo || fading) return;
    const t = window.setTimeout(() => {
      if (!fliesToBell) return setFading(true);
      const el = ref.current;
      const bell = document.getElementById(BELL_ID);
      if (!el || !bell) return dismissNotification(item.id);
      const from = el.getBoundingClientRect();
      const to = bell.getBoundingClientRect();
      setFlyTo({
        x: to.left + to.width / 2 - (from.left + from.width / 2),
        y: to.top + to.height / 2 - (from.top + from.height / 2),
      });
    }, DISPLAY_MS);
    return () => window.clearTimeout(t);
  }, [paused, flyTo, fading, fliesToBell, item.id]);

  useEffect(() => {
    if (!fading) return;
    const t = window.setTimeout(() => dismissNotification(item.id), FLY_MS);
    return () => window.clearTimeout(t);
  }, [fading, item.id]);

  useEffect(() => {
    if (!flyTo) return;
    const t = window.setTimeout(() => {
      ringBell();
      dismissNotification(item.id);
    }, FLY_MS);
    return () => window.clearTimeout(t);
  }, [flyTo, item.id]);

  const { icon: Icon, className: iconClass } = ICONS[item.kind];

  return (
    <div
      ref={ref}
      role={item.kind === "error" || item.kind === "alert" ? "alert" : "status"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={
        flyTo
          ? {
              transform: `translate(${flyTo.x}px, ${flyTo.y}px) scale(0.08)`,
              opacity: 0,
              transitionDuration: `${FLY_MS}ms`,
            }
          : fading
            ? { opacity: 0, transitionDuration: `${FLY_MS}ms` }
            : undefined
      }
      className={cn(
        "pointer-events-auto flex w-80 items-start gap-2.5 rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-800 shadow-md",
        "origin-center transition-[transform,opacity] duration-200 ease-in-out motion-reduce:transition-opacity",
        !entered && "translate-x-4 opacity-0",
        item.kind === "alert" && "border-red-200",
      )}
    >
      <Icon size={16} className={cn("mt-0.5 shrink-0", iconClass)} />
      <div className="min-w-0 flex-1">
        <p className="font-medium">{item.message}</p>
        {item.description && <p className="mt-0.5 text-gray-500">{item.description}</p>}
      </div>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => dismissNotification(item.id)}
        className="shrink-0 rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      >
        <X size={14} />
      </button>
    </div>
  );
}

/** Top-right stack for every in-app notification (see lib/notify). */
export function NotificationToaster() {
  const items = useSyncExternalStore(
    subscribeNotifications,
    getNotificationsSnapshot,
    getNotificationsSnapshot,
  );
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 top-16 z-50 flex flex-col items-end gap-2"
    >
      {items.map((item) => (
        <Toast key={item.id} item={item} />
      ))}
    </div>
  );
}

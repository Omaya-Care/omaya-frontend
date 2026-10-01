import type { ReactNode } from "react";

// App-wide notification store. Every in-app toast goes through here (it
// replaces sonner) so they all share one presentation: top-right, visible for
// DISPLAY_MS; then <NotificationToaster> flies `alert` toasts into the
// notifications bell and simply fades out every other kind.

export type NotificationKind = "success" | "error" | "info" | "warning" | "alert";

export interface AppNotification {
  id: number;
  kind: NotificationKind;
  message: ReactNode;
  description?: ReactNode;
}

export const DISPLAY_MS = 5_000;

let nextId = 1;
let items: AppNotification[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((cb) => cb());
}

export function subscribeNotifications(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** getSnapshot for useSyncExternalStore — a stable array reference until it changes. */
export function getNotificationsSnapshot(): AppNotification[] {
  return items;
}

export function dismissNotification(id: number): void {
  items = items.filter((n) => n.id !== id);
  emit();
}

function push(kind: NotificationKind, message: ReactNode, opts?: { description?: ReactNode }) {
  const id = nextId++;
  items = [...items, { id, kind, message, description: opts?.description }];
  emit();
  return id;
}

type Show = (message: ReactNode, opts?: { description?: ReactNode }) => number;

export const toast: Record<NotificationKind, Show> = {
  success: (m, o) => push("success", m, o),
  error: (m, o) => push("error", m, o),
  info: (m, o) => push("info", m, o),
  warning: (m, o) => push("warning", m, o),
  alert: (m, o) => push("alert", m, o),
};

import { describe, expect, it, vi } from "vitest";

vi.mock("./api", () => ({ api: { get: vi.fn(), post: vi.fn() } }));

import { clearNotifications, getNotificationsSnapshot, subscribeNotifications, toast } from "./notify";
import { clearSession } from "./auth";
import { endSession } from "./auth-api";

describe("notifications are session-scoped", () => {
  it("clearNotifications drops every toast and notifies subscribers", () => {
    toast.alert("L4 escalation — Ama Serwaa");
    const cb = vi.fn();
    const off = subscribeNotifications(cb);
    clearNotifications();
    expect(getNotificationsSnapshot()).toEqual([]);
    expect(cb).toHaveBeenCalledTimes(1);
    off();
  });

  it("sign-out and the 401 path (clearSession) clear named escalation toasts", () => {
    toast.alert("L4 escalation — Ama Serwaa");
    expect(getNotificationsSnapshot()).toHaveLength(1);
    clearSession();
    expect(getNotificationsSnapshot()).toEqual([]);
  });

  it("cross-tab sign-out (endSession) clears them too", () => {
    toast.alert("L4 escalation — Ama Serwaa");
    endSession();
    expect(getNotificationsSnapshot()).toEqual([]);
  });
});

// A zone well off UTC, so the local day and the UTC day differ at night.
process.env.TZ = "America/New_York";

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const get = vi.fn();
vi.mock("@/lib/api", async (importActual) => ({
  ...(await importActual<typeof import("@/lib/api")>()),
  api: { get: (...args: unknown[]) => get(...args) },
}));
vi.mock("@/lib/auth-api", () => ({
  fetchMe: () => Promise.resolve({ permissions: { view_mothers: true, escalate: false } }),
}));

const { useDashboardCards, localDateParam } = await import("./useDashboardCards");

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  // 22:30 on 1 Oct in New York, already 2 Oct in UTC.
  vi.setSystemTime(new Date("2026-10-02T02:30:00Z"));
  get.mockReset();
  get.mockResolvedValue({ data: {} });
});
afterEach(() => {
  act(() => root?.unmount());
  vi.useRealTimers();
});

describe("useDashboardCards date", () => {
  it("formats the local calendar day, not the UTC one", () => {
    expect(localDateParam()).toBe("2026-10-01");
  });

  it("asks /calls for the clinician's local day", async () => {
    function Harness() {
      useDashboardCards();
      return null;
    }
    root = createRoot(document.createElement("div"));
    await act(async () => root.render(<Harness />));
    expect(get).toHaveBeenCalledWith("/calls", { params: { date: "2026-10-01" } });
  });
});

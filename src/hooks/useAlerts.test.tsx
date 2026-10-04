import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const get = vi.fn();
vi.mock("@/lib/api", async (importActual) => ({
  ...(await importActual<typeof import("@/lib/api")>()),
  api: { get: (...args: unknown[]) => get(...args) },
}));

const { useAlerts, invalidateAlerts, FORBIDDEN_RETRY_MS } = await import("./useAlerts");
type Result = ReturnType<typeof useAlerts>;

// React 19's act() warns unless the environment opts in.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let latest: Result;
let other: Result;
function Harness({ status = "resolved" }: { status?: "open" | "resolved" }) {
  latest = useAlerts(status);
  return null;
}
// Two readers of the open feed, like AppLayout's bell + the Escalations page.
function TwoOpenReaders() {
  latest = useAlerts("open");
  other = useAlerts("open");
  return null;
}

async function mount(node: React.ReactNode = <Harness />) {
  root = createRoot(document.createElement("div"));
  await act(async () => root.render(node));
}

function httpError(status: number) {
  return Object.assign(new Error(`HTTP ${status}`), { isAxiosError: true, response: { status, data: {} } });
}

const ROW = {
  id: "a1",
  call_id: "c1",
  mother_id: "m1",
  mother_name: "Ama Serwaa",
  day_postpartum: 6,
  severity: "crisis",
  created_at: "2026-09-30T07:30:00Z",
  time_left_minutes: -20,
  status: "resolved",
  page_status: "not_applicable",
  provisional_reason: null,
  acknowledged_at: "2026-09-30T07:40:00Z",
  acknowledged_by_name: "Nurse Efua",
  resolved_at: "2026-09-30T08:00:00Z",
  resolved_by_name: "Dr. Mensah",
  resolution_note: "Seen at clinic.",
};

beforeEach(() => {
  vi.useFakeTimers();
  get.mockReset();
});
afterEach(() => {
  act(() => root.unmount());
  vi.useRealTimers();
});

describe("useAlerts", () => {
  it("maps who handled the alert and the resolution note", async () => {
    get.mockResolvedValue({ data: { alerts: [ROW] } });
    await mount();
    expect(get).toHaveBeenCalledWith("/alerts", { params: { status: "resolved", limit: 100 } });
    expect(latest.loading).toBe(false);
    expect(latest.data[0]).toMatchObject({
      acknowledgedByName: "Nurse Efua",
      resolvedByName: "Dr. Mensah",
      resolvedAt: "2026-09-30T08:00:00Z",
      resolutionNote: "Seen at clinic.",
    });
  });

  it("treats a 403 as forbidden", async () => {
    get.mockRejectedValue(httpError(403));
    await mount();
    expect(latest.forbidden).toBe(true);
    expect(latest.failed).toBe(false);
  });

  it("never polls the history tabs (unbounded lists) — one load, then on demand", async () => {
    get.mockResolvedValue({ data: { alerts: [ROW] } });
    await mount();
    await act(async () => vi.advanceTimersByTime(120_000));
    expect(get).toHaveBeenCalledTimes(1);
    await act(async () => latest.reload());
    expect(get).toHaveBeenCalledTimes(2);
  });

  it("shares ONE open-alerts poller between readers", async () => {
    get.mockResolvedValue({ data: { alerts: [{ ...ROW, status: "open" }] } });
    await mount(<TwoOpenReaders />);
    expect(get).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith("/alerts", { params: { status: "open" } });
    await act(async () => vi.advanceTimersByTime(15_000));
    expect(get).toHaveBeenCalledTimes(2);
    expect(other.data).toHaveLength(1);
    await act(async () => invalidateAlerts());
    expect(get).toHaveBeenCalledTimes(3);
  });

  it("keeps the last open rows on a failed poll but flags the feed stale after 2 in a row", async () => {
    get.mockResolvedValueOnce({ data: { alerts: [{ ...ROW, status: "open" }] } }).mockRejectedValue(httpError(500));
    await mount(<Harness status="open" />);
    expect(latest.lastSuccessAt).not.toBeNull();
    await act(async () => vi.advanceTimersByTime(15_000));
    expect(latest.failed).toBe(true);
    expect(latest.stale).toBe(false);
    expect(latest.data).toHaveLength(1);
    await act(async () => vi.advanceTimersByTime(15_000));
    expect(latest.stale).toBe(true);
    expect(latest.data).toHaveLength(1);
  });

  it("clears the stale flag as soon as a poll succeeds", async () => {
    get
      .mockRejectedValueOnce(httpError(500))
      .mockRejectedValueOnce(httpError(500))
      .mockResolvedValue({ data: { alerts: [] } });
    await mount(<Harness status="open" />);
    await act(async () => vi.advanceTimersByTime(15_000));
    expect(latest.stale).toBe(true);
    expect(latest.lastSuccessAt).toBeNull();
    await act(async () => vi.advanceTimersByTime(15_000));
    expect(latest.stale).toBe(false);
    expect(latest.failed).toBe(false);
  });

  it("applies only the latest open poll when two overlap (latest wins)", async () => {
    const deferred = () => {
      let resolve!: (v: unknown) => void;
      const promise = new Promise((r) => (resolve = r));
      return { promise, resolve };
    };
    const first = deferred();
    const second = deferred();
    get.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    await mount(<Harness status="open" />);
    // An ack fires a second poll while the first (pre-ack) one is in flight.
    await act(async () => invalidateAlerts());
    await act(async () => second.resolve({ data: { alerts: [] } }));
    await act(async () => first.resolve({ data: { alerts: [{ ...ROW, status: "open" }] } }));
    expect(latest.data).toHaveLength(0);
  });

  it("counts a poll that times out on a slow link even after the next tick superseded it", async () => {
    // The API timeout equals the 15s cadence, so each tick supersedes the
    // previous poll before it times out. Dropping those failures let a frozen
    // feed pass for a live one; the cadence itself must not slow down either.
    const timeout = Object.assign(new Error("timeout of 15000ms exceeded"), {
      isAxiosError: true,
      code: "ECONNABORTED",
    });
    get.mockImplementation(
      () => new Promise((_, reject) => window.setTimeout(() => reject(timeout), 15_000)),
    );
    await mount(<Harness status="open" />);
    await act(async () => vi.advanceTimersByTime(15_000));
    expect(get).toHaveBeenCalledTimes(2);
    expect(latest.failed).toBe(true);
    await act(async () => vi.advanceTimersByTime(15_000));
    expect(get).toHaveBeenCalledTimes(3);
    expect(latest.stale).toBe(true);
  });

  it("refreshes immediately on tab return even while a poll is in flight", async () => {
    let settleSlow!: (v: unknown) => void;
    const slow = new Promise((resolve) => (settleSlow = resolve));
    get.mockReturnValueOnce(slow).mockResolvedValue({ data: { alerts: [] } });
    await mount(<Harness status="open" />);
    await act(async () => document.dispatchEvent(new Event("visibilitychange")));
    expect(get).toHaveBeenCalledTimes(2);
    expect(latest.data).toEqual([]);
    // The superseded slow poll settles late and must not overwrite the fresh data.
    await act(async () => settleSlow({ data: { alerts: [{ ...ROW, status: "open" }] } }));
    expect(latest.data).toEqual([]);
  });

  it("counts timed-out polls that tab returns superseded, so an outage still reads as paused", async () => {
    const timeout = Object.assign(new Error("timeout of 15000ms exceeded"), {
      isAxiosError: true,
      code: "ECONNABORTED",
    });
    get.mockImplementation(
      () => new Promise((_, reject) => window.setTimeout(() => reject(timeout), 15_000)),
    );
    await mount(<Harness status="open" />);
    for (let i = 0; i < 4; i++) {
      await act(async () => vi.advanceTimersByTime(5_000));
      await act(async () => document.dispatchEvent(new Event("visibilitychange")));
    }
    await act(async () => vi.advanceTimersByTime(15_000));
    expect(latest.stale).toBe(true);
  });

  it("a superseded failure never marks a feed failed once a newer poll succeeded", async () => {
    let failOld!: (e: unknown) => void;
    get
      .mockReturnValueOnce(new Promise((_, reject) => (failOld = reject)))
      .mockResolvedValue({ data: { alerts: [] } });
    await mount(<Harness status="open" />);
    await act(async () => invalidateAlerts());
    expect(latest.failed).toBe(false);
    await act(async () => failOld(httpError(500)));
    expect(latest.failed).toBe(false);
    expect(latest.data).toEqual([]);
  });

  it("an older poll's timeout never undoes a newer 403 backoff", async () => {
    let failOld!: (e: unknown) => void;
    get
      .mockReturnValueOnce(new Promise((_, reject) => (failOld = reject)))
      .mockRejectedValueOnce(httpError(403))
      .mockResolvedValue({ data: { alerts: [] } });
    await mount(<Harness status="open" />);
    await act(async () => invalidateAlerts());
    expect(latest.forbidden).toBe(true);
    await act(async () => failOld(httpError(500)));
    expect(latest.forbidden).toBe(true);
    // Still on the slow retry: no 15s poll.
    await act(async () => vi.advanceTimersByTime(15_000));
    expect(get).toHaveBeenCalledTimes(2);
  });

  it("backs off on an open-feed 403 but keeps retrying, and resumes 15s cadence on recovery", async () => {
    get.mockRejectedValue(httpError(403));
    await mount(<Harness status="open" />);
    expect(latest.forbidden).toBe(true);
    expect(get).toHaveBeenCalledTimes(1);
    // No 15s poll while forbidden…
    await act(async () => vi.advanceTimersByTime(15_000));
    expect(get).toHaveBeenCalledTimes(1);
    // …but the slow retry still fires.
    get.mockResolvedValue({ data: { alerts: [{ ...ROW, status: "open" }] } });
    await act(async () => vi.advanceTimersByTime(FORBIDDEN_RETRY_MS - 15_000));
    expect(get).toHaveBeenCalledTimes(2);
    expect(latest.forbidden).toBe(false);
    expect(latest.data).toHaveLength(1);
    // Normal cadence is back.
    await act(async () => vi.advanceTimersByTime(15_000));
    expect(get).toHaveBeenCalledTimes(3);
  });

  it("refetches on manual invalidation even while forbidden", async () => {
    get.mockRejectedValueOnce(httpError(403)).mockResolvedValue({ data: { alerts: [] } });
    await mount(<Harness status="open" />);
    expect(latest.forbidden).toBe(true);
    await act(async () => invalidateAlerts());
    expect(get).toHaveBeenCalledTimes(2);
    expect(latest.forbidden).toBe(false);
  });

  it("shows an outage after a 403 as a paused feed, not as forbidden", async () => {
    get.mockRejectedValueOnce(httpError(403)).mockRejectedValue(httpError(500));
    await mount(<Harness status="open" />);
    expect(latest.forbidden).toBe(true);
    await act(async () => vi.advanceTimersByTime(FORBIDDEN_RETRY_MS));
    expect(latest.forbidden).toBe(false);
    expect(latest.failed).toBe(true);
    // Back on the normal cadence, so the outage is retried every 15s.
    await act(async () => vi.advanceTimersByTime(15_000));
    expect(get).toHaveBeenCalledTimes(3);
    expect(latest.stale).toBe(true);
  });
});

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const get = vi.fn();
const post = vi.fn();
vi.mock("@/lib/api", async (importActual) => ({
  ...(await importActual<typeof import("@/lib/api")>()),
  api: {
    get: (...args: unknown[]) => get(...args),
    post: (...args: unknown[]) => post(...args),
  },
}));

const mod = await import("./useExpertRequests");
const { useMyExpertRequests, useExpertThread, replyToExpertRequest, claimExpertRequest, sendExpertTyping } = mod;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
async function mount(render: () => null) {
  function Harness() {
    return render();
  }
  root = createRoot(document.createElement("div"));
  await act(async () => root.render(<Harness />));
}

const MINE_ROW = {
  id: "r1",
  category: "lactation_consultant",
  question_text: "Is it normal for feeds to take an hour?",
  mother_name: "Ama Serwaa",
  care_phase: "postpartum",
  language: "en",
  status: "active",
  requested_at: "2026-09-30T07:30:00+00:00",
  responded_at: "2026-09-30T07:45:00+00:00",
  reported: false,
  rating: null,
  urgent: true,
  message_count: 3,
  last_message: { id: "m3", speaker: "mother", text_body: "Thank you", created_at: "2026-09-30T08:00:00+00:00" },
};

beforeEach(() => {
  vi.useFakeTimers();
  get.mockReset();
  post.mockReset();
});
afterEach(() => {
  act(() => root?.unmount());
  vi.useRealTimers();
});

describe("useMyExpertRequests", () => {
  it("maps the MineResponse wire shape", async () => {
    get.mockResolvedValue({ data: { requests: [MINE_ROW] } });
    let latest!: ReturnType<typeof useMyExpertRequests>;
    await mount(() => {
      latest = useMyExpertRequests();
      return null;
    });
    expect(get).toHaveBeenCalledWith("/expert-requests/mine");
    expect(latest.loading).toBe(false);
    expect(latest.data[0]).toMatchObject({
      id: "r1",
      category: "lactation_consultant",
      questionText: "Is it normal for feeds to take an hour?",
      motherName: "Ama Serwaa",
      urgent: true,
      messageCount: 3,
      lastMessage: { id: "m3", speaker: "mother", textBody: "Thank you" },
    });
  });

  it("polls every 20s, and refetches at once after a write", async () => {
    get.mockResolvedValue({ data: { requests: [] } });
    await mount(() => {
      useMyExpertRequests();
      return null;
    });
    expect(get).toHaveBeenCalledTimes(1);
    await act(async () => vi.advanceTimersByTime(20_000));
    expect(get).toHaveBeenCalledTimes(2);

    post.mockResolvedValue({ data: { id: "r1", status: "assigned", sent: true, detail: null } });
    await act(async () => {
      await claimExpertRequest("r1");
    });
    expect(post).toHaveBeenCalledWith("/expert-requests/r1/claim");
    expect(get).toHaveBeenCalledTimes(3);
  });

  it("reports a failed fetch as failed, not as an empty list", async () => {
    get.mockRejectedValue(Object.assign(new Error("boom"), { response: { status: 500, data: {} } }));
    let latest!: ReturnType<typeof useMyExpertRequests>;
    await mount(() => {
      latest = useMyExpertRequests();
      return null;
    });
    expect(latest.failed).toBe(true);
    expect(latest.loading).toBe(false);
  });
});

describe("useExpertThread", () => {
  it("stays idle for null and polls an open thread every 10s", async () => {
    get.mockResolvedValue({
      data: {
        request: { ...MINE_ROW, message_count: undefined, last_message: undefined },
        messages: [{ id: "m1", speaker: "expert", text_body: "Hello", created_at: "2026-09-30T07:46:00+00:00" }],
      },
    });
    let id: string | null = null;
    let latest!: ReturnType<typeof useExpertThread>;
    await mount(() => {
      latest = useExpertThread(id);
      return null;
    });
    expect(get).not.toHaveBeenCalled();
    expect(latest.loading).toBe(false);

    id = "r1";
    await act(async () => root.render(<Probe />));
    function Probe() {
      latest = useExpertThread(id);
      return null;
    }
    expect(get).toHaveBeenCalledWith("/expert-requests/r1/thread");
    expect(latest.data?.messages[0]).toEqual({
      id: "m1",
      speaker: "expert",
      textBody: "Hello",
      createdAt: "2026-09-30T07:46:00+00:00",
    });
    const calls = get.mock.calls.length;
    await act(async () => vi.advanceTimersByTime(10_000));
    expect(get.mock.calls.length).toBe(calls + 1);
  });
});

describe("mutations", () => {
  it("sends exactly the fields ReplyRequest declares (extra=forbid)", async () => {
    post.mockResolvedValue({ data: { id: "m9", status: "active", sent: false, detail: "bridge down" } });
    const result = await replyToExpertRequest("r1", "Try feeding on demand.");
    expect(post).toHaveBeenCalledWith("/expert-requests/r1/reply", { body: "Try feeding on demand." });
    expect(result.sent).toBe(false);
  });

  it("swallows typing-ping failures", async () => {
    post.mockRejectedValue(new Error("offline"));
    expect(() => sendExpertTyping("r1")).not.toThrow();
    expect(post).toHaveBeenCalledWith("/expert-requests/r1/typing");
    await act(async () => {});
  });
});

describe("overlapping loads", () => {
  it("never lets an older response overwrite a newer one (latest wins)", async () => {
    const deferred = () => {
      let resolve!: (v: unknown) => void;
      const promise = new Promise((r) => (resolve = r));
      return { promise, resolve };
    };
    const first = deferred();
    const second = deferred();
    get.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    let latest!: ReturnType<typeof useMyExpertRequests>;
    await mount(() => {
      latest = useMyExpertRequests();
      return null;
    });
    // The tab regains focus while the first load is still in flight.
    await act(async () => document.dispatchEvent(new Event("visibilitychange")));
    expect(get).toHaveBeenCalledTimes(2);
    await act(async () => second.resolve({ data: { requests: [] } }));
    // The older load (from before the request was claimed) lands last.
    await act(async () => first.resolve({ data: { requests: [MINE_ROW] } }));
    expect(latest.data).toHaveLength(0);
  });

  it("drops a stale in-flight load when a write triggers a refresh", async () => {
    const deferred = () => {
      let resolve!: (v: unknown) => void;
      const promise = new Promise((r) => (resolve = r));
      return { promise, resolve };
    };
    const first = deferred();
    get
      .mockReturnValueOnce(first.promise)
      .mockResolvedValue({ data: { request: { ...MINE_ROW }, messages: [{ id: "m9", speaker: "expert", text_body: "New", created_at: "x" }] } });
    let latest!: ReturnType<typeof useExpertThread>;
    await mount(() => {
      latest = useExpertThread("r1");
      return null;
    });
    await act(async () => mod.invalidateExpertRequests());
    await act(async () => first.resolve({ data: { request: { ...MINE_ROW }, messages: [] } }));
    expect(latest.data?.messages.map((m) => m.id)).toEqual(["m9"]);
  });
});

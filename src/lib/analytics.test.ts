import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { endSession } from "./auth-api";
import { trackAlertViewed, trackConversationOpened } from "./analytics";

describe("portal analytics relay", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    endSession(); // clears the once-per-session memory
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts only the event name and the row id, with the session cookie", () => {
    trackAlertViewed("alert-1");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/analytics\/portal-events$/);
    expect(init.credentials).toBe("include");
    expect(JSON.parse(init.body)).toEqual({ event: "alert_viewed", alert_id: "alert-1" });
  });

  it("reports each alert or transcript once per session", () => {
    trackAlertViewed("alert-1");
    trackAlertViewed("alert-1");
    trackConversationOpened("call-1");
    trackConversationOpened("call-1");
    expect(fetchMock).toHaveBeenCalledTimes(2);

    endSession();
    trackAlertViewed("alert-1");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("never throws when the request fails", async () => {
    fetchMock.mockRejectedValue(new Error("offline"));
    expect(() => trackConversationOpened("call-2")).not.toThrow();
    await Promise.resolve();
  });
});

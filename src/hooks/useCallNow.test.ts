import { describe, expect, it } from "vitest";
import { callNowErrorMessage, stableCallIdempotencyKey } from "./useCallNow";

describe("useCallNow shared phone-call behavior", () => {
  it("reuses one key for a transport retry and mints a new action key after reset", () => {
    const ref = { current: null as string | null };
    const first = stableCallIdempotencyKey(ref);
    expect(stableCallIdempotencyKey(ref)).toBe(first);
    ref.current = null;
    expect(stableCallIdempotencyKey(ref)).not.toBe(first);
  });

  it("maps the backend in-flight response used by both call surfaces", () => {
    expect(callNowErrorMessage(409, "call_in_flight")).toBe(
      "A call for this mother is already queued or in progress.",
    );
  });

  it("does not report a sent permission ask as an inactive mother", () => {
    // Regression: `whatsapp_permission_ask_sent` fell through to the bare-409
    // branch, so a lapsed WhatsApp permission — which the backend answers by
    // messaging her — surfaced as "this mother is not active". Both halves were
    // false, and it hid the ask that had just spent a weekly slot.
    const message = callNowErrorMessage(409, "whatsapp_permission_ask_sent");
    expect(message).not.toBe("This mother is not active, so a call can't be placed.");
    expect(message).toMatch(/asked her again/);
  });

  it("still falls back to the generic refusal for an unrecognised 409", () => {
    expect(callNowErrorMessage(409, "something_new")).toBe(
      "This mother is not active, so a call can't be placed.",
    );
  });
});

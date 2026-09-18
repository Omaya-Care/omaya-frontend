import { describe, it, expect } from "vitest";
import {
  permissionSendErrorMessage,
  permissionRefusalMessage,
} from "./useWhatsAppPermission";

describe("permissionSendErrorMessage", () => {
  it("quotes the machine token the edge refused with", () => {
    // Regression for the 2026-09-17 incident: this branch dropped `reason` on
    // the floor, so every Meta failure we had not explicitly mapped came out
    // as "you can try again in a minute". A deleted template does not fix
    // itself in a minute, and the clinician had nothing to report upward.
    const message = permissionSendErrorMessage("meta_132001");
    expect(message).toContain("meta_132001");
    expect(message).not.toContain("try again in a minute");
  });

  it("still says something useful when the server names no reason", () => {
    expect(permissionSendErrorMessage("")).toBe(
      "The message couldn't be sent to WhatsApp. You can try again in a minute.",
    );
  });

  it("tells the clinician not to retry a configuration failure", () => {
    // `send_secret_unconfigured` needs someone to change configuration.
    // Offering a retry wastes their time and hides the real fix.
    const message = permissionSendErrorMessage("send_secret_unconfigured");
    expect(message).toMatch(/retrying won't help/);
  });
});

describe("permissionRefusalMessage", () => {
  it("does not present a WhatsApp-side limit as 'already asked today'", () => {
    // `cooldown_meta` means WhatsApp refused to carry the request because the
    // budget for this business-and-mother pair was spent — she was never
    // actually asked. `cooldown_24h` is the one that means we asked her.
    // Conflating them tells a midwife we messaged a mother we did not.
    const meta = permissionRefusalMessage("cooldown_meta");
    expect(meta).not.toBe(permissionRefusalMessage("cooldown_24h"));
    expect(meta).toMatch(/tomorrow/);
  });

  it("names the kill switch rather than blaming the mother's state", () => {
    expect(permissionRefusalMessage("calling_disabled")).toMatch(/switched off/);
  });

  it("falls back to a generic refusal for a reason it does not know", () => {
    expect(permissionRefusalMessage("meta_131026")).toBe(
      "Could not send the permission request. Please try again.",
    );
  });
});

import { describe, it, expect } from "vitest";
import {
  permissionWindowLabel,
  permissionLabel,
  askBlockedLabel,
} from "./whatsappPermission";

const inHours = (h: number) => new Date(Date.now() + h * 3_600_000).toISOString();

describe("permissionWindowLabel", () => {
  it("says nothing unless the grant is live", () => {
    // The window is only meaningful for a grant; rendering it next to
    // "she declined" would read as a countdown to something that isn't coming.
    expect(permissionWindowLabel("requested", inHours(48))).toBeUndefined();
    expect(permissionWindowLabel("denied", inHours(48))).toBeUndefined();
    expect(permissionWindowLabel(undefined, inHours(48))).toBeUndefined();
  });

  it("reports a permanent grant as having no expiry", () => {
    // Backend stores NULL expires_at for Meta's permanent grant — the absence
    // is the fact, not missing data.
    expect(permissionWindowLabel("granted", undefined)).toBe("no expiry");
  });

  it("uses hours inside a day and a date beyond it", () => {
    expect(permissionWindowLabel("granted", inHours(5))).toBe("expires in 5h");
    expect(permissionWindowLabel("granted", inHours(72))).toMatch(/^until /);
  });

  it("never rounds a live grant down to '0h'", () => {
    // A grant with minutes left is still callable; "expires in 0h" would read
    // as already gone and stop a clinician placing a call the backend allows.
    expect(permissionWindowLabel("granted", inHours(0.1))).toBe("expires in 1h");
  });

  it("stays silent when the client clock says lapsed but the server says granted", () => {
    // The placement gate runs on the SERVER's clock; contradicting the row we
    // were handed would be a guess, not information.
    expect(permissionWindowLabel("granted", inHours(-3))).toBeUndefined();
  });

  it("ignores an unparseable timestamp rather than printing 'Invalid Date'", () => {
    expect(permissionWindowLabel("granted", "not-a-date")).toBeUndefined();
  });
});

describe("permissionLabel", () => {
  it("distinguishes never-asked from refused", () => {
    expect(permissionLabel(undefined)).toBe("not asked yet");
    expect(permissionLabel("denied")).toBe("she declined");
    expect(permissionLabel("expired")).toBe("permission expired");
  });
});

describe("askBlockedLabel", () => {
  it("distinguishes a WhatsApp-side limit from 'already asked today'", () => {
    // `cooldown_meta` means WhatsApp refused to carry the request — she was
    // never actually asked. Rendering it as "already asked today" would tell a
    // midwife we messaged a mother we did not, which is the same class of
    // untruth the 2026-09-17 incident produced at the toast layer.
    expect(askBlockedLabel("cooldown_meta")).toBe("WhatsApp limit reached");
    expect(askBlockedLabel("cooldown_24h")).toBe("already asked today");
  });

  it("names the kill switch instead of falling through to 'unavailable'", () => {
    // `calling_disabled` has always been reachable (WHATSAPP_CALLING_ENABLED)
    // but had no label, so the item read "unavailable" — indistinguishable
    // from a fault.
    expect(askBlockedLabel("calling_disabled")).toBe("WhatsApp calling is off");
  });

  it("returns undefined for a reason it does not know", () => {
    // The caller falls back to "unavailable"; an unknown reason must not
    // render as the empty string and collapse the hint entirely.
    expect(askBlockedLabel("meta_131026")).toBeUndefined();
    expect(askBlockedLabel(undefined)).toBeUndefined();
  });
});

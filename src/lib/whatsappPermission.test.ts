import { describe, it, expect } from "vitest";
import { permissionWindowLabel, permissionLabel } from "./whatsappPermission";

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

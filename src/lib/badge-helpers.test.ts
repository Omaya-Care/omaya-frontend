import { describe, it, expect } from "vitest";
import { matchesDirectionFilter, showsIncomingBadge } from "./badge-helpers";

describe("matchesDirectionFilter", () => {
  it("passes everything through on 'all'", () => {
    expect(matchesDirectionFilter("inbound", "all")).toBe(true);
    expect(matchesDirectionFilter("outbound", "all")).toBe(true);
    expect(matchesDirectionFilter(undefined, "all")).toBe(true);
  });

  it("matches an explicit direction", () => {
    expect(matchesDirectionFilter("inbound", "inbound")).toBe(true);
    expect(matchesDirectionFilter("outbound", "inbound")).toBe(false);
    expect(matchesDirectionFilter("outbound", "outbound")).toBe(true);
    expect(matchesDirectionFilter("inbound", "outbound")).toBe(false);
  });

  // The whole reason this is a function and not an inline comparison. Against a
  // backend that predates mig 0081 every call arrives with no `direction`. If
  // undefined did not normalize to "outbound", the "Outgoing" filter would hide
  // EVERY call — which reads to a clinician as data loss, not as a filter.
  it("treats a missing direction as outbound", () => {
    expect(matchesDirectionFilter(undefined, "outbound")).toBe(true);
    expect(matchesDirectionFilter(undefined, "inbound")).toBe(false);
  });
});

describe("showsIncomingBadge", () => {
  it("badges any inbound row, on every channel", () => {
    expect(showsIncomingBadge("inbound")).toBe(true);
  });

  it("never badges an outbound row, or one with no direction", () => {
    expect(showsIncomingBadge("outbound")).toBe(false);
    expect(showsIncomingBadge(undefined)).toBe(false);
  });

  // The property that matters: the badge and the filter must answer the same
  // question. A channel special-case on one side and not the other is what
  // previously let "Incoming" return rows the UI did not mark as incoming.
  it("agrees with the direction filter on every input", () => {
    for (const d of ["inbound", "outbound", undefined] as const) {
      expect(showsIncomingBadge(d)).toBe(matchesDirectionFilter(d, "inbound"));
    }
  });
});

/**
 * The onboarding wizards' field rules.
 *
 * These mirror the API's validators (backend `app/schemas/validators.py`), and
 * the whole point of the module is that a clinician learns about a bad value
 * on the step where she typed it rather than from a banner after submit. If
 * one of these silently loosens, the wizard starts letting through forms the
 * server then rejects — so pin the boundaries, not just the happy path.
 */
import { describe, expect, it } from "vitest";

import {
  applyExclusiveChoice,
  MAX_PARITY,
  deliveryVsDobError,
  dischargeVsDeliveryError,
  dobError,
  gravidaError,
  localDigitsOf,
  paraError,
  parityPairError,
  phoneLocalDigitsValid,
  requiredErrors,
  collectErrors,
  revealTogether,
} from "./onboarding-validation";

/** `n` whole years before today, as the wizard's `yyyy-MM-dd`. */
const yearsAgo = (years: number): string => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  // Avoid the Feb-29 edge landing on a different day after the year shift.
  d.setDate(Math.min(d.getDate(), 28));
  return d.toISOString().slice(0, 10);
};

const daysFromNow = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

describe("phone", () => {
  it("accepts 9 or more local digits", () => {
    expect(phoneLocalDigitsValid("241234567")).toBe(true);
    expect(phoneLocalDigitsValid("24 123 4567")).toBe(true);
  });

  it("rejects fewer than 9", () => {
    expect(phoneLocalDigitsValid("24123456")).toBe(false);
    expect(phoneLocalDigitsValid("")).toBe(false);
  });

  it("strips the dial code and separators", () => {
    expect(localDigitsOf("+233241234567", "+233")).toBe("241234567");
    expect(localDigitsOf("+233 24-123 4567", "+233")).toBe("241234567");
  });
});

describe("gravida / para", () => {
  it("passes an empty value — that's the required-field rule's job", () => {
    expect(gravidaError("")).toBeNull();
    expect(paraError("", "")).toBeNull();
  });

  it("accepts the inclusive bounds", () => {
    expect(gravidaError("0")).toBeNull();
    expect(gravidaError(String(MAX_PARITY))).toBeNull();
  });

  it("rejects above the cap, with a message rather than silence", () => {
    // The input used to just refuse the keystroke, with nothing on screen.
    expect(gravidaError("31")).toMatch(/30 or less/);
    expect(paraError("31", "31")).toMatch(/30 or less/);
  });

  it("rejects negatives", () => {
    expect(gravidaError("-1")).toMatch(/negative/);
  });

  it("rejects para above gravida", () => {
    expect(parityPairError("1", "3")).toMatch(/can't exceed/);
    expect(paraError("1", "3")).toMatch(/can't exceed/);
  });

  it("allows para equal to gravida", () => {
    expect(parityPairError("2", "2")).toBeNull();
  });

  it("reports the range problem before the pair problem", () => {
    // 45 is out of range AND above gravida; the range message is the more
    // actionable one and must win.
    expect(paraError("2", "45")).toMatch(/30 or less/);
  });
});

describe("date of birth", () => {
  it("accepts a plausible maternal age", () => {
    expect(dobError(yearsAgo(30))).toBeNull();
    expect(dobError(yearsAgo(10))).toBeNull();
    expect(dobError(yearsAgo(60))).toBeNull();
  });

  it("rejects a future date", () => {
    expect(dobError(daysFromNow(1))).toMatch(/must be in the past/);
  });

  it("rejects ages outside 10–60", () => {
    expect(dobError(yearsAgo(9))).toMatch(/check the year/);
    expect(dobError(yearsAgo(61))).toMatch(/check the year/);
  });

  it("ignores an empty or malformed value", () => {
    expect(dobError("")).toBeNull();
    expect(dobError("not-a-date")).toBeNull();
  });
});

describe("delivery vs date of birth", () => {
  it("accepts a plausible gap", () => {
    expect(deliveryVsDobError(yearsAgo(1), yearsAgo(30))).toBeNull();
  });

  it("rejects a delivery too close to her own birth", () => {
    // The shape a swapped pair of dates, or a transposed year, takes.
    expect(deliveryVsDobError(yearsAgo(10), yearsAgo(15))).toMatch(
      /too close to her date of birth/,
    );
  });

  it("is a no-op while either date is missing", () => {
    expect(deliveryVsDobError("", yearsAgo(30))).toBeNull();
    expect(deliveryVsDobError(yearsAgo(1), "")).toBeNull();
  });
});

describe("discharge vs delivery", () => {
  it("accepts same-day discharge", () => {
    expect(dischargeVsDeliveryError("2026-06-01", "2026-06-01")).toBeNull();
  });

  it("accepts discharge after delivery", () => {
    expect(dischargeVsDeliveryError("2026-06-03", "2026-06-01")).toBeNull();
  });

  it("rejects discharge before delivery", () => {
    // The rule that motivated the whole change: the server enforced it, but
    // only at submit and with no field attribution.
    expect(dischargeVsDeliveryError("2026-06-01", "2026-06-10")).toMatch(
      /can't be before the delivery date/,
    );
  });

  it("is a no-op while either date is missing", () => {
    expect(dischargeVsDeliveryError("", "2026-06-01")).toBeNull();
    expect(dischargeVsDeliveryError("2026-06-01", "")).toBeNull();
  });
});

describe("aggregation", () => {
  it("flags only the empty required fields", () => {
    const errors = requiredErrors({
      name: { value: "", message: "need a name" },
      phone: { value: "0241234567", message: "need a phone" },
      risks: { value: [], message: "need risks" },
    });
    expect(errors).toEqual({ name: "need a name", risks: "need risks" });
  });

  it("treats whitespace as empty", () => {
    const errors = requiredErrors({ name: { value: "   ", message: "need a name" } });
    expect(errors).toEqual({ name: "need a name" });
  });

  it("drops the nulls when collecting rule results", () => {
    expect(collectErrors({ a: null, b: "bad", c: null })).toEqual({ b: "bad" });
  });
});

describe("revealTogether", () => {
  const PAIRS = [
    ["deliveryDate", "dischargeDate"],
    ["dateOfBirth", "deliveryDate"],
    ["gravida", "para"],
  ] as const;

  it("reveals a paired field so a cross-field error can't hide", () => {
    // The case from the field: `dischargeDate` is prefilled with today and
    // never touched, so picking a later delivery date must still speak.
    expect(revealTogether("deliveryDate", PAIRS).sort()).toEqual(
      ["dateOfBirth", "deliveryDate", "dischargeDate"].sort(),
    );
    expect(revealTogether("dischargeDate", PAIRS).sort()).toEqual(
      ["deliveryDate", "dischargeDate"].sort(),
    );
    expect(revealTogether("para", PAIRS).sort()).toEqual(["gravida", "para"]);
  });

  it("leaves an unpaired field alone", () => {
    expect(revealTogether("motherName", PAIRS)).toEqual(["motherName"]);
    expect(revealTogether("gravida", [])).toEqual(["gravida"]);
  });
});

describe("applyExclusiveChoice", () => {
  const MEDS = ["none", "not_sure"] as const;

  it("clears the real selections when an exclusive answer is ticked", () => {
    expect(
      applyExclusiveChoice(
        ["pain_relief", "antibiotics", "not_sure"],
        ["pain_relief", "antibiotics"],
        MEDS,
      ),
    ).toEqual(["not_sure"]);
  });

  it("lets one exclusive answer replace the other", () => {
    expect(applyExclusiveChoice(["none", "not_sure"], ["none"], MEDS)).toEqual([
      "not_sure",
    ]);
  });

  it("drops the exclusive answer when a real item is ticked", () => {
    expect(
      applyExclusiveChoice(["not_sure", "iron_folic"], ["not_sure"], MEDS),
    ).toEqual(["iron_folic"]);
  });

  it("leaves a deselection alone", () => {
    expect(
      applyExclusiveChoice(["pain_relief"], ["pain_relief", "antibiotics"], MEDS),
    ).toEqual(["pain_relief"]);
    expect(applyExclusiveChoice([], ["not_sure"], MEDS)).toEqual([]);
  });

  it("still governs the risks chips it was generalized from", () => {
    expect(
      applyExclusiveChoice(["prior_csection", "none"], ["prior_csection"], ["none"]),
    ).toEqual(["none"]);
    expect(
      applyExclusiveChoice(["none", "diabetes"], ["none"], ["none"]),
    ).toEqual(["diabetes"]);
  });
});

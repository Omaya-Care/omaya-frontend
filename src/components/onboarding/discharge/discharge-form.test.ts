import { describe, expect, it } from "vitest";
import {
  buildDischargeRequest,
  dischargeStepErrors,
  initialDischargeForm,
  riskOtherText,
  type DischargeFormData,
} from "./discharge-form";

const form = (over: Partial<DischargeFormData>): DischargeFormData => ({
  ...initialDischargeForm(),
  motherName: "Ama Serwaa",
  phoneNumber: "+233241234567",
  deliveryDate: "2026-09-28",
  dischargeDate: "2026-09-30",
  deliveryType: "vaginal",
  outcome: "well",
  callingWindow: "morning",
  language: "en",
  consentCalls: true,
  whatsappOptIn: true,
  ...over,
});

const motherOf = (f: DischargeFormData) =>
  (buildDischargeRequest(f, null, []).body as { mother: Record<string, unknown> }).mother;

describe("risks_other payload", () => {
  it("sends the typed risk while the Other chip is on", () => {
    const m = motherOf(form({ riskOtherOn: true, risksOther: "  Anaemia " }));
    expect(m.risks_other).toEqual(["Anaemia"]);
  });

  it("omits text left behind by a deselected Other chip", () => {
    const f = form({ riskOtherOn: false, risksOther: "Anaemia" });
    expect(riskOtherText(f)).toBe("");
    expect(motherOf(f).risks_other).toEqual([]);
  });

  it("requires a description only while the chip is on", () => {
    const ctx = { existing: false, emergencyValid: true, countryCode: "+233" };
    expect(dischargeStepErrors(form({ riskOtherOn: true }), ctx, true, 4)).toHaveProperty("risksOther");
    expect(dischargeStepErrors(form({ riskOtherOn: false }), ctx, true, 4)).toEqual({});
  });
});

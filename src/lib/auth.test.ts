import { afterEach, describe, expect, it } from "vitest";
import {
  EXPERT_HOSPITAL_NAME,
  clearSession,
  defaultRouteFor,
  isExpertAccount,
  setSession,
  type Clinician,
} from "./auth";

const clinician = (hospital_name: string): Clinician => ({
  id: "c1",
  name: "Abena Mensah",
  email: "abena@example.com",
  role: "Psychologist",
  hospital_id: "h1",
  hospital_name,
});

afterEach(() => clearSession());

describe("defaultRouteFor", () => {
  it("lands an expert-roster account on its queue", () => {
    expect(defaultRouteFor(EXPERT_HOSPITAL_NAME)).toBe("/expert-requests");
  });

  it("lands everyone else on the dashboard", () => {
    expect(defaultRouteFor("Korle Bu Teaching Hospital")).toBe("/dashboard");
    expect(defaultRouteFor(undefined)).toBe("/dashboard");
  });
});

describe("isExpertAccount", () => {
  it("keys on the hospital, not the role", () => {
    // A hospital's own psychologist is not an expert.
    expect(isExpertAccount(clinician("Korle Bu Teaching Hospital"))).toBe(false);
    expect(isExpertAccount(clinician(EXPERT_HOSPITAL_NAME))).toBe(true);
  });

  it("reads the stored profile by default", () => {
    expect(isExpertAccount()).toBe(false);
    setSession(clinician(EXPERT_HOSPITAL_NAME));
    expect(isExpertAccount()).toBe(true);
  });
});

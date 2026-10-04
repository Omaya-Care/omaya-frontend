import { describe, expect, it } from "vitest";
import type { MotherProfile } from "@/hooks/useMother";
import {
  editMotherErrors,
  editMotherPayload,
  mapServerFieldErrors,
  seedEditMother,
} from "./edit-mother-form";

const mother = (over: Partial<MotherProfile> = {}): MotherProfile => ({
  id: "m1",
  name: "Ama Mensah",
  phone: "+233241234567",
  hospital: "Korle Bu",
  severity: "routine",
  consentStatus: "active",
  dayPostpartum: 5,
  lastInteraction: "",
  currentFlag: "",
  nextCallAt: "",
  dateOfBirth: "1995-03-15",
  language: "english",
  preferredCallWindow: "morning",
  deliveryType: "vaginal",
  deliveryDate: "2026-09-20",
  dischargeDate: "2026-09-22",
  gravida: 2,
  para: 1,
  risks: [],
  medications: [],
  emergencyContacts: [{ name: "Kwame Asante", phone: "+447700900123", relationship: "Husband" }],
  checkIns: [],
  whatsappCall: null,
  ...over,
});

describe("edit-mother-form", () => {
  it("sends nothing when nothing changed", () => {
    const seed = seedEditMother(mother());
    expect(editMotherPayload(seed.form, seed)).toEqual({});
    expect(editMotherErrors(seed.form, seed)).toEqual({});
  });

  it("sends only the changed fields, typed per the backend schema", () => {
    const seed = seedEditMother(mother());
    const form = { ...seed.form, phone: "551234567", gravida: "3", preferredCallWindow: "evening" };
    expect(editMotherPayload(form, seed)).toEqual({
      phone: "+233551234567",
      gravida: 3,
      preferred_call_window: "evening",
    });
  });

  it("keeps an off-list contact number verbatim when another field of the list changes", () => {
    const seed = seedEditMother(mother());
    const contacts = seed.form.contacts.map((c) => ({ ...c, name: "Kwame A." }));
    const body = editMotherPayload({ ...seed.form, contacts }, seed);
    expect(body.emergency_contacts).toEqual([
      { name: "Kwame A.", phone: "+447700900123", relationship: "husband" },
    ]);
  });

  it("does not send an untouched blank contact row for a mother with none", () => {
    const seed = seedEditMother(mother({ emergencyContacts: [] }));
    expect(editMotherPayload({ ...seed.form, language: "english", para: "0" }, seed)).toEqual({ para: 0 });
  });

  it("rejects an over-long phone instead of truncating it", () => {
    const seed = seedEditMother(mother());
    const errors = editMotherErrors({ ...seed.form, phone: "2412345678" }, seed);
    expect(errors.phone).toMatch(/9-digit/);
  });

  it("checks para against the stored gravida when only para changed", () => {
    const seed = seedEditMother(mother());
    expect(editMotherErrors({ ...seed.form, para: "4" }, seed).para).toBeTruthy();
  });

  it("won't let a stored value be blanked", () => {
    const seed = seedEditMother(mother());
    expect(editMotherErrors({ ...seed.form, gravida: "" }, seed).gravida).toBeTruthy();
  });

  it("maps 422 field paths onto form fields", () => {
    const { errors, unmapped } = mapServerFieldErrors([
      { path: "para", loc: ["body", "para"], type: "value_error", message: "too many" },
      {
        path: "emergency_contacts.0.phone",
        loc: ["body", "emergency_contacts", "0", "phone"],
        type: "value_error",
        message: "invalid",
      },
      { path: "body", loc: ["body"], type: "value_error", message: "bad body" },
    ]);
    expect(errors).toEqual({ para: "too many", contacts: "Contact 1 phone: invalid" });
    expect(unmapped).toEqual(["bad body"]);
  });
});

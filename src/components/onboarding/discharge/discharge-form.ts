// State shape, option lists and pure rules for the discharge wizard
// (`NewDischarge`). Nothing here touches React, so each rule can be read —
// and tested — on its own. The components in this folder render from it.

import { format, addDays } from "date-fns";
import type { ApiError, ApiFieldError } from "@/lib/api";
import {
  MIN_MATERNAL_AGE,
  collectErrors,
  deliveryVsDobError,
  dischargeVsDeliveryError,
  dobError,
  gravidaError,
  paraError,
  parseFormDate,
  phoneLengthMessage,
  requiredErrors,
  type FieldErrors,
} from "@/lib/onboarding-validation";
import { languageLabel } from "@/lib/languages";
import {
  RELATIONSHIP_OPTIONS,
  toEmergencyContactsPayload,
  type EmergencyContactForm,
} from "../emergency-contacts";
import { formatFormDate, type SummaryRow } from "../display";

// ── State ───────────────────────────────────────────────────────────

export type DeliveryType = "vaginal" | "caesarean" | "";
export type Outcome = "well" | "loss" | "";
export type CallingWindow = "morning" | "afternoon" | "evening" | "inbound" | "";

export interface DischargeFormData {
  motherName: string;
  phoneNumber: string;
  deliveryDate: string;
  dischargeDate: string;
  deliveryType: DeliveryType;
  outcome: Outcome;
  medications: string[];
  callingWindow: CallingWindow;
  language: string;
  dateOfBirth: string;
  edd: string;
  gravida: string;
  para: string;
  risks: string[];
  risksOther: string;
  /** Free text behind the "Other" medication chip; sent as `medications_other`. */
  medicationsOther: string;
  consentCalls: boolean;
  consentRecording: boolean;
  whatsappOptIn: boolean;
}

export const initialDischargeForm = (): DischargeFormData => ({
  motherName: "",
  phoneNumber: "",
  deliveryDate: "",
  dischargeDate: new Date().toISOString().split("T")[0],
  deliveryType: "",
  outcome: "",
  medications: [],
  callingWindow: "",
  language: "",
  dateOfBirth: "",
  edd: "",
  gravida: "",
  para: "",
  risks: [],
  risksOther: "",
  medicationsOther: "",
  consentCalls: false,
  consentRecording: false,
  whatsappOptIn: false,
});

export interface MotherSearchResult {
  id: string;
  name: string;
  /** `null` for a BSUID-only (WhatsApp username) mother with no phone on file. */
  phone: string | null;
  /** `null` when no EDD is recorded. */
  edd: string | null;
  /** Her already-recorded call consent. Forwarded on the discharge so
   *  scheduling isn't silently suppressed by the server's fail-closed gate. */
  consent_status: "active" | "pending" | "withdrawn";
}

/** What the step rules need to know beyond the form values themselves. */
export interface DischargeStepContext {
  /** An existing patient was picked on the search screen (5-step flow). */
  existing: boolean;
  /** The free-text "Other" risk chip is on (new-patient flow only). */
  riskOtherOn: boolean;
  emergencyValid: boolean;
  /** Dial code selected for her phone — sets the expected local length. */
  countryCode: string;
}

// ── Options ─────────────────────────────────────────────────────────

// Risk factors split into history (present before this pregnancy) vs. those
// that arose during/because of this pregnancy. Both groups still write to the
// single `risks` array, so the payload is unchanged.
export const PRE_EXISTING_RISKS = [
  { value: "prior_csection", label: "Previous C-section" },
  { value: "prior_loss", label: "Previous pregnancy loss" },
  { value: "sickle_cell", label: "Sickle cell disease" },
  { value: "hiv_pmtct", label: "On HIV care (PMTCT)" },
];
export const PREGNANCY_RISKS = [
  { value: "hypertension", label: "High blood pressure or pre-eclampsia" },
  { value: "diabetes", label: "Diabetes (including during pregnancy)" },
  { value: "multiple", label: "Twins or more" },
];
export const OTHER_RISK_OPTION = [{ value: "other", label: "Other" }];

export const MEDICATION_OPTIONS = [
  { value: "pain_relief", label: "Pain relief" },
  { value: "antibiotics", label: "Antibiotics" },
  { value: "iron_folic", label: "Iron & folic acid" },
  { value: "wound_care", label: "Wound care" },
  { value: "none", label: "None sent home" },
  { value: "not_sure", label: "Not sure" },
  { value: "other", label: "Other" },
];

export const CALLING_WINDOW_OPTIONS = [
  { value: "morning", label: "Morning 8am-11am" },
  { value: "afternoon", label: "Afternoon 12pm-3pm" },
  { value: "evening", label: "Evening 4pm-6pm" },
  { value: "inbound", label: "She will call in" },
];

const CALLING_WINDOW_SUMMARY: Record<string, string> = {
  morning: "Morning 8am–11am",
  afternoon: "Afternoon 12pm–3pm",
  evening: "Evening 4pm–6pm",
  inbound: "She will call in",
};

const MEDICATION_LABELS: Record<string, string> = {
  pain_relief: "Pain relief",
  antibiotics: "Antibiotics",
  iron_folic: "Iron & folic acid",
  wound_care: "Wound-care supplies",
  none: "None",
  not_sure: "Not sure",
  other: "Other",
};

export const labelForMedication = (value: string) =>
  MEDICATION_LABELS[value] || value.replace(/_/g, " ");

// Multi-selects with an answer that rules out the others. `none` and
// `not_sure` both mean "no specific medications", so they also rule out each
// other. Both are stripped before the payload goes out (see
// `buildDischargePayload`) — the API only wants real medications — but the
// clinician must not be able to state two contradictory things on screen.
export const EXCLUSIVE_CHOICES: Record<string, readonly string[]> = {
  risks: ["none"],
  medications: ["none", "not_sure"],
};

// Rules that span two inputs, so touching either input reveals the message.
// Pinned at module scope: a fresh array each render would needlessly re-create
// the reveal callbacks.
export const DATE_AND_PARITY_PAIRS = [
  ["deliveryDate", "dischargeDate"],
  ["dateOfBirth", "deliveryDate"],
  ["gravida", "para"],
] as const;

// ── Derived values ──────────────────────────────────────────────────

/** The typed "Other" medication, or empty while the chip is off. */
export const medicationOtherText = (form: DischargeFormData): string =>
  form.medications.includes("other") ? form.medicationsOther.trim() : "";

/** A toggled-on "Other" medication chip must be described. */
export const medicationOtherError = (form: DischargeFormData): string | null =>
  form.medications.includes("other") && medicationOtherText(form) === ""
    ? "Please describe the other medication"
    : null;

/** Summary line: codes as labels, with the typed text standing in for "Other". */
export const medicationsSummary = (form: DischargeFormData): string =>
  form.medications
    .map((m) => (m === "other" ? medicationOtherText(form) : labelForMedication(m)))
    .filter(Boolean)
    .join(", ");

/**
 * Earliest plausible delivery given her date of birth — mirrors the API's
 * `delivery_date >= date_of_birth + MIN_MATERNAL_AGE` rule.
 */
export const earliestDeliveryDate = (dateOfBirth: string): Date | null => {
  const dob = parseFormDate(dateOfBirth);
  return dob
    ? new Date(dob.getFullYear() + MIN_MATERNAL_AGE, dob.getMonth(), dob.getDate())
    : null;
};

/** When the first check-in call would land, as `dd/MM/yyyy`; empty until both dates are set. */
export const firstCallDateLabel = (form: DischargeFormData): string => {
  const delivery = parseFormDate(form.deliveryDate);
  const discharge = parseFormDate(form.dischargeDate);
  if (!delivery || !discharge) return "";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return delivery >= today
    ? format(addDays(discharge, 3), "dd/MM/yyyy")
    : format(addDays(new Date(), 1), "dd/MM/yyyy");
};

// ── Per-step validation ─────────────────────────────────────────────
//
// ONE source of truth. This used to be written out twice — once as
// `canContinue` to grey out the button, once again as the same chain of
// conditionals inside `handleNext` — so the two could (and did) drift, and
// neither covered the cross-field date rules at all. Rules live in
// `lib/onboarding-validation` and mirror the API's validators.

const EMERGENCY_CONTACTS_ERROR = "Add at least one complete emergency contact";

const outcomeErrors = (form: DischargeFormData): FieldErrors =>
  requiredErrors({
    outcome: { value: form.outcome, message: "Please record the birth outcome" },
  });

const medicationErrors = (form: DischargeFormData): FieldErrors => ({
  ...requiredErrors({
    medications: { value: form.medications, message: "Please answer — 'None sent home' counts" },
  }),
  ...collectErrors({ medicationsOther: medicationOtherError(form) }),
});

const existingDetailsErrors = (form: DischargeFormData): FieldErrors => ({
  ...requiredErrors({
    deliveryDate: { value: form.deliveryDate, message: "Please select the delivery date" },
    dischargeDate: { value: form.dischargeDate, message: "Please select the discharge date" },
    callingWindow: { value: form.callingWindow, message: "Please pick a calling window" },
    deliveryType: { value: form.deliveryType, message: "Please select the delivery type" },
  }),
  ...collectErrors({
    dischargeDate: dischargeVsDeliveryError(form.dischargeDate, form.deliveryDate),
  }),
});

const newDetailsErrors = (
  form: DischargeFormData,
  phoneValid: boolean,
  countryCode: string,
): FieldErrors => ({
  ...requiredErrors({
    motherName: { value: form.motherName, message: "Please enter her full name" },
    phoneNumber: { value: form.phoneNumber, message: "Please enter her phone number" },
    dateOfBirth: { value: form.dateOfBirth, message: "Please select her date of birth" },
    gravida: { value: form.gravida, message: "Please enter number of pregnancies" },
    para: { value: form.para, message: "Please enter number of births" },
    deliveryDate: { value: form.deliveryDate, message: "Please select the delivery date" },
    dischargeDate: { value: form.dischargeDate, message: "Please select the discharge date" },
    language: { value: form.language, message: "Please pick her preferred language" },
    callingWindow: { value: form.callingWindow, message: "Please pick a calling window" },
    deliveryType: { value: form.deliveryType, message: "Please select the delivery type" },
  }),
  ...collectErrors({
    phoneNumber: form.phoneNumber && !phoneValid ? phoneLengthMessage(countryCode) : null,
    dateOfBirth: dobError(form.dateOfBirth),
    gravida: gravidaError(form.gravida),
    para: paraError(form.gravida, form.para),
    deliveryDate: deliveryVsDobError(form.deliveryDate, form.dateOfBirth),
    dischargeDate: dischargeVsDeliveryError(form.dischargeDate, form.deliveryDate),
  }),
});

const existingPatientStepErrors = (
  form: DischargeFormData,
  ctx: DischargeStepContext,
  step: number,
): FieldErrors => {
  if (step === 1) return existingDetailsErrors(form);
  if (step === 2) return outcomeErrors(form);
  if (step === 3) return medicationErrors(form);
  if (step === 4) return ctx.emergencyValid ? {} : { emergencyContacts: EMERGENCY_CONTACTS_ERROR };
  return {};
};

const newPatientStepErrors = (
  form: DischargeFormData,
  ctx: DischargeStepContext,
  phoneValid: boolean,
  step: number,
): FieldErrors => {
  if (step === 1) return newDetailsErrors(form, phoneValid, ctx.countryCode);
  if (step === 2) return outcomeErrors(form);
  if (step === 3) return medicationErrors(form);
  if (step === 4)
    // Optional step, but a toggled-on "Other" must be described.
    return ctx.riskOtherOn && form.risksOther.trim() === ""
      ? { risksOther: "Please describe the other risk factor" }
      : {};
  if (step === 5)
    return collectErrors({
      consentCalls: form.consentCalls ? null : "Call consent is required to enroll her",
      whatsappOptIn: form.whatsappOptIn ? null : "WhatsApp consent is required to enroll her",
    });
  if (step === 6) return ctx.emergencyValid ? {} : { emergencyContacts: EMERGENCY_CONTACTS_ERROR };
  return {};
};

export const dischargeStepErrors = (
  form: DischargeFormData,
  ctx: DischargeStepContext,
  phoneValid: boolean,
  step: number,
): FieldErrors => {
  if (step === 0) return {};
  return ctx.existing
    ? existingPatientStepErrors(form, ctx, step)
    : newPatientStepErrors(form, ctx, phoneValid, step);
};

// ── Server field errors ─────────────────────────────────────────────

/**
 * Map a backend 422 `fields[].path` onto the wizard's own field name.
 *
 * The combined endpoint nests its body as `{mother, discharge}`, so paths
 * arrive as `mother.gravida` / `discharge.discharge_date`. Both halves are
 * collected on step 1, which is why almost everything lands there — the point
 * is that the clinician is taken back to the input rather than left staring at
 * a banner on the summary screen.
 */
const SERVER_FIELD_MAP: Record<string, { field: string; step: number }> = {
  "mother.full_name": { field: "motherName", step: 1 },
  "mother.phone": { field: "phoneNumber", step: 1 },
  "mother.date_of_birth": { field: "dateOfBirth", step: 1 },
  "mother.gravida": { field: "gravida", step: 1 },
  "mother.para": { field: "para", step: 1 },
  "mother.language": { field: "language", step: 1 },
  "mother.edd": { field: "deliveryDate", step: 1 },
  "mother.risks_other": { field: "risksOther", step: 4 },
  "mother.consent_calls": { field: "consentCalls", step: 5 },
  "mother.whatsapp_opt_in": { field: "whatsappOptIn", step: 5 },
  "discharge.delivery_date": { field: "deliveryDate", step: 1 },
  "discharge.discharge_date": { field: "dischargeDate", step: 1 },
  "discharge.delivery_type": { field: "deliveryType", step: 1 },
  "discharge.preferred_call_window": { field: "callingWindow", step: 1 },
  "discharge.outcome": { field: "outcome", step: 2 },
  "discharge.medications": { field: "medications", step: 3 },
  "discharge.medications_other": { field: "medicationsOther", step: 3 },
  "discharge.phone": { field: "phoneNumber", step: 1 },
};

export const mapServerFields = (
  fields: ApiFieldError[],
  existingPatient: boolean,
): { errors: FieldErrors; step: number | null } => {
  const errors: FieldErrors = {};
  let earliest: number | null = null;
  for (const f of fields) {
    // The existing-patient endpoint (`POST /mothers/{id}/discharge`) takes a
    // flat body, so its paths arrive unprefixed (`medications_other`). Its
    // fields are the combined endpoint's `discharge.*` half — prefix them.
    const path = existingPatient ? `discharge.${f.path}` : f.path;
    // Emergency contacts arrive indexed (`discharge.emergency_contacts.0.phone`);
    // collapse them onto the one editor that owns them.
    const key = path.startsWith("discharge.emergency_contacts")
      ? "discharge.emergency_contacts"
      : path;
    const mapped =
      key === "discharge.emergency_contacts"
        ? // Contacts are step 4 of the 5-step existing-patient wizard, 6 of 7.
          { field: "emergencyContacts", step: existingPatient ? 4 : 6 }
        : SERVER_FIELD_MAP[key];
    if (!mapped) continue;
    errors[mapped.field] = f.message;
    if (earliest === null || mapped.step < earliest) earliest = mapped.step;
  }
  return { errors, step: earliest };
};

// ── Submit ──────────────────────────────────────────────────────────

/** The request the wizard sends: one of two endpoints, chosen by patient type. */
export interface DischargeRequest {
  url: string;
  body: Record<string, unknown>;
}

export const buildDischargeRequest = (
  form: DischargeFormData,
  foundMother: MotherSearchResult | null,
  contacts: EmergencyContactForm[],
): DischargeRequest => {
  const other = medicationOtherText(form);
  const discharge: Record<string, unknown> = {
    delivery_date: form.deliveryDate,
    discharge_date: form.dischargeDate,
    delivery_type: form.deliveryType,
    medications: form.medications.filter(
      (m) => m !== "none" && m !== "not_sure" && m !== "other",
    ),
    // Only sent when filled in, so an older backend (extra="forbid")
    // still accepts every discharge that doesn't use "Other".
    ...(other ? { medications_other: [other] } : {}),
    outcome: form.outcome,
    preferred_call_window: form.callingWindow,
    emergency_contacts: toEmergencyContactsPayload(contacts),
  };

  if (foundMother) {
    // Existing patient: she already went through onboarding and consent,
    // so this flow has no consent step and must not invent one.
    //
    // It also must not stay SILENT about it. Discharge scheduling fails
    // closed on a `consent_calls` it wasn't sent, so omitting the key
    // returned a cheerful 201 with `automated_calls_enabled: false` — she
    // was discharged, listed, and permanently call-less with nothing on
    // screen saying so. Forward the consent she actually gave (carried on
    // the search result) instead of omitting it or fabricating `true`.
    discharge.already_enrolled = true;
    discharge.consent_calls = foundMother.consent_status === "active";
    if (form.phoneNumber) discharge.phone = form.phoneNumber;
    return { url: `/mothers/${foundMother.id}/discharge`, body: discharge };
  }

  // New patient: ONE atomic request. This used to be two — POST /mothers
  // then POST /mothers/{id}/discharge — and the first one committed, so
  // any failure on the second left her in the mothers list with no calls
  // ever scheduled and no way to retry (re-enrolling 409s on her own
  // phone number). The combined endpoint lands the mother, the discharge
  // and the whole call journey under a single commit.
  discharge.consent_calls = form.consentCalls;
  discharge.consent_recording = form.consentRecording;
  discharge.whatsapp_opt_in = form.whatsappOptIn;
  const risksOther = form.risksOther.trim();
  return {
    url: "/mothers/enroll-with-discharge",
    body: {
      mother: {
        full_name: form.motherName,
        phone: form.phoneNumber,
        date_of_birth: form.dateOfBirth,
        edd: form.deliveryDate,
        gravida: parseInt(form.gravida) || 0,
        para: parseInt(form.para) || 0,
        language: form.language,
        risks: form.risks.filter((r) => r !== "none"),
        risks_other: risksOther ? [risksOther] : [],
        consent_calls: form.consentCalls,
        consent_recording: form.consentRecording,
        whatsapp_opt_in: form.whatsappOptIn,
      },
      discharge,
    },
  };
};

/**
 * Why no check-in calls were queued, in the clinician's terms.
 *
 * The server returns `automated_calls_enabled: false` for several distinct
 * reasons and this is the only place a human can act on any of them, so say
 * which one it was rather than showing a generic "saved" toast.
 */
const noCallsReason = (
  form: DischargeFormData,
  foundMother: MotherSearchResult | null,
): string => {
  if (form.callingWindow === "inbound") {
    return "Discharge recorded. No calls were scheduled — she's set to call in rather than be called.";
  }
  if (foundMother && foundMother.consent_status !== "active") {
    return "Discharge recorded, but NO check-in calls were scheduled — she hasn't consented to calls. Update her consent on her profile to start them.";
  }
  if (!foundMother && !form.consentCalls) {
    return "Discharge recorded, but NO check-in calls were scheduled — call consent wasn't given.";
  }
  return "Discharge recorded, but NO check-in calls were scheduled. Please check her profile.";
};

/** The outcome line for the confirmation screen. `warning` = saved, but no check-in calls were queued. */
export interface DischargeCompletion {
  message: string;
  warning: boolean;
}

export const completionFor = (
  data: { first_call_scheduled_at?: string | null; automated_calls_enabled?: boolean } | undefined,
  form: DischargeFormData,
  foundMother: MotherSearchResult | null,
): DischargeCompletion => {
  const firstCallAt: string | null = data?.first_call_scheduled_at ?? null;
  const callsEnabled: boolean = data?.automated_calls_enabled ?? false;
  if (form.outcome === "loss") {
    return {
      message: "Discharge recorded. Bereavement support flow activated.",
      warning: false,
    };
  }
  if (callsEnabled && firstCallAt) {
    return {
      message: `Discharge recorded. First call scheduled for ${format(new Date(firstCallAt), "d MMM 'at' h:mm a")}.`,
      warning: false,
    };
  }
  // NOT a plain success. She is saved but no check-in calls were
  // queued, and the clinician is the only person who can act on that.
  return { message: noCallsReason(form, foundMother), warning: true };
};

/** How a failed submit is shown: a banner, and for a 422 the offending fields + step. */
export interface DischargeFailure {
  message: string;
  fieldErrors?: FieldErrors;
  step?: number | null;
}

export const failureFor = (
  apiError: ApiError,
  existingPatient: boolean,
): DischargeFailure => {
  if (apiError.status === 409 || apiError.error_code === "already_discharged") {
    return {
      message:
        "This mother has already been discharged. Search for her record to view or update it.",
    };
  }
  if (apiError.status === 403 || apiError.error_code === "insufficient_role") {
    return {
      message: "You don't have permission to record discharges. Contact your administrator.",
    };
  }
  if (apiError.fields?.length) {
    // Field-attributed 422: put each message on the input that caused it
    // and jump back to the earliest offending step, rather than showing
    // one opaque banner on the summary screen.
    const { errors, step } = mapServerFields(apiError.fields, existingPatient);
    return {
      message: "Some details need correcting — see the highlighted fields.",
      fieldErrors: errors,
      step,
    };
  }
  if (apiError.status === 422 || apiError.error_code === "validation_error") {
    return { message: `Some details were rejected — ${apiError.message}` };
  }
  return { message: apiError.message };
};

// ── Summary ─────────────────────────────────────────────────────────

const relationshipLabel = (c: EmergencyContactForm) => {
  if (c.relationship === "other") return c.relationshipCustom.trim();
  return (
    RELATIONSHIP_OPTIONS.find((o) => o.value === c.relationship)?.label ??
    c.relationship
  );
};

/**
 * Summary rows for the emergency contacts (one "name (relationship)" + phone
 * pair per contact). Labels number the contacts when there's more than one.
 */
const emergencySummaryRows = (contacts: EmergencyContactForm[]): SummaryRow[] =>
  contacts.flatMap((c, idx) => {
    const suffix = contacts.length > 1 ? ` ${idx + 1}` : "";
    return [
      {
        label: `Emergency contact${suffix}`,
        value: c.name.trim()
          ? `${c.name.trim()} (${relationshipLabel(c)})`
          : "None recorded",
      },
      {
        label: `Emergency phone${suffix}`,
        value: c.phone
          ? `${c.countryCode}${c.phone.replace(/\D/g, "")}`
          : "None recorded",
      },
    ];
  });

const firstCallRow = (form: DischargeFormData): SummaryRow => ({
  label: "First call",
  value:
    form.outcome === "well"
      ? form.callingWindow === "inbound"
        ? "Care line number will be sent to her"
        : firstCallDateLabel(form) || ""
      : "Bereavement support flow",
  highlight: true,
});

const risksSummary = (form: DischargeFormData): string => {
  const other = form.risksOther.trim();
  if (form.risks.length === 0 && !other) return "None recorded";
  return [
    ...form.risks.map((r) => r.replace(/_/g, " ")),
    ...(other ? [other] : []),
  ].join(", ");
};

/** The review-step rows for the 5-step existing-patient flow. */
const existingPatientSummaryRows = (
  form: DischargeFormData,
  contacts: EmergencyContactForm[],
): SummaryRow[] => [
  { label: "Full name", value: form.motherName },
  { label: "Phone", value: form.phoneNumber || "No phone on file" },
  { label: "Delivery date", value: formatFormDate(form.deliveryDate) },
  { label: "Discharge date", value: formatFormDate(form.dischargeDate) },
  {
    label: "Delivery type",
    value: form.deliveryType === "vaginal" ? "Vaginal delivery" : "C-section",
  },
  {
    label: "Outcome",
    value: form.outcome === "well" ? "Mother and baby well" : "Pregnancy loss",
  },
  { label: "Medications", value: medicationsSummary(form) || "None recorded" },
  { label: "Calling window", value: CALLING_WINDOW_SUMMARY[form.callingWindow] || "" },
  firstCallRow(form),
  ...emergencySummaryRows(contacts),
];

/** The review-step rows for the 7-step new-patient flow. */
const newPatientSummaryRows = (
  form: DischargeFormData,
  contacts: EmergencyContactForm[],
): SummaryRow[] => [
  { label: "Full name", value: form.motherName },
  { label: "Phone", value: form.phoneNumber },
  { label: "Date of birth", value: formatFormDate(form.dateOfBirth) },
  { label: "Gravida / Para", value: `G${form.gravida} P${form.para}` },
  { label: "Delivery date", value: formatFormDate(form.deliveryDate) },
  { label: "Discharge date", value: formatFormDate(form.dischargeDate) },
  {
    label: "Delivery type",
    value: form.deliveryType === "vaginal" ? "Vaginal delivery" : "C-section",
  },
  {
    label: "Outcome",
    value: form.outcome === "well" ? "Mother and baby well" : "Pregnancy loss",
  },
  { label: "Medications", value: medicationsSummary(form) || "None recorded" },
  { label: "Language", value: languageLabel(form.language) },
  { label: "Clinical risks", value: risksSummary(form) },
  {
    label: "Consent",
    value: form.consentCalls ? "Consented to calls" : "No consent",
    highlight: form.consentCalls,
  },
  {
    label: "WhatsApp messages",
    value: form.whatsappOptIn ? "Consented" : "No consent",
  },
  {
    label: "Call recording",
    value: form.consentRecording ? "Consented" : "No consent",
  },
  firstCallRow(form),
  ...emergencySummaryRows(contacts),
];

export const dischargeSummaryRows = (
  form: DischargeFormData,
  existing: boolean,
  contacts: EmergencyContactForm[],
): SummaryRow[] =>
  existing
    ? existingPatientSummaryRows(form, contacts)
    : newPatientSummaryRows(form, contacts);

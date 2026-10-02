// State shape, option lists and pure rules for the antenatal enrolment wizard
// (`AddMother`). Nothing here touches React, so each rule can be read — and
// tested — on its own.

import {
  collectErrors,
  dobError,
  gravidaError,
  paraError,
  phoneLengthMessage,
  requiredErrors,
  type FieldErrors,
} from "@/lib/onboarding-validation";
import { languageLabel } from "@/lib/languages";
import { formatFormDate, type SummaryRow } from "../display";

export interface AddMotherFormData {
  fullName: string;
  phone: string;
  dob: string;
  edd: string;
  gravida: string;
  para: string;
  language: string[];
  risks: string[];
  /** Free text behind the "Other" risk chip; sent as `risks_other`. */
  risksOther: string;
  consentCalls: boolean;
  consentRecording: boolean;
  whatsappOptIn: boolean;
}

export const initialAddMotherForm = (): AddMotherFormData => ({
  fullName: "",
  phone: "",
  dob: "",
  edd: "",
  gravida: "",
  para: "",
  language: [],
  risks: [],
  risksOther: "",
  consentCalls: false,
  consentRecording: false,
  whatsappOptIn: false,
});

export const ADD_MOTHER_TOTAL_STEPS = 4;

export const ADD_MOTHER_STEP_LABELS = [
  "Her details",
  "Clinical background",
  "Consent",
  "Summary",
];

export const RISK_OPTIONS = [
  { value: "prior_csection", label: "Previous C-section" },
  { value: "hypertension", label: "High blood pressure or pre-eclampsia" },
  { value: "diabetes", label: "Diabetes (including during pregnancy)" },
  { value: "multiple", label: "Twins or more" },
  { value: "sickle_cell", label: "Sickle cell disease" },
  { value: "prior_loss", label: "Previous pregnancy loss" },
  { value: "hiv_pmtct", label: "On HIV care (PMTCT)" },
  { value: "other", label: "Other" },
];

// Labels come from the one canonical list every language selector uses.
export const getLanguageLabel = (val: string) => languageLabel(val);

const RISK_LABELS: Record<string, string> = {
  prior_csection: "Previous C-section",
  hypertension: "High blood pressure or pre-eclampsia",
  diabetes: "Diabetes",
  multiple: "Twins or more",
  sickle_cell: "Sickle cell disease",
  prior_loss: "Previous pregnancy loss",
  hiv_pmtct: "On HIV care (PMTCT)",
  other: "Other",
};

export const getRiskLabel = (val: string) => RISK_LABELS[val] || val;

// Births can't exceed pregnancies — a rule about the pair, so touching either
// one reveals it. See `revealTogether`.
export const PARITY_PAIR = [["gravida", "para"]] as const;

const STEP_1_REQUIRED = [
  { key: "fullName", label: "full name" },
  { key: "phone", label: "phone number" },
  { key: "dob", label: "date of birth" },
  { key: "edd", label: "expected delivery date" },
  { key: "gravida", label: "gravida" },
  { key: "para", label: "para" },
  { key: "language", label: "preferred language" },
] as const;

/** True once the "Other" risk chip is on. */
export const riskOtherOn = (form: AddMotherFormData): boolean =>
  form.risks.includes("other");

/** The typed "Other" risk, or empty while the chip is off. */
export const riskOtherText = (form: AddMotherFormData): string =>
  riskOtherOn(form) ? form.risksOther.trim() : "";

/** Summary line: codes as labels, with the typed text standing in for "Other". */
export const risksSummary = (form: AddMotherFormData): string =>
  form.risks
    .map((r) => (r === "other" ? riskOtherText(form) : getRiskLabel(r)))
    .filter(Boolean)
    .join(", ");

const step1Errors = (
  form: AddMotherFormData,
  phoneValid: boolean,
  countryCode: string,
): FieldErrors => ({
  ...requiredErrors(
    Object.fromEntries(
      STEP_1_REQUIRED.map((f) => [
        f.key,
        { value: form[f.key], message: `Please enter her ${f.label}` },
      ]),
    ),
  ),
  ...collectErrors({
    phone: form.phone && !phoneValid ? phoneLengthMessage(countryCode) : null,
    dob: dobError(form.dob),
    gravida: gravidaError(form.gravida),
    para: paraError(form.gravida, form.para),
  }),
});

/**
 * Per-step errors, from the same rules the discharge wizard and the API use
 * (`lib/onboarding-validation`). One source, so the Continue button and the
 * field messages can never disagree.
 */
export const addMotherStepErrors = (
  form: AddMotherFormData,
  phoneValid: boolean,
  countryCode: string,
  step: number,
): FieldErrors => {
  if (step === 1) return step1Errors(form, phoneValid, countryCode);
  if (step === 2)
    return collectErrors({
      risksOther:
        riskOtherOn(form) && riskOtherText(form) === ""
          ? "Please describe the other risk factor"
          : null,
    });
  if (step === 3)
    return collectErrors({
      consentCalls: form.consentCalls ? null : "Call consent is required to enroll her",
      whatsappOptIn: form.whatsappOptIn ? null : "WhatsApp consent is required to enroll her",
    });
  return {};
};

/**
 * The phone field shows its own two messages rather than the step rule's
 * text: one for "nothing entered", one for "not a usable number".
 */
export const phoneDisplayError = (
  shown: boolean,
  phone: string,
  phoneValid: boolean,
): string | undefined => {
  if (!shown) return undefined;
  if (!phone) return "Please enter a phone number";
  if (!phoneValid) return "Please enter a valid phone number";
  return undefined;
};

/** The `POST /mothers` body. */
export const buildAddMotherPayload = (form: AddMotherFormData) => {
  const other = riskOtherText(form);
  return {
    full_name: form.fullName,
    phone: form.phone,
    date_of_birth: form.dob,
    edd: form.edd,
    language: form.language[0] || "",
    gravida: Number(form.gravida) || 0,
    para: Number(form.para) || 0,
    risks: form.risks.filter((r) => r !== "other"),
    ...(other ? { risks_other: [other] } : {}),
    consent_calls: form.consentCalls,
    consent_recording: form.consentRecording,
    whatsapp_opt_in: form.whatsappOptIn,
  };
};

/** Rows for the review step. */
export const addMotherSummaryRows = (form: AddMotherFormData): SummaryRow[] => [
  { label: "Full name", value: form.fullName },
  { label: "Phone number", value: form.phone },
  { label: "Date of birth", value: formatFormDate(form.dob) },
  { label: "Expected delivery", value: formatFormDate(form.edd) },
  { label: "Gravida / Para", value: `G${form.gravida} P${form.para}` },
  { label: "Language", value: getLanguageLabel(form.language[0] || "") },
  { label: "Clinical risks", value: risksSummary(form) || "None recorded" },
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
];

// State and handlers for the discharge wizard. Split into small hooks — form
// values, screen navigation, submit — composed by `useDischargeWizard`, which
// is what the step screens render from. The rules live in `discharge-form.ts`.

import { useState } from "react";
import { api, extractApiError } from "@/lib/api";
import {
  applyExclusiveChoice,
  localDigitsOf,
  phoneLocalDigitsValid,
  type ErrorReveal,
  type FieldErrors,
} from "@/lib/onboarding-validation";
import { useErrorReveal } from "@/lib/use-error-reveal";
import {
  emergencyContactsValid,
  emptyEmergencyContact,
  type EmergencyContactForm,
} from "../emergency-contacts";
import {
  DATE_AND_PARITY_PAIRS,
  EXCLUSIVE_CHOICES,
  buildDischargeRequest,
  completionFor,
  dischargeStepErrors,
  failureFor,
  initialDischargeForm,
  type DischargeCompletion,
  type DischargeFormData,
  type MotherSearchResult,
} from "./discharge-form";

export type UpdateDischargeField = <K extends keyof DischargeFormData>(
  field: K,
  value: DischargeFormData[K],
) => void;

type Direction = "forward" | "back";

// ── Form values ─────────────────────────────────────────────────────

const useDischargeFields = (reveal: ErrorReveal) => {
  const [form, setForm] = useState<DischargeFormData>(initialDischargeForm);
  // Field-level errors surfaced by the SERVER on submit, keyed by the same
  // form-field names. Merged into the display so a 422 lands on its input.
  const [serverErrors, setServerErrors] = useState<FieldErrors>({});
  // Whether the free-text "Other" risk chip is toggled on (the typed value
  // lives in form.risksOther and is sent as `risks_other`, NOT in `risks`).
  const [riskOtherOn, setRiskOtherOn] = useState(false);
  const [countryCode, setCountryCode] = useState("+233");
  // 1–3 emergency contacts (index 0 = primary). Each carries its own country
  // code since each phone is independent. Resets on unmount (drawer close).
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContactForm[]>(
    [emptyEmergencyContact()],
  );

  const updateField: UpdateDischargeField = (field, value) => {
    // She has now had a say on this field, so its rule may speak.
    reveal.touch(field);
    // A server-side rejection is only true of the value that was submitted.
    // Once she edits the field, drop it and let the local rules take over —
    // otherwise a stale 422 message sits under a field she has already fixed.
    setServerErrors((prev) => {
      if (!(field in prev)) return prev;
      const rest = { ...prev };
      delete rest[field];
      return rest;
    });
    // Answers that speak for the whole list can't sit alongside its items —
    // "Not sure" plus Antibiotics is not an answer. One rule, both chip groups.
    const exclusive = EXCLUSIVE_CHOICES[field];
    if (exclusive) {
      const resolved = applyExclusiveChoice(value as string[], form[field] as string[], exclusive);
      setForm((prev) => ({ ...prev, [field]: resolved }));
      return;
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  /** Contacts change like any other field, so they reveal like one too. */
  const updateEmergencyContacts = (contacts: EmergencyContactForm[]) => {
    reveal.touch("emergencyContacts");
    setEmergencyContacts(contacts);
  };

  return {
    form,
    setForm,
    updateField,
    serverErrors,
    setServerErrors,
    riskOtherOn,
    setRiskOtherOn,
    countryCode,
    setCountryCode,
    emergencyContacts,
    updateEmergencyContacts,
  };
};

// ── Screens ─────────────────────────────────────────────────────────

const useDischargeNav = () => {
  const [searchPhase, setSearchPhase] = useState(true);
  const [foundMother, setFoundMother] = useState<MotherSearchResult | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  // Slide direction for the step transition: forward slides in from the right,
  // back from the left.
  const [direction, setDirection] = useState<Direction>("forward");
  const [discardOpen, setDiscardOpen] = useState(false);

  /** Leave the search screen for step 1, with or without a found record. */
  const enterForm = (mother: MotherSearchResult | null) => {
    setDirection("forward");
    setFoundMother(mother);
    setSearchPhase(false);
    setCurrentStep(1);
  };

  const stepForward = () => {
    setDirection("forward");
    setCurrentStep((prev) => prev + 1);
  };

  /** Back off step 1 returns to the search screen. */
  const stepBack = () => {
    setDirection("back");
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      setFoundMother(null);
      setSearchPhase(true);
    }
  };

  /** A failed submit sends her back to the earliest offending step. */
  const jumpBackTo = (step: number) => {
    setDirection("back");
    setCurrentStep(step);
  };

  return {
    searchPhase,
    foundMother,
    currentStep,
    direction,
    discardOpen,
    setDiscardOpen,
    enterForm,
    stepForward,
    stepBack,
    jumpBackTo,
  };
};

// ── Submit ──────────────────────────────────────────────────────────

interface SubmitDeps {
  form: DischargeFormData;
  foundMother: MotherSearchResult | null;
  emergencyContacts: EmergencyContactForm[];
  currentStep: number;
  reveal: ErrorReveal;
  setServerErrors: (errors: FieldErrors) => void;
  jumpBackTo: (step: number) => void;
}

const useDischargeSubmit = (deps: SubmitDeps) => {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  // Set once the discharge is saved: the outcome line for the confirmation
  // screen. `warning` = saved, but no check-in calls were queued.
  const [completed, setCompleted] = useState<DischargeCompletion | null>(null);

  const submit = async () => {
    const { form, foundMother, emergencyContacts } = deps;
    setSubmitting(true);
    setSubmitError("");
    try {
      const { url, body } = buildDischargeRequest(form, foundMother, emergencyContacts);
      const res = await api.post(url, body);
      // Stay open on a confirmation screen rather than closing, so the
      // clinician can give her the hospital's number before she leaves.
      setCompleted(completionFor(res.data, form, foundMother));
    } catch (err: unknown) {
      const failure = failureFor(
        extractApiError(err, "Could not save discharge. Please try again."),
        foundMother !== null,
      );
      if (failure.fieldErrors) {
        deps.setServerErrors(failure.fieldErrors);
        deps.reveal.revealAll();
      }
      if (failure.step != null && failure.step !== deps.currentStep) {
        deps.jumpBackTo(failure.step);
      }
      setSubmitError(failure.message);
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, submitError, completed, submit };
};

// ── The wizard ──────────────────────────────────────────────────────

export const useDischargeWizard = () => {
  // Which fields have earned an error message yet. Per field, not one flag —
  // see `useErrorReveal`.
  const reveal = useErrorReveal(DATE_AND_PARITY_PAIRS);
  const fields = useDischargeFields(reveal);
  const nav = useDischargeNav();
  const { form, serverErrors } = fields;
  const { foundMother, currentStep } = nav;

  const totalSteps = foundMother ? 5 : 7;

  // Country-code-aware: strip the dial code + any separators, require that
  // country's local length (`PHONE_PLANS`). Shared with AddMother and the
  // emergency-contacts editor — this rule used to be written out four times.
  const phoneValid = phoneLocalDigitsValid(
    localDigitsOf(form.phoneNumber, fields.countryCode),
    fields.countryCode,
  );

  // Errors for the step on screen. Each is rendered once the clinician has
  // touched that field, or once a failed Continue reveals the whole step.
  const currentErrors = dischargeStepErrors(
    form,
    {
      existing: foundMother !== null,
      riskOtherOn: fields.riskOtherOn,
      emergencyValid: emergencyContactsValid(fields.emergencyContacts),
      countryCode: fields.countryCode,
    },
    phoneValid,
    currentStep,
  );
  const canContinue = Object.keys(currentErrors).length === 0;

  /** The message to show under `field`, if any. */
  const showError = (field: string): string | undefined =>
    serverErrors[field] ?? (reveal.shows(field) ? currentErrors[field] : undefined);

  const submission = useDischargeSubmit({
    form,
    foundMother,
    emergencyContacts: fields.emergencyContacts,
    currentStep,
    reveal,
    setServerErrors: fields.setServerErrors,
    jumpBackTo: nav.jumpBackTo,
  });

  // "Progress" worth warning about = an existing mother has been selected, or
  // the user has moved past the search screen into the actual form.
  // Once saved (`completed`) there is nothing left to lose.
  const isDirty =
    !submission.completed && (foundMother !== null || (!nav.searchPhase && currentStep >= 1));

  const handleNext = async () => {
    reveal.revealAll();
    // Same function that greys out the button — no second copy to drift.
    if (!canContinue) return;

    reveal.reset();
    if (currentStep < totalSteps) {
      nav.stepForward();
      return;
    }
    await submission.submit();
  };

  const handleBack = () => {
    reveal.reset();
    nav.stepBack();
  };

  /** Pick an existing record off the search screen and start her discharge. */
  const selectMother = (result: MotherSearchResult) => {
    fields.setForm((prev) => ({
      ...prev,
      motherName: result.name,
      // A BSUID-only mother has no phone on file; keep the field a string.
      phoneNumber: result.phone ?? "",
    }));
    nav.enterForm(result);
  };

  return {
    ...fields,
    ...nav,
    ...submission,
    reveal,
    totalSteps,
    phoneValid,
    canContinue,
    showError,
    isDirty,
    handleNext,
    handleBack,
    selectMother,
  };
};

export type DischargeWizard = ReturnType<typeof useDischargeWizard>;

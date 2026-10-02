// State and handlers for the antenatal enrolment wizard. The step screens
// render from the object this returns; the rules live in `add-mother-form.ts`.

import { useState } from "react";
import { api, extractApiError } from "@/lib/api";
import { localDigitsOf, phoneLocalDigitsValid } from "@/lib/onboarding-validation";
import { useErrorReveal } from "@/lib/use-error-reveal";
import {
  ADD_MOTHER_TOTAL_STEPS,
  PARITY_PAIR,
  addMotherStepErrors,
  buildAddMotherPayload,
  initialAddMotherForm,
  type AddMotherFormData,
} from "./add-mother-form";

export type UpdateAddMotherField = <K extends keyof AddMotherFormData>(
  field: K,
  value: AddMotherFormData[K],
) => void;

export const useAddMotherForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  // Set once the enrollment is saved — swaps the wizard for the
  // confirmation screen.
  const [completed, setCompleted] = useState(false);
  // Which fields have earned an error message yet — see `useErrorReveal`.
  const reveal = useErrorReveal(PARITY_PAIR);
  const [countryCode, setCountryCode] = useState("+233");
  const [form, setForm] = useState<AddMotherFormData>(initialAddMotherForm);

  const phoneValid = phoneLocalDigitsValid(localDigitsOf(form.phone, countryCode), countryCode);
  const currentErrors = addMotherStepErrors(form, phoneValid, countryCode, currentStep);
  const canContinue = Object.keys(currentErrors).length === 0;

  const submit = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      await api.post("/mothers", buildAddMotherPayload(form));
      // Stay open on a confirmation screen so the clinician can give her
      // the hospital's number before she leaves.
      setCompleted(true);
    } catch (err: unknown) {
      const { message } = extractApiError(
        err,
        "Enrollment failed. Please check the form and try again.",
      );
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    reveal.revealAll();
    // Same check that greys out the button — no second copy to drift.
    if (!canContinue) return;

    // Advance to next step if not at the final summary step
    if (currentStep < ADD_MOTHER_TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
      reveal.reset();
      return;
    }

    // At the review step, submit the form
    await submit();
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      reveal.reset();
    }
  };

  const updateField: UpdateAddMotherField = (field, value) => {
    // She has now had a say on this field, so its rule may speak.
    reveal.touch(field);
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  /** The message to show under `key`, if any. */
  const showError = (key: string): string | undefined =>
    reveal.shows(key) ? currentErrors[key] : undefined;

  return {
    form,
    updateField,
    showError,
    currentStep,
    submitting,
    submitError,
    completed,
    canContinue,
    countryCode,
    setCountryCode,
    phoneValid,
    handleNext,
    handleBack,
  };
};

export type AddMotherWizard = ReturnType<typeof useAddMotherForm>;

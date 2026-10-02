import { OnboardingStep, SubmitErrorAlert, SummaryList } from "../fields";
import { addMotherSummaryRows } from "./add-mother-form";
import type { AddMotherWizard } from "./useAddMotherForm";

/** Step 4 — review everything before enrolling her. */
export const MotherSummaryStep = ({ wizard }: { wizard: AddMotherWizard }) => (
  <OnboardingStep
    step={4}
    title="Review details"
    description="Double check her information before enrolling her in the program."
  >
    <SubmitErrorAlert message={wizard.submitError} />
    <SummaryList rows={addMotherSummaryRows(wizard.form)} />
    <p className="text-xs text-gray-400 font-normal mt-6">
      By tapping 'Enroll her', you confirm that you have explained this
      program to the mother and she has agreed to participate.
    </p>
  </OnboardingStep>
);

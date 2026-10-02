import { OnboardingStep, SubmitErrorAlert, SummaryList } from "../fields";
import { dischargeSummaryRows } from "./discharge-form";
import type { DischargeWizard } from "./useDischargeWizard";

/** The last step of either flow — review everything before confirming. */
export const DischargeSummaryStep = ({ wizard }: { wizard: DischargeWizard }) => (
  <OnboardingStep
    step={wizard.currentStep}
    title="Summary"
    description="Review all details before confirming discharge."
  >
    <SubmitErrorAlert message={wizard.submitError} />
    <SummaryList
      rows={dischargeSummaryRows(wizard.form, wizard.foundMother !== null, wizard.emergencyContacts)}
    />
  </OnboardingStep>
);

import { EmergencyContacts } from "../EmergencyContacts";
import { OnboardingStep } from "../fields";
import type { DischargeWizard } from "./useDischargeWizard";

/** Emergency contacts — step 4 of the existing-patient flow, 6 of the new one. */
export const ContactsStep = ({ wizard }: { wizard: DischargeWizard }) => (
  <OnboardingStep
    step={wizard.currentStep}
    title="Emergency contacts"
    description="Who should we call if we cannot reach her? Add up to 3."
  >
    <EmergencyContacts
      contacts={wizard.emergencyContacts}
      onChange={wizard.updateEmergencyContacts}
      touched={wizard.reveal.shows("emergencyContacts")}
    />
  </OnboardingStep>
);

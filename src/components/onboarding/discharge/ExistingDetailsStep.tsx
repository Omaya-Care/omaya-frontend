import { OnboardingStep } from "../fields";
import {
  CallingWindowPicker,
  DeliveryDatesFields,
  DeliveryTypePicker,
} from "./discharge-fields";
import type { DischargeWizard } from "./useDischargeWizard";

/** Step 1 of the existing-patient flow — her record is known, just the discharge. */
export const ExistingDetailsStep = ({ wizard }: { wizard: DischargeWizard }) => {
  const { foundMother } = wizard;
  return (
    <OnboardingStep
      step={1}
      title="Discharge details"
      description="Dates, delivery type, and preferred contact window."
    >
      <div className="flex flex-col gap-5">
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-1">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-medium">Full name</span>
            <span className="text-sm font-semibold text-gray-900">{foundMother?.name}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-medium">Phone</span>
            <span className="text-sm font-semibold text-gray-900">{foundMother?.phone}</span>
          </div>
        </div>

        <DeliveryDatesFields wizard={wizard} />
        <DeliveryTypePicker wizard={wizard} />
        <CallingWindowPicker wizard={wizard} />
      </div>
    </OnboardingStep>
  );
};

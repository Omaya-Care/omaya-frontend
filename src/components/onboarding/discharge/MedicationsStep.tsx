import { ChipSelect } from "../ChipSelect";
import { FieldError, OnboardingStep, TextField } from "../fields";
import { MEDICATION_OPTIONS } from "./discharge-form";
import type { DischargeWizard } from "./useDischargeWizard";

/** Step 3 (both flows) — what was she discharged with? */
export const MedicationsStep = ({ wizard }: { wizard: DischargeWizard }) => {
  const { form, updateField, showError } = wizard;
  return (
    <OnboardingStep step={3} title="Medications" description="What was she discharged with?">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-700 mb-3 block">
            Medications sent home
          </span>
          <ChipSelect
            options={MEDICATION_OPTIONS}
            selected={form.medications}
            onChange={(val) => updateField("medications", val)}
          />
          <FieldError error={showError("medications")} className="mt-2" />
          {/* Other — free-text medication, sent separately as `medications_other` */}
          {form.medications.includes("other") && (
            <TextField
              containerClassName="mt-3"
              placeholder="Describe the medication"
              value={form.medicationsOther}
              maxLength={80}
              onChange={(e) => updateField("medicationsOther", e.target.value)}
              error={showError("medicationsOther")}
            />
          )}
        </div>
      </div>
    </OnboardingStep>
  );
};

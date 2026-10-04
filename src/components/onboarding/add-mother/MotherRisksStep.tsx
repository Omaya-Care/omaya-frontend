import { Info } from "lucide-react";
import { ChipSelect } from "../ChipSelect";
import { OnboardingStep, SubmitErrorAlert, TextField } from "../fields";
import { RISK_OPTIONS, riskOtherOn } from "./add-mother-form";
import type { AddMotherWizard } from "./useAddMotherForm";

/** Step 2 — clinical risk factors, with a free-text "Other". */
export const MotherRisksStep = ({ wizard }: { wizard: AddMotherWizard }) => {
  const { form, updateField, showError } = wizard;

  return (
    <OnboardingStep
      step={2}
      title="Clinical background"
      description="Select anything that applies. This helps Omaya ask the right questions and know when to escalate faster. Leave blank if nothing applies."
    >
      <SubmitErrorAlert message={wizard.submitError} />
      <h4 className="text-xs font-semibold text-gray-400 tracking-wide uppercase mb-4">
        SELECT ALL THAT APPLY
      </h4>
      <ChipSelect
        options={RISK_OPTIONS}
        selected={form.risks}
        onChange={(val) => updateField("risks", val)}
      />
      {/* Other — free-text risk, sent separately as `risks_other` */}
      {riskOtherOn(form) && (
        <TextField
          containerClassName="mt-3"
          placeholder="Describe the risk factor"
          value={form.risksOther}
          maxLength={80}
          onChange={(e) => updateField("risksOther", e.target.value)}
          error={showError("risksOther")}
        />
      )}
      <div className="bg-blue-50 rounded-xl px-4 py-3 flex items-start gap-3 mt-6">
        <Info size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-gray-500 font-normal leading-relaxed">
          These flags are stored securely and only visible to her assigned
          midwife and hospital admin. They are never shared or used for
          anything outside her care.
        </p>
      </div>
    </OnboardingStep>
  );
};

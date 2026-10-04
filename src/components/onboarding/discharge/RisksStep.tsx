import { ChipSelect } from "../ChipSelect";
import { OnboardingStep, TextField } from "../fields";
import {
  OTHER_RISK_OPTION,
  PREGNANCY_RISKS,
  PRE_EXISTING_RISKS,
} from "./discharge-form";
import type { DischargeWizard } from "./useDischargeWizard";

interface RiskGroupProps {
  heading: string;
  options: { value: string; label: string }[];
  wizard: DischargeWizard;
}

/**
 * One chip group over a slice of `form.risks`. Each group only shows its own
 * values and, on change, swaps just those out — so both groups keep writing
 * to the single `risks` array and the payload is unchanged.
 */
const RiskGroup = ({ heading, options, wizard }: RiskGroupProps) => {
  const { form, updateField } = wizard;
  const values = new Set(options.map((o) => o.value));
  return (
    <div className="flex flex-col">
      <h4 className="text-xs font-semibold text-gray-400 tracking-wide uppercase mb-3">
        {heading}
      </h4>
      <ChipSelect
        options={options}
        selected={form.risks.filter((r) => values.has(r))}
        onChange={(val) =>
          updateField("risks", [...form.risks.filter((r) => !values.has(r)), ...val])
        }
      />
    </div>
  );
};

/** Step 4 of the new-patient flow — clinical risk factors (optional). */
export const RisksStep = ({ wizard }: { wizard: DischargeWizard }) => {
  const { form, updateField, showError, riskOtherOn, setRiskOtherOn } = wizard;
  return (
    <OnboardingStep
      step={4}
      title="Clinical background"
      description="Tap any that apply — this helps Omaya escalate sooner."
    >
      <div className="flex flex-col gap-6 mt-2">
        {/* Pre-existing — present before this pregnancy */}
        <RiskGroup heading="Before this pregnancy" options={PRE_EXISTING_RISKS} wizard={wizard} />

        {/* Pregnancy-related — arose during/because of this pregnancy */}
        <RiskGroup heading="From this pregnancy" options={PREGNANCY_RISKS} wizard={wizard} />

        {/* Other — free-text risk, sent separately as `risks_other` */}
        <div className="flex flex-col">
          <h4 className="text-xs font-semibold text-gray-400 tracking-wide uppercase mb-3">
            Something else
          </h4>
          <ChipSelect
            options={OTHER_RISK_OPTION}
            selected={riskOtherOn ? ["other"] : []}
            onChange={(val) => {
              const on = val.includes("other");
              setRiskOtherOn(on);
              if (!on) updateField("risksOther", "");
            }}
          />
          {riskOtherOn && (
            <TextField
              containerClassName="mt-3"
              placeholder="Describe the risk factor"
              value={form.risksOther}
              maxLength={80}
              onChange={(e) => updateField("risksOther", e.target.value)}
              error={showError("risksOther")}
            />
          )}
        </div>
      </div>
    </OnboardingStep>
  );
};

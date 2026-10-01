import { CheckCircle2, Heart } from "lucide-react";
import { FieldError, OnboardingStep } from "../fields";
import type { Outcome } from "./discharge-form";
import type { DischargeWizard } from "./useDischargeWizard";

const OUTCOMES = [
  {
    id: "well",
    icon: CheckCircle2,
    title: "Mother and baby are well",
    description: "Both mother and newborn are stable and healthy",
  },
  {
    id: "loss",
    icon: Heart,
    title: "The baby passed away",
    description:
      "Omaya switches to gentle bereavement support instead of routine check-in calls",
  },
] as const;

/** Step 2 (both flows) — how did mother and baby do? */
export const OutcomeStep = ({ wizard }: { wizard: DischargeWizard }) => {
  const { form, updateField } = wizard;
  const error = wizard.showError("outcome");
  return (
    <OnboardingStep step={2} title="Birth outcome" description="How did mother and baby do?">
      <div className="flex flex-col gap-3">
        {OUTCOMES.map((outcome) => (
          <button
            type="button"
            key={outcome.id}
            onClick={() => updateField("outcome", outcome.id as Outcome)}
            className={`text-left border rounded-xl px-5 py-4 cursor-pointer transition-colors flex items-center gap-4 ${form.outcome === outcome.id ? "border-primary bg-primary-100" : "border-gray-200 hover:border-primary/40"} ${error ? "border-red-400" : ""}`}
          >
            <outcome.icon
              size={24}
              className={`shrink-0 ${form.outcome === outcome.id ? "text-primary" : "text-gray-400"}`}
            />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">{outcome.title}</span>
              <span className="text-xs text-gray-500 mt-0.5">{outcome.description}</span>
            </div>
          </button>
        ))}
        <FieldError error={error} />
      </div>
    </OnboardingStep>
  );
};

// Field groups that appear on more than one discharge step (the two "details"
// screens differ by patient type but share these blocks).

import { Baby, Scissors } from "lucide-react";
import { ChipSelect } from "../ChipSelect";
import { DateField, FieldError } from "../fields";
import { parseFormDate } from "@/lib/onboarding-validation";
import {
  CALLING_WINDOW_OPTIONS,
  earliestDeliveryDate,
  type CallingWindow,
  type DeliveryType,
} from "./discharge-form";
import type { DischargeWizard } from "./useDischargeWizard";

interface WizardProps {
  wizard: DischargeWizard;
}

/** Delivery + discharge dates side by side, each greying out impossible days. */
export const DeliveryDatesFields = ({ wizard }: WizardProps) => {
  const { form, updateField, showError } = wizard;
  const earliest = earliestDeliveryDate(form.dateOfBirth);
  const delivery = parseFormDate(form.deliveryDate);
  return (
    <div className="grid grid-cols-2 gap-4">
      <DateField
        label="Delivery date"
        value={form.deliveryDate}
        onChange={(val) => updateField("deliveryDate", val)}
        error={showError("deliveryDate")}
        // She cannot have delivered before her own plausible
        // childbearing age.
        calendar={{ disabled: earliest ? { before: earliest } : undefined }}
      />
      <DateField
        label="Discharge date"
        value={form.dischargeDate}
        onChange={(val) => updateField("dischargeDate", val)}
        error={showError("dischargeDate")}
        // Discharge before delivery is invalid — grey those days
        // out so the error state is mostly unreachable by mouse.
        // The typed/loaded case is still caught by stepErrors.
        calendar={{ disabled: delivery ? { before: delivery } : undefined }}
      />
    </div>
  );
};

const DELIVERY_TYPES = [
  { id: "vaginal", icon: Baby, title: "Vaginal delivery" },
  { id: "caesarean", icon: Scissors, title: "C-section" },
] as const;

/** Vaginal / C-section as two large cards. */
export const DeliveryTypePicker = ({ wizard }: WizardProps) => {
  const { form, updateField } = wizard;
  const error = wizard.showError("deliveryType");
  return (
    <div className="flex flex-col">
      <span className="text-sm font-semibold text-gray-700 mb-3 block">
        Delivery type
      </span>
      <div className={`grid grid-cols-2 gap-4 ${error ? "[&>button]:border-red-400" : ""}`}>
        {DELIVERY_TYPES.map((type) => (
          <button
            type="button"
            key={type.id}
            onClick={() => updateField("deliveryType", type.id as DeliveryType)}
            className={`border rounded-xl px-5 py-4 cursor-pointer transition-colors flex flex-col items-center text-center gap-2 ${form.deliveryType === type.id ? "border-primary bg-primary-100" : "border-gray-200 hover:border-primary/40"}`}
          >
            <type.icon
              size={24}
              className={form.deliveryType === type.id ? "text-primary" : "text-gray-400"}
            />
            <span className="text-sm font-semibold text-gray-900">{type.title}</span>
          </button>
        ))}
      </div>
      <FieldError error={error} className="mt-2" />
    </div>
  );
};

/** Morning / afternoon / evening / she-will-call-in. */
export const CallingWindowPicker = ({ wizard }: WizardProps) => {
  const { form, updateField, showError } = wizard;
  return (
    <div className="flex flex-col">
      <span className="text-sm font-semibold text-gray-700 mb-3 block">
        Preferred calling window
      </span>
      <ChipSelect
        max={1}
        options={CALLING_WINDOW_OPTIONS}
        selected={form.callingWindow ? [form.callingWindow] : []}
        onChange={(val) =>
          updateField("callingWindow", val.length > 0 ? (val[0] as CallingWindow) : "")
        }
      />
      {form.callingWindow === "inbound" && (
        <span className="text-xs text-primary font-medium mt-2">
          We will share the care line number with her on the welcome SMS
        </span>
      )}
      <FieldError error={showError("callingWindow")} className="mt-1" />
    </div>
  );
};

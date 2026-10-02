import { ChipSelect } from "../ChipSelect";
import {
  DateField,
  FieldError,
  OnboardingStep,
  PhoneField,
  TextField,
} from "../fields";
import { normaliseLocalDigits, startOfToday } from "@/lib/onboarding-validation";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
import {
  CallingWindowPicker,
  DeliveryDatesFields,
  DeliveryTypePicker,
} from "./discharge-fields";
import type { DischargeWizard } from "./useDischargeWizard";

/** Step 1 of the new-patient flow — identity, dates, parity, language, window. */
export const NewDetailsStep = ({ wizard }: { wizard: DischargeWizard }) => {
  const { form, updateField, showError, countryCode, setCountryCode } = wizard;

  return (
    <OnboardingStep
      step={1}
      title="Discharge details"
      description="Her details, dates, and how to reach her after discharge."
    >
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Full name"
            placeholder="e.g. Ama Mensah"
            value={form.motherName}
            onChange={(e) => updateField("motherName", e.target.value)}
            error={showError("motherName")}
          />
          <PhoneField
            id="discharge-phone"
            countryCode={countryCode}
            onCountryCodeChange={(val) => {
              setCountryCode(val);
              const local = form.phoneNumber.replace(countryCode, "");
              updateField("phoneNumber", local ? `${val}${local}` : "");
            }}
            localDigits={form.phoneNumber.replace(countryCode, "")}
            onLocalInput={(typed) => {
              // Normalise so a pasted "+233…" still fits. Never truncated:
              // the length differs per country, and an over-long number must
              // fail validation rather than be sliced into a different one.
              const raw = normaliseLocalDigits(typed, countryCode);
              updateField("phoneNumber", raw ? `${countryCode}${raw}` : "");
            }}
            error={showError("phoneNumber")}
          />
        </div>

        <DateField
          label="Date of birth"
          value={form.dateOfBirth}
          onChange={(val) => updateField("dateOfBirth", val)}
          error={showError("dateOfBirth")}
          calendar={{
            captionLayout: "dropdown",
            startMonth: new Date(1940, 0, 1),
            // Today and later can't be a date of birth (see `dobError`).
            disabled: (d) => d >= startOfToday(),
            endMonth: new Date(),
          }}
        />

        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Gravida"
            type="number"
            min="0"
            max="30"
            placeholder="Number of pregnancies"
            value={form.gravida}
            // Accept what she types — the 0–30 cap is reported as a
            // message below, not enforced by swallowing the keystroke
            // (which looked like a broken input).
            onChange={(e) => updateField("gravida", e.target.value)}
            error={showError("gravida")}
          />
          <TextField
            label="Para"
            type="number"
            min="0"
            max="30"
            placeholder="Number of births"
            value={form.para}
            onChange={(e) => updateField("para", e.target.value)}
            error={showError("para")}
          />
        </div>

        <DeliveryDatesFields wizard={wizard} />

        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-700 mb-3 block">
            Preferred language for calls
          </span>
          <ChipSelect
            max={1}
            options={LANGUAGE_OPTIONS}
            selected={form.language ? [form.language] : []}
            onChange={(val) => updateField("language", val.length > 0 ? val[0] : "")}
          />
          <FieldError error={showError("language")} className="mt-1" />
        </div>

        <CallingWindowPicker wizard={wizard} />
        <DeliveryTypePicker wizard={wizard} />
      </div>
    </OnboardingStep>
  );
};

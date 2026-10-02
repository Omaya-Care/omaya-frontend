import { ChipSelect } from "../ChipSelect";
import {
  DateField,
  FieldError,
  OnboardingStep,
  PhoneField,
  SubmitErrorAlert,
  TextField,
} from "../fields";
import { normaliseLocalDigits, startOfToday } from "@/lib/onboarding-validation";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
import { phoneDisplayError } from "./add-mother-form";
import type { AddMotherWizard } from "./useAddMotherForm";

/** Step 1 — identity, contact, dates, parity and language. */
export const MotherDetailsStep = ({ wizard }: { wizard: AddMotherWizard }) => {
  const { form, updateField, showError, countryCode, setCountryCode, phoneValid } = wizard;

  return (
    <OnboardingStep
      step={1}
      title="Her details"
      description="Pre-fill from her ANC record where possible. Double-check the phone number. This is how Omaya reaches her."
    >
      <SubmitErrorAlert message={wizard.submitError} />
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Full name"
            placeholder="e.g. Ama Mensah"
            value={form.fullName}
            onChange={(e) => updateField("fullName", e.target.value)}
            error={showError("fullName")}
          />
          <PhoneField
            id="mother-phone"
            countryCode={countryCode}
            onCountryCodeChange={(val) => {
              setCountryCode(val);
              const local = form.phone.replace(countryCode, "");
              updateField("phone", local ? `${val}${local}` : "");
            }}
            localDigits={form.phone.replace(countryCode, "")}
            onLocalInput={(typed) => {
              // Normalise so a pasted "+233…" still fits. Never truncated:
              // the length differs per country, and an over-long number must
              // fail validation rather than be sliced into a different one.
              const raw = normaliseLocalDigits(typed, countryCode);
              updateField("phone", raw ? `${countryCode}${raw}` : "");
            }}
            error={phoneDisplayError(Boolean(showError("phone")), form.phone, phoneValid)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <DateField
            id="mother-dob"
            label="Date of birth"
            value={form.dob}
            onChange={(val) => updateField("dob", val)}
            error={showError("dob")}
            calendar={{
              captionLayout: "dropdown",
              startMonth: new Date(1940, 0, 1),
              // Today and later can't be a date of birth (see `dobError`).
              disabled: (d) => d >= startOfToday(),
              endMonth: new Date(),
            }}
          />
          <DateField
            id="mother-edd"
            label="Expected delivery date"
            value={form.edd}
            onChange={(val) => updateField("edd", val)}
            error={showError("edd")}
            calendar={{
              // She is still pregnant, so her due date can't already
              // have passed — a past EDD belongs in the discharge flow.
              disabled: (d) => d < startOfToday(),
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Gravida"
            type="number"
            min="0"
            max="30"
            placeholder="Number of pregnancies"
            value={form.gravida}
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

        <div className="flex flex-col gap-1.5">
          <label htmlFor="mother-language" className="text-sm font-medium text-gray-700">
            Preferred language for calls
          </label>
          <ChipSelect
            id="mother-language"
            max={1}
            options={LANGUAGE_OPTIONS}
            selected={form.language}
            onChange={(val) => updateField("language", val)}
          />
          <FieldError error={showError("language")} />
        </div>
      </div>
    </OnboardingStep>
  );
};

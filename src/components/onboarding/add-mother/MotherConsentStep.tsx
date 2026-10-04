import { ConsentToggle, FieldError, OnboardingStep, SubmitErrorAlert } from "../fields";
import type { AddMotherWizard } from "./useAddMotherForm";

/** Step 3 — the three consents; calls and WhatsApp are required. */
export const MotherConsentStep = ({ wizard }: { wizard: AddMotherWizard }) => {
  const { form, updateField, showError } = wizard;

  return (
    <OnboardingStep
      step={3}
      title="Her consent"
      description="Read this to her out loud, or show her the screen. Check-in calls and WhatsApp messages are both required before you can enroll her."
    >
      <SubmitErrorAlert message={wizard.submitError} />
      <div className="flex flex-col gap-4">
        <ConsentToggle
          checked={form.consentCalls}
          onToggle={() => updateField("consentCalls", !form.consentCalls)}
          title="Check-in calls"
          description="Omaya will call her to check how she and her baby are doing after she goes home. She can ask to stop at any time."
          tag="REQUIRED TO ENROLL"
          tagTone="required"
          invalid={Boolean(showError("consentCalls"))}
        />
        <FieldError
          className="-mt-3"
          error={showError("consentCalls") && "You must obtain consent to check-in calls before enrolling"}
        />

        <ConsentToggle
          checked={form.whatsappOptIn}
          onToggle={() => updateField("whatsappOptIn", !form.whatsappOptIn)}
          title="WhatsApp messages"
          description="She can message Omaya on WhatsApp with questions or concerns between check-in calls. She can opt out at any time."
          tag="REQUIRED TO ENROLL"
          tagTone="required"
          invalid={Boolean(showError("whatsappOptIn"))}
        />
        <FieldError
          className="-mt-3"
          error={showError("whatsappOptIn") && "You must obtain consent to WhatsApp messages before enrolling"}
        />

        <ConsentToggle
          checked={form.consentRecording}
          onToggle={() => updateField("consentRecording", !form.consentRecording)}
          title="Call recording"
          description="If she agrees, calls are recorded and stored securely for her care team only. If she declines, no recording is made or kept — her check-in calls continue either way."
          tag="OPTIONAL"
          tagTone="optional"
        />
      </div>
      <p className="text-xs text-gray-400 font-normal mt-6">
        By tapping 'Enroll her', you confirm that you have explained this
        program to the mother and she has agreed to participate.
      </p>
    </OnboardingStep>
  );
};

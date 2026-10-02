import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ConsentToggle, OnboardingStep } from "../fields";
import type { DischargeWizard } from "./useDischargeWizard";

/** Step 5 of the new-patient flow — the three consents; calls and WhatsApp are required. */
export const DischargeConsentStep = ({ wizard }: { wizard: DischargeWizard }) => {
  const { form, updateField, setForm, showError } = wizard;
  const callsError = Boolean(showError("consentCalls"));
  const whatsappError = Boolean(showError("whatsappOptIn"));

  return (
    <OnboardingStep
      step={5}
      title="Her consent"
      description="Read this to her out loud, or show her the screen. Check-in calls and WhatsApp messages are both required before you can enroll her."
    >
      {(callsError || whatsappError) && (
        <div className="mb-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Consent required</AlertTitle>
            <AlertDescription>
              You must obtain consent to check-in calls and WhatsApp
              messages before enrolling
            </AlertDescription>
          </Alert>
        </div>
      )}
      <div className="flex flex-col gap-4">
        <ConsentToggle
          checked={form.consentCalls}
          onToggle={() => {
            const next = !form.consentCalls;
            // Recording consent can't stand without calls consent — clear
            // it whenever calls is switched off.
            setForm((prev) => ({
              ...prev,
              consentCalls: next,
              consentRecording: next ? prev.consentRecording : false,
            }));
          }}
          title="Check-in calls"
          description="Omaya will call her to check how she and her baby are doing after she goes home. She can ask to stop at any time."
          tag="Required to enroll"
          tagTone="required"
          invalid={callsError}
        />

        <ConsentToggle
          checked={form.whatsappOptIn}
          onToggle={() => updateField("whatsappOptIn", !form.whatsappOptIn)}
          title="WhatsApp messages"
          description="She can message Omaya on WhatsApp with questions or concerns between check-in calls. She can opt out at any time."
          tag="Required to enroll"
          tagTone="required"
          invalid={whatsappError}
        />

        <ConsentToggle
          checked={form.consentRecording}
          disabled={!form.consentCalls}
          onToggle={() => {
            if (!form.consentCalls) return;
            updateField("consentRecording", !form.consentRecording);
          }}
          title="Call recording"
          description="If she agrees, calls are recorded and stored securely for her care team only. If she declines, no recording is made or kept — her check-in calls continue either way."
          tag={form.consentCalls ? "Optional" : "Consent to calls first"}
          tagTone="optional"
        />
      </div>
      <p className="text-xs text-gray-400 font-normal mt-6">
        By tapping 'Confirm discharge', you confirm that you have explained
        this program to the mother and she has agreed to participate.
      </p>
    </OnboardingStep>
  );
};

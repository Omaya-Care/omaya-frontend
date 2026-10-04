import { AlertCircle, ArrowRight, CheckCircle2, Copy, PhoneCall } from "lucide-react";
import { OnboardingShell } from "./OnboardingShell";
import { Button } from "@/components/ui/Button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useMe } from "@/hooks/useMe";
import { formatPhone } from "@/lib/format";
import { toast } from "@/lib/notify";

interface EnrollmentCompleteProps {
  /** Heading and top-bar label, e.g. "Discharge recorded". */
  title: string;
  message: string;
  /** Saved, but something needs the clinician's attention (e.g. no calls). */
  warning?: boolean;
  warningTitle?: string;
  onDone: () => void;
}

/** Last screen of both onboarding wizards. Stays open after the save so the
 *  clinician can give the mother the hospital's front-desk number (from
 *  GET /auth/me) before she leaves; the number block hides if none is set. */
export function EnrollmentComplete({
  title,
  message,
  warning = false,
  warningTitle = "No check-in calls scheduled",
  onDone,
}: EnrollmentCompleteProps) {
  const { me } = useMe();
  const hospitalPhone = me?.hospitalPhone ?? null;

  return (
    // Saved — nothing left to discard, so close straight away.
    <OnboardingShell onClose={onDone} stepLabel={title}>
      <div className="flex flex-col max-w-2xl w-full mx-auto mt-12 sm:mt-20">
        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
          <CheckCircle2 size={24} className="text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mt-6">{title}</h1>
        {warning ? (
          <div className="mt-5">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{warningTitle}</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          </div>
        ) : (
          <p className="text-base text-gray-500 mt-3 leading-relaxed">{message}</p>
        )}

        {hospitalPhone && (
          <>
            <div className="mt-10 mb-10 h-px bg-gray-100 w-full" />
            <span className="text-sm font-semibold text-gray-700">
              Give her the hospital's number
            </span>
            <p className="text-sm text-gray-500 mt-1">
              Ask her to save it, so she knows who to call if anything worries
              her.
            </p>
            <div className="mt-4 bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                  <PhoneCall size={20} className="text-primary" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-gray-400 font-medium">
                    {me?.hospitalName}
                  </span>
                  <span className="text-2xl font-semibold text-gray-900 tracking-wide">
                    {formatPhone(hospitalPhone)}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                className="gap-2 shrink-0"
                onClick={() => {
                  navigator.clipboard
                    .writeText(hospitalPhone)
                    .then(() => toast.success("Number copied."))
                    .catch(() => toast.error("Couldn't copy the number."));
                }}
              >
                <Copy size={16} />
                <span>Copy</span>
              </Button>
            </div>
          </>
        )}

        <Button variant="default" onClick={onDone} className="gap-2 mt-14 self-start">
          <span>Done</span>
          <ArrowRight size={18} />
        </Button>
      </div>
    </OnboardingShell>
  );
}

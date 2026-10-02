import { ArrowRight, Clock, Phone, ShieldCheck } from "lucide-react";
import { OnboardingShell } from "./OnboardingShell";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";

const CARDS = [
  {
    icon: Phone,
    title: "She'll receive calls, and can message Omaya on WhatsApp",
    description:
      "Omaya calls her directly. No app needed, just her phone number and WhatsApp.",
  },
  {
    icon: ShieldCheck,
    title: "Her data is private",
    description:
      "Only her care team can see her record. She controls her consent.",
  },
  {
    icon: Clock,
    title: "You can stop anytime",
    description:
      "If she changes her mind, you can withdraw her from the program in one click.",
  },
];

interface BeforeWeStartProps {
  onClose: () => void;
  onStart: () => void;
}

/** First screen of new-mother onboarding, ahead of the find-record step and
 *  outside the numbered steps of either wizard. */
export function BeforeWeStart({ onClose, onStart }: BeforeWeStartProps) {
  return (
    <OnboardingShell
      onClose={onClose}
      stepLabel="Add mother"
    >
      <div className="flex flex-col max-w-4xl w-full mx-auto mt-12 sm:mt-20">
        <div className="flex flex-col max-w-2xl">
          <h1 className="text-2xl font-bold text-gray-900">Before we start</h1>
          <p className="text-base text-gray-500 mt-5 leading-relaxed font-normal">
            This takes about 3 minutes. You're enrolling her in Omaya's
            follow-up care program. She'll receive check-in calls after
            delivery to make sure she and her baby are doing well.
          </p>
        </div>
        <div className="mt-10 mb-10 h-px bg-gray-100 w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {CARDS.map((card) => (
            <Card key={card.title} className="border-gray-100 shadow-sm">
              <CardContent className="p-5 flex flex-col items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                  <card.icon size={20} className="text-primary" />
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {card.title}
                </span>
                <span className="text-xs text-gray-500 leading-relaxed">
                  {card.description}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
        <Button variant="default" onClick={onStart} className="gap-2 mt-14 self-start">
          <span>Start enrollment</span>
          <ArrowRight size={18} />
        </Button>
      </div>
    </OnboardingShell>
  );
}

import type { ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { OnboardingShell } from "./OnboardingShell";
import { EnrollmentComplete } from "./EnrollmentComplete";
import { Button } from "@/components/ui/Button";
import { usePermissions } from "@/hooks/usePermissions";
import {
  ADD_MOTHER_STEP_LABELS,
  ADD_MOTHER_TOTAL_STEPS,
} from "./add-mother/add-mother-form";
import { useAddMotherForm, type AddMotherWizard } from "./add-mother/useAddMotherForm";
import { MotherDetailsStep } from "./add-mother/MotherDetailsStep";
import { MotherRisksStep } from "./add-mother/MotherRisksStep";
import { MotherConsentStep } from "./add-mother/MotherConsentStep";
import { MotherSummaryStep } from "./add-mother/MotherSummaryStep";

interface AddMotherProps {
  onClose?: () => void;
  /** Back from step 1 returns to the find-record screen. */
  onBackToSearch: () => void;
}

const STEP_SCREENS: Record<number, ComponentType<{ wizard: AddMotherWizard }>> = {
  1: MotherDetailsStep,
  2: MotherRisksStep,
  3: MotherConsentStep,
  4: MotherSummaryStep,
};

const AddMother = ({ onClose, onBackToSearch }: AddMotherProps) => {
  const navigate = useNavigate();
  // A Coordinator (create_discharges without view_mothers) can't open /mothers.
  const { can } = usePermissions();
  const handleClose = onClose ?? (() => navigate(can("view_mothers") ? "/mothers" : "/dashboard"));
  const wizard = useAddMotherForm();
  const { currentStep, submitting, canContinue } = wizard;
  const isLastStep = currentStep === ADD_MOTHER_TOTAL_STEPS;
  const StepScreen = STEP_SCREENS[currentStep];

  if (wizard.completed) {
    return (
      <EnrollmentComplete
        title="Mother enrolled"
        message={`${wizard.form.fullName} is enrolled in Omaya's care program.`}
        onDone={handleClose}
      />
    );
  }

  return (
    <OnboardingShell
      onClose={handleClose}
      currentStep={currentStep}
      totalSteps={ADD_MOTHER_TOTAL_STEPS}
      stepLabel={ADD_MOTHER_STEP_LABELS[currentStep - 1]}
      leftAction={
        <Button
          variant="ghost"
          onClick={currentStep === 1 ? onBackToSearch : wizard.handleBack}
          className="gap-2"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </Button>
      }
      rightAction={
        <Button
          variant="default"
          onClick={wizard.handleNext}
          className="gap-2"
          // Previously only ever disabled while submitting, so on an invalid
          // step the button looked live but silently did nothing.
          disabled={submitting || !canContinue}
        >
          {submitting && <Loader2 size={18} className="animate-spin" />}
          <span>{isLastStep ? "Enroll her" : "Continue"}</span>
          {!submitting && <ArrowRight size={18} />}
        </Button>
      }
    >
      <StepScreen wizard={wizard} />
    </OnboardingShell>
  );
};

export default AddMother;

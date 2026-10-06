import type { ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { OnboardingShell } from "./OnboardingShell";
import { EnrollmentComplete } from "./EnrollmentComplete";
import { Button } from "@/components/ui/Button";
import { usePermissions } from "@/hooks/usePermissions";
import { useDischargeWizard, type DischargeWizard } from "./discharge/useDischargeWizard";
import { useMotherSearch } from "./discharge/useMotherSearch";
import { DischargeSearch } from "./discharge/DischargeSearch";
import { DischargeDiscardDialog } from "./discharge/DischargeDiscardDialog";
import { ExistingDetailsStep } from "./discharge/ExistingDetailsStep";
import { NewDetailsStep } from "./discharge/NewDetailsStep";
import { OutcomeStep } from "./discharge/OutcomeStep";
import { MedicationsStep } from "./discharge/MedicationsStep";
import { RisksStep } from "./discharge/RisksStep";
import { DischargeConsentStep } from "./discharge/DischargeConsentStep";
import { ContactsStep } from "./discharge/ContactsStep";
import { DischargeSummaryStep } from "./discharge/DischargeSummaryStep";

interface NewDischargeProps {
  onClose?: () => void;
  /** "Enrolling during pregnancy" — hand over to the antenatal wizard. */
  onEnrollAntenatal: () => void;
  /** Back from the find-record screen returns to "Before we start". */
  onBackToIntro: () => void;
}

type StepScreen = ComponentType<{ wizard: DischargeWizard }>;

/** The 5-step flow for a mother who already has a record with us. */
const EXISTING_PATIENT_STEPS: Record<number, StepScreen> = {
  1: ExistingDetailsStep,
  2: OutcomeStep,
  3: MedicationsStep,
  4: ContactsStep,
  5: DischargeSummaryStep,
};

/** The 7-step flow for a mother we are meeting at discharge. */
const NEW_PATIENT_STEPS: Record<number, StepScreen> = {
  1: NewDetailsStep,
  2: OutcomeStep,
  3: MedicationsStep,
  4: RisksStep,
  5: DischargeConsentStep,
  6: ContactsStep,
  7: DischargeSummaryStep,
};

const NewDischarge = ({ onClose, onEnrollAntenatal, onBackToIntro }: NewDischargeProps) => {
  const navigate = useNavigate();
  // Raw close — used on successful submit (no prompt).
  // A Receptionist (create_discharges without view_mothers) can't open /mothers.
  const { can } = usePermissions();
  const handleClose = onClose ?? (() => navigate(can("view_mothers") ? "/mothers" : "/dashboard"));
  const wizard = useDischargeWizard();
  const search = useMotherSearch();
  const { foundMother, currentStep, totalSteps, submitting, canContinue } = wizard;

  // Guarded close: used by the X, the intro Back, and overlay-click / Escape
  // (registered with the drawer). Prompts before discarding when dirty. A
  // successful submit calls handleClose() directly and skips this.
  const requestClose = () => {
    if (wizard.isDirty) wizard.setDiscardOpen(true);
    else handleClose();
  };

  const discardDialog = (
    <DischargeDiscardDialog
      open={wizard.discardOpen}
      onOpenChange={wizard.setDiscardOpen}
      onDiscard={handleClose}
    />
  );

  if (wizard.completed) {
    return (
      <EnrollmentComplete
        title="Discharge recorded"
        message={wizard.completed.message}
        warning={wizard.completed.warning}
        onDone={handleClose}
      />
    );
  }

  if (wizard.searchPhase) {
    return (
      <>
        <DischargeSearch
          search={search}
          onClose={requestClose}
          onSelect={wizard.selectMother}
          onNewPatient={() => wizard.enterForm(null)}
          onEnrollAntenatal={onEnrollAntenatal}
          onBackToIntro={onBackToIntro}
        />
        {discardDialog}
      </>
    );
  }

  const StepScreen = (foundMother ? EXISTING_PATIENT_STEPS : NEW_PATIENT_STEPS)[currentStep];

  return (
    <>
      <OnboardingShell
        onClose={requestClose}
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepLabel={foundMother ? "Discharge - existing patient" : "Discharge - new patient"}
        leftAction={
          <Button variant="ghost" onClick={wizard.handleBack} className="gap-2">
            <ArrowLeft size={18} />
            <span>Back</span>
          </Button>
        }
        rightAction={
          <Button
            variant="default"
            onClick={wizard.handleNext}
            className="gap-2"
            disabled={submitting || !canContinue}
          >
            {submitting && <Loader2 size={18} className="animate-spin" />}
            <span>{currentStep === totalSteps ? "Confirm discharge" : "Continue"}</span>
            {!submitting && <ArrowRight size={18} />}
          </Button>
        }
      >
        {/* Keyed per step so the block remounts and the directional slide replays
            on every Continue / Back. */}
        <div
          key={currentStep}
          className={`animate-in fade-in-0 duration-300 ease-out motion-reduce:animate-none ${
            wizard.direction === "forward" ? "slide-in-from-right-5" : "slide-in-from-left-5"
          }`}
        >
          <StepScreen wizard={wizard} />
        </div>
      </OnboardingShell>
      {discardDialog}
    </>
  );
};

export default NewDischarge;

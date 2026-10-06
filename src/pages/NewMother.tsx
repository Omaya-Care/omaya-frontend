import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BeforeWeStart } from "@/components/onboarding/BeforeWeStart";
import NewDischarge from "@/components/onboarding/NewDischarge";
import AddMother from "@/components/onboarding/AddMother";
import { usePermissions } from "@/hooks/usePermissions";

/**
 * New-mother onboarding — rendered inside AppLayout. "Before we start" →
 * find-record (inside NewDischarge), which branches to an existing mother's
 * discharge, a new mother's discharge, or antenatal enrolment (AddMother).
 */
export default function NewMother() {
  const navigate = useNavigate();
  // A Receptionist (create_discharges without view_mothers) can't open /mothers.
  const { can } = usePermissions();
  const [flow, setFlow] = useState<"intro" | "discharge" | "antenatal">("intro");

  if (flow === "intro") {
    return (
      <BeforeWeStart
        onClose={() => navigate(can("view_mothers") ? "/mothers" : "/dashboard")}
        onStart={() => setFlow("discharge")}
      />
    );
  }

  return flow === "antenatal" ? (
    <AddMother onBackToSearch={() => setFlow("discharge")} />
  ) : (
    <NewDischarge
      onEnrollAntenatal={() => setFlow("antenatal")}
      onBackToIntro={() => setFlow("intro")}
    />
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDrawer } from "../contexts/DrawerContext";
import { PageHeader } from "../components/dashboard/PageHeader";
import {
  StatCard,
  SectionHeader,
  AlertsTable,
  CallsTable,
  EscalationModal,
} from "../components/dashboard";
import { useMothers } from "../hooks/useMothers";
import { useCalls } from "../hooks/useCalls";
import { useEscalations } from "../hooks/useEscalations";
import { useAcknowledgeAlert } from "../hooks/useMutations";
import { EscalationItem } from "../types";
import PageLoading from "../components/PageLoading";
import { getClinician } from "../lib/auth";

const Dashboard = () => {
  const navigate = useNavigate();
  const { openDrawer } = useDrawer();
  const { data: mothers = [], isLoading: mothersLoading } = useMothers();
  const { data: calls = [], isLoading: callsLoading } = useCalls();
  const { data: escalations = [], isLoading: escalationsLoading } = useEscalations();
  const acknowledgeMutation = useAcknowledgeAlert();

  const [acknowledgeModal, setAcknowledgeModal] = useState<{
    open: boolean;
    item: EscalationItem | null;
  }>({
    open: false,
    item: null,
  });

  const handleNewDischarge = () => {
    openDrawer('discharge');
  };

  const handleAcknowledgeClick = (item: EscalationItem) => {
    setAcknowledgeModal({ open: true, item });
  };

  const handleAcknowledgeConfirm = async () => {
    if (acknowledgeModal.item) {
      try {
        await acknowledgeMutation.mutateAsync(acknowledgeModal.item.id);
        setAcknowledgeModal({ open: false, item: null });
      } catch (err) {
        console.error("Failed to acknowledge alert", err);
      }
    }
  };

  const clinician = getClinician();
  const firstName = clinician?.name?.split(/\s+/)[0] ?? "User";

  if (mothersLoading || callsLoading || escalationsLoading) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col">
      {/* BLOCK 1: PAGE HEADER */}
      <PageHeader userName={firstName} onNewDischarge={handleNewDischarge} />

      {/* BLOCK 2: STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard
          label="Mothers in care"
          sublabel="Active right now"
          value={mothers.length}
          background="#F2DCEA"
          onViewAll={() => navigate("/mothers")}
        />
        <StatCard
          label="Calls today"
          sublabel="Scheduled & completed"
          value={calls.length}
          background="#F2DCEA"
          onViewAll={() => navigate("/calls")}
        />
        <StatCard
          label="Need attention"
          sublabel="L3 & L4 unacknowledged"
          value={escalations.length}
          background="#F2DCEA"
          footerText={`${escalations.length} waiting`}
          footerColor="#DC2626"
        />
        <StatCard
          label="Avg. response time"
          sublabel="To L3 & L4 alerts"
          value="11m"
          background="#F2DCEA"
        />
      </div>

      {/* BLOCK 3: TWO COLUMN ROW */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* LEFT — "Needs attention now" panel */}
        <div className="flex-1 bg-white rounded-2xl pt-4 md:pt-5 px-3 md:px-5 pb-3 shadow-sm flex flex-col">
          <SectionHeader
            title="Needs attention now"
            count={escalations.length}
          />
          <AlertsTable
            escalations={escalations}
            onAcknowledgeClick={handleAcknowledgeClick}
          />
        </div>

        {/* RIGHT — "This week" summary panel */}
        <div className="w-full lg:w-80 bg-white rounded-2xl p-3 md:p-5 shadow-sm self-start">
          <div className="mb-4 overflow-hidden">
            <span className="text-xs text-gray-400 float-right">
              Mon – today
            </span>
            <h3 className="text-sm md:text-base font-semibold text-gray-900">This week</h3>
          </div>

          <div className="flex flex-col">
            {[
              {
                label: "Calls completed",
                sub: "across the cohort",
                value: "318",
              },
              {
                label: "Escalations resolved",
                sub: "L3 & L4 acknowledged",
                value: "12",
              },
              { label: "New discharges", sub: "mothers enrolled", value: "8" },
              {
                label: "Avg. response time",
                sub: "to L3 & L4 alerts",
                value: "11m",
              },
            ].map((row, idx) => (
              <div
                key={idx}
                className="flex justify-between items-start border-b border-gray-50 py-3 last:border-0"
              >
                <div>
                  <div className="text-sm font-normal text-gray-600">
                    {row.label}
                  </div>
                  <div className="text-xs font-normal text-gray-400 mt-0.5">
                    {row.sub}
                  </div>
                </div>
                <div className="text-xl font-bold text-gray-900">
                  {row.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BLOCK 4: TODAY'S CALLS */}
      <div className="bg-white rounded-2xl pt-4 md:pt-5 px-3 md:px-5 pb-3 shadow-sm">
        <SectionHeader
          title="Today's calls"
          onViewAll={() => navigate("/calls")}
        />
        <div className="text-xs md:text-sm font-normal text-gray-400 -mt-3 mb-4">
          {calls.filter(c => c.status === 'completed').length} of {calls.length} completed
        </div>
        <CallsTable calls={calls} />
      </div>

      <EscalationModal
        isOpen={acknowledgeModal.open}
        onClose={() =>
          setAcknowledgeModal({ ...acknowledgeModal, open: false })
        }
        onAcknowledge={handleAcknowledgeConfirm}
        item={acknowledgeModal.item}
      />
    </div>
  );
};

export default Dashboard;

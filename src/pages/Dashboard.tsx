import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDrawer } from "../contexts/DrawerContext";
import { PageHeader } from "../components/dashboard/PageHeader";
import {
  StatCard,
  SectionHeader,
  AcknowledgeRow,
  CallRow,
  EscalationModal,
} from "../components/dashboard";
import { mothers } from "../data/mothers";
import { calls } from "../data/calls";
import { escalations } from "../data/escalations";
import { EscalationItem } from "../types";

const Dashboard = () => {
  const navigate = useNavigate();
  const { openDrawer } = useDrawer();
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

  const handleAcknowledgeConfirm = () => {
    if (acknowledgeModal.item) {
      console.log("acknowledged", acknowledgeModal.item.id);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
      {/* BLOCK 1: PAGE HEADER */}
      <PageHeader userName="Ama" onNewDischarge={handleNewDischarge} />

      {/* BLOCK 2: STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Mothers in care"
          sublabel="Active right now"
          value={mothers.length}
          background="#F7E8F0"
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
          background="#EDD5E4"
          footerText={`${escalations.length} waiting`}
          footerColor="#DC2626"
          onViewAll={() => console.log("View all unacknowledged")}
        />
        <StatCard
          label="Avg. response time"
          sublabel="To L3 & L4 alerts"
          value="11m"
          background="#E8CCDC"
          onViewAll={() => console.log("View response time details")}
        />
      </div>

      {/* BLOCK 3: TWO COLUMN ROW */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* LEFT — "Needs attention now" panel */}
        <div className="flex-1 bg-white rounded-2xl p-5 shadow-sm">
          <SectionHeader
            title="Needs attention now"
            count={escalations.length}
            onViewAll={() => navigate("/calls")}
          />

          <div className="overflow-x-auto">
            <div className="min-w-[480px]">
              {/* Column headers row */}
              <div className="grid grid-cols-[1fr_192px_1fr_144px] text-xs font-medium text-gray-400 tracking-wide uppercase border-b border-gray-100 pb-2 mb-1">
                <div>Mother</div>
                <div>Severity</div>
                <div>Time Left</div>
                <div className="text-right">Action</div>
              </div>

              <div className="flex flex-col">
                {escalations.map((item) => (
                  <AcknowledgeRow
                    key={item.id}
                    item={item}
                    onAcknowledge={() => handleAcknowledgeClick(item)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — "This week" summary panel */}
        <div className="w-full lg:w-80 bg-white rounded-2xl p-5 shadow-sm">
          <div className="mb-4 overflow-hidden">
            <span className="text-xs text-gray-400 float-right">
              Mon – today
            </span>
            <h3 className="text-base font-semibold text-gray-900">This week</h3>
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
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <SectionHeader
          title="Today's calls"
          onViewAll={() => navigate("/calls")}
        />
        <div className="text-sm font-normal text-gray-400 -mt-3 mb-4">
          1 of 6 completed
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[480px]">
            {/* Column headers */}
            <div className="grid grid-cols-[1fr_112px_1fr_160px] text-xs font-medium text-gray-400 tracking-wide uppercase border-b border-gray-100 pb-2 mb-1">
              <div>Mother</div>
              <div>Time</div>
              <div>Call Type</div>
              <div className="text-right">Status</div>
            </div>

            <div className="flex flex-col">
              {calls.map((call) => (
                <CallRow key={call.id} call={call} />
              ))}
            </div>
          </div>
        </div>
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

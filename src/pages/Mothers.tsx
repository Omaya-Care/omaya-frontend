import { useState, useEffect, useMemo } from "react";
import { useDrawer } from "../contexts/DrawerContext";
import { Plus, Search, ArrowLeft, UserRound } from "lucide-react";
import { useMothers } from "../hooks/useMothers";
import { useConfirmConsentAction } from "../hooks/useMutations";
import {
  MotherListItem,
  MotherDetail,
  WithdrawModal,
  LogVisitModal,
  type LogVisitData,
} from "../components/mothers";
import { Button } from "../components/ui/Button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import PageLoading from "../components/PageLoading";

const MothersPage = () => {
  const { openDrawer } = useDrawer();
  const { data: mothers = [], isLoading } = useMothers();
  const withdrawMutation = useConfirmConsentAction("withdrawal");
  const [selectedMotherId, setSelectedMotherId] = useState<string>("");

  console.log("[MothersPage] mothers from API:", mothers);
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [logVisitModalOpen, setLogVisitModalOpen] = useState(false);

  useEffect(() => {
    if (mothers.length > 0 && !selectedMotherId) {
      setSelectedMotherId(mothers[0].id);
    }
  }, [mothers, selectedMotherId]);

  const filteredMothers = useMemo(() => {
    return mothers.filter((mother) => {
      if (severityFilter !== "all" && mother.severity !== severityFilter) return false;
      if (statusFilter !== "all" && mother.consentStatus !== statusFilter) return false;
      return true;
    });
  }, [mothers, severityFilter, statusFilter]);

  const selectedMother = mothers.find((m) => m.id === selectedMotherId) || null;

  const handleSelectMother = (id: string) => {
    setSelectedMotherId(id);
    setMobileDetailOpen(true);
  };

  const handleWithdrawConfirm = async () => {
    if (selectedMother) {
      try {
        await withdrawMutation.mutateAsync(selectedMother.id);
        setWithdrawModalOpen(false);
      } catch (err) {
        console.error("Failed to confirm withdrawal", err);
      }
    }
  };

  const handleLogVisitSave = (data: LogVisitData) => {
    console.log("visit saved", data);
  };

  if (isLoading && mothers.length === 0) {
    return <PageLoading />;
  }

  if (!mothers || mothers.length === 0) {
    return (
      <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center gap-3">
        <UserRound size={48} className="text-[#93406B]" />
        <span className="text-sm font-semibold text-gray-700">No mothers enrolled yet</span>
        <span className="text-xs text-gray-400 font-normal">Discharged mothers will appear here.</span>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)] flex flex-row gap-4">
      {/* LEFT PANEL */}
      <div
        className={`
          flex-shrink-0 flex-col bg-white rounded-2xl overflow-hidden shadow-sm
          w-full lg:w-72 h-full
          ${mobileDetailOpen ? "hidden lg:flex" : "flex"}
        `}
      >
        {/* Top bar */}
        <div className="px-4 pt-5 pb-3 flex justify-between items-center flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Mothers</h2>
          <Button
            variant="default"
            size="sm"
            className="flex items-center gap-1.5 px-3"
            onClick={() => openDrawer("add-mother")}
          >
            <Plus size={16} />
            <span className="font-medium">Add</span>
          </Button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3 flex-shrink-0">
          <Input
            placeholder="Search name or reference"
            leftIcon={<Search size={16} />}
            className="bg-gray-50/50"
          />
        </div>

        {/* Filters */}
        <div className="px-4 pb-3 flex-shrink-0 flex gap-2">
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="flex-1 h-auto text-xs border-gray-200 bg-white py-1.5 px-2.5 font-medium">
              <SelectValue placeholder="All levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All levels</SelectItem>
              <SelectItem value="routine">Routine</SelectItem>
              <SelectItem value="elevated">Elevated</SelectItem>
              <SelectItem value="crisis">Crisis</SelectItem>
              <SelectItem value="monitor">Monitor</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="flex-1 h-auto text-xs border-gray-200 bg-white py-1.5 px-2.5 font-medium">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="withdrawn">Withdrawn</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto border-t border-gray-50">
          {filteredMothers.map((mother) => (
            <MotherListItem
              key={mother.id}
              mother={mother}
              isSelected={selectedMotherId === mother.id}
              onClick={() => handleSelectMother(mother.id)}
            />
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div
        className={`
          flex-col bg-white rounded-2xl overflow-y-auto shadow-sm p-6
          flex-1 h-full
          ${mobileDetailOpen ? "flex" : "hidden lg:flex"}
        `}
      >
        {/* Back button — mobile only */}
        <button
          className="lg:hidden flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 -mt-1 self-start"
          onClick={() => setMobileDetailOpen(false)}
        >
          <ArrowLeft size={16} />
          <span>Back to list</span>
        </button>

        <MotherDetail
          mother={selectedMother}
          onWithdrawClick={() => setWithdrawModalOpen(true)}
          onLogVisitClick={() => setLogVisitModalOpen(true)}
        />
      </div>

      {selectedMother && (
        <>
          <WithdrawModal
            isOpen={withdrawModalOpen}
            onClose={() => setWithdrawModalOpen(false)}
            onConfirm={handleWithdrawConfirm}
            motherName={selectedMother.name}
          />
          <LogVisitModal
            isOpen={logVisitModalOpen}
            onClose={() => setLogVisitModalOpen(false)}
            onSave={handleLogVisitSave}
            motherName={selectedMother.name}
            dayPostpartum={selectedMother.dayPostpartum}
          />
        </>
      )}
    </div>
  );
};

export default MothersPage;

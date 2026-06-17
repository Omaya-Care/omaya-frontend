import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useDrawer } from "../contexts/DrawerContext";
import { useAuth } from "../contexts/AuthContext";
import {
  Plus,
  Search,
  ArrowLeft,
  UserRound,
  SlidersHorizontal,
} from "lucide-react";
import { useMothers, useMother } from "../hooks/useMothers";
import { useWithdrawMother } from "../hooks/useMutations";
import {
  MotherListItem,
  MotherDetail,
  WithdrawModal,
  LogVisitModal,
} from "../components/mothers";
import { EditMotherSheet } from "../components/mothers/EditMotherSheet";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Skeleton } from "../components/ui/skeleton";
import { toast } from "sonner";

const MothersPage = () => {
  const { openDrawer } = useDrawer();
  const { can } = useAuth();
  const location = useLocation();
  const { data: mothers = [], isLoading } = useMothers();
  const withdrawMutation = useWithdrawMother();
  const [selectedMotherId, setSelectedMotherId] = useState<string>(
    (location.state as { motherId?: string } | null)?.motherId ?? "",
  );
  const { data: selectedMother = null, isLoading: isMotherLoading } =
    useMother(selectedMotherId);

  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [logVisitModalOpen, setLogVisitModalOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);

  useEffect(() => {
    if (mothers.length > 0 && !selectedMotherId) {
      setSelectedMotherId(mothers[0].id);
    }
    // If navigated with a motherId, open detail panel on mobile too
    const navMotherId = (location.state as { motherId?: string } | null)
      ?.motherId;
    if (navMotherId) setMobileDetailOpen(true);
  }, [mothers, selectedMotherId]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredMothers = useMemo(() => {
    return mothers.filter((mother) => {
      if (severityFilter !== "all" && mother.severity !== severityFilter)
        return false;
      if (statusFilter !== "all" && mother.consentStatus !== statusFilter)
        return false;
      return true;
    });
  }, [mothers, severityFilter, statusFilter]);

  const handleSelectMother = (id: string) => {
    if (!can("message_mothers")) return;
    setSelectedMotherId(id);
    setMobileDetailOpen(true);
  };

  const handleWithdrawConfirm = async (reason: string) => {
    if (selectedMother) {
      try {
        await withdrawMutation.mutateAsync({
          motherId: selectedMother.id,
          reason,
        });
        toast.success("Mother withdrawn from program.");
        setWithdrawModalOpen(false);
      } catch (err) {
        toast.error("Could not withdraw. Please try again.");
        console.error("Failed to confirm withdrawal", err);
      }
    }
  };

  if (isLoading && mothers.length === 0) {
    return (
      <div className="flex flex-row gap-4 h-[calc(100vh-64px)]">
        <div className="w-full lg:w-72 bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-3">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-9 w-full rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
          <div className="space-y-1 mt-1">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[72px] w-full rounded-lg" />
            ))}
          </div>
        </div>
        <div className="flex-1 bg-white rounded-2xl shadow-sm p-6 hidden lg:block">
          <Skeleton className="h-8 w-48 mb-3" />
          <Skeleton className="h-5 w-32 mb-6" />
          <div className="grid grid-cols-2 gap-x-16 gap-y-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-32" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!mothers || mothers.length === 0) {
    return (
      <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center gap-3">
        <UserRound size={48} className="text-[#93406B]" />
        <span className="text-sm font-semibold text-gray-700">
          No mothers enrolled yet
        </span>
        <span className="text-xs text-gray-400 font-normal">
          Discharged mothers will appear here.
        </span>
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
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                tabIndex={0}
                className={
                  !can("create_discharges") ? "cursor-not-allowed" : ""
                }
              >
                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center gap-1.5 px-3"
                  onClick={() => openDrawer("discharge")}
                  disabled={!can("create_discharges")}
                >
                  <Plus size={16} />
                  <span className="font-medium">Add</span>
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>
                {can("create_discharges")
                  ? "Enrol a new mother"
                  : "You don't have permission to enrol mothers"}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Search */}
        <div className="px-4 pb-3 flex-shrink-0">
          <Input
            placeholder="Search name or reference"
            leftIcon={<Search size={16} />}
            className="bg-gray-50/50"
          />
        </div>

        {/* Combined filter */}
        <div className="px-4 pb-3 flex-shrink-0">
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1.5 text-xs border border-gray-200 bg-white rounded-md py-1.5 px-2.5 font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <SlidersHorizontal size={14} />
                <span>Filter</span>
                {(severityFilter !== "all" || statusFilter !== "all") && (
                  <span className="ml-1 w-5 h-5 rounded-full bg-[#93406B] text-white text-[10px] font-bold flex items-center justify-center">
                    {(severityFilter !== "all" ? 1 : 0) +
                      (statusFilter !== "all" ? 1 : 0)}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-56 p-3">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Severity
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "all",
                      "routine",
                      "elevated",
                      "crisis",
                      "monitor",
                      "inactive",
                    ].map((val) => (
                      <button
                        key={val}
                        onClick={() => setSeverityFilter(val)}
                        className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                          severityFilter === val
                            ? "border-[#93406B] bg-[#F7E8F0] text-[#93406B] font-medium"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {val === "all"
                          ? "All"
                          : val.charAt(0).toUpperCase() + val.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Status
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {["all", "active", "withdrawn", "pending"].map((val) => (
                      <button
                        key={val}
                        onClick={() => setStatusFilter(val)}
                        className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                          statusFilter === val
                            ? "border-[#93406B] bg-[#F7E8F0] text-[#93406B] font-medium"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {val === "all"
                          ? "All"
                          : val.charAt(0).toUpperCase() + val.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto border-t border-gray-200">
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

        {isMotherLoading ? (
          <div className="flex flex-col gap-6">
            <div className="pb-5 border-b border-gray-200">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="pb-5 border-b border-gray-200 flex flex-col gap-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
            <div className="pb-5 border-b border-gray-200">
              <Skeleton className="h-4 w-24 mb-3" />
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-16 gap-y-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-28" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <MotherDetail
            mother={selectedMother}
            onWithdrawClick={() => setWithdrawModalOpen(true)}
            onLogVisitClick={
              can("message_mothers")
                ? () => setLogVisitModalOpen(true)
                : undefined
            }
            onEditClick={
              can("message_mothers") ? () => setEditSheetOpen(true) : undefined
            }
          />
        )}
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
            motherId={selectedMother.id}
            motherName={selectedMother.name}
            dayPostpartum={selectedMother.dayPostpartum}
          />
          <EditMotherSheet
            isOpen={editSheetOpen}
            onClose={() => setEditSheetOpen(false)}
            mother={selectedMother}
          />
        </>
      )}
    </div>
  );
};

export default MothersPage;

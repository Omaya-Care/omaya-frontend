import { useState } from "react";
import { Plus } from "lucide-react";
import { useStaff } from "../hooks/useStaff";
import {
  StaffRow,
  PermissionsMatrix,
  AddStaffModal,
  AddRoleModal,
} from "../components/staff";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/skeleton";
import { StaffRole } from "../types";

type FilterKey = "All" | StaffRole;

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: "All", label: "All" },
  { key: "Administrator", label: "Administrators" },
  { key: "Physician", label: "Physicians" },
  { key: "Midwife", label: "Midwifes" },
  { key: "Coordinator", label: "Coordinators" },
];

const StaffPage = () => {
  const { data: staffMembers = [], isLoading } = useStaff();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("All");
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [addRoleOpen, setAddRoleOpen] = useState(false);

  if (isLoading && staffMembers.length === 0) {
    return (
      <div className="flex flex-col gap-6 overflow-y-auto h-full">
        <div className="space-y-1">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-5 w-52" />
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-8 w-28 rounded-full" />
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-3 border-b border-gray-100">
            <div className="grid grid-cols-[1fr_160px_144px_180px] gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-4 w-16" />
              ))}
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="px-6 py-4">
                <div className="grid grid-cols-[1fr_160px_144px_180px] gap-4 items-center">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-36" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-4 w-24 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeCount = staffMembers.filter((s) => s.status === "active").length;
  const invitedCount = staffMembers.filter(
    (s) => s.status === "invited",
  ).length;

  const counts: Record<FilterKey, number> = {
    All: staffMembers.length,
    Administrator: staffMembers.filter((s) => s.role === "Administrator")
      .length,
    Physician: staffMembers.filter((s) => s.role === "Physician").length,
    Midwife: staffMembers.filter((s) => s.role === "Midwife").length,
    Coordinator: staffMembers.filter((s) => s.role === "Coordinator").length,
  };

  const visibleStaff =
    activeFilter === "All"
      ? staffMembers
      : staffMembers.filter((s) => s.role === activeFilter);

  return (
    <div className="flex flex-col gap-6 overflow-y-auto h-full">
      {/* PAGE HEADER */}
      <div className="flex items-start justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff & roles</h1>
          <p className="text-sm text-gray-500 mt-1">
            {activeCount} active · {invitedCount} invited
          </p>
        </div>
        <Button
          variant="default"
          className="flex items-center gap-1.5"
          onClick={() => setAddStaffOpen(true)}
        >
          <Plus size={16} />
          <span>Add staff member</span>
        </Button>
      </div>

      {/* FILTER PILLS */}
      <div className="flex gap-2 flex-wrap flex-shrink-0 -mt-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`rounded-full px-3 py-1 text-sm transition-colors border ${
              activeFilter === f.key
                ? "bg-[#F7E8F0] text-[#93406B] border-[#93406B] font-medium"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f.label} {counts[f.key]}
          </button>
        ))}
      </div>

      {/* STAFF TABLE */}
      <div className="bg-white rounded-2xl shadow-sm flex-shrink-0 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Column headers */}
            <div className="grid grid-cols-[1fr_160px_144px_180px] px-6 py-3 border-b border-gray-100">
              {["Name", "Role", "Status", "Last active"].map((col, i) => (
                <span
                  key={col}
                  className={`text-xs font-medium text-gray-400 uppercase tracking-wide ${i === 3 ? "text-right" : ""}`}
                >
                  {col}
                </span>
              ))}
            </div>

            {/* Rows */}
            {visibleStaff.map((member) => (
              <StaffRow key={member.id} member={member} />
            ))}
          </div>
        </div>
      </div>

      {/* ROLES & PERMISSIONS */}
      <div className="flex-shrink-0 pb-6">
        <PermissionsMatrix onAddRole={() => setAddRoleOpen(true)} />
      </div>

      {/* MODALS */}
      <AddStaffModal
        isOpen={addStaffOpen}
        onClose={() => setAddStaffOpen(false)}
      />
      <AddRoleModal
        isOpen={addRoleOpen}
        onClose={() => setAddRoleOpen(false)}
      />
    </div>
  );
};

export default StaffPage;

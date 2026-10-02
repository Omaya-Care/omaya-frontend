import { useState } from "react";
import { Plus, Users, AlertCircle } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { useStaff } from "@/hooks/useStaff";
import { useRoles } from "@/hooks/useRoles";
import { StaffRow } from "@/components/staff/StaffRow";
import { PermissionsMatrix } from "@/components/staff/PermissionsMatrix";
import { AddStaffModal } from "@/components/staff/AddStaffModal";
import { AddRoleModal } from "@/components/staff/AddRoleModal";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/skeleton";

// Same card shell as the Settings page sections.
const CARD =
  "flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)]";
const GRID = "grid grid-cols-[1fr_160px_144px_160px_44px] gap-4";

const StaffPage = () => {
  const { can } = usePermissions();
  const { data: staffMembers, isLoading, isError } = useStaff();
  const { data: roles } = useRoles();
  const [activeFilter, setActiveFilter] = useState("All");
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [addRoleOpen, setAddRoleOpen] = useState(false);

  const canManage = can("manage_staff");

  if (isLoading && staffMembers.length === 0) {
    return (
      <div className="px-8 py-10 sm:px-12 sm:py-14 lg:px-20 lg:py-16">
        <header className="space-y-1.5">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-5 w-52" />
        </header>
        <div className="mt-10 flex flex-col gap-4">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-8 w-28 rounded-full" />
            ))}
          </div>
          <div className={CARD}>
            <div className="border-b border-gray-200 px-5 py-3">
              <div className={GRID}>
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-4 w-16" />
                ))}
                <span />
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="px-5 py-4">
                  <div className={`${GRID} items-center`}>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-36" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                    <span />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeCount = staffMembers.filter((s) => s.status === "active").length;
  const invitedCount = staffMembers.filter((s) => s.status === "invited").length;

  const filters = [
    { key: "All", label: "All" },
    ...roles.map((r) => ({ key: r.name, label: r.name })),
  ];

  const countByRole = (role: string) => staffMembers.filter((s) => s.role === role).length;

  const visibleStaff =
    activeFilter === "All" ? staffMembers : staffMembers.filter((s) => s.role === activeFilter);

  return (
    <div className="px-8 py-10 sm:px-12 sm:py-14 lg:px-20 lg:py-16">
      {/* Right padding keeps the action button clear of the floating bell. */}
      <header className="flex items-start justify-between gap-4 pr-12">
        <div>
          <h1 className="text-2xl font-normal tracking-tight text-foreground">Staff & roles</h1>
          <p className="mt-1 text-sm text-gray-400">
            {staffMembers.length > 0
              ? `${activeCount} active · ${invitedCount} invited`
              : "No members yet"}
          </p>
        </div>
        <span
          title={canManage ? "Add a new staff member" : "You don't have permission to manage staff"}
          className={!canManage ? "cursor-not-allowed" : ""}
        >
          <Button
            variant="default"
            className="flex items-center gap-1.5"
            onClick={() => setAddStaffOpen(true)}
            disabled={!canManage}
          >
            <Plus size={16} />
            <span>Add staff member</span>
          </Button>
        </span>
      </header>

      <div className="mt-10 flex flex-col gap-4">
        {/* FILTER PILLS */}
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              aria-pressed={activeFilter === f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                activeFilter === f.key
                  ? "border-primary bg-primary-100 font-medium text-primary"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f.label} {f.key === "All" ? staffMembers.length : countByRole(f.key)}
            </button>
          ))}
        </div>

        {/* STAFF TABLE */}
        <section className={CARD}>
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Column headers */}
              <div className="grid grid-cols-[1fr_160px_144px_160px_44px] border-b border-gray-200 px-5 py-3">
                {["Name", "Role", "Status", "Last active"].map((col) => (
                  <span key={col} className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    {col}
                  </span>
                ))}
                <span />
              </div>

              {/* Rows */}
              {isError ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                  <AlertCircle size={28} className="text-red-200" />
                  <p className="text-sm font-normal text-gray-400">Could not load staff members.</p>
                </div>
              ) : visibleStaff.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                  <Users size={28} className="text-gray-200" />
                  <p className="text-sm font-normal text-gray-400">
                    {activeFilter === "All"
                      ? "No staff members yet."
                      : `No ${activeFilter} members found.`}
                  </p>
                  {activeFilter !== "All" && (
                    <button
                      type="button"
                      onClick={() => setActiveFilter("All")}
                      className="mt-0.5 text-xs font-medium text-primary hover:underline"
                    >
                      Clear filter
                    </button>
                  )}
                </div>
              ) : (
                visibleStaff.map((member) => <StaffRow key={member.id} member={member} />)
              )}
            </div>
          </div>
        </section>

        {/* ROLES & PERMISSIONS */}
        <PermissionsMatrix onAddRole={() => setAddRoleOpen(true)} />
      </div>

      {/* MODALS */}
      <AddStaffModal isOpen={addStaffOpen} onClose={() => setAddStaffOpen(false)} />
      <AddRoleModal isOpen={addRoleOpen} onClose={() => setAddRoleOpen(false)} />
    </div>
  );
};

export default StaffPage;

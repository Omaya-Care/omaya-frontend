import { useState } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { MoreHorizontal, Pencil, Ban, RotateCcw, Trash2, Loader2 } from "lucide-react";
import { staffErrorMessage, type StaffMember, type StaffStatus } from "@/hooks/useStaff";
import { Button } from "@/components/ui/Button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { EditClinicianModal } from "./EditClinicianModal";
import { useUpdateClinician, useDeleteClinician } from "@/hooks/useStaffMutations";
import { toast } from "@/lib/notify";
import { cn } from "@/lib/utils";

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatLastActive(iso: string | null): string {
  if (!iso) return "Never";
  try {
    const dist = formatDistanceToNow(parseISO(iso), { addSuffix: true });
    return dist.replace("less than a minute ago", "Just now");
  } catch {
    return "Unknown";
  }
}

interface StaffRowProps {
  member: StaffMember;
}

const statusConfig: Record<StaffStatus, { className: string; dot: string; label: string }> = {
  active: { className: "bg-primary-100 border-primary-100 text-primary-700", dot: "bg-primary-700", label: "Active" },
  invited: { className: "bg-yellow-50 border-yellow-200 text-yellow-700", dot: "bg-yellow-500", label: "Invited" },
  suspended: { className: "bg-red-50 border-red-200 text-red-600", dot: "bg-red-500", label: "Suspended" },
};

const pill = "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium";

const menuItem =
  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors disabled:pointer-events-none disabled:opacity-50";

const StaffRow = ({ member }: StaffRowProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const updateClinician = useUpdateClinician();
  const deleteClinician = useDeleteClinician();

  const { className: statusClass, dot, label } = statusConfig[member.status];
  const isSelf = member.isCurrentUser ?? false;
  const isSuspended = member.status === "suspended";

  const handleSuspendToggle = async () => {
    setMenuOpen(false);
    const newStatus = isSuspended ? "active" : "suspended";
    try {
      await updateClinician.mutateAsync({ clinicianId: member.id, status: newStatus });
      toast.success(isSuspended ? `${member.name} reactivated.` : `${member.name} suspended.`);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      const known = staffErrorMessage(err);
      if (known) {
        toast.error(known);
      } else if (status === 403) {
        toast.error("You don't have permission to make this change.");
      } else {
        toast.error("Could not update status. Please try again.");
      }
    }
  };

  const handleDelete = async () => {
    try {
      await deleteClinician.mutateAsync(member.id);
      toast.success(`${member.name} has been removed.`);
      setDeleteOpen(false);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      const known = staffErrorMessage(err);
      if (known) {
        toast.error(known);
      } else if (status === 403) {
        toast.error("You don't have permission to make this change.");
      } else {
        toast.error("Could not remove staff member. Please try again.");
      }
    }
  };

  return (
    <>
      <div className="grid grid-cols-[1fr_160px_144px_160px_44px] items-center border-b border-gray-200 px-5 py-4 transition-colors last:border-0 hover:bg-gray-50">
        {/* NAME */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 select-none items-center justify-center rounded-full bg-[#7A2850]/10 text-sm font-medium text-[#7A2850]">
            {initials(member.name || member.email)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-medium text-gray-900">{member.name}</span>
              {isSelf && (
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">You</span>
              )}
            </div>
            <span className="block truncate text-sm text-gray-400">{member.email}</span>
          </div>
        </div>

        {/* ROLE */}
        <div>
          <span className={cn(pill, "border-gray-100 bg-gray-100 text-gray-600")}>{member.role}</span>
        </div>

        {/* STATUS */}
        <div>
          <span className={cn(pill, statusClass)}>
            <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", dot)} />
            {label}
          </span>
        </div>

        {/* LAST ACTIVE */}
        <div>
          <span className="text-sm text-gray-400">{formatLastActive(member.lastActiveAt)}</span>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end">
          <Popover open={menuOpen} onOpenChange={setMenuOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Actions for ${member.name || member.email}`}
                className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 data-[state=open]:bg-gray-100"
              >
                <MoreHorizontal size={16} />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-44 p-1">
              <div role="menu" className="flex flex-col">
                <button
                  type="button"
                  role="menuitem"
                  className={cn(menuItem, "hover:bg-gray-100")}
                  onClick={() => {
                    setMenuOpen(false);
                    setEditOpen(true);
                  }}
                >
                  <Pencil size={14} />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className={cn(menuItem, "hover:bg-gray-100")}
                  disabled={isSelf || updateClinician.isPending}
                  onClick={handleSuspendToggle}
                >
                  {isSuspended ? (
                    <>
                      <RotateCcw size={14} />
                      <span>Reactivate</span>
                    </>
                  ) : (
                    <>
                      <Ban size={14} />
                      <span>Suspend</span>
                    </>
                  )}
                </button>

                <hr className="-mx-1 my-1 h-px border-0 bg-gray-200" />

                <button
                  type="button"
                  role="menuitem"
                  className={cn(menuItem, "text-red-600 hover:bg-red-50")}
                  disabled={isSelf}
                  onClick={() => {
                    setMenuOpen(false);
                    setDeleteOpen(true);
                  }}
                >
                  <Trash2 size={14} />
                  <span>Remove</span>
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editOpen && (
        <EditClinicianModal
          key={member.id}
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          member={member}
        />
      )}

      {/* DELETE CONFIRM */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove staff member?</DialogTitle>
            <DialogDescription>
              <strong>{member.name}</strong> will lose access immediately. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="ghost"
              onClick={() => setDeleteOpen(false)}
              disabled={deleteClinician.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteClinician.isPending}
              className="flex items-center gap-2"
            >
              {deleteClinician.isPending && <Loader2 size={16} className="animate-spin" />}
              {deleteClinician.isPending ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { StaffRow };

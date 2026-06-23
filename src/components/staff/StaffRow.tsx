import { useState } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { MoreHorizontal, Pencil, Ban, RotateCcw, Trash2, Loader2 } from "lucide-react";
import { StaffMember, StaffStatus } from "../../types";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { EditClinicianModal } from "./EditClinicianModal";
import { useUpdateClinician, useDeleteClinician } from "../../hooks/useMutations";
import { toast } from "sonner";

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

const statusConfig: Record<StaffStatus, { className: string; label: string }> = {
  active:    { className: "bg-primary-100 border-primary-100 text-primary-700", label: "Active"    },
  invited:   { className: "bg-yellow-50   border-yellow-200   text-yellow-700",  label: "Invited"   },
  suspended: { className: "bg-red-50      border-red-200      text-red-600",     label: "Suspended" },
};

const StaffRow = ({ member }: StaffRowProps) => {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const updateClinician = useUpdateClinician();
  const deleteClinician = useDeleteClinician();

  const { className: statusClass, label } = statusConfig[member.status];
  const isSelf = member.isCurrentUser ?? false;
  const isSuspended = member.status === "suspended";

  const handleSuspendToggle = async () => {
    const newStatus = isSuspended ? "active" : "suspended";
    try {
      await updateClinician.mutateAsync({ clinicianId: member.id, status: newStatus });
      toast.success(isSuspended ? `${member.name} reactivated.` : `${member.name} suspended.`);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 403) {
        toast.error("You cannot suspend yourself.");
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
      if (status === 403) {
        toast.error("You cannot remove yourself.");
      } else {
        toast.error("Could not remove staff member. Please try again.");
      }
    }
  };

  return (
    <>
      <div className="grid grid-cols-[1fr_160px_144px_160px_44px] items-center px-6 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
        {/* NAME */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-100 text-primary font-semibold text-sm flex items-center justify-center flex-shrink-0">
            {initials(member.name || member.email)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-gray-900">{member.name}</span>
              {isSelf && (
                <span className="text-xs bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">You</span>
              )}
            </div>
            <span className="text-sm text-gray-400">{member.email}</span>
          </div>
        </div>

        {/* ROLE */}
        <div>
          <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-100" size="sm">
            {member.role}
          </Badge>
        </div>

        {/* STATUS */}
        <div>
          <Badge variant="outline" className={statusClass} size="sm" dot>
            {label}
          </Badge>
        </div>

        {/* LAST ACTIVE */}
        <div>
          <span className="text-sm text-gray-400">{formatLastActive(member.lastActiveAt)}</span>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 data-[state=open]:bg-gray-100"
              >
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                className="gap-2 cursor-pointer"
                onClick={() => setEditOpen(true)}
              >
                <Pencil size={14} />
                <span>Edit</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="gap-2 cursor-pointer"
                disabled={isSelf || updateClinician.isPending}
                onClick={handleSuspendToggle}
              >
                {isSuspended
                  ? <><RotateCcw size={14} /><span>Reactivate</span></>
                  : <><Ban size={14} /><span>Suspend</span></>}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                disabled={isSelf}
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 size={14} />
                <span>Remove</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">Remove staff member?</DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-1">
              <strong>{member.name}</strong> will lose access immediately. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleteClinician.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="default"
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

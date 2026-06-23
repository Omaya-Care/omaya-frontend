import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Alert, AlertDescription } from "../ui/alert";
import { useUpdateClinician } from "../../hooks/useMutations";
import { useRoles } from "../../hooks/useRoles";
import { StaffMember, StaffRole } from "../../types";
import { toast } from "sonner";

interface EditClinicianModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: StaffMember;
}

const EditClinicianModal = ({ isOpen, onClose, member }: EditClinicianModalProps) => {
  // Seeding local edit state from `member` is correct here: the call site
  // (StaffRow) passes key={member.id}, so this modal remounts per member and
  // never holds a stale copy.
  // react-doctor-disable-next-line react-doctor/no-derived-useState
  const [name, setName] = useState(member.name);
  // react-doctor-disable-next-line react-doctor/no-derived-useState
  const [selectedRole, setSelectedRole] = useState<StaffRole>(member.role);
  const [error, setError] = useState<string | null>(null);

  const updateClinician = useUpdateClinician();
  const { data: roles = [], isLoading: rolesLoading } = useRoles();

  const hasChanges = name.trim() !== member.name || selectedRole !== member.role;
  const canSubmit = name.trim() !== "" && hasChanges && !updateClinician.isPending;

  const handleClose = () => {
    setName(member.name);
    setSelectedRole(member.role);
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    setError(null);
    const body: { name?: string; role?: StaffRole } = {};
    if (name.trim() !== member.name) body.name = name.trim();
    if (selectedRole !== member.role) body.role = selectedRole;

    try {
      await updateClinician.mutateAsync({ clinicianId: member.id, ...body });
      toast.success("Staff member updated.");
      onClose();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 403) {
        setError("You cannot change your own role.");
      } else if (status === 404) {
        setError("This staff member no longer exists.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Edit staff member
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 mt-1">
            Update {member.name.split(" ")[0]}'s name or role.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mt-5 flex flex-col gap-4">
          <Input
            label="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-clinician-role" className="text-sm font-medium text-gray-700 ml-0.5">
              Role
            </label>
            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as StaffRole)}>
              <SelectTrigger id="edit-clinician-role" className="w-full" disabled={rolesLoading}>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.name}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="mt-7">
          <Button variant="outline" onClick={handleClose} disabled={updateClinician.isPending}>
            Cancel
          </Button>
          <Button
            variant="default"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="flex items-center gap-2"
          >
            {updateClinician.isPending && <Loader2 size={16} className="animate-spin" />}
            {updateClinician.isPending ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { EditClinicianModal };

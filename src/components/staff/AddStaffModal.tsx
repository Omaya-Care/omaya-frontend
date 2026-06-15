import { useState } from "react";
import { Loader2, AlertCircle, MailWarning } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/Button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "../ui/alert";
import { useAddStaff } from "../../hooks/useMutations";
import { StaffRole } from "../../types";
import { toast } from "sonner";

const ROLE_OPTIONS: Array<{ value: StaffRole; desc: string }> = [
  { value: "Physician",     desc: "View and manage clinical records." },
  { value: "Midwife",       desc: "Care delivery and escalation." },
  { value: "Coordinator",   desc: "Scheduling and discharges." },
  { value: "Paediatrician", desc: "Newborn assessments and reviews." },
  { value: "Psychologist",  desc: "Mental health assessments and support." },
  { value: "Administrator", desc: "Full access including staff management." },
];

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddStaffModal = ({ isOpen, onClose }: AddStaffModalProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<StaffRole | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inviteWarning, setInviteWarning] = useState(false);

  const addStaff = useAddStaff();

  const canSubmit =
    name.trim() !== "" &&
    email.trim() !== "" &&
    selectedRole !== null &&
    !addStaff.isPending;

  const handleClose = () => {
    setName("");
    setEmail("");
    setSelectedRole(null);
    setError(null);
    setInviteWarning(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedRole) return;
    setError(null);

    try {
      const result = await addStaff.mutateAsync({ name, email, role: selectedRole });
      if (!result.invite_sent) {
        setInviteWarning(true);
      } else {
        toast.success(`Invite sent to ${email}.`);
        handleClose();
      }
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        setError("This email is already registered. Use a different email address.");
      } else if (status === 403) {
        setError("You don't have permission to add staff members.");
      } else {
        toast.error("Something went wrong. Please try again.");
        setError("Something went wrong. Please try again.");
      }
    }
  };

  // Post-success state: invite email failed
  if (inviteWarning) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Account created
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-1">
              The staff member was added but the invite email failed to send.
            </DialogDescription>
          </DialogHeader>

          <Alert className="mt-4 border-amber-200 bg-amber-50">
            <MailWarning className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700 text-sm">
              The invite email didn't reach <strong>{email}</strong>. Ask them to use
              "Forgot password" to set their password and gain access.
            </AlertDescription>
          </Alert>

          <DialogFooter className="mt-6">
            <Button variant="default" onClick={handleClose}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Add a staff member
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 mt-1">
            They'll receive an email to set their own password.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Fields */}
        <div className="mt-5 flex flex-col gap-4">
          <Input
            label="Full name"
            placeholder="e.g. Abena Mensah"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          <Input
            label="Work email"
            type="email"
            placeholder="name@korlebu.gov.gh"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />
        </div>

        {/* Role selector */}
        <div className="mt-5">
          <label className="text-sm font-medium text-gray-700">Role</label>
          <div className="grid grid-cols-2 gap-2.5 mt-2">
            {ROLE_OPTIONS.map((r) => {
              const selected = selectedRole === r.value;
              return (
                <div
                  key={r.value}
                  onClick={() => setSelectedRole(r.value)}
                  className={`border rounded-xl p-3 cursor-pointer transition-all ${
                    selected
                      ? "border-[#93406B] bg-[#F7E8F0]"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <span className={`text-sm font-semibold ${selected ? "text-[#93406B]" : "text-gray-900"}`}>
                    {r.value}
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5 font-normal">{r.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-3 mt-7">
          <Button variant="outline" onClick={handleClose} disabled={addStaff.isPending}>
            Cancel
          </Button>
          <Button
            variant="default"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="flex items-center gap-2"
          >
            {addStaff.isPending && <Loader2 size={16} className="animate-spin" />}
            {addStaff.isPending ? "Sending invite..." : "Send invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { AddStaffModal };

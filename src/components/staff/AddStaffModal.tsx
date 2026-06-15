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
import { Input } from "@/components/ui/input";
import { useAddStaff } from "../../hooks/useMutations";
import { extractApiError } from "../../lib/api";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";

type TabKey = "invite" | "create";
type RoleOption = "Administrator" | "Physician" | "Midwife" | "Coordinator";

// Map UI roles to API roles (lowercase strings from the spec)
const ROLE_MAP: Record<RoleOption, string> = {
  Administrator: "hospital_admin",
  Physician: "ob_gyn",
  Midwife: "midwife",
  Coordinator: "midwife", // Or whatever makes sense for coordinator if not in spec
};

const ROLE_OPTIONS: Array<{ value: RoleOption; desc: string }> = [
  { value: "Administrator", desc: "Full access to all portal features." },
  { value: "Physician", desc: "View and manage clinical records." },
  { value: "Midwife", desc: "Care delivery and escalation." },
  { value: "Coordinator", desc: "Scheduling and discharges." },
];

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddStaffModal = ({ isOpen, onClose }: AddStaffModalProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>("invite");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<RoleOption | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addStaffMutation = useAddStaff();

  const canSubmit =
    name.trim() !== "" &&
    email.trim() !== "" &&
    selectedRole !== null &&
    !addStaffMutation.isPending;

  const handleClose = () => {
    setName("");
    setEmail("");
    setSelectedRole(null);
    setActiveTab("invite");
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedRole) return;
    setError(null);

    try {
      await addStaffMutation.mutateAsync({
        name,
        email,
        role: ROLE_MAP[selectedRole],
      });
      handleClose();
    } catch (err) {
      setError(
        extractApiError(
          err,
          "Failed to add staff member. Email might be already taken.",
        ).message,
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Add a staff member
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 mt-1">
            Invite them by email, or create the account directly.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="mt-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Toggle tabs */}
        <div className="flex mt-5 bg-gray-100 rounded-lg p-0.5 gap-0.5">
          {[
            { key: "invite" as TabKey, label: "Invite by email" },
            { key: "create" as TabKey, label: "Create directly" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 text-sm py-1.5 rounded-md transition-all ${
                activeTab === tab.key
                  ? "bg-white border border-gray-300 font-medium shadow-sm text-gray-800"
                  : "text-gray-400 font-normal hover:text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div className="mt-5 flex flex-col gap-4">
          <Input
            label="Full name"
            placeholder="e.g. Abena Mensah"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          <div className="flex flex-col gap-1.5">
            <Input
              label="Work email"
              type="email"
              placeholder="name@korlebu.gov.gh"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
            />
            {activeTab === "invite" && (
              <span className="text-xs text-gray-400">
                They'll get an email to set up their own password.
              </span>
            )}
          </div>
        </div>

        {/* Role selector */}
        <div className="mt-5">
          <label className="text-sm font-medium text-gray-700">Role</label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {ROLE_OPTIONS.map((r) => (
              <div
                key={r.value}
                onClick={() => setSelectedRole(r.value)}
                className={`border rounded-xl p-3 cursor-pointer transition-all ${
                  selectedRole === r.value
                    ? "border-[#93406B] bg-[#F7E8F0]"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <span
                  className={`text-sm font-semibold ${selectedRole === r.value ? "text-[#93406B]" : "text-gray-900"}`}
                >
                  {r.value}
                </span>
                <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-3 mt-7">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={addStaffMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="flex items-center gap-2"
          >
            {addStaffMutation.isPending && (
              <Loader2 size={16} className="animate-spin" />
            )}
            {addStaffMutation.isPending
              ? "Saving..."
              : activeTab === "invite"
                ? "Send invite"
                : "Create account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { AddStaffModal };

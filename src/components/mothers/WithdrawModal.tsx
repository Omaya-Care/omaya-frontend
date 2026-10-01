import { useState } from "react";
import { Loader2, XCircle } from "lucide-react";
import { toast } from "@/lib/notify";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { api } from "@/lib/api";

export function WithdrawModal({
  open,
  onClose,
  onWithdrawn,
  motherId,
  motherName,
}: {
  open: boolean;
  onClose: () => void;
  onWithdrawn: () => void;
  motherId: string;
  motherName: string;
}) {
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);

  const close = () => {
    if (pending) return;
    setReason("");
    onClose();
  };

  const confirm = async () => {
    setPending(true);
    try {
      await api.post(`/mothers/${motherId}/withdraw`, { reason, send_confirmation_sms: true });
      toast.success("Mother withdrawn from program.");
      setReason("");
      onWithdrawn();
      onClose();
    } catch {
      toast.error("Could not withdraw. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal open={open} onClose={close} labelledBy="withdraw-title">
      <div className="flex items-start gap-3">
        <XCircle className="mt-0.5 size-6 shrink-0 text-red-500" />
        <div>
          <h2 id="withdraw-title" className="text-lg font-medium leading-tight text-gray-900">Withdraw {motherName}?</h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            This pauses all outreach and cancels her scheduled calls. She'll be marked{" "}
            <strong className="font-semibold">Inactive</strong> and her record becomes read-only.
            You can still view it for audit.
          </p>
        </div>
      </div>

      <label htmlFor="withdraw-reason" className="mt-5 mb-1.5 block text-sm font-medium text-gray-700">
        Reason for withdrawal <span className="font-normal text-gray-400">(optional)</span>
      </label>
      <textarea
        id="withdraw-reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="e.g. Mother requested no further calls."
        rows={3}
        className="w-full resize-none rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />

      <div className="mt-5 flex justify-end gap-3">
        <Button variant="outline" onClick={close} disabled={pending}>
          Cancel
        </Button>
        <Button onClick={confirm} disabled={pending}>
          {pending && <Loader2 className="animate-spin" />}
          Withdraw consent
        </Button>
      </div>
    </Modal>
  );
}

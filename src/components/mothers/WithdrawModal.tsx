import { useState } from 'react';
import { Loader2, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/Button';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  motherName: string;
  isPending?: boolean;
}

const WithdrawModal = ({ isOpen, onClose, onConfirm, motherName, isPending = false }: WithdrawModalProps) => {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    onConfirm(reason);
  };

  const handleClose = () => {
    if (isPending) return;
    onClose(); // reason resets via the `key` at the call site on the next open
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <XCircle size={24} className="text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900 leading-tight">
                Withdraw {motherName}?
              </DialogTitle>
              <DialogDescription className="mt-3 text-sm text-gray-600 font-normal leading-relaxed">
                This pauses all outreach and cancels her scheduled calls.
                She'll be marked <strong className="font-semibold">Inactive</strong> and her record becomes
                read-only. You can still view it for audit.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4">
          <label htmlFor="withdraw-reason" className="text-sm font-medium text-gray-700 block mb-1.5">
            Reason for withdrawal <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="withdraw-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Mother requested no further calls."
            rows={3}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
          />
        </div>

        <DialogFooter className="mt-4 flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="default" onClick={handleConfirm} disabled={isPending} className="gap-2">
            {isPending && <Loader2 size={16} className="animate-spin" />}
            Withdraw consent
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { WithdrawModal };

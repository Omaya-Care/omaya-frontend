import { XCircle } from 'lucide-react';
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
  onConfirm: () => void;
  motherName: string;
}

const WithdrawModal = ({ isOpen, onClose, onConfirm, motherName }: WithdrawModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
        <DialogFooter className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Withdraw consent
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { WithdrawModal };

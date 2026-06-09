import React from 'react';
import { XCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  motherName: string;
}

const WithdrawModal = ({ isOpen, onClose, onConfirm, motherName }: WithdrawModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="flex items-start gap-3">
        <XCircle size={24} className="text-red-500 mt-0.5 flex-shrink-0" />
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 leading-tight">Withdraw {motherName}?</h3>

          <div className="mt-3">
            <p className="text-sm text-gray-600 font-normal leading-relaxed">
              This pauses all outreach and cancels her scheduled calls.
              She'll be marked <strong className="font-semibold">Inactive</strong> and her record becomes
              read-only. You can still view it for audit.
            </p>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              Withdraw consent
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export { WithdrawModal };

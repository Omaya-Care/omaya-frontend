import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/Button';
import { Input } from '@/components/ui/input';

interface AddRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddRoleModal = ({ isOpen, onClose }: AddRoleModalProps) => {
  const [roleName, setRoleName] = useState('');
  const [description, setDescription] = useState('');

  const canSubmit = roleName.trim() !== '';

  const handleClose = () => {
    setRoleName('');
    setDescription('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">Add a role</DialogTitle>
          <DialogDescription className="text-sm text-gray-500 mt-1">
            New roles start with no permissions. Grant them in the matrix.
          </DialogDescription>
        </DialogHeader>

        {/* Fields */}
        <div className="mt-6 flex flex-col gap-4">
          <Input
            label="Role name"
            placeholder="e.g. Lactation consultant"
            value={roleName}
            onChange={e => setRoleName(e.target.value)}
            fullWidth
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={3}
              placeholder="What this role is responsible for"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 w-full resize-none focus:outline-none focus:ring-2 focus:ring-[#93406B] focus:border-transparent transition-all"
            />
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-3 mt-7">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button variant="default" disabled={!canSubmit}>Create role</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { AddRoleModal };

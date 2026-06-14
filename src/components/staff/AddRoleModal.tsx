import { useState } from 'react';
import { X } from 'lucide-react';
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30" onClick={handleClose} />
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-[calc(100vw-2rem)] sm:w-[440px] p-6 sm:p-8 mx-4 sm:mx-0"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-900">Add a role</h2>
        <p className="text-sm text-gray-500 mt-1">
          New roles start with no permissions. Grant them in the matrix.
        </p>

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

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-7">
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button variant="primary" disabled={!canSubmit}>Create role</Button>
        </div>
      </div>
    </div>
  );
};

export { AddRoleModal };

import { useState } from 'react';
import { Loader2, AlertCircle, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { useAddRole } from '../../hooks/useMutations';
import { RolePermissions } from '../../types';
import { toast } from 'sonner';

const PERMISSIONS: Array<{ key: keyof RolePermissions; label: string }> = [
  { key: 'view_mothers',      label: 'View mothers & alerts' },
  { key: 'message_mothers',   label: 'Message mothers' },
  { key: 'escalate',          label: 'Escalate & resolve alerts' },
  { key: 'create_discharges', label: 'Create discharges' },
  { key: 'manage_staff',      label: 'Manage staff & roles' },
];

const DEFAULT_PERMISSIONS: RolePermissions = {
  view_mothers: false,
  message_mothers: false,
  escalate: false,
  create_discharges: false,
  manage_staff: false,
};

interface AddRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddRoleModal = ({ isOpen, onClose }: AddRoleModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState<RolePermissions>({ ...DEFAULT_PERMISSIONS });
  const [error, setError] = useState<string | null>(null);

  const addRole = useAddRole();

  const canSubmit = name.trim() !== '' && !addRole.isPending;

  const handleClose = () => {
    setName('');
    setDescription('');
    setPermissions({ ...DEFAULT_PERMISSIONS });
    setError(null);
    onClose();
  };

  const togglePermission = (key: keyof RolePermissions) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async () => {
    setError(null);
    try {
      await addRole.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        permissions,
      });
      toast.success(`"${name.trim()}" role created.`);
      handleClose();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        setError('A role with this name already exists. Choose a different name.');
      } else if (status === 403) {
        setError("You don't have permission to create roles.");
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">Add a role</DialogTitle>
          <DialogDescription className="text-sm text-gray-500 mt-1">
            Define the role name and set its permissions.
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
            label="Role name"
            placeholder="e.g. Lactation Consultant"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />

          <Textarea
            label="Description"
            placeholder="What this role is responsible for (optional)"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700 ml-0.5">Permissions</span>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              {PERMISSIONS.map(({ key, label }, idx) => {
                const checked = permissions[key];
                return (
                  <button
                    key={key}
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    onClick={() => togglePermission(key)}
                    className={`w-full flex items-center justify-between px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                      idx !== PERMISSIONS.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <span className="text-sm text-gray-700">{label}</span>
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        checked
                          ? 'bg-primary border-primary'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      {checked && <Check size={12} className="text-white" strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-3 mt-7">
          <Button variant="outline" onClick={handleClose} disabled={addRole.isPending}>
            Cancel
          </Button>
          <Button
            variant="default"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="flex items-center gap-2"
          >
            {addRole.isPending && <Loader2 size={16} className="animate-spin" />}
            {addRole.isPending ? 'Creating...' : 'Create role'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { AddRoleModal };

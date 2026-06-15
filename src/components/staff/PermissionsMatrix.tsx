import { useState } from 'react';
import { Check, Loader2, Trash2, AlertCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { useRoles } from '../../hooks/useRoles';
import { useDeleteRole } from '../../hooks/useMutations';
import { api } from '../../lib/api';
import { RolePermissions } from '../../types';
import { toast } from 'sonner';

const PERMISSIONS: Array<{ key: keyof RolePermissions; label: string }> = [
  { key: 'view_mothers',      label: 'View mothers & alerts' },
  { key: 'message_mothers',   label: 'Message mothers' },
  { key: 'escalate',          label: 'Escalate & resolve alerts' },
  { key: 'create_discharges', label: 'Create discharges' },
  { key: 'manage_staff',      label: 'Manage staff & roles' },
];

interface PermissionsMatrixProps {
  onAddRole: () => void;
}

const PermissionsMatrix = ({ onAddRole }: PermissionsMatrixProps) => {
  const queryClient = useQueryClient();
  const { data: roles = [], isLoading, isError } = useRoles();
  const deleteRole = useDeleteRole();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draft, setDraft] = useState<Record<string, RolePermissions>>({});
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const deleteTarget = roles.find((r) => r.id === deleteTargetId);

  const startEditing = () => {
    const initial: Record<string, RolePermissions> = {};
    roles.forEach((r) => { initial[r.id] = { ...r.permissions }; });
    setDraft(initial);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setDraft({});
    setIsEditing(false);
  };

  const handleSave = async () => {
    const changed = roles.filter((r) => {
      const d = draft[r.id];
      if (!d) return false;
      return (Object.keys(d) as (keyof RolePermissions)[]).some(
        (p) => d[p] !== r.permissions[p],
      );
    });

    if (changed.length === 0) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await Promise.all(
        changed.map((r) =>
          api.patch(`/admin/roles/${r.id}`, { permissions: draft[r.id] }),
        ),
      );
      await queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Permissions updated.');
      setIsEditing(false);
    } catch {
      toast.error('Could not save some changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggle = (roleId: string, perm: keyof RolePermissions) => {
    setDraft((prev) => ({
      ...prev,
      [roleId]: { ...prev[roleId], [perm]: !prev[roleId][perm] },
    }));
  };

  const handleDeleteRole = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteRole.mutateAsync(deleteTargetId);
      toast.success(`"${deleteTarget?.name}" role removed.`);
      setDeleteTargetId(null);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        toast.error(`Cannot delete "${deleteTarget?.name}" — it's still assigned to staff members.`);
      } else {
        toast.error('Could not delete role. Please try again.');
      }
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Roles & permissions</h3>
          <p className="text-sm text-gray-400 mt-0.5">What each role can do in the portal.</p>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleCancel} disabled={isSaving}>
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1.5"
              >
                {isSaving && <Loader2 size={14} className="animate-spin" />}
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className="border-[#93406B] text-[#93406B] hover:bg-[#F7E8F0]"
                onClick={startEditing}
                disabled={isLoading || isError}
              >
                Edit
              </Button>
              <Button variant="default" size="sm" onClick={onAddRole}>
                + Add role
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          <div className="flex gap-4">
            <Skeleton className="h-4 w-40" />
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-4 w-20 mx-auto" />)}
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4 items-center">
              <Skeleton className="h-4 w-40" />
              {[1, 2, 3, 4].map((j) => <Skeleton key={j} className="h-5 w-5 rounded mx-auto" />)}
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
          <AlertCircle size={16} className="text-red-300 flex-shrink-0" />
          <span>Could not load roles. Refresh the page to try again.</span>
        </div>
      )}

      {/* Matrix */}
      {!isLoading && !isError && roles.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 pr-6 text-xs font-medium text-gray-400 uppercase tracking-wide w-52">
                  Permission
                </th>
                {roles.map((role) => (
                  <th key={role.id} className="text-center py-2 px-4 text-xs font-medium text-gray-700 min-w-[96px]">
                    <div className="flex flex-col items-center gap-1">
                      <span>{role.name}</span>
                      <div className="flex items-center gap-1">
                        <span className={`text-[10px] font-normal ${role.isSystem ? 'text-gray-400' : 'text-[#93406B]'}`}>
                          {role.isSystem ? 'system' : 'custom'}
                        </span>
                        {isEditing && !role.isSystem && (
                          <button
                            onClick={() => setDeleteTargetId(role.id)}
                            className="text-red-300 hover:text-red-500 transition-colors ml-0.5"
                            title="Delete role"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map(({ key, label }, rowIdx) => (
                <tr key={key} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-3 pr-6 text-sm text-gray-700 font-normal">{label}</td>
                  {roles.map((role) => {
                    const checked = isEditing
                      ? (draft[role.id]?.[key] ?? role.permissions[key])
                      : role.permissions[key];
                    return (
                      <td key={role.id} className="py-3 px-4 text-center">
                        {isEditing ? (
                          <div
                            onClick={() => toggle(role.id, key)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer mx-auto transition-colors ${
                              checked
                                ? 'bg-[#93406B] border-[#93406B]'
                                : 'bg-white border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {checked && <Check size={12} className="text-white" strokeWidth={3} />}
                          </div>
                        ) : (
                          <span className={checked ? 'text-[#93406B] font-semibold' : 'text-gray-300'}>
                            {checked ? '✓' : '–'}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete role confirm */}
      <Dialog open={!!deleteTargetId} onOpenChange={() => setDeleteTargetId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Delete "{deleteTarget?.name}" role?
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-1">
              This role will be permanently removed. If staff members are still assigned to it, the deletion will be blocked.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setDeleteTargetId(null)}
              disabled={deleteRole.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleDeleteRole}
              disabled={deleteRole.isPending}
              className="flex items-center gap-2"
            >
              {deleteRole.isPending && <Loader2 size={16} className="animate-spin" />}
              {deleteRole.isPending ? 'Deleting...' : 'Delete role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { PermissionsMatrix };

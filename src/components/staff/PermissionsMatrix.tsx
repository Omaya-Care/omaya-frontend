import { useState } from 'react';
import { Check, Loader2, Trash2, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { reloadRoles, useRoles } from "@/hooks/useRoles";
import { useDeleteRole } from "@/hooks/useStaffMutations";
import { api } from "@/lib/api";
import { refreshPermissions, type RolePermissions } from "@/hooks/usePermissions";
import { toast } from "@/lib/notify";

const PERMISSIONS: Array<{ key: keyof RolePermissions; label: string }> = [
  { key: 'view_mothers',      label: 'View mothers & calls' },
  { key: 'message_mothers',   label: 'Message mothers' },
  { key: 'escalate',          label: 'View, acknowledge & resolve escalations' },
  { key: 'create_discharges', label: 'Create discharges' },
  { key: 'manage_staff',      label: 'Manage staff & roles' },
];

interface PermissionsMatrixProps {
  onAddRole: () => void;
}

const PermissionsMatrix = ({ onAddRole }: PermissionsMatrixProps) => {
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
      // /auth/me reports the permissions frozen into the caller's session
      // JWT, so if the editing admin changed their OWN role it takes effect
      // for them only after they sign in again (other staff likewise pick it
      // up on their next sign-in). Re-read anyway so nothing reads stale.
      reloadRoles();
      await refreshPermissions();
      toast.success('Permissions updated. Changes apply after each person signs in again.');
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
    <section className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)]">
      {/* Header — same shell as the Settings page sections. */}
      <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-3">
        <div>
          <h2 className="text-base font-medium text-gray-900">Roles & permissions</h2>
          <p className="mt-0.5 text-sm text-gray-400">What each role can do in the portal.</p>
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

      <div className="p-5">
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
                        <span className={`text-[10px] font-normal ${role.isSystem ? 'text-gray-400' : 'text-primary'}`}>
                          {role.isSystem ? 'system' : 'custom'}
                        </span>
                        {isEditing && !role.isSystem && (
                          <button
                            type="button"
                            onClick={() => setDeleteTargetId(role.id)}
                            className="text-red-300 hover:text-red-500 transition-colors ml-0.5"
                            title="Delete role"
                            aria-label={`Delete ${role.name} role`}
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
                          <button
                            type="button"
                            role="checkbox"
                            aria-checked={checked}
                            aria-label={`${label} for ${role.name}`}
                            onClick={() => toggle(role.id, key)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer mx-auto transition-colors ${
                              checked
                                ? 'bg-primary border-primary'
                                : 'bg-white border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {checked && <Check size={12} className="text-white" strokeWidth={3} />}
                          </button>
                        ) : (
                          <span className={checked ? 'text-primary font-semibold' : 'text-gray-300'}>
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

      </div>

      {/* Delete role confirm */}
      <Dialog open={!!deleteTargetId} onOpenChange={() => setDeleteTargetId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Delete "{deleteTarget?.name}" role?
            </DialogTitle>
            <DialogDescription>
              This role will be permanently removed. If staff members are still assigned to it, the deletion will be blocked.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="ghost"
              onClick={() => setDeleteTargetId(null)}
              disabled={deleteRole.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
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
    </section>
  );
};

export { PermissionsMatrix };

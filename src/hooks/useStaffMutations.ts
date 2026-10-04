import { useCallback, useState } from "react";
import { api } from "@/lib/api";
import type { RolePermissions } from "@/hooks/usePermissions";
import { reloadRoles } from "@/hooks/useRoles";
import { reloadStaff, type StaffRole } from "@/hooks/useStaff";

/** Minimal mutation wrapper: `mutateAsync` rethrows (callers branch on the
 *  axios status), `isPending` tracks the in-flight call, and `onSuccess`
 *  reloads the affected lists. */
function useMutation<A, R>(fn: (args: A) => Promise<R>, onSuccess: () => void) {
  const [isPending, setIsPending] = useState(false);
  const mutateAsync = useCallback(
    async (args: A): Promise<R> => {
      setIsPending(true);
      try {
        const result = await fn(args);
        onSuccess();
        return result;
      } finally {
        setIsPending(false);
      }
    },
    [fn, onSuccess],
  );
  return { mutateAsync, isPending };
}

export interface AddStaffResult {
  clinician_id: string;
  email: string;
  invite_sent: boolean;
  role: string;
}

async function addStaff(data: { name: string; email: string; role: StaffRole }) {
  const res = await api.post("/admin/clinicians", data);
  return res.data as AddStaffResult;
}

async function updateClinician({
  clinicianId,
  ...body
}: {
  clinicianId: string;
  name?: string;
  role?: StaffRole;
  status?: "active" | "suspended";
}) {
  const res = await api.patch(`/admin/clinicians/${clinicianId}`, body);
  return res.data as unknown;
}

async function deleteClinician(clinicianId: string) {
  await api.delete(`/admin/clinicians/${clinicianId}`);
}

async function addRole(data: { name: string; description?: string; permissions: RolePermissions }) {
  const res = await api.post("/admin/roles", data);
  return res.data as unknown;
}

async function deleteRole(roleId: string) {
  await api.delete(`/admin/roles/${roleId}`);
}

export const useAddStaff = () => useMutation(addStaff, reloadStaff);
export const useUpdateClinician = () => useMutation(updateClinician, reloadStaff);
export const useDeleteClinician = () => useMutation(deleteClinician, reloadStaff);
export const useAddRole = () => useMutation(addRole, reloadRoles);
export const useDeleteRole = () => useMutation(deleteRole, reloadRoles);

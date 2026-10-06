import { useEffect, useState } from "react";
import { api, extractApiError } from "@/lib/api";

export type StaffRole = string;

/** The roles a clinician seat can hold — the backend `ClinicianRole` Literal
 *  (`app/schemas/enums.py`). Custom roles from /admin/roles can't be assigned
 *  to a clinician yet, so the pickers offer only these. */
export const CLINICIAN_ROLES: readonly string[] = [
  "Receptionist",
  "Administrator",
  "Midwife",
  "Doctor",
  "Psychologist",
  "Lactation Consultant",
  "Postpartum Wellness Expert",
];

/** Roles offered when inviting: Administrator seats can't be created via the
 *  API (403 `administrator_create_forbidden`). */
export const isCreatableRole = (name: string) =>
  name !== "Administrator" && CLINICIAN_ROLES.includes(name);

/** Readable text for the staff endpoints' guard errors, or null if unknown. */
export function staffErrorMessage(err: unknown): string | null {
  switch (extractApiError(err).error_code) {
    case "administrator_create_forbidden":
      return "Administrator accounts can't be added here. Contact Omaya support to add one.";
    case "last_active_admin":
      return "This is the hospital's only active Administrator. Make another staff member an Administrator first.";
    case "cannot_edit_own_role":
      return "You cannot change your own role.";
    case "cannot_suspend_self":
      return "You cannot suspend yourself.";
    case "cannot_delete_self":
      return "You cannot remove yourself.";
    case "insufficient_role":
      return "You don't have permission to manage staff.";
    default:
      return null;
  }
}

export type StaffStatus = "active" | "invited" | "suspended";

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  status: StaffStatus;
  lastActiveAt: string | null;
  isCurrentUser?: boolean;
}

function toStaffMember(raw: Record<string, unknown>): StaffMember {
  return {
    id: raw.id as string,
    // Invited-but-not-activated seats can have a null name; default to "" so
    // initials()/edit-form state never crash on null.
    name: (raw.name as string | null) ?? "",
    email: raw.email as string,
    role: raw.role as StaffRole,
    status: raw.status as StaffStatus,
    lastActiveAt: (raw.last_active_at as string | null) ?? null,
    isCurrentUser: (raw.is_current_user as boolean | undefined) ?? false,
  };
}

// Every mounted useStaff() reloads when a staff mutation lands (the
// replacement for react-query's invalidateQueries(["staff"])).
const listeners = new Set<() => void>();

export function reloadStaff(): void {
  listeners.forEach((cb) => cb());
}

/** GET /admin/clinicians — the hospital's staff list. */
export function useStaff() {
  const [data, setData] = useState<StaffMember[] | null>(null);
  const [isError, setIsError] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const cb = () => setVersion((v) => v + 1);
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/admin/clinicians")
      .then((res) => {
        if (cancelled) return;
        const rows = (res.data?.clinicians ?? []) as Record<string, unknown>[];
        setData(rows.map(toStaffMember));
        setIsError(false);
      })
      .catch(() => {
        if (cancelled) return;
        setIsError(true);
        setData((d) => d ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, [version]);

  return { data: data ?? [], isLoading: data === null, isError, reload: reloadStaff };
}

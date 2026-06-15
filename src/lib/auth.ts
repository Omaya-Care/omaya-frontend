// Auth session storage — the portal JWT (8h TTL) + the current clinician
// profile. The token is a Bearer credential sent on every API request
// (see lib/api.ts); we persist it in localStorage so a page refresh keeps
// the session alive until the token expires server-side.

export type ClinicianRole =
  | "Administrator"
  | "Physician"
  | "Midwife"
  | "Coordinator"
  | "Paediatrician"
  | "Psychologist";

export interface Clinician {
  id: string;
  name: string | null;
  email: string;
  role: ClinicianRole;
  hospital_id: string;
  hospital_name: string;
}

const TOKEN_KEY = "omaya_token";
const CLINICIAN_KEY = "omaya_clinician";
// A seeded/legacy seat may sign in with must_change_password=true. The
// backend middleware 403s every non-auth route until the password is
// rotated, so we stash the flag and force the /change-password screen.
const MUST_CHANGE_KEY = "omaya_must_change";

export function setSession(
  token: string,
  clinician: Clinician,
  mustChange = false,
): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(CLINICIAN_KEY, JSON.stringify(clinician));
  localStorage.setItem(MUST_CHANGE_KEY, mustChange ? "1" : "");
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getClinician(): Clinician | null {
  const raw = localStorage.getItem(CLINICIAN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Clinician;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}

export function getMustChange(): boolean {
  return localStorage.getItem(MUST_CHANGE_KEY) === "1";
}

export function clearMustChange(): void {
  localStorage.setItem(MUST_CHANGE_KEY, "");
}

/** Replaces the stored JWT (e.g. after a password change) and clears the must-change flag. */
export function updateToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  clearMustChange();
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(CLINICIAN_KEY);
  localStorage.removeItem(MUST_CHANGE_KEY);
}

/** Initials for the avatar chip — first+last of the name, else the email. */
export function initialsOf(clinician: Clinician | null): string {
  if (!clinician) return "?";
  const name = clinician.name?.trim();
  if (name) {
    const parts = name.split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase() || name[0].toUpperCase();
  }
  return clinician.email[0]?.toUpperCase() ?? "?";
}

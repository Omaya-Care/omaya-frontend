// Auth session storage — the current clinician profile. The real session
// credential is the HttpOnly `omaya_session` cookie the browser holds (set
// by the backend, unreadable from JS); we can't store or inspect the JWT.
// The persisted profile is our client-side "a session is present" signal and
// powers the AppShell chrome; a page refresh keeps it until sign-out or a 401.

export type ClinicianRole =
  | "Administrator"
  | "Physician"
  | "Midwife"
  | "Coordinator"
  | "Paediatrician"
  | "Psychologist"
  // OMA-341 expert roster roles (bloom-backend migration 0057). "Psychologist"
  // above is shared — it's also a normal hospital-staff role; hospitalName is
  // what actually distinguishes an expert account, see isExpertAccount().
  | "Lactation Consultant"
  | "Postpartum Wellness Expert";

export interface Clinician {
  id: string;
  name: string | null;
  email: string;
  role: ClinicianRole;
  hospital_id: string;
  hospital_name: string;
}

const CLINICIAN_KEY = "omaya_clinician_v2";
/** The key other tabs watch to detect a sign-out here (see AppShell's `storage`
 *  listener). Exported so the cross-tab guard can't drift from the real key. */
export const SESSION_STORAGE_KEY = CLINICIAN_KEY;
// A seeded/legacy seat may sign in with must_change_password=true. The
// backend middleware 403s every non-auth route until the password is
// rotated, so we stash the flag and force the /change-password screen.
const MUST_CHANGE_KEY = "omaya_must_change_v2";
// Legacy keys from the pre-cookie (localStorage-Bearer) version. Cleared on
// sign-out for hygiene; a stale token here is now harmless (never read/sent).
const LEGACY_TOKEN_KEY = "omaya_token";
const LEGACY_CLINICIAN_KEY = "omaya_clinician";
const LEGACY_MUST_CHANGE_KEY = "omaya_must_change";

export function setSession(clinician: Clinician, mustChange = false): void {
  localStorage.setItem(CLINICIAN_KEY, JSON.stringify(clinician));
  localStorage.setItem(MUST_CHANGE_KEY, mustChange ? "1" : "");
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
  // The HttpOnly session cookie can't be read from JS, so the stored profile
  // is our signal that a session was established. A 401 (see lib/api.ts)
  // clears it if the cookie has since expired/been revoked.
  return getClinician() !== null;
}

export function getMustChange(): boolean {
  return localStorage.getItem(MUST_CHANGE_KEY) === "1";
}

export function clearMustChange(): void {
  localStorage.setItem(MUST_CHANGE_KEY, "");
}

export function clearSession(): void {
  localStorage.removeItem(CLINICIAN_KEY);
  localStorage.removeItem(MUST_CHANGE_KEY);
  // Hygiene: drop any leftovers from the pre-cookie version.
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(LEGACY_CLINICIAN_KEY);
  localStorage.removeItem(LEGACY_MUST_CHANGE_KEY);
}

// OMA-341: the one dedicated hospital expert clinician accounts live on
// (bloom-backend migration 0057 — app/models/clinician.py / the seed
// script). Hospital name, not role, is what actually identifies an expert
// account: "Psychologist" is also an ordinary hospital-staff role, so role
// name alone would misfire for a hospital's own psychologist. Compared
// directly against `hospital_name` (Clinician, localStorage profile) or
// `hospitalName` (Me, /auth/me) at each call site — the field naming
// differs between those two shapes, so this is a bare constant, not a
// shape-specific helper.
export const EXPERT_HOSPITAL_NAME = "Omaya (Expert Roster)";

/** Default landing route for a signed-in clinician. An expert-roster account
 * has no mothers of its own — Dashboard/Mothers/Calls are all empty for it —
 * so it lands on its actual work queue instead. */
export function defaultRouteFor(hospitalName: string | undefined): string {
  return hospitalName === EXPERT_HOSPITAL_NAME ? "/expert-requests" : "/dashboard";
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

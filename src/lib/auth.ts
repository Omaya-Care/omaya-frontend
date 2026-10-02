import { clearNotifications } from "./notify";

// Auth session storage — the current clinician profile. The real session
// credential is the HttpOnly `omaya_session` cookie the browser holds (set
// by the backend, unreadable from JS); we can't store or inspect the JWT.
// The persisted profile is our client-side "a session is present" signal;
// a page refresh keeps it until sign-out or a 401.

export type ClinicianRole =
  | "Administrator"
  | "Physician"
  | "Midwife"
  | "Coordinator"
  | "Paediatrician"
  | "Psychologist"
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
/** The key other tabs watch to detect a sign-out here (see the Sidebar's
 *  `storage` listener). Exported so the cross-tab guard can't drift from the
 *  real key. */
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
  // Toasts can carry a patient's name and outlive the protected routes.
  clearNotifications();
}


// The expert roster's tenant name — expert-only UI (e.g. the expert profile
// section in Settings) is gated on it.
export const EXPERT_HOSPITAL_NAME = "Omaya (Expert Roster)";

/** True for an account on the dedicated expert roster. Hospital name, not
 *  role, identifies an expert ("Psychologist" is also an ordinary hospital
 *  role). Reads the stored profile so the answer is synchronous — routing and
 *  the sidebar decide before /auth/me answers, and never disagree. */
export function isExpertAccount(clinician: Clinician | null = getClinician()): boolean {
  return clinician?.hospital_name === EXPERT_HOSPITAL_NAME;
}

/** Default landing route for a signed-in clinician. An expert-roster account
 *  has no mothers of its own — the hospital dashboard would be empty for it —
 *  so it lands on its actual work queue instead. */
export function defaultRouteFor(hospitalName: string | undefined): string {
  return hospitalName === EXPERT_HOSPITAL_NAME ? "/expert-requests" : "/dashboard";
}

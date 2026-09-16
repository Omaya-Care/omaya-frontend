// Shared field rules for the two onboarding wizards (AddMother, NewDischarge).
//
// These exist so a clinician finds out about a bad value on the step where she
// typed it, rather than from one generic banner after the final submit. Both
// wizards previously hand-rolled the same checks — NewDischarge wrote its step
// rules out TWICE (once to disable Continue, once to re-check in handleNext) —
// and the cross-field date rules existed nowhere on the client at all.
//
// Every rule here is mirrored by a server-side validator (backend
// `app/schemas/validators.py`). That is deliberate and the direction matters:
// the API is the real gate, and this module is the fast, local echo of it. Keep
// the two in step — if you loosen something here, loosen it there too, or the
// wizard will happily let a clinician fill in a form the server then rejects.
//
// Modelled on `components/onboarding/emergency-contacts.ts`, the other place
// shared validators already live.

import { parse, differenceInYears, isValid } from "date-fns";

// Mirrors MIN/MAX_MATERNAL_AGE_YEARS in the backend validators.
export const MIN_MATERNAL_AGE = 10;
export const MAX_MATERNAL_AGE = 60;

// Mirrors the `ge=0, le=30` bounds on gravida/para in the API schemas.
export const MIN_PARITY = 0;
export const MAX_PARITY = 30;

/** Parse a wizard `yyyy-MM-dd` string. Returns null for empty/malformed. */
export const parseFormDate = (value: string): Date | null => {
  if (!value) return null;
  const parsed = parse(value, "yyyy-MM-dd", new Date());
  return isValid(parsed) ? parsed : null;
};

/** Today at midnight — the comparison point for every "in the past" rule. */
export const startOfToday = (): Date => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

// ── Phone ───────────────────────────────────────────────────────────

/**
 * A local phone number is usable once it has >= 9 digits (the dial code is
 * held separately). This rule was written out four times across the two
 * wizards and the emergency-contacts editor; this is the one copy.
 */
export const phoneLocalDigitsValid = (localDigits: string): boolean =>
  localDigits.replace(/\D/g, "").length >= 9;

/** Strip a dial-code prefix and any separators off a stored phone value. */
export const localDigitsOf = (phone: string, countryCode: string): string =>
  phone.replace(countryCode, "").replace(/\D/g, "");

// ── Gravida / para ──────────────────────────────────────────────────

/**
 * Validate one parity field's range. Returns a message, or null when valid.
 *
 * The inputs used to silently swallow any keystroke that would push the value
 * over 30 — the field simply refused to change, with nothing on screen saying
 * why. Accept the input and explain the problem instead.
 */
export const parityRangeError = (value: string, label: string): string | null => {
  if (value === "") return null;
  const n = Number(value);
  if (!Number.isInteger(n)) return `${label} must be a whole number`;
  if (n < MIN_PARITY) return `${label} can't be negative`;
  if (n > MAX_PARITY) return `${label} must be ${MAX_PARITY} or less`;
  return null;
};

/**
 * Births can never exceed pregnancies. Reported against `para`, the field a
 * clinician is most likely to have mistyped — and the one the backend
 * attributes it to, so a server-side rejection highlights the same input.
 */
export const parityPairError = (gravida: string, para: string): string | null => {
  if (gravida === "" || para === "") return null;
  if (Number(para) > Number(gravida)) {
    return "Births (para) can't exceed pregnancies (gravida)";
  }
  return null;
};

/** The full parity picture: range on each, then the pair rule. */
export const gravidaError = (gravida: string): string | null =>
  parityRangeError(gravida, "Pregnancies (gravida)");

export const paraError = (gravida: string, para: string): string | null =>
  parityRangeError(para, "Births (para)") ?? parityPairError(gravida, para);

// ── Dates ───────────────────────────────────────────────────────────

/** Date of birth must be in the past and imply a plausible maternal age. */
export const dobError = (dob: string): string | null => {
  const parsed = parseFormDate(dob);
  if (!parsed) return null;
  const today = startOfToday();
  if (parsed >= today) return "Date of birth must be in the past";
  const age = differenceInYears(today, parsed);
  if (age < MIN_MATERNAL_AGE || age > MAX_MATERNAL_AGE) {
    return `That's an age of ${age} — please check the year`;
  }
  return null;
};

/**
 * A delivery must postdate the mother's own birth by a plausible age. Catches
 * the two dates being swapped, or a transposed year digit.
 */
export const deliveryVsDobError = (
  deliveryDate: string,
  dob: string,
): string | null => {
  const delivery = parseFormDate(deliveryDate);
  const born = parseFormDate(dob);
  if (!delivery || !born) return null;
  if (differenceInYears(delivery, born) < MIN_MATERNAL_AGE) {
    return "Delivery date is too close to her date of birth — please check both";
  }
  return null;
};

/**
 * Discharge cannot precede delivery.
 *
 * This is the rule that motivated the whole change: the backend enforced it,
 * but as a model-level validator whose error carried no field path, so the
 * wizard could only show a generic banner on the final step — after the mother
 * had already been created. Both dates sit on step 1, so it is checkable long
 * before submit.
 */
export const dischargeVsDeliveryError = (
  dischargeDate: string,
  deliveryDate: string,
): string | null => {
  const discharge = parseFormDate(dischargeDate);
  const delivery = parseFormDate(deliveryDate);
  if (!discharge || !delivery) return null;
  if (discharge < delivery) return "Discharge date can't be before the delivery date";
  return null;
};

// ── Aggregation ─────────────────────────────────────────────────────

/** A map of form-field name → error message for the fields currently invalid. */
export type FieldErrors = Record<string, string>;

/** Drop the nulls from a set of candidate rules. */
export const collectErrors = (
  candidates: Record<string, string | null>,
): FieldErrors => {
  const errors: FieldErrors = {};
  for (const [field, message] of Object.entries(candidates)) {
    if (message) errors[field] = message;
  }
  return errors;
};

/** True when a required value is absent. */
export const isEmpty = (value: string | unknown[]): boolean =>
  typeof value === "string" ? value.trim() === "" : value.length === 0;

/**
 * Build the errors for a set of required fields plus any extra rules.
 * `required` maps field name → { value, message }.
 */
export const requiredErrors = (
  required: Record<string, { value: string | unknown[]; message: string }>,
): FieldErrors => {
  const errors: FieldErrors = {};
  for (const [field, { value, message }] of Object.entries(required)) {
    if (isEmpty(value)) errors[field] = message;
  }
  return errors;
};

// ── Exclusive choices ───────────────────────────────────────────────

/**
 * Resolve a multi-select whose list contains answers that rule out the rest.
 *
 * "None sent home", "Not sure" and "No known risks" are not items in the list —
 * they are statements about the whole list, so they can't coexist with a real
 * selection or with each other. Ticking one clears everything else; ticking a
 * real item clears the exclusive answer.
 *
 * Deselecting is left alone: `next` shorter than `prev` means she un-ticked
 * something, which never needs resolving.
 */
export const applyExclusiveChoice = (
  next: string[],
  prev: string[],
  exclusive: readonly string[],
): string[] => {
  const added = next.filter((value) => !prev.includes(value));
  const addedExclusive = added.find((value) => exclusive.includes(value));
  if (addedExclusive) return [addedExclusive];
  if (added.length > 0) return next.filter((value) => !exclusive.includes(value));
  return next;
};

// ── Revealing errors ────────────────────────────────────────────────

/**
 * Which fields' errors are currently worth showing.
 *
 * The wizards used to gate every message on one `touched` flag that was only
 * ever set inside `handleNext` — and `handleNext` is unreachable while the
 * Continue button is disabled, which is exactly when there IS an error. The
 * result was a dead end: a greyed-out button and no stated reason.
 *
 * So reveal per field instead. A field speaks up as soon as the clinician has
 * touched it, and a failed submit reveals everything left on the step.
 */
/**
 * Fields whose rules are about a PAIR, not a value: discharge-vs-delivery,
 * delivery-vs-birth, births-vs-pregnancies. The message has to be pinned to
 * one of the two inputs, but either one can be the one that caused it — and
 * either can be the one the clinician never touched (`dischargeDate` is
 * prefilled with today, so a later delivery date breaks a field she never
 * went near). So touching one half reveals the other's message too.
 */
export const revealTogether = (
  field: string,
  groups: readonly (readonly string[])[],
): string[] => {
  const revealed = new Set<string>([field]);
  for (const group of groups) {
    if (group.includes(field)) for (const member of group) revealed.add(member);
  }
  return [...revealed];
};

export type ErrorReveal = {
  /** True once `field`'s error should be rendered. */
  shows: (field: string) => boolean;
  /**
   * Mark `field` as touched — call from the field's change handler. Also
   * reveals any field paired with it (see `revealTogether`).
   */
  touch: (field: string) => void;
  /** Reveal every error on the step (a failed Continue / a 422 coming back). */
  revealAll: () => void;
  /** Go quiet again — on step change, where the next step starts untouched. */
  reset: () => void;
};

// Pure form logic for the Edit Mother dialog: seed the form from a profile,
// validate what changed, and build the PATCH /mothers/{id} body. Kept out of
// the component file so Fast Refresh can preserve state and so it's testable.
//
// Contract (backend `EditMotherRequest`, extra="forbid"): every field is
// optional, only fields PRESENT are applied, and an explicit null is a no-op —
// the endpoint can never clear a value. So the body carries only the fields the
// clinician actually changed, and a stored value can't be blanked here.

import type { MotherProfile } from "@/hooks/useMother";
import {
  dobError,
  deliveryVsDobError,
  gravidaError,
  paraError,
  phoneLengthMessage,
  phoneLocalDigitsValid,
  type FieldErrors,
} from "@/lib/onboarding-validation";
import { COUNTRY_CODE_OPTIONS } from "@/components/onboarding/display";
import {
  RELATIONSHIP_OPTIONS,
  emergencyContactsValid,
  emptyEmergencyContact,
  type EmergencyContactForm,
} from "@/components/onboarding/emergency-contacts";
import type { ApiFieldError } from "@/lib/api";

/** Backend `CallWindow` literal. */
export const CALL_WINDOW_OPTIONS = [
  { value: "morning", label: "Morning 8am-11am" },
  { value: "afternoon", label: "Afternoon 12pm-3pm" },
  { value: "evening", label: "Evening 4pm-6pm" },
  { value: "inbound", label: "She will call in" },
];

/** Backend `DeliveryType` literal. */
export const DELIVERY_TYPE_OPTIONS = [
  { value: "vaginal", label: "Vaginal" },
  { value: "caesarean", label: "C-section" },
];

export interface EditMotherForm {
  countryCode: string;
  /** Local digits only — the dial code lives in `countryCode`. */
  phone: string;
  dateOfBirth: string;
  language: string;
  gravida: string;
  para: string;
  preferredCallWindow: string;
  deliveryType: string;
  deliveryDate: string;
  contacts: EmergencyContactForm[];
}

export type EditMotherField = Exclude<keyof EditMotherForm, "countryCode">;

/** The PATCH body — every key optional, matching `EditMotherRequest`. */
export interface EditMotherPayload {
  phone?: string;
  date_of_birth?: string;
  language?: string;
  gravida?: number;
  para?: number;
  preferred_call_window?: string;
  delivery_type?: string;
  delivery_date?: string;
  emergency_contacts?: { name: string; phone: string; relationship: string }[];
}

const KNOWN_CODES = COUNTRY_CODE_OPTIONS.map((o) => o.value);

/** Split a stored E.164 number into the dial-code select + local digits. A
 *  dial code the selector doesn't offer falls back to +233 with every digit
 *  kept (never sliced) — see `contactPhones` for how it survives a save. */
export function splitPhone(phone: string): { countryCode: string; phone: string } {
  const code = KNOWN_CODES.find((c) => phone.startsWith(c));
  if (code) return { countryCode: code, phone: phone.slice(code.length).replace(/\D/g, "") };
  return { countryCode: "+233", phone: phone.replace(/\D/g, "") };
}

/** A stored relationship maps to a chip when it matches an option's value or
 *  label; anything else is the free-text "other". */
function splitRelationship(relationship: string) {
  const lower = relationship.trim().toLowerCase();
  const match = RELATIONSHIP_OPTIONS.find(
    (o) => o.value !== "other" && (o.value === lower || o.label.toLowerCase() === lower),
  );
  return match
    ? { relationship: match.value, relationshipCustom: "" }
    : { relationship: "other", relationshipCustom: relationship };
}

export interface EditMotherSeed {
  form: EditMotherForm;
  /** Stored E.164 per contact row id — used verbatim when that row's phone is
   *  untouched, so a number on a dial code the selector doesn't offer (a
   *  diaspora next-of-kin) is never rewritten as +233… by an unrelated edit. */
  contactPhones: Map<string, { countryCode: string; phone: string; e164: string }>;
}

/** Seed the form from the profile. */
export function seedEditMother(mother: MotherProfile): EditMotherSeed {
  const contactPhones: EditMotherSeed["contactPhones"] = new Map();
  const contacts: EmergencyContactForm[] =
    mother.emergencyContacts.length > 0
      ? mother.emergencyContacts.map((c) => {
          const id = crypto.randomUUID();
          const { countryCode, phone } = splitPhone(c.phone);
          contactPhones.set(id, { countryCode, phone, e164: c.phone });
          return { id, name: c.name, countryCode, phone, ...splitRelationship(c.relationship) };
        })
      : [emptyEmergencyContact()];
  const own = splitPhone(mother.phone);
  return {
    form: {
      countryCode: own.countryCode,
      phone: own.phone,
      dateOfBirth: mother.dateOfBirth,
      language: mother.language,
      gravida: mother.gravida != null ? String(mother.gravida) : "",
      para: mother.para != null ? String(mother.para) : "",
      preferredCallWindow: mother.preferredCallWindow,
      deliveryType: mother.deliveryType,
      deliveryDate: mother.deliveryDate,
      contacts,
    },
    contactPhones,
  };
}

function contactsPayload(contacts: EmergencyContactForm[], seed: EditMotherSeed) {
  return contacts.map((c) => {
    const stored = seed.contactPhones.get(c.id);
    const untouched =
      stored && stored.countryCode === c.countryCode && stored.phone === c.phone.replace(/\D/g, "");
    return {
      name: c.name.trim(),
      phone: untouched ? stored.e164 : `${c.countryCode}${c.phone.replace(/\D/g, "")}`,
      relationship: c.relationship === "other" ? c.relationshipCustom.trim() : c.relationship,
    };
  });
}

const fullPhone = (f: EditMotherForm) => (f.phone ? `${f.countryCode}${f.phone}` : "");

/** Which fields differ from the seed. */
export function changedFields(form: EditMotherForm, seed: EditMotherSeed): Set<EditMotherField> {
  const s = seed.form;
  const changed = new Set<EditMotherField>();
  if (fullPhone(form) !== fullPhone(s)) changed.add("phone");
  for (const key of [
    "dateOfBirth",
    "language",
    "gravida",
    "para",
    "preferredCallWindow",
    "deliveryType",
    "deliveryDate",
  ] as const) {
    if (form[key] !== s[key]) changed.add(key);
  }
  if (
    JSON.stringify(contactsPayload(form.contacts, seed)) !==
    JSON.stringify(contactsPayload(s.contacts, seed))
  ) {
    changed.add("contacts");
  }
  return changed;
}

const CANT_CLEAR = "This can't be removed — enter a value or cancel";

/**
 * Errors for the changed fields only. A pair rule (gravida/para, DOB/delivery)
 * runs when either half changed, against the other half's current value —
 * mirroring the backend's merged check. Unchanged legacy values are never
 * re-judged, so an old record can still have its phone fixed.
 */
export function editMotherErrors(form: EditMotherForm, seed: EditMotherSeed): FieldErrors {
  const changed = changedFields(form, seed);
  const s = seed.form;
  const errors: FieldErrors = {};
  const set = (field: EditMotherField, message: string | null) => {
    if (message && !errors[field]) errors[field] = message;
  };

  if (changed.has("phone")) {
    if (!form.phone) set("phone", s.phone ? CANT_CLEAR : null);
    else if (!phoneLocalDigitsValid(form.phone, form.countryCode)) {
      set("phone", phoneLengthMessage(form.countryCode));
    }
  }
  for (const key of ["dateOfBirth", "deliveryDate", "gravida", "para"] as const) {
    if (changed.has(key) && form[key] === "" && s[key] !== "") set(key, CANT_CLEAR);
  }
  if (changed.has("dateOfBirth")) set("dateOfBirth", dobError(form.dateOfBirth));
  if (changed.has("gravida")) set("gravida", gravidaError(form.gravida));
  if (changed.has("gravida") || changed.has("para")) {
    // Reported on `para`, like the backend, unless only gravida was sent.
    const pair = paraError(form.gravida, form.para);
    set(changed.has("para") ? "para" : "gravida", pair);
  }
  if (changed.has("dateOfBirth") || changed.has("deliveryDate")) {
    set(
      changed.has("deliveryDate") ? "deliveryDate" : "dateOfBirth",
      deliveryVsDobError(form.deliveryDate, form.dateOfBirth),
    );
  }
  if (changed.has("contacts") && !emergencyContactsValid(form.contacts)) {
    set("contacts", "Complete every emergency contact, or remove the extra ones");
  }
  return errors;
}

/** Build the PATCH body from the changed, non-empty fields. */
export function editMotherPayload(form: EditMotherForm, seed: EditMotherSeed): EditMotherPayload {
  const changed = changedFields(form, seed);
  const body: EditMotherPayload = {};
  if (changed.has("phone") && form.phone) body.phone = fullPhone(form);
  if (changed.has("dateOfBirth") && form.dateOfBirth) body.date_of_birth = form.dateOfBirth;
  if (changed.has("language") && form.language) body.language = form.language;
  if (changed.has("gravida") && form.gravida !== "") body.gravida = Number(form.gravida);
  if (changed.has("para") && form.para !== "") body.para = Number(form.para);
  if (changed.has("preferredCallWindow") && form.preferredCallWindow) {
    body.preferred_call_window = form.preferredCallWindow;
  }
  if (changed.has("deliveryType") && form.deliveryType) body.delivery_type = form.deliveryType;
  if (changed.has("deliveryDate") && form.deliveryDate) body.delivery_date = form.deliveryDate;
  if (changed.has("contacts")) body.emergency_contacts = contactsPayload(form.contacts, seed);
  return body;
}

const SERVER_FIELD: Record<string, EditMotherField> = {
  phone: "phone",
  date_of_birth: "dateOfBirth",
  language: "language",
  gravida: "gravida",
  para: "para",
  preferred_call_window: "preferredCallWindow",
  delivery_type: "deliveryType",
  delivery_date: "deliveryDate",
  emergency_contacts: "contacts",
};

/**
 * Map a 422's `fields[]` onto form fields. A nested contact path
 * (`emergency_contacts.1.phone`) lands on the contacts section, prefixed with
 * which contact and which part. Anything unmapped is returned for a banner.
 */
export function mapServerFieldErrors(fields: ApiFieldError[]): {
  errors: FieldErrors;
  unmapped: string[];
} {
  const errors: FieldErrors = {};
  const unmapped: string[] = [];
  for (const f of fields) {
    const [head, index, part] = f.path.split(".");
    const field = SERVER_FIELD[head];
    if (!field) {
      unmapped.push(f.message);
      continue;
    }
    let message = f.message;
    if (field === "contacts" && index !== undefined && /^\d+$/.test(index)) {
      message = `Contact ${Number(index) + 1}${part ? ` ${part}` : ""}: ${f.message}`;
    }
    errors[field] = errors[field] ? `${errors[field]}; ${message}` : message;
  }
  return { errors, unmapped };
}

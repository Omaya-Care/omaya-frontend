// Shared types, constants, and validators for the emergency-contacts editor.
// Kept separate from the component file so Fast Refresh can preserve component
// state (a file should export only components for that to work).

// One editable emergency-contact row. `phone` holds ONLY the local digits
// (no dial code); `countryCode` is the dial code for that row's phone.
export interface EmergencyContactForm {
  // Stable per-row id assigned at creation time, used as the React list key so
  // removing/reordering rows doesn't shuffle controlled-input state.
  id: string;
  name: string;
  countryCode: string;
  phone: string;
  relationship: string;
  relationshipCustom: string;
}

export const MAX_EMERGENCY_CONTACTS = 3;

export const emptyEmergencyContact = (): EmergencyContactForm => ({
  id: crypto.randomUUID(),
  name: "",
  countryCode: "+233",
  phone: "",
  relationship: "",
  relationshipCustom: "",
});

// Unified relationship list (matches the set both discharge flows used). The
// "other" option reveals a free-text input whose value is sent as the label.
export const RELATIONSHIP_OPTIONS = [
  { value: "husband", label: "Husband" },
  { value: "wife", label: "Wife" },
  { value: "mother", label: "Mother" },
  { value: "father", label: "Father" },
  { value: "brother", label: "Brother" },
  { value: "sister", label: "Sister" },
  { value: "son", label: "Son" },
  { value: "daughter", label: "Daughter" },
  { value: "uncle", label: "Uncle" },
  { value: "aunt", label: "Aunt" },
  { value: "cousin", label: "Cousin" },
  { value: "grandmother", label: "Grandmother" },
  { value: "grandfather", label: "Grandfather" },
  { value: "friend", label: "Friend" },
  { value: "neighbour", label: "Neighbour" },
  { value: "colleague", label: "Colleague" },
  { value: "other", label: "Other" },
];

// A single contact's local phone is valid once it has >=9 digits — mirrors the
// mother's `phoneValid` check used elsewhere in the discharge flow.
export const emergencyPhoneValid = (c: EmergencyContactForm) =>
  c.phone.replace(/\D/g, "").length >= 9;

// A contact is complete when name + a valid phone + relationship are present,
// and (for "other") the custom relationship text is non-empty.
const emergencyContactComplete = (c: EmergencyContactForm) =>
  Boolean(
    c.name.trim() &&
      emergencyPhoneValid(c) &&
      c.relationship &&
      (c.relationship !== "other" || c.relationshipCustom.trim()),
  );

// All contacts valid: between 1 and MAX, every one complete.
export const emergencyContactsValid = (contacts: EmergencyContactForm[]) =>
  contacts.length >= 1 &&
  contacts.length <= MAX_EMERGENCY_CONTACTS &&
  contacts.every(emergencyContactComplete);

// Build the API payload (full-replacement list) from the form rows:
//   phone = `${countryCode}${localDigits}`, relationship = custom text for "other".
export const toEmergencyContactsPayload = (contacts: EmergencyContactForm[]) =>
  contacts.map((c) => ({
    name: c.name.trim(),
    phone: `${c.countryCode}${c.phone.replace(/\D/g, "")}`,
    relationship:
      c.relationship === "other" ? c.relationshipCustom.trim() : c.relationship,
  }));

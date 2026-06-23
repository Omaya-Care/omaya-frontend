import { Plus, X } from "lucide-react";
import { Input } from "../ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ChipSelect } from "./ChipSelect";
import { groupPhoneDigits } from "../../lib/format";

// One editable emergency-contact row. `phone` holds ONLY the local digits
// (no dial code); `countryCode` is the dial code for that row's phone.
export interface EmergencyContactForm {
  name: string;
  countryCode: string;
  phone: string;
  relationship: string;
  relationshipCustom: string;
}

export const MAX_EMERGENCY_CONTACTS = 3;

export const emptyEmergencyContact = (): EmergencyContactForm => ({
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
export const emergencyContactComplete = (c: EmergencyContactForm) =>
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

interface EmergencyContactsProps {
  contacts: EmergencyContactForm[];
  onChange: (contacts: EmergencyContactForm[]) => void;
  touched?: boolean;
}

const EmergencyContacts = ({
  contacts,
  onChange,
  touched = false,
}: EmergencyContactsProps) => {
  const update = (index: number, patch: Partial<EmergencyContactForm>) => {
    onChange(contacts.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  };

  const addContact = () => {
    if (contacts.length >= MAX_EMERGENCY_CONTACTS) return;
    onChange([...contacts, emptyEmergencyContact()]);
  };

  const removeContact = (index: number) => {
    if (index === 0) return; // first row is never removable
    onChange(contacts.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-6">
      {contacts.map((contact, index) => {
        const phoneInvalid = touched && !emergencyPhoneValid(contact);
        return (
          <div
            key={index}
            className={
              index > 0 ? "flex flex-col gap-5 border-t border-gray-100 pt-6" : "flex flex-col gap-5"
            }
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-gray-400 tracking-wide uppercase">
                {index === 0
                  ? "Primary contact"
                  : `Contact ${index + 1} of ${MAX_EMERGENCY_CONTACTS}`}
              </h4>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeContact(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 text-xs font-medium"
                >
                  <X size={14} />
                  <span>Remove</span>
                </button>
              )}
            </div>

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <Input
                label="Full name"
                placeholder="e.g. Kwame Asante"
                value={contact.name}
                onChange={(e) => update(index, { name: e.target.value })}
                className={touched && !contact.name.trim() ? "border-red-400" : ""}
                fullWidth
              />
              {touched && !contact.name.trim() && (
                <span className="text-xs text-red-500">
                  Please enter emergency contact name
                </span>
              )}
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Phone number
              </label>
              <div
                className={`flex items-center border rounded-md h-10 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${phoneInvalid ? "border-red-400" : "border-gray-200"}`}
              >
                <Select
                  value={contact.countryCode}
                  onValueChange={(val) => update(index, { countryCode: val })}
                >
                  <SelectTrigger className="h-auto w-fit border-0 bg-transparent px-2 py-2 text-sm font-medium text-gray-700 shadow-none focus:ring-0 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-gray-400 [&>span]:line-clamp-none whitespace-nowrap shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="min-w-[100px]">
                    <SelectItem value="+233">🇬🇭 +233</SelectItem>
                    <SelectItem value="+234">🇳🇬 +234</SelectItem>
                    <SelectItem value="+225">🇨🇮 +225</SelectItem>
                    <SelectItem value="+228">🇹🇬 +228</SelectItem>
                    <SelectItem value="+221">🇸🇳 +221</SelectItem>
                  </SelectContent>
                </Select>
                <div className="h-6 w-px bg-gray-200" />
                <Input
                  type="tel"
                  placeholder="55 123 4567"
                  value={groupPhoneDigits(contact.phone)}
                  onChange={(e) => {
                    const raw = e.target.value
                      .replace(/\D/g, "")
                      .replace(/^0+/, "")
                      .slice(0, 9);
                    update(index, { phone: raw });
                  }}
                  className="flex-1 border-0 bg-transparent px-2 py-2 text-gray-900 focus-visible:ring-0 shadow-none h-auto"
                />
              </div>
              {phoneInvalid && (
                <span className="text-xs text-red-500">
                  Please enter a valid phone number
                </span>
              )}
            </div>

            {/* Relationship */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-3">
                Relationship
              </label>
              <ChipSelect
                max={1}
                options={RELATIONSHIP_OPTIONS}
                selected={contact.relationship ? [contact.relationship] : []}
                onChange={(val) =>
                  update(index, { relationship: val.length > 0 ? val[0] : "" })
                }
              />
              {contact.relationship === "other" && (
                <div className="flex flex-col gap-1.5 mt-3">
                  <Input
                    placeholder="Please specify"
                    value={contact.relationshipCustom}
                    onChange={(e) =>
                      update(index, { relationshipCustom: e.target.value })
                    }
                    className={
                      touched && !contact.relationshipCustom.trim()
                        ? "border-red-400"
                        : ""
                    }
                    fullWidth
                  />
                  {touched && !contact.relationshipCustom.trim() && (
                    <span className="text-xs text-red-500">
                      Please specify relationship
                    </span>
                  )}
                </div>
              )}
              {touched && !contact.relationship && (
                <span className="text-xs text-red-500 mt-1">
                  Please select a relationship
                </span>
              )}
            </div>
          </div>
        );
      })}

      {contacts.length < MAX_EMERGENCY_CONTACTS && (
        <button
          type="button"
          onClick={addContact}
          className="flex items-center justify-center gap-2 border border-dashed border-gray-300 rounded-xl px-4 py-3 text-sm font-medium text-gray-500 hover:border-primary hover:text-primary transition-colors"
        >
          <Plus size={16} />
          <span>Add another contact</span>
        </button>
      )}
    </div>
  );
};

export { EmergencyContacts };

import { Plus, X } from "lucide-react";
import { ChipSelect } from "./ChipSelect";
import { FieldError, PhoneField, TextField } from "./fields";
import { normaliseLocalDigits } from "../../lib/onboarding-validation";
import {
  type EmergencyContactForm,
  MAX_EMERGENCY_CONTACTS,
  emptyEmergencyContact,
  RELATIONSHIP_OPTIONS,
  emergencyPhoneValid,
} from "./emergency-contacts";

interface ContactRowProps {
  contact: EmergencyContactForm;
  index: number;
  touched: boolean;
  onChange: (patch: Partial<EmergencyContactForm>) => void;
  onRemove: () => void;
}

/** One editable contact: heading, name, phone, relationship. */
const ContactRow = ({ contact, index, touched, onChange, onRemove }: ContactRowProps) => {
  const phoneInvalid = touched && !emergencyPhoneValid(contact);
  return (
    <div
      className={
        index > 0 ? "flex flex-col gap-5 border-t border-gray-100 pt-6" : "flex flex-col gap-5"
      }
    >
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-gray-400 tracking-wide uppercase">
          {index === 0 ? "Primary contact" : `Contact ${index + 1} of ${MAX_EMERGENCY_CONTACTS}`}
        </h4>
        {index > 0 && (
          <button
            type="button"
            onClick={onRemove}
            className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 text-xs font-medium"
          >
            <X size={14} />
            <span>Remove</span>
          </button>
        )}
      </div>

      {/* Name */}
      <TextField
        label="Full name"
        placeholder="e.g. Kwame Asante"
        value={contact.name}
        onChange={(e) => onChange({ name: e.target.value })}
        error={touched && !contact.name.trim() ? "Please enter emergency contact name" : undefined}
      />

      {/* Phone */}
      <PhoneField
        id={`emergency-phone-${contact.id}`}
        countryCode={contact.countryCode}
        onCountryCodeChange={(val) => onChange({ countryCode: val })}
        localDigits={contact.phone}
        onLocalInput={(typed) => {
          // Normalise so a pasted "+233…" still fits. Never truncated — an
          // over-long number fails validation instead (see `PHONE_PLANS`).
          const raw = normaliseLocalDigits(typed, contact.countryCode);
          onChange({ phone: raw });
        }}
        error={phoneInvalid ? "Please enter a valid phone number" : undefined}
      />

      {/* Relationship */}
      <div className="flex flex-col">
        <label
          htmlFor={`emergency-relationship-${contact.id}`}
          className="text-sm font-semibold text-gray-700 mb-3"
        >
          Relationship
        </label>
        <ChipSelect
          id={`emergency-relationship-${contact.id}`}
          max={1}
          options={RELATIONSHIP_OPTIONS}
          selected={contact.relationship ? [contact.relationship] : []}
          onChange={(val) => onChange({ relationship: val.length > 0 ? val[0] : "" })}
        />
        {contact.relationship === "other" && (
          <TextField
            containerClassName="mt-3"
            placeholder="Please specify"
            value={contact.relationshipCustom}
            onChange={(e) => onChange({ relationshipCustom: e.target.value })}
            error={
              touched && !contact.relationshipCustom.trim()
                ? "Please specify relationship"
                : undefined
            }
          />
        )}
        <FieldError
          className="mt-1"
          error={touched && !contact.relationship && "Please select a relationship"}
        />
      </div>
    </div>
  );
};

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
      {contacts.map((contact, index) => (
        <ContactRow
          key={contact.id}
          contact={contact}
          index={index}
          touched={touched}
          onChange={(patch) => update(index, patch)}
          onRemove={() => removeContact(index)}
        />
      ))}

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

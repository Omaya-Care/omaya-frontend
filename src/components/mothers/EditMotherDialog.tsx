import { useMemo, useState } from "react";
import { AlertCircle, Loader2, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/Button";
import { ChipSelect } from "@/components/onboarding/ChipSelect";
import { EmergencyContacts } from "@/components/onboarding/EmergencyContacts";
import { DateField, FieldError, PhoneField, TextField } from "@/components/onboarding/fields";
import { api, extractApiError } from "@/lib/api";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
import { toast } from "@/lib/notify";
import {
  normaliseLocalDigits,
  parseFormDate,
  startOfToday,
  MIN_MATERNAL_AGE,
  type FieldErrors,
} from "@/lib/onboarding-validation";
import type { MotherProfile } from "@/hooks/useMother";
import {
  CALL_WINDOW_OPTIONS,
  DELIVERY_TYPE_OPTIONS,
  changedFields,
  editMotherErrors,
  editMotherPayload,
  mapServerFieldErrors,
  seedEditMother,
  type EditMotherField,
  type EditMotherForm,
} from "./edit-mother-form";

const SECTION_LABEL = "text-xs font-medium uppercase tracking-wide text-gray-400";
const FIELD_LABEL = "mb-3 block text-sm font-semibold text-gray-700";

/**
 * Edit Mother — PATCH /mothers/{id} with only the fields that changed.
 * Mounted only while open (and keyed by mother id by the caller), so every
 * open re-seeds from the latest profile.
 */
export function EditMotherDialog({
  mother,
  onClose,
  onSaved,
}: {
  mother: MotherProfile;
  onClose: () => void;
  onSaved: () => void;
}) {
  const seed = useMemo(() => seedEditMother(mother), [mother]);
  const [form, setForm] = useState<EditMotherForm>(seed.form);
  // Local errors show once a field is touched or after a failed save.
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [revealAll, setRevealAll] = useState(false);
  const [serverErrors, setServerErrors] = useState<FieldErrors>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const localErrors = editMotherErrors(form, seed);
  const dirty = changedFields(form, seed).size > 0;
  const errorFor = (field: EditMotherField): string | undefined =>
    serverErrors[field] ?? ((revealAll || touched.has(field)) ? localErrors[field] : undefined);

  const update = <K extends keyof EditMotherForm>(field: K, value: EditMotherForm[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // The dial code is part of the phone field for errors.
    const key = field === "countryCode" ? "phone" : field;
    setTouched((prev) => (prev.has(key) ? prev : new Set(prev).add(key)));
    // A fresh edit supersedes whatever the server said about that field.
    setServerErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const close = () => {
    if (!pending) onClose();
  };

  const save = async () => {
    setBanner(null);
    if (Object.keys(localErrors).length > 0) {
      setRevealAll(true);
      return;
    }
    const body = editMotherPayload(form, seed);
    if (Object.keys(body).length === 0) {
      onClose();
      return;
    }
    setPending(true);
    try {
      await api.patch(`/mothers/${mother.id}`, body);
      toast.success("Details updated.");
      onSaved();
      onClose();
    } catch (err) {
      const e = extractApiError(err, "Could not update details. Please try again.");
      if (e.status === 422 && e.fields?.length) {
        const { errors, unmapped } = mapServerFieldErrors(e.fields);
        setServerErrors(errors);
        if (unmapped.length > 0) setBanner(unmapped.join(" "));
      } else if (e.status === 409) {
        // phone_already_enrolled / whatsapp_active_elsewhere — both about her phone.
        setServerErrors({ phone: e.message });
      } else if (e.status === 403) {
        setBanner("You don't have permission to edit this mother's details.");
      } else if (e.status === 404) {
        setBanner("This mother's record was not found. Close this and reload the page.");
      } else if (e.status < 500) {
        // 5xx already toasted by the api interceptor.
        setBanner(e.message);
      }
    } finally {
      setPending(false);
    }
  };

  const earliestDelivery = (() => {
    const dob = parseFormDate(form.dateOfBirth);
    return dob ? new Date(dob.getFullYear() + MIN_MATERNAL_AGE, dob.getMonth(), dob.getDate()) : null;
  })();

  return (
    <Dialog open onOpenChange={(o) => !o && close()}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] max-w-xl flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:rounded-2xl">
        <DialogHeader className="border-b border-gray-100 px-6 pb-4 pt-6 text-left">
          <DialogTitle className="flex items-center gap-2 text-lg font-medium text-gray-900">
            <Pencil className="size-[18px] text-[#7A2850]" />
            Edit details
          </DialogTitle>
          <DialogDescription>{mother.name}</DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
          {banner && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{banner}</AlertDescription>
            </Alert>
          )}

          <p className={SECTION_LABEL}>Contact</p>
          <PhoneField
            id="edit-mother-phone"
            countryCode={form.countryCode}
            onCountryCodeChange={(code) => update("countryCode", code)}
            localDigits={form.phone}
            // Normalised, never truncated — an over-long number fails validation.
            onLocalInput={(typed) => update("phone", normaliseLocalDigits(typed, form.countryCode))}
            error={errorFor("phone")}
          />
          <DateField
            id="edit-mother-dob"
            label="Date of birth"
            value={form.dateOfBirth}
            onChange={(v) => update("dateOfBirth", v)}
            error={errorFor("dateOfBirth")}
            calendar={{
              captionLayout: "dropdown",
              startMonth: new Date(1940, 0, 1),
              endMonth: new Date(),
              disabled: (d) => d >= startOfToday(),
            }}
          />
          <div className="flex flex-col">
            <span className={FIELD_LABEL}>Preferred language for calls</span>
            <ChipSelect
              max={1}
              options={LANGUAGE_OPTIONS}
              selected={form.language ? [form.language] : []}
              // Single-choice and never cleared (the API can't null it).
              onChange={(v) => update("language", v[0] ?? form.language)}
            />
            <FieldError error={errorFor("language")} className="mt-1" />
          </div>

          <p className={`${SECTION_LABEL} border-t border-gray-100 pt-5`}>Clinical</p>
          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="Gravida"
              type="number"
              min="0"
              max="30"
              placeholder="Number of pregnancies"
              value={form.gravida}
              onChange={(e) => update("gravida", e.target.value)}
              error={errorFor("gravida")}
            />
            <TextField
              label="Para"
              type="number"
              min="0"
              max="30"
              placeholder="Number of births"
              value={form.para}
              onChange={(e) => update("para", e.target.value)}
              error={errorFor("para")}
            />
          </div>
          <div className="flex flex-col">
            <span className={FIELD_LABEL}>Delivery type</span>
            <ChipSelect
              max={1}
              options={DELIVERY_TYPE_OPTIONS}
              selected={form.deliveryType ? [form.deliveryType] : []}
              onChange={(v) => update("deliveryType", v[0] ?? form.deliveryType)}
            />
            <FieldError error={errorFor("deliveryType")} className="mt-1" />
          </div>
          <DateField
            id="edit-mother-delivery-date"
            label="Delivery date"
            value={form.deliveryDate}
            onChange={(v) => update("deliveryDate", v)}
            error={errorFor("deliveryDate")}
            calendar={{
              disabled: earliestDelivery ? { before: earliestDelivery } : undefined,
            }}
          />

          <p className={`${SECTION_LABEL} border-t border-gray-100 pt-5`}>Program settings</p>
          <div className="flex flex-col">
            <span className={FIELD_LABEL}>Preferred calling window</span>
            <ChipSelect
              max={1}
              options={CALL_WINDOW_OPTIONS}
              selected={form.preferredCallWindow ? [form.preferredCallWindow] : []}
              onChange={(v) => update("preferredCallWindow", v[0] ?? form.preferredCallWindow)}
            />
            {form.preferredCallWindow !== seed.form.preferredCallWindow && (
              <span className="mt-2 text-xs font-medium text-primary">
                Her upcoming calls will move to the new window.
              </span>
            )}
            <FieldError error={errorFor("preferredCallWindow")} className="mt-1" />
          </div>

          <p className={`${SECTION_LABEL} border-t border-gray-100 pt-5`}>Emergency contacts</p>
          <EmergencyContacts
            contacts={form.contacts}
            onChange={(contacts) => update("contacts", contacts)}
            touched={revealAll && "contacts" in localErrors}
          />
          <FieldError error={errorFor("contacts")} className="-mt-2" />
        </div>

        <div className="flex shrink-0 justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <Button variant="outline" onClick={close} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={save} disabled={pending || !dirty}>
            {pending && <Loader2 className="animate-spin" />}
            Save changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

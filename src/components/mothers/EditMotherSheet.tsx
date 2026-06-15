import { useState, useEffect } from "react";
import { Loader2, CalendarIcon, AlertCircle } from "lucide-react";
import { format, parse } from "date-fns";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { Button } from "../ui/Button";
import { Input } from "../ui/input";
import { Alert, AlertDescription } from "../ui/alert";
import { ChipSelect } from "../onboarding";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useUpdateMother } from "../../hooks/useMutations";
import { Mother } from "../../types";
import { toast } from "sonner";

interface EditMotherSheetProps {
  isOpen: boolean;
  onClose: () => void;
  mother: Mother;
}

const LANGUAGE_OPTIONS = [
  { value: "english", label: "English" },
  { value: "twi", label: "Twi" },
  { value: "ga", label: "Ga" },
  { value: "ewe", label: "Ewe" },
];

const CALLING_WINDOW_OPTIONS = [
  { value: "morning", label: "Morning (8am–12pm)" },
  { value: "afternoon", label: "Afternoon (12pm–4pm)" },
  { value: "evening", label: "Evening (4pm–7pm)" },
  { value: "inbound", label: "Inbound (mother calls)" },
];

const DELIVERY_TYPE_OPTIONS = [
  { value: "vaginal", label: "Vaginal" },
  { value: "caesarean", label: "Caesarean" },
];

const EditMotherSheet = ({ isOpen, onClose, mother }: EditMotherSheetProps) => {
  const updateMutation = useUpdateMother();

  const [form, setForm] = useState({
    phone: mother.phone,
    dateOfBirth: mother.dateOfBirth ?? "",
    language: mother.language ?? "",
    gravida: mother.gravida != null ? String(mother.gravida) : "",
    para: mother.para != null ? String(mother.para) : "",
    preferredCallWindow: mother.preferredCallWindow ?? "",
    deliveryType: mother.deliveryType ?? "",
    deliveryDate: mother.deliveryDate ?? "",
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setForm({
        phone: mother.phone,
        dateOfBirth: mother.dateOfBirth ?? "",
        language: mother.language ?? "",
        gravida: mother.gravida != null ? String(mother.gravida) : "",
        para: mother.para != null ? String(mother.para) : "",
        preferredCallWindow: mother.preferredCallWindow ?? "",
        deliveryType: mother.deliveryType ?? "",
        deliveryDate: mother.deliveryDate ?? "",
      });
      setError(null);
    }
  }, [isOpen, mother]);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "phone") setError(null);
  };

  const handleSave = async () => {
    setError(null);
    try {
      await updateMutation.mutateAsync({
        motherId: mother.id,
        data: {
          phone: form.phone || undefined,
          date_of_birth: form.dateOfBirth || undefined,
          language: form.language || undefined,
          gravida: form.gravida !== "" ? parseInt(form.gravida) : undefined,
          para: form.para !== "" ? parseInt(form.para) : undefined,
          preferred_call_window: form.preferredCallWindow || undefined,
          delivery_type: form.deliveryType || undefined,
          delivery_date: form.deliveryDate || undefined,
        },
      });
      toast.success("Details updated.");
      onClose();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number; data?: { error?: string } } })?.response?.status;
      const code = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      if (status === 409 || code === "phone_already_enrolled") {
        setError("This phone number is already enrolled with another mother.");
      } else if (status === 404 || code === "mother_not_found") {
        setError("This mother's record was not found. Please reload and try again.");
      } else {
        toast.error("Could not update details. Please try again.");
      }
    }
  };

  const renderDatePicker = (label: string, field: "dateOfBirth" | "deliveryDate") => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="justify-start gap-2 bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 font-normal w-full h-10 hover:bg-gray-50"
          >
            <CalendarIcon size={16} className="text-gray-400 shrink-0" />
            {form[field] ? (
              format(parse(form[field], "yyyy-MM-dd", new Date()), "dd/MM/yyyy")
            ) : (
              <span className="text-gray-400">Select date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={form[field] ? parse(form[field], "yyyy-MM-dd", new Date()) : undefined}
            onSelect={(date) => updateField(field, date ? format(date, "yyyy-MM-dd") : "")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full p-0">
        {/* Fixed header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex-shrink-0">
          <SheetHeader>
            <SheetTitle>Edit: {mother.name}</SheetTitle>
          </SheetHeader>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium -mb-1">Contact</p>

          <Input
            label="Phone number"
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            fullWidth
          />

          {renderDatePicker("Date of birth", "dateOfBirth")}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Preferred language</label>
            <ChipSelect
              max={1}
              options={LANGUAGE_OPTIONS}
              selected={form.language ? [form.language] : []}
              onChange={(val) => updateField("language", val.length > 0 ? val[0] : "")}
            />
          </div>

          <div className="border-t border-gray-100 pt-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-4">Clinical</p>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <Input
                label="Gravida"
                type="number"
                min="0"
                placeholder="0"
                value={form.gravida}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || parseInt(val) >= 0) updateField("gravida", val);
                }}
                fullWidth
              />
              <Input
                label="Para"
                type="number"
                min="0"
                placeholder="0"
                value={form.para}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || parseInt(val) >= 0) updateField("para", val);
                }}
                fullWidth
              />
            </div>

            <div className="flex flex-col gap-1.5 mb-5">
              <label className="text-sm font-medium text-gray-700">Delivery type</label>
              <ChipSelect
                max={1}
                options={DELIVERY_TYPE_OPTIONS}
                selected={form.deliveryType ? [form.deliveryType] : []}
                onChange={(val) => updateField("deliveryType", val.length > 0 ? val[0] : "")}
              />
            </div>

            {renderDatePicker("Delivery date", "deliveryDate")}
          </div>

          <div className="border-t border-gray-100 pt-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-4">Program settings</p>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Preferred calling window</label>
              <ChipSelect
                max={1}
                options={CALLING_WINDOW_OPTIONS}
                selected={form.preferredCallWindow ? [form.preferredCallWindow] : []}
                onChange={(val) => updateField("preferredCallWindow", val.length > 0 ? val[0] : "")}
              />
            </div>
          </div>
        </div>

        {/* Fixed footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="flex-1 gap-2"
          >
            {updateMutation.isPending && <Loader2 size={16} className="animate-spin" />}
            Save changes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export { EditMotherSheet };

// Field blocks shared by the onboarding wizards (AddMother, NewDischarge) and
// the emergency-contacts editor. Each one is "the input plus its error line"
// so a step screen reads as a list of fields rather than a wall of markup.

import type * as React from "react";
import { AlertCircle, CalendarIcon } from "lucide-react";
import { format, parse } from "date-fns";
import { StepHeader } from "./StepHeader";
import { Button } from "@/components/ui/Button";
import { Input, type InputProps } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { groupPhoneDigits } from "@/lib/format";
import { COUNTRY_CODE_OPTIONS, type SummaryRow } from "./display";

// ── Layout ──────────────────────────────────────────────────────────

interface OnboardingStepProps {
  step: number;
  title: string;
  description: string;
  children: React.ReactNode;
}

/** The column every numbered step renders into, with its heading. */
export const OnboardingStep = ({
  step,
  title,
  description,
  children,
}: OnboardingStepProps) => (
  <div className="flex flex-col max-w-2xl w-full mx-auto mt-6">
    <StepHeader step={step} title={title} description={description} />
    {children}
  </div>
);

/** The destructive banner a step shows for a failed submit. */
export const SubmitErrorAlert = ({ message }: { message: string }) =>
  message ? (
    <div className="mb-6">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </div>
  ) : null;

// ── Errors ──────────────────────────────────────────────────────────

interface FieldErrorProps {
  error?: string | false | null;
  /** Spacing tweaks (`mt-1`, `mt-2`, `-mt-3`) — appended after the base classes. */
  className?: string;
}

/** The red line under a field. Renders nothing when there is no message. */
export const FieldError = ({ error, className }: FieldErrorProps) =>
  error ? (
    <span className={className ? `text-xs text-red-500 ${className}` : "text-xs text-red-500"}>
      {error}
    </span>
  ) : null;

// ── Text / number ───────────────────────────────────────────────────

interface TextFieldProps extends Omit<InputProps, "className" | "fullWidth"> {
  error?: string;
  /** Extra classes on the wrapping column (e.g. `mt-3`). */
  containerClassName?: string;
}

/** An `Input` with its error line; the border turns red while invalid. */
export const TextField = ({ error, containerClassName, ...input }: TextFieldProps) => (
  <div className={containerClassName ? `flex flex-col gap-1.5 ${containerClassName}` : "flex flex-col gap-1.5"}>
    <Input {...input} className={error ? "border-red-400" : ""} fullWidth />
    <FieldError error={error} />
  </div>
);

// ── Phone ───────────────────────────────────────────────────────────

interface PhoneFieldProps {
  id: string;
  countryCode: string;
  onCountryCodeChange: (code: string) => void;
  /** Local digits only (no dial code); grouped for display here. */
  localDigits: string;
  /** Receives what was typed, raw — the caller normalises and stores it. */
  onLocalInput: (raw: string) => void;
  error?: string;
}

/** Dial-code select + local-number input in one bordered control. */
export const PhoneField = ({
  id,
  countryCode,
  onCountryCodeChange,
  localDigits,
  onLocalInput,
  error,
}: PhoneFieldProps) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-sm font-medium text-gray-700">
      Phone number
    </label>
    <div
      className={`flex items-center border rounded-md h-10 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${error ? "border-red-400" : "border-gray-200"}`}
    >
      <Select value={countryCode} onValueChange={onCountryCodeChange}>
        <SelectTrigger className="h-auto w-fit border-0 bg-transparent px-2 py-2 text-sm font-medium text-gray-700 shadow-none focus:ring-0 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-gray-400 [&>span]:line-clamp-none whitespace-nowrap shrink-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="min-w-[100px]">
          {COUNTRY_CODE_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="h-6 w-px bg-gray-200" />
      <Input
        id={id}
        type="tel"
        placeholder="55 123 4567"
        value={groupPhoneDigits(localDigits)}
        onChange={(e) => onLocalInput(e.target.value)}
        className="flex-1 border-0 bg-transparent px-2 py-2 text-gray-900 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none h-auto"
      />
    </div>
    <FieldError error={error} />
  </div>
);

// ── Dates ───────────────────────────────────────────────────────────

type CalendarOptions = Partial<React.ComponentProps<typeof Calendar>>;

interface DateFieldProps {
  label: string;
  /** When set, the trigger gets this id and the label points at it. */
  id?: string;
  /** `yyyy-MM-dd` or empty. */
  value: string;
  onChange: (value: string) => void;
  error?: string;
  /** Which days are offered — `disabled`, `startMonth`, `captionLayout`, … */
  calendar?: CalendarOptions;
}

/** A labelled calendar popover storing `yyyy-MM-dd`, showing `dd/MM/yyyy`. */
export const DateField = ({ label, id, value, onChange, error, calendar }: DateFieldProps) => {
  const selected = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;
  const labelClass = "text-sm font-medium text-gray-700";
  return (
    <div className="flex flex-col gap-1.5">
      {id ? (
        <label htmlFor={id} className={labelClass}>
          {label}
        </label>
      ) : (
        <span className={labelClass}>{label}</span>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="ghost"
            className={`justify-start gap-2 bg-white border rounded-md px-3 py-2 text-sm text-gray-900 font-normal w-full h-10 hover:bg-gray-50 ${error ? "border-red-400" : "border-gray-200"}`}
          >
            <CalendarIcon size={16} className="text-gray-400 shrink-0" />
            {selected ? (
              format(selected, "dd/MM/yyyy")
            ) : (
              <span className="text-gray-400">Select date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            {...calendar}
            mode="single"
            selected={selected}
            onSelect={(date) => onChange(date ? format(date, "yyyy-MM-dd") : "")}
          />
        </PopoverContent>
      </Popover>
      <FieldError error={error} />
    </div>
  );
};

// ── Consent ─────────────────────────────────────────────────────────

interface ConsentToggleProps {
  checked: boolean;
  onToggle: () => void;
  title: string;
  description: string;
  /** The small upper-case tag under the description. */
  tag: string;
  tagTone: "required" | "optional";
  /** Outline the card red (a required consent that was not given). */
  invalid?: boolean;
  /** Greyed out and inert — e.g. recording before calls are consented to. */
  disabled?: boolean;
}

const consentCardClass = (checked: boolean, invalid: boolean, disabled: boolean | undefined) => {
  if (disabled === undefined) {
    return `w-full text-left border rounded-xl px-5 py-4 flex items-start gap-4 cursor-pointer transition-colors ${checked ? "border-primary bg-primary-100" : "border-gray-200 bg-white"} ${invalid ? "border-red-400" : ""}`;
  }
  const state = disabled
    ? "border-gray-200 bg-gray-50 opacity-60"
    : checked
      ? "border-primary bg-primary-100 cursor-pointer"
      : "border-gray-200 bg-white cursor-pointer";
  return `w-full text-left border rounded-xl px-5 py-4 flex items-start gap-4 transition-[color,background-color,border-color,opacity] ${state}`;
};

/** A large tappable consent card with a checkbox, title, explanation and tag. */
export const ConsentToggle = ({
  checked,
  onToggle,
  title,
  description,
  tag,
  tagTone,
  invalid = false,
  disabled,
}: ConsentToggleProps) => (
  <button
    type="button"
    aria-pressed={checked}
    disabled={disabled}
    aria-disabled={disabled || undefined}
    onClick={onToggle}
    className={consentCardClass(checked, invalid, disabled)}
  >
    <div
      className={`w-5 h-5 rounded flex-shrink-0 border mt-0.5 flex items-center justify-center ${checked ? "bg-primary border-primary" : "bg-white border-gray-300"}`}
    >
      {checked && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
    </div>
    <div className="flex flex-col">
      <span className="text-sm font-semibold text-gray-900">{title}</span>
      <span className="block text-sm text-gray-500 font-normal mt-1 leading-relaxed">
        {description}
      </span>
      <span
        className={`text-xs ${tagTone === "required" ? "text-primary" : "text-gray-400"} font-semibold mt-2 uppercase tracking-wide`}
      >
        {tag}
      </span>
    </div>
  </button>
);

// ── Summary ─────────────────────────────────────────────────────────

/** The striped label/value table on a wizard's review step. */
export const SummaryList = ({ rows }: { rows: SummaryRow[] }) => (
  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
    {rows.map((row, idx) => (
      <div
        key={row.label}
        className={`flex justify-between items-center px-6 py-3 ${idx % 2 === 1 ? "bg-gray-50" : ""}`}
      >
        <span className="text-sm text-gray-500 font-normal">{row.label}</span>
        <span
          className={`text-sm font-semibold ${row.highlight ? "text-primary" : "text-gray-900"}`}
        >
          {row.value}
        </span>
      </div>
    ))}
  </div>
);

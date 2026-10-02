import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';

/* ─── Toggle ─────────────────────────────────────────────────── */
interface ToggleProps {
  enabled: boolean;
  onChange?: () => void;
  locked?: boolean;
  label?: string;
}

export const Toggle = ({ enabled, onChange, locked = false, label }: ToggleProps) => (
  <button
    role="switch"
    type="button"
    aria-checked={enabled}
    aria-label={label ?? "Toggle setting"}
    onClick={locked ? undefined : onChange}
    className={`
      relative inline-flex w-11 h-6 rounded-full flex-shrink-0
      transition-colors duration-200 ease-in-out
      ${enabled ? 'bg-primary' : 'bg-gray-200'}
      ${locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    `}
  >
    <span
      className={`
        absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm
        transition-transform duration-200 ease-in-out
        ${enabled ? 'translate-x-5' : 'translate-x-0.5'}
      `}
    />
  </button>
);

/* ─── Section shell ───────────────────────────────────────────── */
export const Section = ({
  heading,
  subtitle,
  children,
}: {
  heading: string;
  subtitle: string;
  children: React.ReactNode;
}) => (
  <section className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)]">
    <div className="border-b border-gray-200 px-5 py-3">
      <h2 className="text-base font-medium text-gray-900">{heading}</h2>
      <p className="mt-0.5 text-sm text-gray-400">{subtitle}</p>
    </div>
    <div className="p-5">{children}</div>
  </section>
);

/* ─── Pending-aware submit button ─────────────────────────────── */
// Shared by every section's save action: spinner + swapped label while the
// request is in flight, identical markup to what each section rendered inline.
export const PendingButton = ({
  onClick,
  disabled,
  isPending,
  idleLabel,
  pendingLabel,
}: {
  onClick: () => void;
  disabled: boolean;
  isPending: boolean;
  idleLabel: string;
  pendingLabel: string;
}) => (
  <Button
    variant="default"
    onClick={onClick}
    disabled={disabled}
    className="flex items-center gap-2"
  >
    {isPending && <Loader2 size={16} className="animate-spin" />}
    {isPending ? pendingLabel : idleLabel}
  </Button>
);

/** "Save changes" button used by the profile and expert-profile sections. */
export const SaveChangesButton = ({
  onClick,
  disabled,
  isSaving,
}: {
  onClick: () => void;
  disabled: boolean;
  isSaving: boolean;
}) => (
  <div className="flex justify-end mt-5">
    <PendingButton
      onClick={onClick}
      disabled={disabled}
      isPending={isSaving}
      idleLabel="Save changes"
      pendingLabel="Saving..."
    />
  </div>
);

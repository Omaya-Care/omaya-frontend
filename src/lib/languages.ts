export interface LanguageOption {
  value: string;
  label: string;
  /** Greyed-out / unselectable until voice support for this language ships. */
  disabled?: boolean;
}

/**
 * Single source of truth for the call-delivery language options shown in every
 * language selector (discharge, add-mother, edit-mother). Only English is live
 * today; the Ghanaian languages are offered but disabled until their voice
 * agents are ready. Keep every selector pointed at this list so the options —
 * and the greyed-out state — stay identical across the app.
 */
export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: "english", label: "English" },
  { value: "twi", label: "Twi", disabled: true },
  { value: "ga", label: "Ga", disabled: true },
  { value: "ewe", label: "Ewe", disabled: true },
];

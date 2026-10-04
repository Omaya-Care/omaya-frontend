// Plain helpers shared by the onboarding wizards' step screens. Kept out of the
// component files so Fast Refresh can preserve state (a .tsx file should only
// export components).

import { format, parse } from "date-fns";

/** One line of a wizard's review-step table. */
export interface SummaryRow {
  label: string;
  value: string;
  /** Render the value in the brand colour (a confirmation or a key date). */
  highlight?: boolean;
}

/** A wizard `yyyy-MM-dd` value as `dd/MM/yyyy`; empty stays empty. */
export const formatFormDate = (value: string): string =>
  value ? format(parse(value, "yyyy-MM-dd", new Date()), "dd/MM/yyyy") : "";

/** The dial codes offered on every phone input. */
export const COUNTRY_CODE_OPTIONS = [
  { value: "+233", label: "🇬🇭 +233" },
  { value: "+234", label: "🇳🇬 +234" },
  { value: "+225", label: "🇨🇮 +225" },
  { value: "+228", label: "🇹🇬 +228" },
  { value: "+221", label: "🇸🇳 +221" },
];

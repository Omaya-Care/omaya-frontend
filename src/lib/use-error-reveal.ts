// The `ErrorReveal` state machine, as a hook. Shared by the two onboarding
// wizards (AddMother, NewDischarge) so "when does an error appear" is answered
// identically in both. See `ErrorReveal` in `onboarding-validation` for why
// this is per-field rather than one flag.

import { useCallback, useState } from "react";

import { revealTogether, type ErrorReveal } from "./onboarding-validation";

/**
 * @param groups Fields whose rules span a pair — touching one reveals all of
 *   them. Without this, a cross-field error pinned to the field the clinician
 *   never edited stays invisible while the Continue button greys out.
 */
export const useErrorReveal = (
  groups: readonly (readonly string[])[] = [],
): ErrorReveal => {
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [all, setAll] = useState(false);

  const shows = useCallback(
    (field: string) => all || touchedFields.has(field),
    [all, touchedFields],
  );

  const touch = useCallback(
    (field: string) => {
      const fields = revealTogether(field, groups);
      setTouchedFields((prev) => {
        if (fields.every((f) => prev.has(f))) return prev;
        const next = new Set(prev);
        for (const f of fields) next.add(f);
        return next;
      });
    },
    [groups],
  );

  const revealAll = useCallback(() => setAll(true), []);

  const reset = useCallback(() => {
    setAll(false);
    setTouchedFields(new Set());
  }, []);

  return { shows, touch, revealAll, reset };
};

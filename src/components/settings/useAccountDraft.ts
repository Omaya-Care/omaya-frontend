import { useState } from 'react';
import type { Me } from '../../hooks/useMe';

/**
 * Editable form fields seeded from the loaded account.
 *
 * The draft remembers which `me` snapshot it was edited against. Whenever
 * `useMe` hands back a new snapshot (first load, after a save, after the
 * post-password-change refetch) the draft is discarded and the fields re-seed
 * from that snapshot — the same "reset to the server's values" behaviour a
 * `useEffect(() => setX(me.x), [me])` sync gives, without the extra render or
 * a state copy of a prop. Before the account loads, `initial` is shown.
 */
export function useAccountDraft<T extends object>(
  me: Me | null,
  seed: (me: Me) => T,
  initial: T,
): [T, <K extends keyof T>(key: K, value: T[K]) => void] {
  const [draft, setDraft] = useState<{ base: Me | null; fields: T }>({ base: null, fields: initial });

  const fields = draft.base === me ? draft.fields : me ? seed(me) : initial;

  const setField = <K extends keyof T>(key: K, value: T[K]) => {
    setDraft((prev) => {
      const current = prev.base === me ? prev.fields : fields;
      return { base: me, fields: { ...current, [key]: value } };
    });
  };

  return [fields, setField];
}

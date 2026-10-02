import { useCallback, useSyncExternalStore } from "react";

/** Live `matchMedia` result. False where `matchMedia` is unavailable (tests). */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (cb: () => void) => {
      if (typeof window === "undefined" || !window.matchMedia) return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener("change", cb);
      return () => mql.removeEventListener("change", cb);
    },
    [query],
  );
  const get = () =>
    typeof window !== "undefined" && !!window.matchMedia && window.matchMedia(query).matches;
  return useSyncExternalStore(subscribe, get, () => false);
}

/** Tailwind's `md` breakpoint — the docked-sidebar layout. */
export const MD_QUERY = "(min-width: 768px)";

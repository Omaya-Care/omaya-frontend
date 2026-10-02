import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import {
  EMPTY_FILTERS,
  WEEK_BUCKETS,
  type MotherFilterState,
} from "./mother-filters";

export type FilterState = Record<string, string[]>;

export interface FilterGroup<T extends FilterState> {
  key: keyof T & string;
  label: string;
  options: { value: string; label: string }[];
}

const GROUPS: FilterGroup<MotherFilterState>[] = [
  {
    key: "severities",
    label: "Severity",
    options: [
      { value: "crisis", label: "Crisis" },
      { value: "elevated", label: "Elevated" },
      { value: "monitor", label: "Monitor" },
      { value: "routine", label: "Routine" },
    ],
  },
  {
    key: "deliveryTypes",
    label: "Delivery",
    options: [
      { value: "vaginal", label: "Vaginal" },
      { value: "caesarean", label: "Caesarean" },
    ],
  },
  { key: "weeks", label: "Postpartum", options: WEEK_BUCKETS },
];

export function MotherFilters({
  value,
  onChange,
}: {
  value: MotherFilterState;
  onChange: (next: MotherFilterState) => void;
}) {
  return (
    <FilterMenu
      groups={GROUPS}
      value={value}
      empty={EMPTY_FILTERS}
      onChange={onChange}
      label="Filter mothers"
    />
  );
}

/** Filter icon button + dropdown panel of toggle chips. */
export function FilterMenu<T extends FilterState>({
  groups,
  value,
  empty,
  onChange,
  label,
}: {
  groups: FilterGroup<T>[];
  value: T;
  empty: T;
  onChange: (next: T) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const count = Object.values(value).reduce((n, v) => n + v.length, 0);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = (key: keyof T & string, v: string) => {
    const cur = value[key];
    onChange({ ...value, [key]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] });
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`relative -mr-1.5 flex size-7 items-center justify-center rounded-md transition-colors ${
          open || count > 0 ? "text-[#7A2850]" : "text-gray-400 hover:text-gray-700"
        } hover:bg-black/[0.04]`}
      >
        <SlidersHorizontal className="size-4" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-[#7A2850] text-[10px] font-medium text-white tabular-nums">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 z-20 mt-2 w-64 rounded-xl bg-white p-4 shadow-lg ring-1 ring-black/5">
          <div className="flex flex-col gap-4">
            {groups.map((g) => (
              <div key={g.key} className="flex flex-col gap-2">
                <p className="text-xs font-medium text-gray-500">{g.label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {g.options.map((o) => {
                    const on = value[g.key].includes(o.value);
                    return (
                      <button
                        key={o.value}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggle(g.key, o.value)}
                        className={`rounded-full px-3 py-1 text-xs transition-colors ${
                          on
                            ? "bg-[#F7E8F0] text-[#7A2850]"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {count > 0 && (
            <button
              type="button"
              onClick={() => onChange(empty)}
              className="mt-4 text-xs text-gray-500 hover:text-gray-900"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}

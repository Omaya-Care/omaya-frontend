export type MotherFilterState = {
  severities: string[];
  deliveryTypes: string[];
  /** Postpartum-day bucket keys from WEEK_BUCKETS. */
  weeks: string[];
};

export const EMPTY_FILTERS: MotherFilterState = { severities: [], deliveryTypes: [], weeks: [] };

export const WEEK_BUCKETS: { value: string; label: string; min: number; max: number }[] = [
  { value: "w1", label: "Week 1", min: 0, max: 7 },
  { value: "w2", label: "Week 2", min: 8, max: 14 },
  { value: "w3", label: "Week 3+", min: 15, max: Infinity },
];

export function activeFilterCount(f: MotherFilterState): number {
  return f.severities.length + f.deliveryTypes.length + f.weeks.length;
}

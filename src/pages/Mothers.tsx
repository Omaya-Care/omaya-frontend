import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MobileBackButton } from "@/components/layout/MobileBackButton";
import { LoadError } from "@/components/ui/LoadError";
import { ListSkeleton } from "@/components/ui/ListSkeleton";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import { useMothers, type MotherRow } from "@/hooks/useMothers";
import { usePermissions } from "@/hooks/usePermissions";
import { MotherFilters } from "@/components/mothers/MotherFilters";
import { MotherDetail } from "@/components/mothers/MotherDetail";
import { initials, severityClass } from "@/components/mothers/mother-display";
import {
  EMPTY_FILTERS,
  WEEK_BUCKETS,
  activeFilterCount,
  type MotherFilterState,
} from "@/components/mothers/mother-filters";

type Tab = "active" | "withdrawn";
const TABS: { value: Tab; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "withdrawn", label: "Withdrawn" },
];

function filterMothers(data: MotherRow[], tab: Tab, filters: MotherFilterState, query: string): MotherRow[] {
  const q = query.trim().toLowerCase();
  const weeks = new Set(filters.weeks);
  const buckets = WEEK_BUCKETS.filter((b) => weeks.has(b.value));
  const severities = new Set(filters.severities);
  const deliveryTypes = new Set(filters.deliveryTypes);
  const inTab = data.filter(
    (m) =>
      (tab === "withdrawn" ? m.consentStatus === "withdrawn" : m.consentStatus !== "withdrawn") &&
      (severities.size === 0 || severities.has(m.severity)) &&
      (deliveryTypes.size === 0 || deliveryTypes.has(m.deliveryType)) &&
      (buckets.length === 0 ||
        buckets.some(
          (b) => m.dayPostpartum != null && m.dayPostpartum >= b.min && m.dayPostpartum <= b.max,
        )),
  );
  if (!q) return inTab;
  return inTab.filter((m) => m.name.toLowerCase().includes(q) || m.phone.includes(q));
}

function emptyMessage({ failed, filtering, tab }: { failed: boolean; filtering: boolean; tab: Tab }): string {
  if (failed) return "Mothers couldn't be loaded.";
  if (filtering) return "No mothers match your search or filters.";
  return tab === "withdrawn" ? "No withdrawn mothers." : "No active mothers.";
}

/** Mothers page — rendered inside AppLayout. Split 1/3 (list) | 2/3 (detail). */
export default function Mothers() {
  const { data, loading, failed, reload } = useMothers();
  const { can } = usePermissions();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<MotherFilterState>(EMPTY_FILTERS);
  const [tab, setTab] = useState<Tab>("active");
  // ?mother=<id> (e.g. the Calls page's info link) preselects her.
  const [searchParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(() => searchParams.get("mother"));

  const filtered = useMemo(() => filterMothers(data, tab, filters, query), [data, query, tab, filters]);

  return (
    <div className="flex h-full flex-col px-4 py-6 sm:px-12 sm:py-14 md:grid md:grid-cols-3 lg:px-20 lg:py-16">
      <section
        className={`col-span-1 min-h-0 min-w-0 flex-1 flex-col md:flex md:border-r md:border-border md:pr-6 ${
          selectedId ? "hidden" : "flex"
        }`}
      >
        <header className="flex flex-col gap-4 pb-4">
          <div className="flex items-center justify-between gap-3">
            <h1 className="flex items-center gap-2 text-2xl font-normal tracking-tight text-foreground">
              Mothers
              {!loading && !failed && (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#F7E8F0] px-1.5 text-xs font-medium text-[#7A2850] tabular-nums">{data.length}</span>
              )}
            </h1>
            {can("create_discharges") && (
              <Button asChild size="sm">
                <Link to="/new-mother">
                  <Plus />
                  Add Mother
                </Link>
              </Button>
            )}
          </div>
          <SegmentedTabs tabs={TABS} value={tab} onChange={setTab} />
          <Input
            type="search"
            placeholder="Search by name or phone"
            aria-label="Search mothers"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leftIcon={<Search className="size-4" />}
            rightIcon={<MotherFilters value={filters} onChange={setFilters} />}
            fullWidth
          />
          {failed && <LoadError message="Couldn't load mothers." onRetry={reload} />}
        </header>

        <ul className="-mx-3 min-h-0 flex-1 divide-y divide-gray-100 overflow-y-auto">
          {loading ? (
            <ListSkeleton />
          ) : filtered.length === 0 ? (
            <li className="px-3 py-10 text-center text-sm text-gray-400">
              {emptyMessage({ failed, filtering: !!query || activeFilterCount(filters) > 0, tab })}
            </li>
          ) : (
            filtered.map((m) => (
              <MotherListItem
                key={m.id}
                mother={m}
                selected={m.id === selectedId}
                onSelect={() => setSelectedId(m.id)}
              />
            ))
          )}
        </ul>
      </section>
      <section
        className={`col-span-2 min-h-0 min-w-0 flex-1 flex-col md:flex md:pl-6 ${
          selectedId ? "flex" : "hidden"
        }`}
      >
        <MobileBackButton onClick={() => setSelectedId(null)} />
        <MotherDetail motherId={selectedId} onWithdrawn={reload} onUpdated={reload} />
      </section>
    </div>
  );
}

function MotherListItem({
  mother: m,
  selected,
  onSelect,
}: {
  mother: MotherRow;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={selected || undefined}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
          selected ? "bg-[#F7E8F0]" : "hover:bg-black/[0.04]"
        }`}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#7A2850]/10 text-xs text-[#7A2850]">
          {initials(m.name)}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-gray-900">{m.name}</span>
            {m.severity && (
              <span
                className={`shrink-0 rounded-full px-2 py-px text-[11px] font-medium capitalize ${severityClass(m.severity)}`}
              >
                {m.severity}
              </span>
            )}
          </span>
          <span className="truncate text-xs text-gray-500">
            {[m.dayPostpartum != null && `Day ${m.dayPostpartum} postpartum`, m.phone]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </span>
      </button>
    </li>
  );
}

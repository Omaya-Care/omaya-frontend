import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MobileBackButton } from "@/components/layout/MobileBackButton";
import { LoadError } from "@/components/ui/LoadError";
import { useMothers } from "@/hooks/useMothers";
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

  const filtered = useMemo(() => {
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
  }, [data, query, tab, filters]);

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
          <div
            role="tablist"
            className="relative grid grid-cols-2 self-start rounded-full bg-gray-100 p-1"
          >
            {/* Sliding highlight — transform-only so it stays on the compositor. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-white shadow-sm transition-transform duration-200 ease-out motion-reduce:transition-none"
              style={{ transform: tab === "withdrawn" ? "translateX(100%)" : "translateX(0)" }}
            />
            {TABS.map((t) => (
              <button
                key={t.value}
                type="button"
                role="tab"
                aria-selected={tab === t.value}
                onClick={() => setTab(t.value)}
                className={`relative z-10 rounded-full px-3.5 py-1 text-sm transition-colors ${
                  tab === t.value ? "text-[#7A2850]" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
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
            Array.from({ length: 6 }, (_, i) => (
              <li key={i} className="flex items-center gap-3 px-3 py-3">
                <div className="size-9 shrink-0 animate-pulse rounded-full bg-gray-100" />
                <div className="flex-1">
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                  <div className="mt-2 h-3 w-24 animate-pulse rounded bg-gray-100" />
                </div>
              </li>
            ))
          ) : filtered.length === 0 ? (
            <li className="px-3 py-10 text-center text-sm text-gray-400">
              {failed
                ? "Mothers couldn't be loaded."
                : query || activeFilterCount(filters) > 0
                  ? "No mothers match your search or filters."
                  : tab === "withdrawn"
                    ? "No withdrawn mothers."
                    : "No active mothers."}
            </li>
          ) : (
            filtered.map((m) => {
              const selected = m.id === selectedId;
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(m.id)}
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
            })
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

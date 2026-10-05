import { useMemo, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Info, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import { MobileBackButton } from "@/components/layout/MobileBackButton";
import { HISTORY_LIMIT, useAlerts, type AlertRow, type AlertStatus } from "@/hooks/useAlerts";
import { FilterMenu, type FilterGroup } from "@/components/mothers/MotherFilters";
import { EscalationDetail } from "@/components/escalations/EscalationDetail";
import { usePermissions } from "@/hooks/usePermissions";
import { formatTimeLeft, isUnreached, timeLeftClass } from "@/components/escalations/alert-display";
import { formatDateTime, initials, severityClass } from "@/components/mothers/mother-display";

const TABS: { value: AlertStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "acknowledged", label: "Acknowledged" },
  { value: "resolved", label: "Resolved" },
];

type AlertFilterState = { severities: string[] };
const EMPTY_FILTERS: AlertFilterState = { severities: [] };

const FILTER_GROUPS: FilterGroup<AlertFilterState>[] = [
  {
    key: "severities",
    label: "Severity",
    options: [
      { value: "crisis", label: "Crisis" },
      { value: "elevated", label: "Elevated" },
      { value: "monitor", label: "Monitor" },
    ],
  },
];

const SEVERITY_RANK: Record<string, number> = { crisis: 0, elevated: 1, monitor: 2, routine: 3 };

/** Open queue order: unreached pages first, then severity, then least time left. */
function urgency(a: AlertRow, b: AlertRow): number {
  return (
    Number(isUnreached(b)) - Number(isUnreached(a)) ||
    (SEVERITY_RANK[a.severity] ?? 9) - (SEVERITY_RANK[b.severity] ?? 9) ||
    a.timeLeftMinutes - b.timeLeftMinutes
  );
}

function RowMeta({ alert }: { alert: AlertRow }) {
  if (alert.status === "open" && isUnreached(alert)) {
    return <span className="truncate text-xs font-medium text-red-600">On-call not reached</span>;
  }
  if (alert.status === "resolved" || alert.status === "acknowledged") {
    const resolved = alert.status === "resolved";
    const by = resolved ? alert.resolvedByName : alert.acknowledgedByName;
    const at = resolved ? alert.resolvedAt : alert.acknowledgedAt;
    return (
      <span className="truncate text-xs text-gray-500">
        {resolved ? "Resolved" : "Acknowledged"}
        {by && ` by ${by}`}
        {at && ` · ${formatDateTime(at)}`}
      </span>
    );
  }
  const day = alert.dayPostpartum != null ? `Day ${alert.dayPostpartum}` : "Not started";
  return (
    <span className="truncate text-xs text-gray-500">
      {day} · <span className={timeLeftClass(alert.timeLeftMinutes)}>{formatTimeLeft(alert.timeLeftMinutes)}</span>
    </span>
  );
}

/** Deep link from the notifications drawer: /escalations?alert=<id> opens that
 *  alert on the Open tab. Applied during render (not an effect) and the param
 *  is consumed, so a repeat click on the same notification re-applies it. */
function useAlertDeepLink(
  tab: AlertStatus,
  setTab: (tab: AlertStatus) => void,
  selectedId: string | null,
  setSelectedId: (id: string | null) => void,
) {
  const [searchParams, setSearchParams] = useSearchParams();
  const linkedId = searchParams.get("alert");
  if (linkedId) {
    if (tab !== "open") setTab("open");
    if (selectedId !== linkedId) setSelectedId(linkedId);
    queueMicrotask(() => setSearchParams((p) => { p.delete("alert"); return p; }, { replace: true }));
  }
}

const createdAtMs = (iso: string) => new Date(iso).getTime() || 0;

/** Search + severity filter, then the tab's sort order. */
function useFilteredAlerts(data: AlertRow[], query: string, tab: AlertStatus, filters: AlertFilterState) {
  return useMemo(() => {
    const q = query.trim().toLowerCase();
    const severities = new Set(filters.severities);
    const rows = data.filter(
      (a) =>
        (severities.size === 0 || severities.has(a.severity)) &&
        (!q || a.motherName.toLowerCase().includes(q)),
    );
    return rows.sort(tab === "open" ? urgency : (a, b) => createdAtMs(b.createdAt) - createdAtMs(a.createdAt));
  }, [data, query, tab, filters]);
}

/** Escalations page — same split layout as Calls/Mothers: 1/3 alert queue |
 *  2/3 the selected alert's status + actions over its call's details. */
export default function Escalations() {
  const [tab, setTab] = useState<AlertStatus>("open");
  const { data, loading, failed, forbidden, reload } = useAlerts(tab);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<AlertFilterState>(EMPTY_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useAlertDeepLink(tab, setTab, selectedId, setSelectedId);

  const filtered = useFilteredAlerts(data, query, tab, filters);
  const selected = data.find((a) => a.id === selectedId) ?? null;

  if (forbidden) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center">
        <h1 className="text-2xl font-normal tracking-tight text-foreground">Escalations</h1>
        <p className="mt-2 max-w-sm text-sm text-gray-500">
          Your role doesn't include acting on escalations. Ask your hospital admin if you need access.
        </p>
      </div>
    );
  }

  const emptyMessage = emptyListMessage({ failed, filtering: !!query || filters.severities.length > 0, tab });

  return (
    <div className="flex h-full flex-col px-4 py-6 sm:px-12 sm:py-14 md:grid md:grid-cols-3 lg:px-20 lg:py-16">
      <section
        className={`col-span-1 min-h-0 min-w-0 flex-1 flex-col md:flex md:border-r md:border-border md:pr-6 ${
          selected ? "hidden" : "flex"
        }`}
      >
        <header className="flex flex-col gap-4 pb-4">
          <h1 className="flex items-center gap-2 text-2xl font-normal tracking-tight text-foreground">
            Escalations
            {!loading && (
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#F7E8F0] px-1.5 text-xs font-medium text-[#7A2850] tabular-nums">
                {filtered.length}
              </span>
            )}
          </h1>
          <SegmentedTabs
            tabs={TABS}
            value={tab}
            onChange={(value) => {
              setTab(value);
              setSelectedId(null);
            }}
          />
          <Input
            type="search"
            placeholder="Search by name"
            aria-label="Search escalations"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leftIcon={<Search className="size-4" />}
            rightIcon={
              <FilterMenu
                groups={FILTER_GROUPS}
                value={filters}
                empty={EMPTY_FILTERS}
                onChange={setFilters}
                label="Filter escalations"
              />
            }
            fullWidth
          />
          {failed && (
            <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
              Couldn't refresh escalations — this list may be out of date. Retrying…
            </p>
          )}
        </header>

        <AlertList
          loading={loading}
          alerts={filtered}
          emptyMessage={emptyMessage}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        {tab !== "open" && !loading && data.length >= HISTORY_LIMIT && (
          <p className="pt-2 text-center text-xs text-gray-400">Showing the {HISTORY_LIMIT} most recent.</p>
        )}
      </section>
      <section
        className={`col-span-2 min-h-0 min-w-0 flex-1 flex-col md:flex md:pl-6 ${
          selected ? "flex" : "hidden"
        }`}
      >
        <MobileBackButton onClick={() => setSelectedId(null)} />
        {/* Keyed so transcript view and the note reset per escalation. */}
        <EscalationDetail
          key={selected?.id ?? "none"}
          alert={selected}
          onChanged={() => {
            setSelectedId(null);
            reload();
          }}
        />
      </section>
    </div>
  );
}

function emptyListMessage({ failed, filtering, tab }: { failed: boolean; filtering: boolean; tab: AlertStatus }) {
  if (failed) return "Couldn't load escalations.";
  if (filtering) return "No escalations match your search or filters.";
  return `No ${tab} escalations.`;
}


function AlertList({
  loading,
  alerts,
  emptyMessage,
  selectedId,
  onSelect,
}: {
  loading: boolean;
  alerts: AlertRow[];
  emptyMessage: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  let content: ReactNode;
  if (loading) {
    content = Array.from({ length: 6 }, (_, i) => (
      <li key={i} className="flex items-center gap-3 px-3 py-3">
        <div className="size-9 shrink-0 animate-pulse rounded-full bg-gray-100" />
        <div className="flex-1">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
          <div className="mt-2 h-3 w-24 animate-pulse rounded bg-gray-100" />
        </div>
      </li>
    ));
  } else if (alerts.length === 0) {
    content = <li className="px-3 py-10 text-center text-sm text-gray-400">{emptyMessage}</li>;
  } else {
    content = alerts.map((a) => (
      <AlertListItem key={a.id} alert={a} selected={a.id === selectedId} onSelect={onSelect} />
    ));
  }
  return <ul className="-mx-3 min-h-0 flex-1 divide-y divide-gray-100 overflow-y-auto">{content}</ul>;
}

function AlertListItem({
  alert,
  selected,
  onSelect,
}: {
  alert: AlertRow;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  // The profile lives on /mothers, which needs `view_mothers`.
  const { can } = usePermissions();
  return (
    <li className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onSelect(alert.id)}
        aria-current={selected || undefined}
        className={`flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
          selected ? "bg-[#F7E8F0]" : "hover:bg-black/[0.04]"
        }`}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#7A2850]/10 text-xs text-[#7A2850]">
          {initials(alert.motherName)}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-gray-900">{alert.motherName}</span>
            <span
              className={`shrink-0 rounded-full px-2 py-px text-[11px] font-medium capitalize ${severityClass(alert.severity)}`}
            >
              {alert.provisionalReason === "post_call_failed" ? "Review" : alert.severity}
            </span>
          </span>
          <RowMeta alert={alert} />
        </span>
      </button>
      {can("view_mothers") && (
        <Link
          to={`/mothers?mother=${encodeURIComponent(alert.motherId)}`}
          aria-label={`Open ${alert.motherName}'s profile`}
          title="Open mother's profile"
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-black/[0.04] hover:text-[#7A2850]"
        >
          <Info className="size-[18px]" strokeWidth={1.75} />
        </Link>
      )}
    </li>
  );
}

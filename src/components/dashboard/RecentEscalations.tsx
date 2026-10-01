import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { RecentEscalation } from "@/hooks/useDashboardCards";
import { formatTimeLeft, isUnreached, timeLeftClass } from "@/components/escalations/alert-display";

const SEVERITY_CLASS: Record<string, string> = {
  crisis: "bg-severity-crisis-bg text-severity-crisis-fg",
  elevated: "bg-severity-elevated-bg text-severity-elevated-fg",
  monitor: "bg-severity-monitor-bg text-severity-monitor-fg",
  routine: "bg-severity-routine-bg text-severity-routine-fg",
};

function formatRaisedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true });
}

interface RecentEscalationsProps {
  rows: RecentEscalation[];
  loading: boolean;
  /** The request behind this panel failed — say so, not "nothing here". */
  failed?: boolean;
  limit?: number;
}

/** Dashboard preview of open crisis/elevated alerts — acting on them happens on /escalations. */
export function RecentEscalations({ rows, loading, failed, limit = 5 }: RecentEscalationsProps) {
  return (
    <section className="flex h-full min-h-[320px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
        <h2 className="text-base font-medium text-gray-900">Recent escalations</h2>
        <Link
          to="/escalations"
          className="inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-900"
        >
          View all <ArrowRight className="size-4" />
        </Link>
      </div>

      {loading ? (
        <ul className="grid flex-1 grid-rows-5 divide-y divide-gray-200">
          {[1, 2, 3].map((i) => (
            <li key={i} className="px-5 py-2.5">
              <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
              <div className="mt-2 h-3 w-28 animate-pulse rounded bg-gray-100" />
            </li>
          ))}
        </ul>
      ) : failed ? (
        <div className="flex flex-1 items-center justify-center px-5 text-center text-sm text-gray-400">
          Couldn't load escalations.
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-5 text-center">
          <span
            aria-hidden="true"
            className="block size-20 bg-gray-300 [mask:url(/icons/warning-arrows.svg)_center/contain_no-repeat]"
          />
          <p className="-mt-1 text-sm text-gray-500">No open escalations</p>
          <p className="mt-0.5 text-xs text-gray-400">Crisis and elevated alerts will appear here as they come in.</p>
        </div>
      ) : (
        <ul className="grid flex-1 grid-rows-5 divide-y divide-gray-200">
          {rows.slice(0, limit).map((row) => {
            const raisedAt = formatRaisedAt(row.createdAt);
            return (
              <li key={row.id} className="flex">
                <Link
                  to={`/escalations?alert=${encodeURIComponent(row.id)}`}
                  className="flex flex-1 items-center justify-between gap-4 px-5 py-2.5 transition-colors hover:bg-gray-50"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="truncate text-sm text-gray-900">{row.motherName}</span>
                      <span
                        className={`rounded-full px-2 py-px text-[11px] font-medium capitalize ${SEVERITY_CLASS[row.severity] ?? "bg-gray-100 text-gray-500"}`}
                      >
                        {row.severity}
                      </span>
                      {isUnreached(row) && (
                        <span className="rounded-full bg-red-50 px-2 py-px text-[11px] font-medium text-red-600">
                          Not reached
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {[
                        row.dayPostpartum != null && `Day ${row.dayPostpartum} postpartum`,
                        raisedAt,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  </div>
                  <div className={`shrink-0 text-right ${timeLeftClass(row.timeLeftMinutes)}`}>
                    <div className="text-base font-semibold tabular-nums">
                      {formatTimeLeft(row.timeLeftMinutes)}
                    </div>
                    <div className="text-xs text-gray-400">SLA</div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

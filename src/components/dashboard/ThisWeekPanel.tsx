import type { ThisWeek } from "@/hooks/useDashboardCards";
import { formatResponseMinutes } from "@/lib/utils";

interface ThisWeekPanelProps {
  data: ThisWeek | null;
  loading: boolean;
}

/** Mon–today summary from /dashboard/stats `this_week`, same rows as the main portal. */
export function ThisWeekPanel({ data, loading }: ThisWeekPanelProps) {
  const rows = [
    { label: "Calls completed", sub: "across the cohort", value: data?.callsCompleted ?? "—" },
    { label: "Escalations resolved", sub: "Crisis & elevated acknowledged", value: data?.escalationsResolved ?? "—" },
    { label: "New discharges", sub: "mothers enrolled", value: data?.newDischarges ?? "—" },
    {
      label: "Avg. response time",
      sub: "to crisis & elevated alerts",
      value: data ? formatResponseMinutes(data.avgResponseMinutes) : "—",
    },
  ];

  return (
    <section className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
        <h2 className="text-base font-medium text-gray-900">This week</h2>
        <span className="text-sm text-gray-400">Mon – today</span>
      </div>

      <ul className="flex flex-1 flex-col divide-y divide-gray-200">
        {rows.map((row) => {
          const empty = row.value === "—";
          return (
            <li key={row.label} className="flex flex-1 items-center justify-between gap-4 px-5 py-2.5">
              <div>
                <div className="text-sm text-gray-900">{row.label}</div>
                <div className="text-xs text-gray-500">{row.sub}</div>
              </div>
              {loading ? (
                <div className="h-6 w-10 animate-pulse rounded bg-gray-100" />
              ) : (
                <div className={`text-base font-semibold tabular-nums ${empty ? "text-gray-300" : "text-gray-900"}`}>
                  {row.value}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

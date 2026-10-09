import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { TodayCall } from "@/hooks/useDashboardCards";
import { isChat } from "@/hooks/useCalls";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";

type Tab = "calls" | "chats";
const TABS: { value: Tab; label: string }[] = [
  { value: "calls", label: "Calls" },
  { value: "chats", label: "Chats" },
];

// Per-tab empty state. The icons are single-colour SVGs, masked so they take
// our palette.
const EMPTY: Record<Tab, { icon: string; title: string; hint: string }> = {
  calls: {
    icon: "[mask:url(/icons/phone-chat.svg)_center/contain_no-repeat]",
    title: "No calls scheduled for today",
    hint: "Check-in calls will show up here once they're scheduled.",
  },
  chats: {
    icon: "[mask:url(/icons/chat-bubbles.svg)_center/contain_no-repeat]",
    title: "No chats today",
    hint: "WhatsApp conversations with mothers will show up here.",
  },
};

// Same palette as the main portal's getStatusBadgeClass.
const STATUS: Record<string, { label: string; className: string }> = {
  completed: { label: "Completed", className: "bg-gray-100 text-gray-600" },
  in_progress: { label: "In progress", className: "bg-primary-100 text-primary-700" },
  upcoming: { label: "Upcoming", className: "bg-yellow-50 text-yellow-700" },
  missed: { label: "Missed", className: "bg-red-100 text-red-600" },
};

function formatCallTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "--:--";
  return d.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true });
}

interface TodaysCallsProps {
  rows: TodayCall[];
  loading: boolean;
  /** The request behind this panel failed — say so, not "nothing here". */
  failed?: boolean;
  limit?: number;
}

/** Dashboard preview of today's conversations, split like the sidebar:
 *  Calls (phone + WhatsApp calls; full list on /calls) | Chats (WhatsApp text
 *  chats; full list on /chats). */
export function TodaysCalls({ rows: allRows, loading, failed, limit = 5 }: TodaysCallsProps) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("calls");
  const rows = allRows.filter((row) => isChat(row.channel) === (tab === "chats"));
  const empty = EMPTY[tab];
  return (
    <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-5 py-3">
        <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
          <h2 className="text-base font-medium text-gray-900">Today's conversations</h2>
          <SegmentedTabs tabs={TABS} value={tab} onChange={setTab} />
        </div>
        <Link
          to={tab === "chats" ? "/chats" : "/calls"}
          className="inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-900"
        >
          View all <ArrowRight className="size-4" />
        </Link>
      </div>

      {/* Always the height of a full list (5 × h-12 rows), like Recent
          escalations, so the card doesn't shrink on a quiet day. */}
      <div className="flex min-h-60 flex-1 flex-col">
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
            Couldn't load today's conversations.
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-5 text-center">
            <span
              aria-hidden="true"
              className={`block size-20 bg-gray-300 ${empty.icon}`}
            />
            <p className="mt-3 text-sm text-gray-500">{empty.title}</p>
            <p className="mt-0.5 text-xs text-gray-400">{empty.hint}</p>
          </div>
        ) : (
          <table className="w-full table-fixed text-left">
            <tbody className="divide-y divide-gray-200">
              {rows.slice(0, limit).map((row) => {
                const status = STATUS[row.status] ?? { label: row.status, className: "bg-gray-100 text-gray-600" };
                // WhatsApp text chats live on /chats; the Calls page splits
                // upcoming placements onto its Scheduled tab.
                const href = isChat(row.channel)
                  ? `/chats?chat=${encodeURIComponent(row.id)}`
                  : `/calls?call=${encodeURIComponent(row.id)}&tab=${row.status === "upcoming" ? "scheduled" : "recents"}`;
                return (
                  <tr
                    key={row.id}
                    role="link"
                    tabIndex={0}
                    onClick={() => navigate(href)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") navigate(href);
                    }}
                    className="h-12 cursor-pointer hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none"
                  >
                    <td className="w-[30%] truncate px-5 text-sm text-gray-900">{row.motherName}</td>
                    <td className="w-[18%] px-5 text-sm font-semibold tabular-nums text-gray-900">
                      {formatCallTime(row.scheduledAt)}
                    </td>
                    <td className="hidden truncate px-5 text-sm text-gray-500 md:table-cell">{row.callType}</td>
                    <td className="px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Every Chats row is a WhatsApp chat; on Calls, only a
                            WhatsApp call needs telling apart from a phone call. */}
                        {row.channel === "whatsapp_call" && (
                          <span className="rounded-full bg-emerald-50 px-2 py-px text-[11px] font-medium text-emerald-700">
                            WhatsApp call
                          </span>
                        )}
                        <span className={`rounded-full px-2 py-px text-[11px] font-medium ${status.className}`}>
                          {status.label}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

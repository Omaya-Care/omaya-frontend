import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { LoadError } from "@/components/ui/LoadError";
import { getClinician } from "@/lib/auth";
import {
  useExpertQueue,
  useExpertStats,
  useMyExpertRequests,
  type ExpertRequestItem,
  type MyExpertRequestItem,
} from "@/hooks/useExpertRequests";
import { ExpertRequestListItem } from "./ExpertRequestListItem";
import { expertRequestLink, type ExpertTab } from "./expert-display";

function greetingFor(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/** The dashboard for an expert-roster account. It has no mothers of its own,
 *  so this is a different, lighter view — not a variant of the hospital one —
 *  and it only ever calls the /expert-requests endpoints. */
export function ExpertDashboard() {
  const now = new Date();
  const stats = useExpertStats();
  const queue = useExpertQueue();
  const mine = useMyExpertRequests();
  const firstName = getClinician()?.name?.trim().split(/\s+/)[0];
  const s = stats.data;
  const ratingPct = s && s.ratingTotalCount > 0 ? Math.round((s.ratingGoodCount / s.ratingTotalCount) * 100) : null;

  return (
    <div className="px-8 py-10 sm:px-12 sm:py-14 lg:px-20 lg:py-16">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground">
          {now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 className="text-2xl font-normal tracking-tight text-foreground sm:text-[28px]">
          {greetingFor(now.getHours())}
          {firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="text-sm text-gray-500">Here's how your requests are going.</p>
      </header>

      {stats.failed && !s && (
        <LoadError className="mt-6" message="Your summary couldn't be loaded." onRetry={stats.reload} />
      )}

      <section className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Requests this week"
          sublabel="Claimed by you"
          value={s?.requestsThisWeek ?? "—"}
          loading={stats.loading}
        />
        <StatCard
          label="Active conversations"
          sublabel="Open right now"
          value={s?.activeConversations ?? "—"}
          loading={stats.loading}
          to={expertRequestLink("mine")}
        />
        <StatCard
          label="Completed this week"
          sublabel="Marked done"
          value={s?.completedThisWeek ?? "—"}
          loading={stats.loading}
        />
        <StatCard
          label="Your rating"
          sublabel={
            s && s.ratingTotalCount > 0
              ? `From ${s.ratingTotalCount} rated conversation${s.ratingTotalCount === 1 ? "" : "s"}`
              : "No ratings yet"
          }
          value={ratingPct != null ? `${ratingPct}% good` : "—"}
          loading={stats.loading}
        />
      </section>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RequestPanel
          title="Waiting in your queue"
          tab="queue"
          items={queue.data}
          loading={queue.loading}
          failed={queue.failed && queue.data.length === 0}
          empty={
            <>
              <CheckCircle2 className="size-8 text-[#7A2850]" strokeWidth={1.5} />
              <p className="mt-2 text-sm text-gray-700">All caught up</p>
              <p className="mt-1 max-w-[220px] text-xs text-gray-400">No unclaimed requests in your category right now.</p>
            </>
          }
        />
        <RequestPanel
          title="Your active conversations"
          tab="mine"
          items={mine.data}
          loading={mine.loading}
          failed={mine.failed && mine.data.length === 0}
          empty={
            <>
              <p className="text-sm text-gray-700">Nothing active</p>
              <p className="mt-1 max-w-[220px] text-xs text-gray-400">
                Claim a request from the queue to start a conversation.
              </p>
            </>
          }
        />
      </div>
    </div>
  );
}

function RequestPanel({
  title,
  tab,
  items,
  loading,
  failed,
  empty,
  limit = 5,
}: {
  title: string;
  tab: ExpertTab;
  items: (ExpertRequestItem | MyExpertRequestItem)[];
  loading: boolean;
  failed: boolean;
  empty: ReactNode;
  limit?: number;
}) {
  const navigate = useNavigate();
  let body: ReactNode;
  if (loading) {
    body = (
      <ul className="divide-y divide-gray-100 px-2">
        {[0, 1, 2].map((i) => (
          <li key={i} className="px-3 py-3">
            <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
            <div className="mt-2 h-3 w-28 animate-pulse rounded bg-gray-100" />
          </li>
        ))}
      </ul>
    );
  } else if (failed) {
    body = (
      <div className="flex flex-1 items-center justify-center px-5 text-center text-sm text-gray-400">
        Couldn't load requests.
      </div>
    );
  } else if (items.length === 0) {
    body = <div className="flex flex-1 flex-col items-center justify-center px-5 py-8 text-center">{empty}</div>;
  } else {
    body = (
      <ul className="divide-y divide-gray-100 px-2 py-1">
        {items.slice(0, limit).map((item) => (
          <ExpertRequestListItem key={item.id} item={item} onSelect={(id) => navigate(expertRequestLink(tab, id))} />
        ))}
      </ul>
    );
  }

  return (
    <section className="flex min-h-[260px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
        <h2 className="flex items-center gap-2 text-base font-medium text-gray-900">
          {title}
          {!loading && items.length > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F7E8F0] px-1.5 text-xs font-medium text-[#7A2850] tabular-nums">
              {items.length}
            </span>
          )}
        </h2>
        <Link
          to={expertRequestLink(tab)}
          className="inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-900"
        >
          View all <ArrowRight className="size-4" />
        </Link>
      </div>
      {body}
    </section>
  );
}

import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RecentEscalations } from "@/components/dashboard/RecentEscalations";
import { TodaysCalls } from "@/components/dashboard/TodaysCalls";
import { ThisWeekPanel } from "@/components/dashboard/ThisWeekPanel";
import { StatCard } from "@/components/dashboard/StatCard";
import { LoadError } from "@/components/ui/LoadError";
import { useDashboardCards, type DashboardCards } from "@/hooks/useDashboardCards";
import { usePermissions } from "@/hooks/usePermissions";
import { getClinician } from "@/lib/auth";
import { formatResponseMinutes } from "@/lib/utils";

function greetingFor(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/** Post-sign-in landing page. Rendered inside AppLayout. */
export default function Dashboard() {
  const now = new Date();
  const { data, loading, reload } = useDashboardCards();
  const { can } = usePermissions();
  const firstName = getClinician()?.name?.trim().split(/\s+/)[0];
  const fullDate = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="px-8 py-10 sm:px-12 sm:py-14 lg:px-20 lg:py-16">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">{fullDate}</p>
          <h1 className="text-2xl font-normal tracking-tight text-foreground sm:text-[28px]">
            {greetingFor(now.getHours())}
            {firstName ? `, ${firstName}` : ""}
          </h1>
        </div>
        {can("create_discharges") && (
          <Button asChild>
            <Link to="/new-mother">
              <Plus />
              New discharge
            </Link>
          </Button>
        )}
      </header>

      {data?.failed && (
        <LoadError
          className="mt-6"
          message="Some of the dashboard couldn't be loaded."
          onRetry={reload}
        />
      )}

      <StatCards data={data} loading={loading} />
      <Panels data={data} loading={loading} />
    </div>
  );
}

type CardsProps = { data: DashboardCards | null; loading: boolean };

function StatCards({ data, loading }: CardsProps) {
  return (
    <section className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {/* Hidden once we know the role lacks `view_mothers` (Receptionist):
          those endpoints 403 for it, which is not a failure. */}
      {(loading || data?.canViewMothers) && (
        <>
          <StatCard
            label="Mothers in care"
            sublabel="Active right now"
            value={data?.mothersInCare ?? "—"}
            loading={loading}
            to="/mothers"
          />
          <StatCard
            label="Conversations today"
            sublabel="Calls & chats"
            value={data?.callsToday ?? "—"}
            loading={loading}
            to="/calls"
          />
        </>
      )}
      {/* Skeleton while loading so the grid doesn't jump from 3 to 4
          cards; hidden once we know the role lacks `escalate`. */}
      {(loading || data?.canEscalate) && (
        <StatCard
          label="Need attention"
          sublabel="Crisis & elevated unacknowledged"
          value={data?.needAttention ?? "—"}
          loading={loading}
          footerText={
            data?.needAttention ? `${data.needAttention} waiting` : undefined
          }
        />
      )}
      <StatCard
        label="Avg. response time"
        sublabel="To crisis & elevated alerts"
        value={formatResponseMinutes(data?.avgResponseMinutesL3L4)}
        loading={loading}
      />
    </section>
  );
}

function Panels({ data, loading }: CardsProps) {
  const showEscalations = loading || !!data?.canEscalate;
  const showCalls = loading || !!data?.canViewMothers;
  const calls = (
    <TodaysCalls
      rows={data?.todayCalls ?? []}
      loading={loading}
      failed={data != null && data.todayCalls === null}
    />
  );
  return (
    <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Left slot beside "This week": escalations when the role can act on
          them, otherwise today's conversations moves up so the row isn't
          left with a lone panel and a gap (e.g. Administrator). */}
      {showEscalations ? (
        <div className="lg:col-span-2">
          <RecentEscalations
            rows={data?.escalations ?? []}
            loading={loading}
            failed={data != null && data.escalations === null}
          />
        </div>
      ) : (
        showCalls && <div className="lg:col-span-2">{calls}</div>
      )}
      <ThisWeekPanel data={data?.thisWeek ?? null} loading={loading} />
      {showEscalations && showCalls && (
        <div className="lg:col-span-3">{calls}</div>
      )}
    </div>
  );
}

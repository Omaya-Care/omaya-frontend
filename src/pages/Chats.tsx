import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowDownLeft, ArrowUpRight, Info, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { MobileBackButton } from "@/components/layout/MobileBackButton";
import { LoadError } from "@/components/ui/LoadError";
import { ListSkeleton } from "@/components/ui/ListSkeleton";
import { useCalls, type CallRow } from "@/hooks/useCalls";
import { FilterMenu, type FilterGroup } from "@/components/mothers/MotherFilters";
import { CallDetail } from "@/components/calls/CallDetail";
import { formatDateTime, initials, severityClass } from "@/components/mothers/mother-display";

type ChatFilterState = { severities: string[]; statuses: string[] };
const EMPTY_FILTERS: ChatFilterState = { severities: [], statuses: [] };

const FILTER_GROUPS: FilterGroup<ChatFilterState>[] = [
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
    key: "statuses",
    label: "Status",
    options: [
      { value: "completed", label: "Completed" },
      { value: "in_progress", label: "In progress" },
    ],
  },
];

/** Who started the chat + when. */
function ChatMeta({ chat }: { chat: CallRow }) {
  const inbound = chat.direction === "inbound";
  const Arrow = inbound ? ArrowDownLeft : ArrowUpRight;
  return (
    <span className="flex min-w-0 items-center gap-1 text-xs text-gray-500">
      <Arrow aria-label={inbound ? "Incoming" : "Outgoing"} className="size-3.5 shrink-0 text-gray-400" />
      <span className="truncate">WhatsApp chat · {formatDateTime(chat.scheduledAt)}</span>
    </span>
  );
}

/** Deep link from the dashboard: /chats?chat=<id> opens that chat. Applied
 *  during render (not an effect) and the param is consumed, so a repeat click
 *  on the same row re-applies it. */
function useChatDeepLink(selectedId: string | null, setSelectedId: (id: string | null) => void) {
  const [searchParams, setSearchParams] = useSearchParams();
  const linkedId = searchParams.get("chat");
  if (linkedId) {
    if (selectedId !== linkedId) setSelectedId(linkedId);
    queueMicrotask(() =>
      setSearchParams((p) => {
        p.delete("chat");
        return p;
      }, { replace: true }),
    );
  }
}

function filterChats(data: CallRow[], filters: ChatFilterState, query: string): CallRow[] {
  const q = query.trim().toLowerCase();
  const severities = new Set(filters.severities);
  const statuses = new Set(filters.statuses);
  const rows = data.filter(
    (c) =>
      (severities.size === 0 || severities.has(c.severity)) &&
      (statuses.size === 0 || statuses.has(c.status)) &&
      (!q || c.motherName.toLowerCase().includes(q)),
  );
  // Most recent on top.
  const time = (iso: string) => new Date(iso).getTime() || 0;
  return rows.sort((a, b) => time(b.scheduledAt) - time(a.scheduledAt));
}

function emptyMessage({ failed, filtering }: { failed: boolean; filtering: boolean }): string {
  if (failed) return "Chats couldn't be loaded.";
  if (filtering) return "No chats match your search or filters.";
  return "No WhatsApp chats yet.";
}

/** Chats page — the Calls page's layout for WhatsApp text conversations:
 *  1/3 chat list (newest first) | 2/3 the selected chat. WhatsApp CALLS are
 *  voice conversations and stay on /calls. */
export default function Chats() {
  const { data, loading, failed, reload } = useCalls("chats");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<ChatFilterState>(EMPTY_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useChatDeepLink(selectedId, setSelectedId);

  const filtered = useMemo(() => filterChats(data, filters, query), [data, query, filters]);

  const filterCount = Object.values(filters).reduce((n, v) => n + v.length, 0);

  return (
    <div className="flex h-full flex-col px-4 py-6 sm:px-12 sm:py-14 md:grid md:grid-cols-3 lg:px-20 lg:py-16">
      <section
        className={`col-span-1 min-h-0 min-w-0 flex-1 flex-col md:flex md:border-r md:border-border md:pr-6 ${
          selectedId ? "hidden" : "flex"
        }`}
      >
        <header className="flex flex-col gap-4 pb-4">
          <h1 className="flex items-center gap-2 text-2xl font-normal tracking-tight text-foreground">
            Chats
            {!loading && !failed && (
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#F7E8F0] px-1.5 text-xs font-medium text-[#7A2850] tabular-nums">
                {filtered.length}
              </span>
            )}
          </h1>
          <Input
            type="search"
            placeholder="Search by name"
            aria-label="Search chats"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leftIcon={<Search className="size-4" />}
            rightIcon={
              <FilterMenu
                groups={FILTER_GROUPS}
                value={filters}
                empty={EMPTY_FILTERS}
                onChange={setFilters}
                label="Filter chats"
              />
            }
            fullWidth
          />
          {failed && <LoadError message="Couldn't load chats." onRetry={reload} />}
        </header>

        <ul className="-mx-3 min-h-0 flex-1 divide-y divide-gray-100 overflow-y-auto">
          {loading ? (
            <ListSkeleton />
          ) : filtered.length === 0 ? (
            <li className="px-3 py-10 text-center text-sm text-gray-400">
              {emptyMessage({ failed, filtering: !!query || filterCount > 0 })}
            </li>
          ) : (
            filtered.map((c) => (
              <ChatListItem
                key={c.id}
                chat={c}
                selected={c.id === selectedId}
                onSelect={() => setSelectedId(c.id)}
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
        <CallDetail callId={selectedId} noun="chat" />
      </section>
    </div>
  );
}

function ChatListItem({ chat: c, selected, onSelect }: { chat: CallRow; selected: boolean; onSelect: () => void }) {
  return (
    <li className="flex items-center gap-1">
      <button
        type="button"
        onClick={onSelect}
        aria-current={selected || undefined}
        className={`flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
          selected ? "bg-[#F7E8F0]" : "hover:bg-black/[0.04]"
        }`}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#7A2850]/10 text-xs text-[#7A2850]">
          {initials(c.motherName)}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-gray-900">{c.motherName}</span>
            {c.severity && (
              <span
                className={`shrink-0 rounded-full px-2 py-px text-[11px] font-medium capitalize ${severityClass(c.severity)}`}
              >
                {c.severity}
              </span>
            )}
          </span>
          <ChatMeta chat={c} />
        </span>
      </button>
      <Link
        to={`/mothers?mother=${encodeURIComponent(c.motherId)}`}
        aria-label={`Open ${c.motherName}'s profile`}
        title="Open mother's profile"
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-black/[0.04] hover:text-[#7A2850]"
      >
        <Info className="size-[18px]" strokeWidth={1.75} />
      </Link>
    </li>
  );
}

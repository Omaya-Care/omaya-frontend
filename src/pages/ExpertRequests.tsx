import { useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import {
  useExpertQueue,
  useMyExpertRequests,
  type ExpertRequestItem,
  type MyExpertRequestItem,
} from "@/hooks/useExpertRequests";
import { ExpertRequestListItem } from "@/components/expert-requests/ExpertRequestListItem";
import { QueueDetail } from "@/components/expert-requests/QueueDetail";
import { ThreadDetail } from "@/components/expert-requests/ThreadDetail";
import type { ExpertTab } from "@/components/expert-requests/expert-display";
import { MobileBackButton } from "@/components/layout/MobileBackButton";

/** Deep link: /expert-requests?tab=mine&request=<id> opens that request.
 *  Applied during render (not an effect) and the params are consumed, so a
 *  repeat click on the same link re-applies it — same pattern as Escalations. */
function useExpertDeepLink(setTab: (tab: ExpertTab) => void, select: (tab: ExpertTab, id: string) => void) {
  const [searchParams, setSearchParams] = useSearchParams();
  const linkedTab = searchParams.get("tab");
  const linkedId = searchParams.get("request");
  if (linkedTab === "queue" || linkedTab === "mine" || linkedId) {
    const tab: ExpertTab = linkedTab === "mine" ? "mine" : "queue";
    setTab(tab);
    if (linkedId) select(tab, linkedId);
    queueMicrotask(() =>
      setSearchParams(
        (p) => {
          p.delete("tab");
          p.delete("request");
          return p;
        },
        { replace: true },
      ),
    );
  }
}

/** Expert requests — same split layout as Escalations: 1/3 the queue or the
 *  expert's own conversations | 2/3 the selected request. Both lists poll. */
export default function ExpertRequests() {
  const [tab, setTab] = useState<ExpertTab>("queue");
  // Per-tab selection, so switching tabs can't clobber the other's choice.
  const [selected, setSelected] = useState<Record<ExpertTab, string | null>>({ queue: null, mine: null });
  const select = (t: ExpertTab, id: string | null) =>
    setSelected((s) => (s[t] === id ? s : { ...s, [t]: id }));

  const queue = useExpertQueue();
  const mine = useMyExpertRequests();

  useExpertDeepLink(
    (t) => {
      if (t !== tab) setTab(t);
    },
    (t, id) => select(t, id),
  );

  const current = tab === "queue" ? queue : mine;
  const selectedId = selected[tab];
  // Derived, not stored: if the list polls and the request is gone (claimed by
  // another expert, completed), the panel falls back to its empty state.
  const selectedQueueItem = queue.data.find((r) => r.id === selected.queue) ?? null;
  const selectedMineItem = mine.data.find((r) => r.id === selected.mine) ?? null;
  // Below `md` only one pane shows: the detail once something is selected.
  const showDetail = (tab === "queue" ? selectedQueueItem : selectedMineItem) !== null;

  return (
    <div className="flex h-full flex-col px-4 py-6 sm:px-12 sm:py-14 md:grid md:grid-cols-3 lg:px-20 lg:py-16">
      <section
        className={`col-span-1 min-h-0 min-w-0 flex-1 flex-col md:flex md:border-r md:border-border md:pr-6 ${
          showDetail ? "hidden" : "flex"
        }`}
      >
        <header className="flex flex-col gap-4 pb-4">
          <h1 className="text-2xl font-normal tracking-tight text-foreground">Expert requests</h1>
          <TabBar
            tab={tab}
            counts={{ queue: queue.loading ? null : queue.data.length, mine: mine.loading ? null : mine.data.length }}
            onSelect={setTab}
          />
          {current.failed && (
            <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
              Couldn't refresh this list — it may be out of date. Retrying…
            </p>
          )}
        </header>

        <RequestList
          loading={current.loading}
          items={current.data}
          emptyMessage={emptyMessage(tab, current.failed && current.data.length === 0, current.forbidden)}
          selectedId={selectedId}
          onSelect={(id) => select(tab, id)}
        />
      </section>
      <section
        className={`col-span-2 min-h-0 min-w-0 flex-1 flex-col md:flex md:pl-6 ${
          showDetail ? "flex" : "hidden"
        }`}
      >
        <MobileBackButton onClick={() => select(tab, null)} />
        {tab === "queue" ? (
          <QueueDetail
            key={selectedQueueItem?.id ?? "none"}
            request={selectedQueueItem}
            onClaimed={(id) => {
              setTab("mine");
              select("mine", id);
            }}
          />
        ) : (
          <ThreadDetail
            key={selectedMineItem?.id ?? "none"}
            request={selectedMineItem}
            onCompleted={() => select("mine", null)}
          />
        )}
      </section>
    </div>
  );
}

function emptyMessage(tab: ExpertTab, failed: boolean, forbidden: boolean): string {
  if (forbidden) return "Your role doesn't have access to expert requests.";
  if (failed) return "Couldn't load requests.";
  return tab === "queue" ? "No unclaimed requests right now — you're all caught up." : "No active conversations.";
}

const TABS: { value: ExpertTab; label: string }[] = [
  { value: "queue", label: "Queue" },
  { value: "mine", label: "Mine" },
];

function TabBar({
  tab,
  counts,
  onSelect,
}: {
  tab: ExpertTab;
  counts: Record<ExpertTab, number | null>;
  onSelect: (tab: ExpertTab) => void;
}) {
  const tabIndex = TABS.findIndex((t) => t.value === tab);
  return (
    <div role="tablist" className="relative grid grid-cols-2 self-start rounded-full bg-gray-100 p-1">
      {/* Sliding highlight — transform-only so it stays on the compositor. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-1 left-1 w-[calc((100%-8px)/2)] rounded-full bg-white shadow-sm transition-transform duration-200 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(${tabIndex * 100}%)` }}
      />
      {TABS.map((t) => {
        const count = counts[t.value];
        return (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={tab === t.value}
            onClick={() => onSelect(t.value)}
            className={`relative z-10 flex items-center justify-center gap-1.5 rounded-full px-3.5 py-1 text-sm transition-colors ${
              tab === t.value ? "text-[#7A2850]" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {t.label}
            {count != null && count > 0 && <span className="text-xs tabular-nums">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}

function RequestList({
  loading,
  items,
  emptyMessage,
  selectedId,
  onSelect,
}: {
  loading: boolean;
  items: (ExpertRequestItem | MyExpertRequestItem)[];
  emptyMessage: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  let content: ReactNode;
  if (loading) {
    content = Array.from({ length: 5 }, (_, i) => (
      <li key={i} className="flex items-center gap-3 px-3 py-3">
        <div className="size-9 shrink-0 animate-pulse rounded-full bg-gray-100" />
        <div className="flex-1">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
          <div className="mt-2 h-3 w-40 animate-pulse rounded bg-gray-100" />
        </div>
      </li>
    ));
  } else if (items.length === 0) {
    content = <li className="px-3 py-10 text-center text-sm text-gray-400">{emptyMessage}</li>;
  } else {
    content = items.map((item) => (
      <ExpertRequestListItem key={item.id} item={item} selected={item.id === selectedId} onSelect={onSelect} />
    ));
  }
  return <ul className="-mx-3 min-h-0 flex-1 divide-y divide-gray-100 overflow-y-auto">{content}</ul>;
}

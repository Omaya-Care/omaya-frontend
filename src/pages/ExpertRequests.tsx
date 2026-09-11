import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useExpertQueue, useMyExpertRequests } from "../hooks/useExpertRequests";
import { ExpertRequestListItem } from "../components/expert-requests/ExpertRequestListItem";
import { QueueDetail } from "../components/expert-requests/QueueDetail";
import { ThreadDetail } from "../components/expert-requests/ThreadDetail";
import { Skeleton } from "../components/ui/skeleton";
import { useSlideIndicator } from "../hooks/useSlideIndicator";

type Tab = "queue" | "mine";

const ExpertRequestsPage = () => {
  const [tab, setTab] = useState<Tab>("queue");
  const [selectedQueueId, setSelectedQueueId] = useState<string>("");
  const [selectedMineId, setSelectedMineId] = useState<string>("");
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  const { data: queue = [], isLoading: isQueueLoading } = useExpertQueue();
  const { data: mine = [], isLoading: isMineLoading } = useMyExpertRequests();

  const items = tab === "queue" ? queue : mine;
  const selectedId = tab === "queue" ? selectedQueueId : selectedMineId;
  const isLoading = tab === "queue" ? isQueueLoading : isMineLoading;

  // Default-select the first item once each tab's list loads, mirroring
  // Calls.tsx — one effect per list (not a single effect keyed off the
  // active tab) so switching tabs can't clobber the other tab's selection.
  useEffect(() => {
    // react-doctor-disable-next-line react-doctor/no-event-handler
    if (queue.length > 0 && !selectedQueueId) {
      // react-doctor-disable-next-line react-doctor/no-derived-state
      setSelectedQueueId(queue[0].id);
    }
  }, [queue, selectedQueueId]);

  useEffect(() => {
    // react-doctor-disable-next-line react-doctor/no-event-handler
    if (mine.length > 0 && !selectedMineId) {
      // react-doctor-disable-next-line react-doctor/no-derived-state
      setSelectedMineId(mine[0].id);
    }
  }, [mine, selectedMineId]);

  const listRef = useRef<HTMLDivElement>(null);
  const indicator = useSlideIndicator(listRef, '[data-slide-active="true"]', [
    selectedId,
    items,
  ]);

  const handleSelect = (id: string) => {
    if (tab === "queue") setSelectedQueueId(id);
    else setSelectedMineId(id);
    setMobileDetailOpen(true);
  };

  const handleClaimed = (requestId: string) => {
    setTab("mine");
    setSelectedMineId(requestId);
  };

  const handleCompleted = () => {
    setSelectedMineId("");
  };

  const selectedQueueItem = queue.find((r) => r.id === selectedQueueId) ?? null;
  const selectedMineItem = mine.find((r) => r.id === selectedMineId) ?? null;

  return (
    <div className="flex flex-1 min-h-0 flex-row gap-6">
      {/* ── LEFT PANEL ──────────────────────────────────────── */}
      <div
        className={`
          flex-shrink-0 flex-col bg-white rounded-2xl overflow-hidden shadow-sm
          w-full lg:w-80 h-full
          ${mobileDetailOpen ? "hidden lg:flex" : "flex"}
        `}
      >
        <div className="px-4 pt-5 pb-3 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Expert requests</h2>
        </div>

        <div className="px-4 pb-3 flex-shrink-0 flex items-center gap-1.5">
          {(
            [
              { key: "queue", label: `Queue${queue.length ? ` (${queue.length})` : ""}` },
              { key: "mine", label: `Mine${mine.length ? ` (${mine.length})` : ""}` },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`text-xs px-2.5 py-1.5 rounded-md border transition-colors font-medium ${
                tab === t.key
                  ? "border-primary bg-primary-100 text-primary"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div
          ref={listRef}
          className="relative flex-1 overflow-y-auto overflow-x-hidden border-t border-gray-200"
        >
          {indicator && (
            <div
              aria-hidden
              className="absolute left-0 right-0 top-0 z-0 h-px origin-top bg-gray-50 transition-transform duration-300 ease-out pointer-events-none"
              style={{
                transform: `translateY(${indicator.top}px) scaleY(${indicator.height})`,
              }}
            />
          )}
          {isLoading && items.length === 0 ? (
            <div className="space-y-1 p-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[64px] w-full rounded-lg" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-1 px-4 py-12">
              <p className="text-sm text-gray-400 font-normal text-center">
                {tab === "queue"
                  ? "No unclaimed requests right now — you're all caught up."
                  : "No active conversations."}
              </p>
            </div>
          ) : (
            items.map((item) => (
              <ExpertRequestListItem
                key={item.id}
                item={item}
                isSelected={selectedId === item.id}
                onClick={() => handleSelect(item.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL ─────────────────────────────────────── */}
      <div
        className={`
          flex-col bg-white rounded-2xl overflow-hidden shadow-sm p-6
          flex-1 h-full
          ${mobileDetailOpen ? "flex" : "hidden lg:flex"}
        `}
      >
        <button
          type="button"
          className="lg:hidden flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 -mt-1 self-start"
          onClick={() => setMobileDetailOpen(false)}
        >
          <ArrowLeft size={16} />
          <span>Back to list</span>
        </button>

        {tab === "queue" ? (
          <QueueDetail request={selectedQueueItem} onClaimed={handleClaimed} />
        ) : (
          <ThreadDetail
            key={selectedMineId}
            requestItem={selectedMineItem}
            onCompleted={handleCompleted}
          />
        )}
      </div>
    </div>
  );
};

export default ExpertRequestsPage;

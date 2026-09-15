import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Clock, Flag, Loader2, MessageCircle, Send, Star } from "lucide-react";
import { toast } from "sonner";
import { MyExpertRequestItem } from "../../types";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Textarea } from "../ui/textarea";
import { Skeleton } from "../ui/skeleton";
import { useExpertThread } from "../../hooks/useExpertRequests";
import {
  useCompleteExpertRequest,
  useReplyToExpertRequest,
  useSendExpertTyping,
} from "../../hooks/useMutations";
import {
  getExpertCategoryLabel,
  getExpertRequestStatusBadgeClass,
  getExpertRequestStatusLabel,
} from "../../lib/badge-helpers";
import { formatDateTime } from "../../lib/format";
import { extractApiError } from "../../lib/api";

interface ThreadDetailProps {
  requestItem: MyExpertRequestItem | null;
  onCompleted: () => void;
}

const RATING_LABEL: Record<string, string> = {
  good: "Good",
  okay: "Okay",
  not_helpful: "Not helpful",
};

// Fire the typing signal at most once per this many ms of continuous typing
// — WhatsApp's own indicator is visible "~25s or until the next message"
// (bridge.send_typing_indicator's docstring), so this doesn't need to be
// tight, just enough to feel live while she's mid-compose.
const TYPING_PING_INTERVAL_MS = 8_000;

const ThreadDetail = ({ requestItem, onCompleted }: ThreadDetailProps) => {
  const isActive = requestItem?.status === "active";
  // 'assigned' has no thread yet (see the waiting-state branch below) — no
  // point polling for one.
  const shouldFetchThread = requestItem != null && requestItem.status !== "assigned";
  const { data, isLoading } = useExpertThread(shouldFetchThread ? requestItem.id : "");
  const reply = useReplyToExpertRequest();
  const complete = useCompleteExpertRequest();
  const typing = useSendExpertTyping();
  const [body, setBody] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastTypingPingRef = useRef(0);

  const messages = data?.messages ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  if (!requestItem) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <MessageCircle className="text-gray-300 mb-2" size={48} />
        <p className="text-sm text-gray-400 font-normal">
          Select a conversation to view its messages
        </p>
      </div>
    );
  }

  const handleBodyChange = (value: string) => {
    setBody(value);
    if (!isActive || !value.trim()) return;
    const now = Date.now();
    if (now - lastTypingPingRef.current < TYPING_PING_INTERVAL_MS) return;
    lastTypingPingRef.current = now;
    typing.mutate(requestItem.id);
  };

  const handleSend = async () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    try {
      const result = await reply.mutateAsync({ requestId: requestItem.id, body: trimmed });
      setBody("");
      if (!result.sent) {
        toast.warning(
          "Your message is recorded, but it may not have reached her WhatsApp yet — you can retry.",
        );
      }
    } catch (err) {
      const { message } = extractApiError(err, "Could not send your reply. Please try again.");
      toast.error(message);
    }
  };

  const handleComplete = async () => {
    try {
      await complete.mutateAsync(requestItem.id);
      toast.success("Request marked complete.");
      onCompleted();
    } catch (err) {
      const { message } = extractApiError(err, "Could not mark this request complete.");
      toast.error(message);
    }
  };

  const displayName = requestItem.motherName ?? "Anonymous";

  return (
    <div className="flex flex-1 flex-col min-h-0 animate-in fade-in-0 duration-200 motion-reduce:animate-none">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-gray-900 truncate">
            {getExpertCategoryLabel(requestItem.category)}
            {requestItem.motherName && (
              <span className="font-normal text-gray-400"> · {displayName}</span>
            )}
          </h2>
          <p className="text-xs text-gray-400">
            Requested {formatDateTime(requestItem.requestedAt)}
            {requestItem.carePhase && ` · ${requestItem.carePhase}`}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {requestItem.reported && (
            <Badge variant="outline" className="border-red-200 bg-red-50 text-red-600" size="sm">
              <Flag size={11} />
              Reported
            </Badge>
          )}
          <Badge
            variant="outline"
            className={getExpertRequestStatusBadgeClass(requestItem.status)}
            size="sm"
            dot
          >
            {getExpertRequestStatusLabel(requestItem.status)}
          </Badge>
          {isActive && (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5"
              disabled={complete.isPending}
              onClick={handleComplete}
            >
              {complete.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckCircle2 size={14} />
              )}
              <span className="font-medium">Mark complete</span>
            </Button>
          )}
        </div>
      </div>

      {/* Original question — context above the live thread */}
      <div className="pt-4 pb-4 border-b border-gray-100 shrink-0">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest pb-1.5">
          What she asked
        </p>
        <p className="text-sm text-gray-600 font-normal leading-relaxed">
          {requestItem.questionText}
        </p>
      </div>

      {requestItem.status === "assigned" ? (
        // OMA-341: claimed, but she hasn't answered the consent card yet —
        // there's no thread to show and nothing to reply to.
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center px-6">
          <Clock className="text-gray-300" size={36} />
          <p className="text-sm text-gray-500 font-medium">Waiting for her to respond</p>
          <p className="text-xs text-gray-400 max-w-xs">
            She's been sent a message asking to confirm before the conversation starts. You'll be
            able to reply here once she answers.
          </p>
        </div>
      ) : (
        <>
          {/* Thread */}
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide mt-4 pr-1">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-2/3 rounded-2xl" />
                ))}
              </div>
            ) : messages.length === 0 ? (
              <p className="text-sm text-gray-400 font-normal text-center pt-8">
                No messages yet — send the first reply below.
              </p>
            ) : (
              <div className="flex flex-col py-1">
                {messages.map((m, idx, arr) => {
                  const isExpert = m.speaker === "expert";
                  const startsGroup = idx === 0 || arr[idx - 1].speaker !== m.speaker;
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${startsGroup ? "mt-4 first:mt-0" : "mt-1"} ${
                        isExpert ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-[82%] px-3.5 py-2 text-sm leading-relaxed shadow-sm ${
                          isExpert
                            ? `bg-primary text-white rounded-2xl ${startsGroup ? "rounded-tr-md" : ""}`
                            : `bg-gray-100 text-gray-800 rounded-2xl ${startsGroup ? "rounded-tl-md" : ""}`
                        }`}
                      >
                        {m.textBody}
                      </div>
                      <span className="text-[10px] text-gray-400 mt-0.5 px-1">
                        {formatDateTime(m.createdAt)}
                      </span>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
            )}
            {requestItem.rating && (
              <div className="mt-4 flex items-center gap-1.5 text-xs text-gray-400 justify-center pb-1">
                <Star size={12} />
                <span>She rated this conversation: {RATING_LABEL[requestItem.rating]}</span>
              </div>
            )}
          </div>

          {/* Composer */}
          {isActive && (
            <div className="shrink-0 pt-3 border-t border-gray-100 flex items-end gap-2 bg-white">
              <Textarea
                value={body}
                onChange={(e) => handleBodyChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
                placeholder="Reply to her — this sends over WhatsApp"
                rows={2}
                containerClassName="flex-1"
              />
              <Button
                variant="default"
                size="sm"
                className="flex items-center gap-1.5 mb-0.5"
                disabled={reply.isPending || !body.trim()}
                onClick={handleSend}
              >
                {reply.isPending ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Send size={15} />
                )}
                <span className="font-medium">Send</span>
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export { ThreadDetail };

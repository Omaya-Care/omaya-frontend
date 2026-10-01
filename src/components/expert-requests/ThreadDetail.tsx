import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Clock, Flag, Loader2, MessageCircle, Send, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/textarea";
import { Centered } from "@/components/calls/CallDetail";
import { toast } from "@/lib/notify";
import { extractApiError } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import {
  completeExpertRequest,
  replyToExpertRequest,
  sendExpertTyping,
  useExpertThread,
  type ExpertThreadMessage,
  type MyExpertRequestItem,
} from "@/hooks/useExpertRequests";
import { RATING_LABEL, expertCategoryLabel, expertStatusClass, expertStatusLabel } from "./expert-display";

// Fire the typing signal at most once per this many ms of continuous typing —
// WhatsApp's own indicator lasts ~25s or until the next message.
const TYPING_PING_INTERVAL_MS = 8_000;

/** Right-hand panel for one of the expert's own conversations. Key it by the
 *  request id so the draft resets per conversation. */
export function ThreadDetail({
  request,
  onCompleted,
}: {
  request: MyExpertRequestItem | null;
  onCompleted: () => void;
}) {
  // 'assigned' has no thread yet (she hasn't answered the consent card) — no
  // point polling for one.
  const threadId = request && request.status !== "assigned" ? request.id : null;
  const { data, loading, failed } = useExpertThread(threadId);

  if (!request) {
    return (
      <Centered>
        <MessageCircle className="mb-2 size-12 text-gray-300" strokeWidth={1.5} />
        <p className="text-sm text-gray-400">Select a conversation to view its messages</p>
      </Centered>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out motion-reduce:animate-none">
      <ThreadHeader request={request} onCompleted={onCompleted} />

      <section className="shrink-0 border-b border-gray-100 py-4">
        <p className="text-sm text-gray-500">What she asked</p>
        <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{request.questionText}</p>
      </section>

      {request.status === "assigned" ? (
        <Centered>
          <Clock className="mb-2 size-9 text-gray-300" strokeWidth={1.5} />
          <p className="text-sm font-medium text-gray-500">Waiting for her to respond</p>
          <p className="mt-1 max-w-xs text-center text-xs text-gray-400">
            She's been sent a message asking to confirm before the conversation starts. You'll be able to reply here
            once she answers.
          </p>
        </Centered>
      ) : (
        <>
          <Messages
            messages={data?.messages ?? []}
            loading={loading}
            failed={failed && !data}
            rating={request.rating}
          />
          {request.status === "active" && <Composer requestId={request.id} />}
        </>
      )}
    </div>
  );
}

function ThreadHeader({ request, onCompleted }: { request: MyExpertRequestItem; onCompleted: () => void }) {
  const [completing, setCompleting] = useState(false);

  async function handleComplete() {
    setCompleting(true);
    try {
      await completeExpertRequest(request.id);
      toast.success("Request marked complete.");
      onCompleted();
    } catch (err) {
      toast.error(extractApiError(err, "Could not mark this request complete.").message);
    } finally {
      setCompleting(false);
    }
  }

  return (
    <header className="flex items-center gap-4 border-b border-gray-100 pb-4">
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-2xl font-normal tracking-tight text-gray-900">
          {expertCategoryLabel(request.category)}
          {request.motherName && <span className="text-gray-400"> · {request.motherName}</span>}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Requested {formatDateTime(request.requestedAt)}
          {request.carePhase && ` · ${request.carePhase}`}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {request.reported && (
          <span className="flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-600">
            <Flag className="size-3" />
            Reported
          </span>
        )}
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${expertStatusClass(request.status)}`}>
          {expertStatusLabel(request.status)}
        </span>
        {request.status === "active" && (
          <Button variant="outline" size="sm" disabled={completing} onClick={() => void handleComplete()}>
            {completing ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
            Mark complete
          </Button>
        )}
      </div>
    </header>
  );
}

function Messages({
  messages,
  loading,
  failed,
  rating,
}: {
  messages: ExpertThreadMessage[];
  loading: boolean;
  failed: boolean;
  rating: string | null;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView?.({ block: "end" });
  }, [messages.length]);

  let content;
  if (loading) {
    content = (
      <div className="flex flex-col gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-12 w-2/3 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    );
  } else if (failed) {
    content = <p className="pt-8 text-center text-sm text-gray-400">Couldn't load this conversation. Retrying…</p>;
  } else if (messages.length === 0) {
    content = <p className="pt-8 text-center text-sm text-gray-400">No messages yet — send the first reply below.</p>;
  } else {
    content = (
      <ol className="flex flex-col py-1">
        {messages.map((m, idx) => {
          const isExpert = m.speaker === "expert";
          const startsGroup = idx === 0 || messages[idx - 1].speaker !== m.speaker;
          return (
            <li
              key={m.id}
              className={`flex flex-col ${startsGroup ? "mt-4 first:mt-0" : "mt-1"} ${isExpert ? "items-end" : "items-start"}`}
            >
              <span
                className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                  isExpert
                    ? `bg-[#7A2850] text-white ${startsGroup ? "rounded-tr-md" : ""}`
                    : `bg-gray-100 text-gray-800 ${startsGroup ? "rounded-tl-md" : ""}`
                }`}
              >
                {m.textBody}
              </span>
              <span className="mt-0.5 px-1 text-[10px] text-gray-400">{formatDateTime(m.createdAt)}</span>
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
      {content}
      <div ref={bottomRef} />
      {rating && (
        <p className="flex items-center justify-center gap-1.5 pb-1 pt-4 text-xs text-gray-400">
          <Star className="size-3" />
          She rated this conversation: {RATING_LABEL[rating] ?? rating}
        </p>
      )}
    </div>
  );
}

function Composer({ requestId }: { requestId: string }) {
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const lastTypingPing = useRef(0);

  function handleChange(value: string) {
    setBody(value);
    if (!value.trim()) return;
    const now = Date.now();
    if (now - lastTypingPing.current < TYPING_PING_INTERVAL_MS) return;
    lastTypingPing.current = now;
    sendExpertTyping(requestId);
  }

  async function handleSend() {
    const trimmed = body.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      const result = await replyToExpertRequest(requestId, trimmed);
      // The backend records the message BEFORE attempting delivery, so
      // `sent: false` means "she has not received this". Keep the draft so the
      // retry is one click — and say that a retry adds a second message.
      if (result.sent) {
        setBody("");
      } else {
        toast.warning(
          "Recorded, but it may not have reached her WhatsApp. Sending again will retry delivery and add a second message to the thread.",
        );
      }
    } catch (err) {
      toast.error(extractApiError(err, "Could not send your reply. Please try again.").message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex shrink-0 items-end gap-2 border-t border-gray-100 pt-3">
      <Textarea
        value={body}
        aria-label="Reply"
        maxLength={4000}
        onChange={(e) => handleChange(e.target.value)}
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
      <Button className="mb-0.5" disabled={sending || !body.trim()} onClick={() => void handleSend()}>
        {sending ? <Loader2 className="animate-spin" /> : <Send />}
        Send
      </Button>
    </div>
  );
}

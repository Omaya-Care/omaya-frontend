import { useState } from "react";
import { Calendar, HelpCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Centered } from "@/components/calls/CallDetail";
import { toast } from "@/lib/notify";
import { extractApiError } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { claimExpertRequest, type ExpertRequestItem } from "@/hooks/useExpertRequests";
import { expertCategoryLabel, expertStatusClass, expertStatusLabel } from "./expert-display";

/** Right-hand panel for an unclaimed request: what she asked + Claim. */
export function QueueDetail({
  request,
  onClaimed,
}: {
  request: ExpertRequestItem | null;
  onClaimed: (requestId: string) => void;
}) {
  const [claiming, setClaiming] = useState(false);

  if (!request) {
    return (
      <Centered>
        <HelpCircle className="mb-2 size-12 text-gray-300" strokeWidth={1.5} />
        <p className="text-sm text-gray-400">Select a request to view its details</p>
      </Centered>
    );
  }

  const category = expertCategoryLabel(request.category);

  async function handleClaim(id: string) {
    setClaiming(true);
    try {
      const result = await claimExpertRequest(id);
      if (result.sent) {
        toast.success("Request claimed — she's been asked to confirm before you can reply.");
      } else {
        toast.warning("Request claimed, but the confirmation message may not have reached her yet.");
      }
      onClaimed(id);
    } catch (err) {
      toast.error(
        extractApiError(err, "Could not claim this request — it may have just been claimed by someone else.")
          .message,
      );
    } finally {
      setClaiming(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out motion-reduce:animate-none">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <header className="flex items-center gap-4 pb-6">
          <span
            aria-hidden="true"
            className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#7A2850]/10 text-xl text-[#7A2850]"
          >
            {category.charAt(0)}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <h2 className="truncate text-2xl font-normal tracking-tight text-gray-900">{category}</h2>
            <span className="flex flex-wrap items-center gap-2">
              {request.urgent && (
                <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-600">Urgent</span>
              )}
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${expertStatusClass(request.status)}`}
              >
                {expertStatusLabel(request.status)}
              </span>
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <Calendar className="size-3.5 text-[#7A2850]" />
                Requested {formatDateTime(request.requestedAt)}
              </span>
            </span>
          </div>
        </header>

        <section>
          <p className="text-sm text-gray-500">What she asked</p>
          <p className="mt-2 whitespace-pre-wrap rounded-2xl border border-gray-200 px-5 py-4 text-sm leading-relaxed text-gray-900">
            {request.questionText}
          </p>
          {/* OMA-341: her name and stage are never shown before she's agreed
              to a specific expert AND opted in to sharing them. */}
          <p className="mt-4 text-xs text-gray-400">
            Her name and how far along she is stay private until she agrees to share them after you claim this
            request.
          </p>
        </section>
      </div>

      <footer className="flex shrink-0 justify-end border-t border-gray-100 pt-4">
        <Button disabled={claiming} onClick={() => void handleClaim(request.id)}>
          {claiming && <Loader2 className="animate-spin" />}
          Claim request
        </Button>
      </footer>
    </div>
  );
}

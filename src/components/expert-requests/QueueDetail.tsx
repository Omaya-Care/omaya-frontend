import { HelpCircle, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { ExpertRequestItem } from "../../types";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { useClaimExpertRequest } from "../../hooks/useMutations";
import {
  getExpertCategoryLabel,
  getExpertRequestStatusBadgeClass,
  getExpertRequestStatusLabel,
} from "../../lib/badge-helpers";
import { formatDateTime } from "../../lib/format";
import { extractApiError } from "../../lib/api";

interface QueueDetailProps {
  request: ExpertRequestItem | null;
  onClaimed: (requestId: string) => void;
}

const QueueDetail = ({ request, onClaimed }: QueueDetailProps) => {
  const claim = useClaimExpertRequest();

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <HelpCircle className="text-gray-300 mb-2" size={48} />
        <p className="text-sm text-gray-400 font-normal">Select a request to view details</p>
      </div>
    );
  }

  const handleClaim = async () => {
    try {
      const result = await claim.mutateAsync(request.id);
      if (result.sent) {
        toast.success("Request claimed — she's been asked to confirm before you can reply.");
      } else {
        toast.warning(
          "Request claimed, but the confirmation message may not have reached her yet.",
        );
      }
      onClaimed(request.id);
    } catch (err) {
      const { message } = extractApiError(
        err,
        "Could not claim this request — it may have just been claimed by someone else.",
      );
      toast.error(message);
    }
  };

  return (
    <div className="flex flex-1 flex-col min-h-0 animate-in fade-in-0 duration-200 motion-reduce:animate-none">
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        <div className="flex flex-col items-center pt-6 pb-5 border-b border-gray-100">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-xl font-bold text-primary mb-3 ring-4 ring-white shadow-sm">
            {getExpertCategoryLabel(request.category).charAt(0)}
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {getExpertCategoryLabel(request.category)}
          </h2>
          <div className="flex items-center gap-1.5">
            {request.urgent && (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200" size="sm">
                Urgent
              </Badge>
            )}
            <Badge
              variant="outline"
              className={getExpertRequestStatusBadgeClass(request.status)}
              size="sm"
              dot
            >
              {getExpertRequestStatusLabel(request.status)}
            </Badge>
          </div>
        </div>

        <div className="px-4 py-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest pb-2 border-b border-gray-200">
            Request info
          </p>
          <div className="divide-y divide-gray-100">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-1.5">
                <Calendar size={12} className="text-gray-400" />
                <span className="text-sm text-gray-500 font-normal">Requested</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {formatDateTime(request.requestedAt)}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest pb-2 border-b border-gray-200">
              What she asked
            </p>
            <p className="text-sm text-gray-700 font-normal leading-relaxed pt-3">
              {request.questionText}
            </p>
          </div>

          {/* OMA-341: her name and stage are never shown before she's
              agreed to a specific expert AND opted in to sharing them — see
              the combined consent card sent right after claim. */}
          <p className="mt-4 text-xs text-gray-400 font-normal">
            Her name and how far along she is stay private until she agrees to share them after
            you claim this request.
          </p>
        </div>
      </div>

      <div className="shrink-0 pt-4 border-t border-gray-100 flex justify-end bg-white">
        <Button
          variant="default"
          size="sm"
          className="flex items-center gap-1.5"
          disabled={claim.isPending}
          onClick={handleClaim}
        >
          {claim.isPending && <Loader2 size={15} className="animate-spin" />}
          <span className="font-medium">Claim request</span>
        </Button>
      </div>
    </div>
  );
};

export { QueueDetail };

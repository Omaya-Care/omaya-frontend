import { format, parseISO } from "date-fns";
import { PhoneCall, Clock, Heart, Calendar, Mic, Flag, Loader2, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Call } from "../../types";
import { Badge } from "../ui/Badge";
import { getSeverityBadgeClass, getStatusBadgeClass } from "../../lib/badge-helpers";
import { Button } from "../ui/Button";
import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import { useTriggerCall } from "../../hooks/useMutations";
import { toast } from "sonner";

interface CallDetailProps {
  call: Call | null;
  isLoading?: boolean;
}

const statusLabel: Record<string, string> = {
  completed:   "Completed",
  in_progress: "In progress",
  upcoming:    "Upcoming",
  missed:      "Missed",
};

function formatDuration(seconds?: number): string {
  if (seconds == null) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}

function formatScheduled(iso: string): string {
  try {
    return format(parseISO(iso), "d MMM yyyy · h:mm a");
  } catch {
    return iso;
  }
}

const CallDetail = ({ call, isLoading }: CallDetailProps) => {
  const navigate = useNavigate();
  const triggerCall = useTriggerCall();

  const handleViewMother = () => {
    if (!call) return;
    navigate("/mothers", { state: { motherId: call.motherId } });
  };

  const handleCallNow = async () => {
    if (!call) return;
    try {
      await triggerCall.mutateAsync(call.motherId);
      toast.success("Call triggered. She will receive a call shortly.");
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) toast.error("A call is already in progress for this mother.");
      else if (status === 403) toast.error("Cannot call. Consent has been withdrawn.");
      else toast.error("Could not trigger call. Please try again.");
    }
  };

  if (!call && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <PhoneCall className="text-gray-300 mb-2" size={48} />
        <p className="text-sm text-gray-400 font-normal">Select a call to view details</p>
      </div>
    );
  }

  if (!call) return null;

  const label = statusLabel[call.status] ?? call.status;
  const isCompleted = call.status === "completed";
  const hasTranscript = (call.transcript ?? []).length > 0;

  return (
    <div className="flex flex-col min-h-full">

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="pb-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{call.motherName}</h2>
            <p className="text-sm text-gray-500 font-normal mt-0.5">{call.callType}</p>
          </div>
          <Badge variant="outline" className={getStatusBadgeClass(call.status)} dot>
            {label}
          </Badge>
        </div>
      </div>

      {/* ── STATS STRIP ────────────────────────────────────── */}
      <div className="py-4 border-b border-gray-100">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl px-3 py-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Calendar size={13} className="text-gray-400" />
              <span className="text-xs text-gray-400 font-medium">Scheduled</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {formatScheduled(call.scheduledAt)}
            </span>
          </div>

          <div className="bg-gray-50 rounded-xl px-3 py-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Mic size={13} className="text-gray-400" />
              <span className="text-xs text-gray-400 font-medium">Duration</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {formatDuration(call.durationSeconds) || (
                <span className="text-gray-400 font-normal text-xs">
                  {isCompleted ? "Not recorded" : "Pending"}
                </span>
              )}
            </span>
          </div>

          <div className="bg-gray-50 rounded-xl px-3 py-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Clock size={13} className="text-gray-400" />
              <span className="text-xs text-gray-400 font-medium">Day in care</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {call.dayInCare != null ? `Day ${call.dayInCare}` : (
                <span className="text-gray-400 font-normal text-xs">Not recorded</span>
              )}
            </span>
          </div>

          <div className="bg-gray-50 rounded-xl px-3 py-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Heart size={13} className="text-gray-400" />
              <span className="text-xs text-gray-400 font-medium">Delivery type</span>
            </div>
            <span className="text-sm font-semibold text-gray-900 capitalize">
              {call.deliveryType ?? (
                <span className="text-gray-400 font-normal text-xs">Not recorded</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* ── TRANSCRIPT ─────────────────────────────────────── */}
      <div className="py-4 flex-1 border-b border-gray-100">
        <h3 className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">
          Transcript
        </h3>

        {!hasTranscript ? (
          <p className="text-sm text-gray-400 font-normal">
            {call.status === "upcoming"
              ? "Call has not happened yet."
              : call.status === "missed"
              ? "No answer — call was not connected."
              : "No transcript available for this call."}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {call.transcript!.map((row, idx) => {
              const isOmaya = row.speaker === "omaya";
              return (
                <div
                  key={idx}
                  className={`flex gap-2.5 ${isOmaya ? "" : "flex-row-reverse"}`}
                >
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 ${
                    isOmaya ? "bg-[#93406B] text-white" : "bg-gray-200 text-gray-600"
                  }`}>
                    {isOmaya ? "O" : "M"}
                  </div>
                  <div className={`max-w-[78%] px-3 py-2 rounded-xl text-sm font-normal leading-relaxed ${
                    isOmaya
                      ? "bg-[#F7E8F0] text-gray-800 rounded-tl-sm"
                      : "bg-gray-100 text-gray-800 rounded-tr-sm"
                  }`}>
                    {row.text}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── OUTCOME ────────────────────────────────────────── */}
      {isCompleted && (
        <div className="py-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Flag size={14} className={call.flagsRaised ? "text-orange-500" : "text-gray-300"} />
            <span className="text-sm text-gray-500 font-normal">
              {call.flagsRaised
                ? `${call.flagsRaised} flag${call.flagsRaised > 1 ? "s" : ""} raised`
                : "No flags raised"}
            </span>
          </div>
          {call.severity && (
            <Badge variant="outline" className={getSeverityBadgeClass(call.severity)} size="sm" dot>
              {call.severity.charAt(0).toUpperCase() + call.severity.slice(1)}
            </Badge>
          )}
        </div>
      )}

      {/* ── ACTIONS ────────────────────────────────────────── */}
      <div className="mt-auto pt-4 border-t border-gray-100 flex justify-end items-center gap-2 sticky bottom-0 bg-white">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5"
              onClick={handleViewMother}
            >
              <UserRound size={15} />
              <span className="font-medium">Mother record</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Go to this mother's profile.</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="default"
              size="sm"
              className="flex items-center gap-1.5"
              disabled={triggerCall.isPending}
              onClick={handleCallNow}
            >
              {triggerCall.isPending
                ? <Loader2 size={15} className="animate-spin" />
                : <PhoneCall size={15} />}
              <span className="font-medium">Call now</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Trigger an immediate check-in call for this mother.</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export { CallDetail };

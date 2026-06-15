import {
  UserRound,
  Heart,
  Clock,
  Calendar,
  ShieldCheck,
  MessageCircle,
  AlertTriangle,
  XCircle,
  ClipboardList,
  Phone,
  Pencil,
  Loader2,
  PhoneCall,
} from "lucide-react";
import { Mother } from "../../types";
import { Badge } from "../ui/Badge";
import { getSeverityBadgeClass } from "../../lib/badge-helpers";
import { Button } from "../ui/Button";
import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import { Alert, AlertDescription } from "../ui/alert";
import { formatDate } from "../../lib/format";
import { useTriggerCall } from "../../hooks/useMutations";
import { toast } from "sonner";

interface MotherDetailProps {
  mother: Mother | null;
  onWithdrawClick?: () => void;
  onLogVisitClick?: () => void;
  onEditClick?: () => void;
}

const consentConfig = {
  active:    { label: "Active",    className: "bg-green-100 text-green-700" },
  withdrawn: { label: "Withdrawn", className: "bg-red-100 text-red-600" },
  pending:   { label: "Pending",   className: "bg-yellow-100 text-yellow-700" },
};

const severityColors: Record<string, string> = {
  crisis:   "#DC2626",
  elevated: "#EA580C",
  monitor:  "#CA8A04",
  routine:  "#16A34A",
  inactive: "#9CA3AF",
};

const MotherDetail = ({
  mother,
  onWithdrawClick,
  onLogVisitClick,
  onEditClick,
}: MotherDetailProps) => {
  if (!mother) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <UserRound className="text-gray-300 mb-2" size={48} />
        <p className="text-sm text-gray-400 font-normal">
          Select a mother to view her profile
        </p>
      </div>
    );
  }

  const isWithdrawn = mother.consentStatus === "withdrawn";
  const triggerCall = useTriggerCall();
  const consent = consentConfig[mother.consentStatus] ?? { label: mother.consentStatus, className: "bg-gray-100 text-gray-500" };

  const handleCallNow = async () => {
    try {
      await triggerCall.mutateAsync(mother.id);
      toast.success("Call triggered. She will receive a call shortly.");
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) toast.error("A call is already in progress for this mother.");
      else if (status === 403) toast.error("Cannot call. Consent has been withdrawn.");
      else toast.error("Could not trigger call. Please try again.");
    }
  };

  return (
    <div className="flex flex-col min-h-full">

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="pb-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-gray-900">{mother.name}</h2>
              <Badge variant="outline" className={getSeverityBadgeClass(mother.severity)} dot>
                {mother.severity.charAt(0).toUpperCase() + mother.severity.slice(1)}
              </Badge>
            </div>
            <p className="text-xs text-gray-400 font-normal mt-0.5">{mother.hospital}</p>
          </div>
          {!isWithdrawn && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEditClick}
              className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 -mt-1"
            >
              <Pencil size={14} />
              <span className="text-sm font-medium">Edit</span>
            </Button>
          )}
        </div>

        {isWithdrawn && (
          <p className="text-xs text-red-400 mt-2 font-normal">
            Record is read-only. Consent has been withdrawn.
          </p>
        )}

        {mother.currentFlag && (
          <div className="mt-3 rounded-lg border border-orange-100 bg-orange-50 px-3 py-2.5 flex gap-2.5 items-start">
            <AlertTriangle size={15} className="text-orange-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-orange-700 font-normal leading-snug">{mother.currentFlag}</p>
          </div>
        )}
      </div>

      {/* ── STATUS STRIP ───────────────────────────────────── */}
      <div className="py-4 border-b border-gray-100">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-xl px-3 py-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Clock size={13} className="text-gray-400" />
              <span className="text-xs text-gray-400 font-medium">Day in care</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {mother.dayPostpartum != null ? `Day ${mother.dayPostpartum}` : "—"}
            </span>
          </div>

          <div className="bg-gray-50 rounded-xl px-3 py-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-gray-400" />
              <span className="text-xs text-gray-400 font-medium">Consent</span>
            </div>
            <span className={`text-xs font-semibold self-start px-2 py-0.5 rounded-full ${consent.className}`}>
              {consent.label}
            </span>
          </div>

          <div className="bg-gray-50 rounded-xl px-3 py-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <MessageCircle size={13} className="text-gray-400" />
              <span className="text-xs text-gray-400 font-medium">Last contact</span>
            </div>
            <span className="text-sm font-semibold text-gray-900 truncate">
              {mother.lastInteraction || "None"}
            </span>
          </div>
        </div>
      </div>

      {/* ── RECENT CHECK-INS ───────────────────────────────── */}
      <div className="py-4 border-b border-gray-100">
        <h3 className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">
          Recent check-ins
        </h3>
        {mother.checkIns.length === 0 ? (
          <p className="text-sm text-gray-400 font-normal">No check-ins recorded yet.</p>
        ) : (
          <div className="flex flex-col">
            {mother.checkIns.map((checkIn, index) => (
              <div
                key={checkIn.id}
                className={`flex items-center py-2.5 ${
                  index !== mother.checkIns.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <div className="flex flex-col w-14 flex-shrink-0">
                  <span className="text-xs font-semibold text-gray-800">{checkIn.date}</span>
                  <span className="text-xs text-gray-400 font-normal">Day {checkIn.day}</span>
                </div>
                <div className="flex-1 px-3 flex items-center gap-2 min-w-0">
                  <div
                    className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: severityColors[checkIn.severity] }}
                  />
                  <span className="text-sm text-gray-600 font-normal truncate">
                    {checkIn.summary}
                  </span>
                </div>
                {checkIn.transcript && (
                  <button className="text-xs text-[#93406B] font-medium hover:underline whitespace-nowrap flex-shrink-0">
                    Transcript
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── DISCHARGE DETAILS ──────────────────────────────── */}
      <div className="py-4 border-b border-gray-100">
        <h3 className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">
          Discharge
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Heart,    label: "Type",      value: mother.deliveryType ? mother.deliveryType.charAt(0).toUpperCase() + mother.deliveryType.slice(1) : "" },
            { icon: Calendar, label: "Delivered",  value: formatDate(mother.deliveryDate ?? "") },
            { icon: Calendar, label: "Discharged", value: formatDate(mother.dischargeDate) },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1 mb-0.5">
                <item.icon size={12} className="text-gray-400" />
                <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">{item.label}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{item.value || "—"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── PATIENT DETAILS ────────────────────────────────── */}
      <div className="py-5 border-b border-gray-100 flex flex-col gap-5">
        <h3 className="text-xs font-semibold tracking-widest text-gray-400 uppercase -mb-2">
          Patient
        </h3>

        {/* Contact */}
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-widest">Contact</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Phone",         value: mother.phone || "" },
              { label: "Date of birth", value: formatDate(mother.dateOfBirth ?? "") },
            ].map((item, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl px-3 py-3 flex flex-col gap-0.5">
                <span className="text-xs text-gray-400 font-medium">{item.label}</span>
                <span className="text-sm font-semibold text-gray-900">{item.value || "Not set"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Clinical */}
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-widest">Clinical</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                label: "Gravida / Para",
                value: mother.gravida != null && mother.para != null
                  ? `G${mother.gravida} P${mother.para}`
                  : "",
              },
              {
                label: "Language",
                value: mother.language
                  ? mother.language.charAt(0).toUpperCase() + mother.language.slice(1)
                  : "",
              },
              {
                label: "Calling window",
                value: mother.preferredCallWindow
                  ? ({ morning: "Morning", afternoon: "Afternoon", evening: "Evening", inbound: "Inbound" }[mother.preferredCallWindow] ?? mother.preferredCallWindow)
                  : "",
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl px-3 py-3 flex flex-col gap-0.5">
                <span className="text-xs text-gray-400 font-medium">{item.label}</span>
                <span className="text-sm font-semibold text-gray-900">{item.value || "Not set"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk factors */}
        {mother.risks && mother.risks.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-widest">Risk factors</p>
            <div className="bg-orange-50 border border-orange-100 rounded-xl px-3 py-3 flex flex-wrap gap-1.5">
              {mother.risks.map((r) => (
                <span key={r} className="px-2.5 py-1 rounded-full bg-white text-orange-700 text-xs font-medium border border-orange-100 shadow-sm">
                  {r.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Medications */}
        {mother.medications && mother.medications.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-widest">Medications sent home</p>
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-3 flex flex-wrap gap-1.5">
              {mother.medications.map((m) => (
                <span key={m} className="px-2.5 py-1 rounded-full bg-white text-blue-700 text-xs font-medium border border-blue-100 shadow-sm">
                  {m.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── AUDIT NOTE ─────────────────────────────────────── */}
      <Alert className="border-gray-100 bg-gray-50 mt-4">
        <ShieldCheck className="h-4 w-4 text-gray-400" />
        <AlertDescription className="text-gray-400 text-xs">
          Severity labels are system-set and read-only for audit integrity.
        </AlertDescription>
      </Alert>

      {/* ── ACTIONS ────────────────────────────────────────── */}
      <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center sticky bottom-0 bg-white">
        <div>
          {!isWithdrawn && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onWithdrawClick}
                  className="text-xs text-red-400 font-normal flex items-center gap-1.5 hover:text-red-600 transition-colors"
                >
                  <XCircle size={15} />
                  <span>Withdraw from program</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>This will stop all scheduled calls for this mother.</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5"
                onClick={onLogVisitClick}
              >
                <ClipboardList size={15} />
                <span className="font-medium">Log visit</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top"><p>Record a manual visit or note.</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="flex items-center gap-1.5"
                disabled={isWithdrawn || triggerCall.isPending}
                onClick={handleCallNow}
              >
                {triggerCall.isPending
                  ? <Loader2 size={15} className="animate-spin" />
                  : <PhoneCall size={15} />}
                <span className="font-medium">Call now</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{isWithdrawn ? "Cannot call. Consent withdrawn." : "Trigger an immediate check-in call."}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export { MotherDetail };

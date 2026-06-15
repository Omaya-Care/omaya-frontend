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
} from "lucide-react";
import { Mother } from "../../types";
import { Badge } from "../ui/Badge";
import { getSeverityBadgeClass } from "../../lib/badge-helpers";
import { Button } from "../ui/Button";
import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import { Alert, AlertDescription } from "../ui/alert";
import { formatDate } from "../../lib/format";

interface MotherDetailProps {
  mother: Mother | null;
  onWithdrawClick?: () => void;
  onLogVisitClick?: () => void;
}

const MotherDetail = ({
  mother,
  onWithdrawClick,
  onLogVisitClick,
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

  const severityColors = {
    crisis: "#DC2626",
    elevated: "#EA580C",
    monitor: "#CA8A04",
    routine: "#16A34A",
    inactive: "#9CA3AF",
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* TOP: Name + severity badge */}
      <div className="pb-5 border-b border-gray-200">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold text-gray-900">{mother.name}</h2>
          <Badge variant="outline" className={`${getSeverityBadgeClass(mother.severity)} ml-3`} dot>
            {mother.severity.charAt(0).toUpperCase() + mother.severity.slice(1)}
          </Badge>
        </div>
        {isWithdrawn && (
          <p className="text-xs text-gray-400 mt-1 font-normal">
            Record is read-only. Consent has been withdrawn.
          </p>
        )}
      </div>

      {/* CURRENT SEVERITY + FLAG */}
      <div className="pt-5 pb-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 font-normal">Current severity</span>
          <Badge variant="outline" className={getSeverityBadgeClass(mother.severity)} size="sm" dot>
            {mother.severity.charAt(0).toUpperCase() + mother.severity.slice(1)}
          </Badge>
        </div>
        {mother.currentFlag && (
          <div className="mt-3 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3">
            <div className="flex items-center gap-1.5 mb-1">
              <AlertTriangle size={16} className="text-orange-400" />
              <span className="text-sm font-medium text-orange-700">Current flag</span>
            </div>
            <p className="text-sm text-gray-700 font-normal mt-1 leading-relaxed">
              {mother.currentFlag}
            </p>
          </div>
        )}
      </div>

      {/* RECENT CHECK-INS */}
      <div className="pt-5 pb-5 border-b border-gray-200">
        <h3 className="text-xs font-medium tracking-widest text-gray-400 uppercase mb-3">
          RECENT CHECK-INS
        </h3>

        <div className="flex flex-col">
          {mother.checkIns.length === 0 ? (
            <p className="text-sm text-gray-400 font-normal">No check-ins recorded yet.</p>
          ) : (
            mother.checkIns.map((checkIn, index) => (
              <div
                key={checkIn.id}
                className={`flex items-center py-3 ${
                  index !== mother.checkIns.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <div className="flex flex-col w-16">
                  <span className="text-sm font-semibold text-gray-800">
                    {checkIn.date}
                  </span>
                  <span className="text-xs text-gray-400 font-normal">
                    Day {checkIn.day}
                  </span>
                </div>
                <div className="flex-1 px-4 flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: severityColors[checkIn.severity] }}
                  />
                  <span className="text-sm text-gray-700 font-normal">
                    {checkIn.summary}
                  </span>
                </div>
                {checkIn.transcript ? (
                  <button className="text-xs text-[#93406B] font-medium hover:underline whitespace-nowrap">
                    View Transcript
                  </button>
                ) : (
                  <span className="text-xs text-gray-300 font-normal">—</span>
                )}
              </div>
            ))
          )}
        </div>

        <div className="border-t border-gray-200 pt-3 mt-1">
          <div className="flex justify-between py-2 items-center">
            <span className="text-sm text-gray-500 font-normal">Check-ins logged</span>
            <span className="text-sm font-semibold text-gray-900">{mother.checkIns.length}</span>
          </div>
        </div>
      </div>

      {/* META GRID */}
      <div className="grid grid-cols-2 gap-x-16 gap-y-5 pt-5 pb-5 border-b border-gray-200">
        {[
          {
            icon: Heart,
            label: "Delivery type",
            value: mother.deliveryType.charAt(0).toUpperCase() + mother.deliveryType.slice(1),
          },
          {
            icon: Clock,
            label: "Day in care",
            value: `Day ${mother.dayPostpartum} postpartum`,
          },
          {
            icon: ShieldCheck,
            label: "Consent status",
            value: mother.consentStatus.charAt(0).toUpperCase() + mother.consentStatus.slice(1),
          },
          {
            icon: MessageCircle,
            label: "Last interaction",
            value: mother.lastInteraction,
          },
          {
            icon: Calendar,
            label: "Discharge date",
            value: formatDate(mother.dischargeDate),
          },
        ].map((item, idx) => (
          <div key={idx} className="flex flex-col">
            <div className="flex items-center gap-1.5 mb-1">
              <item.icon size={16} className="text-gray-400" />
              <span className="text-xs text-gray-400 uppercase tracking-wide font-normal">
                {item.label}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-900">{item.value}</span>
          </div>
        ))}
      </div>

      {/* AUDIT NOTE */}
      <Alert className="border-gray-200 bg-gray-50 text-gray-500 mt-5">
        <ShieldCheck className="h-4 w-4 text-gray-400" />
        <AlertDescription>
          Records and severity labels are system-set and read-only for audit integrity.
        </AlertDescription>
      </Alert>

      {/* BOTTOM ACTIONS */}
      <div className="mt-auto pt-4 border-t border-gray-200 flex justify-between items-center sticky bottom-0 bg-white">
        <div>
          {!isWithdrawn && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onWithdrawClick}
                  className="text-sm text-red-500 font-normal flex items-center gap-1.5 hover:underline"
                >
                  <XCircle size={16} />
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
                <ClipboardList size={16} />
                <span className="font-medium">Log visit</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Record a manual visit or note.</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="flex items-center gap-1.5"
              >
                <Phone size={16} />
                <span className="font-medium">Call now</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Start a call with this mother.</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export { MotherDetail };

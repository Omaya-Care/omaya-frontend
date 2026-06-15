import { Mother } from "../../types";
import { Badge } from "../ui/Badge";
import { getSeverityBadgeClass } from "../../lib/badge-helpers";
import { formatDate } from "../../lib/format";
import { Skeleton } from "../ui/skeleton";

interface MotherListItemProps {
  mother: Mother;
  isSelected: boolean;
  onClick: () => void;
  onViewDetails?: () => void;
  onLogVisit?: () => void;
  onCallNow?: () => void;
  onWithdraw?: () => void;
}

const severityBorderColors: Record<string, string> = {
  crisis: "border-l-red-500",
  elevated: "border-l-orange-500",
  monitor: "border-l-yellow-500",
  routine: "border-l-green-500",
  inactive: "border-l-gray-300",
};

const MotherListItem = ({
  mother,
  isSelected,
  onClick,
  onViewDetails,
  onLogVisit,
  onCallNow,
  onWithdraw,
}: MotherListItemProps) => {
  // Top level guard for incomplete data
  if (!mother || !mother.name) {
    return (
      <div className="w-full px-4 py-3 border-l-4 border-l-transparent border-b border-gray-50">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="pl-11 mt-2 flex gap-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="pl-11 mt-2">
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
    );
  }

  const isWithdrawn = mother.consentStatus === "withdrawn";
  const severity = mother.severity || "routine";
  const borderColor = severityBorderColors[severity] || "border-l-transparent";

  // Safe initials generation
  const initials = mother.name?.charAt(0) ?? "?";

  return (
    <div
      className={`
        w-full px-4 py-3 transition-colors border-l-4
        ${isSelected ? `${borderColor} bg-gray-50` : "border-l-transparent hover:bg-gray-50"}
        ${isWithdrawn ? "text-gray-400" : ""}
      `}
    >
      <div className="flex justify-between items-start">
        <button
          onClick={onClick}
          className="flex-1 text-left min-w-0 flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400 shrink-0">
            {initials}
          </div>
          <span
            className={`text-sm font-semibold text-gray-900 truncate ${isWithdrawn ? "italic text-gray-400" : ""}`}
          >
            {mother.name}
          </span>
        </button>
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
          <Badge
            variant="outline"
            className={getSeverityBadgeClass(severity)}
            size="sm"
            dot
          >
            {(severity?.charAt(0)?.toUpperCase() ?? "") +
              (severity?.slice(1) ?? "")}
          </Badge>
        </div>
      </div>

      <button onClick={onClick} className="w-full text-left pl-11">
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500 font-normal">
            Day {mother.dayPostpartum}
          </span>
          <span className="text-gray-300 text-xs">·</span>
          <span className="text-xs text-gray-500 font-normal">
            {(mother.deliveryType?.charAt(0)?.toUpperCase() ?? "") +
              (mother.deliveryType?.slice(1) ?? "")}
          </span>
          <span className="text-gray-300 text-xs">·</span>
          <span className="text-xs text-gray-500 font-normal">
            {formatDate(mother.dischargeDate)}
          </span>
        </div>

        <div
          className={`text-xs text-gray-400 mt-1 font-normal truncate ${isWithdrawn ? "italic text-gray-400" : ""}`}
        >
          {mother.note}
        </div>
      </button>
    </div>
  );
};

export { MotherListItem };

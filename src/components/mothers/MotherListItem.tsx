import { PhoneCall } from "lucide-react";
import { Mother } from "../../types";
import { Badge } from "../ui/Badge";
import {
  getSeverityBadgeClass,
  getSeverityBorderClass,
} from "../../lib/badge-helpers";
import { formatDateTime } from "../../lib/format";
import { Skeleton } from "../ui/skeleton";

interface MotherListItemProps {
  mother: Mother;
  isSelected: boolean;
  onClick: () => void;
}

const MotherListItem = ({
  mother,
  isSelected,
  onClick,
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
  const borderColor = getSeverityBorderClass(severity);

  // Safe initials generation
  const initials = mother.name?.charAt(0) ?? "?";

  return (
    <button
      onClick={onClick}
      aria-label={`View ${mother.name}`}
      className={`
        w-full px-4 py-3 text-left transition-colors border-l-4
        ${isSelected ? `${borderColor} bg-gray-50` : "border-l-transparent hover:bg-gray-50"}
        ${isWithdrawn ? "text-gray-400" : ""}
      `}
    >
      <div className="flex items-center gap-3">
        <div className="shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-[10px] font-bold text-primary">
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          {/* Line 1: name + severity badge */}
          <div className="flex justify-between items-center gap-2">
            <span
              className={`block text-sm font-medium text-gray-900 truncate ${isWithdrawn ? "italic text-gray-400" : ""}`}
            >
              {mother.name}
            </span>
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

          {/* Line 2: next call */}
          <div className="mt-1">
            {mother.nextCallAt && !isWithdrawn ? (
              <div className="flex items-center gap-1.5">
                <PhoneCall size={11} className="text-primary shrink-0" />
                <span className="text-xs font-medium text-primary truncate">
                  Next call · {formatDateTime(mother.nextCallAt)}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <PhoneCall size={11} className="text-gray-300 shrink-0" />
                <span className="text-xs font-normal text-gray-400">
                  No upcoming call
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};

export { MotherListItem };

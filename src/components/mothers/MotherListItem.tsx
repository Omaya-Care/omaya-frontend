import { Mother } from "../../types";
import { Badge } from "../ui/Badge";
import { getSeverityBadgeClass } from "../../lib/badge-helpers";
import { formatDate } from "../../lib/format";

interface MotherListItemProps {
  mother: Mother;
  isSelected: boolean;
  onClick: () => void;
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
}: MotherListItemProps) => {
  const isWithdrawn = mother.consentStatus === "withdrawn";
  const borderColor = severityBorderColors[mother.severity] || "border-l-transparent";

  return (
    <div
      onClick={onClick}
      className={`
        w-full cursor-pointer px-4 py-3 transition-colors border-l-4
        ${isSelected ? `${borderColor} bg-gray-50` : "border-l-transparent hover:bg-gray-50"}
        ${isWithdrawn ? "text-gray-400" : ""}
      `}
    >
      <div className="flex justify-between items-start">
        <span
          className={`text-sm font-semibold text-gray-900 ${isWithdrawn ? "italic text-gray-400" : ""}`}
        >
          {mother.name}
        </span>
        <Badge variant="outline" className={getSeverityBadgeClass(mother.severity)} size="sm" dot>
          {mother.severity.charAt(0).toUpperCase() + mother.severity.slice(1)}
        </Badge>
      </div>

      <div className="flex items-center gap-2 mt-1">
        <span className="text-xs text-gray-500 font-normal">
          Day {mother.dayPostpartum}
        </span>
        <span className="text-gray-300 text-xs">·</span>
        <span className="text-xs text-gray-500 font-normal">
          {mother.deliveryType.charAt(0).toUpperCase() + mother.deliveryType.slice(1)}
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
    </div>
  );
};

export { MotherListItem };

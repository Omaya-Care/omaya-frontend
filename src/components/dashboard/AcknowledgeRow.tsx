import { EscalationItem } from "../../types";
import { Badge } from "../ui/Badge";
import { getSeverityBadgeClass } from "../../lib/badge-helpers";
import { Button } from "../ui/Button";
import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";

interface AcknowledgeRowProps {
  item: EscalationItem;
  onAcknowledge: (id: string) => void;
}

const AcknowledgeRow = ({ item, onAcknowledge }: AcknowledgeRowProps) => {
  const formatTimeLeft = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  const getTimeStatusStyles = (totalMinutes: number) => {
    if (totalMinutes < 30) {
      return "text-rose-600 animate-soft-pulse";
    }
    if (totalMinutes <= 120) {
      return "text-amber-600";
    }
    return "text-emerald-600";
  };

  const statusStyles = getTimeStatusStyles(item.timeLeftMinutes);

  return (
    <div className="flex items-center w-full border-b border-gray-50 last:border-0 py-3">
      {/* MOTHER COLUMN */}
      <div className="flex-1">
        <div className="font-medium text-gray-900">{item.motherName}</div>
        <div className="text-sm font-normal text-gray-400">
          Day {item.dayPostpartum}
        </div>
      </div>

      {/* SEVERITY COLUMN */}
      <div className="w-48">
        <Badge variant="outline" className={getSeverityBadgeClass(item.severity)} dot>
          {item.severity.charAt(0).toUpperCase() + item.severity.slice(1)}
        </Badge>
      </div>

      {/* TIME LEFT COLUMN */}
      <div className={`flex-1 ${statusStyles}`}>
        <div className="text-base font-semibold">
          {formatTimeLeft(item.timeLeftMinutes)}
        </div>
        <div className="text-xs font-normal opacity-80">left within SLA</div>
      </div>

      {/* ACTION COLUMN */}
      <div className="w-36 flex justify-end">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAcknowledge(item.id)}
            >
              Acknowledge
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Acknowledge this alert</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export { AcknowledgeRow };

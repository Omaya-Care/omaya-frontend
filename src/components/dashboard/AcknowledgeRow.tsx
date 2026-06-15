import { EscalationItem } from "../../types";
import { Badge } from "../ui/Badge";
import { getSeverityBadgeClass } from "../../lib/badge-helpers";
import { Button } from "../ui/Button";
import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import { TableRow, TableCell } from "../ui/table";

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
    <TableRow className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <TableCell className="py-3">
        <div className="font-medium text-gray-900">{item.motherName}</div>
        <div className="text-sm font-normal text-gray-400">
          Day {item.dayPostpartum}
        </div>
      </TableCell>
      <TableCell className="py-3">
        <Badge variant="outline" className={getSeverityBadgeClass(item.severity)} dot>
          {item.severity.charAt(0).toUpperCase() + item.severity.slice(1)}
        </Badge>
      </TableCell>
      <TableCell className={`py-3 ${statusStyles}`}>
        <div className="text-base font-semibold">
          {formatTimeLeft(item.timeLeftMinutes)}
        </div>
        <div className="text-xs font-normal opacity-80">left within SLA</div>
      </TableCell>
      <TableCell className="py-3 text-right">
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
      </TableCell>
    </TableRow>
  );
};

export { AcknowledgeRow };

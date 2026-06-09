import React from "react";
import { EscalationItem } from "../../types";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

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

  return (
    <div className="flex items-center w-full border-b border-gray-100 py-4">
      {/* MOTHER COLUMN */}
      <div className="flex-1">
        <div className="font-medium text-gray-900">{item.motherName}</div>
        <div className="text-sm font-normal text-gray-400">
          Day {item.dayPostpartum}
        </div>
      </div>

      {/* SEVERITY COLUMN */}
      <div className="w-48">
        <Badge variant={item.severity} dot>
          {item.severity.charAt(0).toUpperCase() + item.severity.slice(1)}
        </Badge>
      </div>

      {/* TIME LEFT COLUMN */}
      <div className="flex-1">
        <div className="text-base font-semibold text-gray-800">
          {formatTimeLeft(item.timeLeftMinutes)}
        </div>
        <div className="text-xs font-normal text-gray-400">left within SLA</div>
      </div>

      {/* ACTION COLUMN */}
      <div className="w-36 flex justify-end">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onAcknowledge(item.id)}
        >
          Acknowledge
        </Button>
      </div>
    </div>
  );
};

export { AcknowledgeRow };

import React from "react";
import { Plus } from "lucide-react";
import { Button } from "../ui/Button";

interface PageHeaderProps {
  userName: string;
  onNewDischarge?: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  userName,
  onNewDischarge,
}) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-1">
        <span className="text-gray-400 text-sm font-normal">
          Tuesday, 3 June
        </span>
        <Button
          variant="primary"
          size="sm"
          onClick={onNewDischarge}
          className="flex items-center gap-1.5"
        >
          <Plus size={16} />
          <span className="font-medium">New discharge</span>
        </Button>
      </div>
      <h1 className="text-3xl font-bold text-gray-900">
        Good morning, {userName}
      </h1>
    </div>
  );
};

import React from "react";
import { Plus } from "lucide-react";
import { Button } from "../ui/Button";

interface PageHeaderProps {
  userName: string;
  onNewDischarge?: () => void;
}

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const formatDate = () => {
  const now = new Date();
  return `${dayNames[now.getDay()]}, ${now.getDate()} ${monthNames[now.getMonth()]}`;
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 21) return "Good evening";
  return "Good night";
};

export const PageHeader: React.FC<PageHeaderProps> = ({
  userName,
  onNewDischarge,
}) => {
  return (
    <div className="mb-6 md:mb-8">
      <div className="flex justify-between items-center mb-1">
        <span className="text-gray-400 text-xs md:text-sm font-normal">
          {formatDate()}
        </span>
        <Button
          variant="primary"
          onClick={onNewDischarge}
          className="flex items-center gap-1.5 h-[2.4rem] md:h-[2.8rem] px-3 md:px-5"
        >
          <Plus size={14} className="md:size-4" />
          <span className="font-medium text-xs md:text-sm">New discharge</span>
        </Button>
      </div>
      <h1 className="text-xl md:text-3xl font-bold text-gray-900">
        {getGreeting()}, {userName}
      </h1>
    </div>
  );
};

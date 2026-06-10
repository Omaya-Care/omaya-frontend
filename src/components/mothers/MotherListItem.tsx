import { Mother } from "../../types";
import { Badge } from "../ui/Badge";

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
  const isWithdrawn = mother.consentStatus === "withdrawn";

  return (
    <div
      onClick={onClick}
      className={`
        w-full cursor-pointer px-4 py-3.5 transition-colors border-l-2
        ${isSelected ? "border-[#93406B] bg-[#F7E8F0]" : "border-transparent hover:bg-gray-50"}
        ${isWithdrawn ? "text-gray-400" : ""}
      `}
    >
      <div className="flex justify-between items-start">
        <span
          className={`text-sm font-semibold text-gray-900 ${isWithdrawn ? "italic text-gray-400" : ""}`}
        >
          {mother.name}
        </span>
        <Badge variant={mother.severity} size="sm" dot>
          {mother.severity.charAt(0).toUpperCase() + mother.severity.slice(1)}
        </Badge>
      </div>

      <div className="text-xs text-gray-400 mt-0.5 font-normal">
        Day {mother.dayPostpartum} ·{" "}
        {mother.deliveryType.charAt(0).toUpperCase() +
          mother.deliveryType.slice(1)}
      </div>

      <div
        className={`text-xs text-gray-500 mt-1 font-normal truncate ${isWithdrawn ? "italic text-gray-400" : ""}`}
      >
        {mother.note}
      </div>
    </div>
  );
};

export { MotherListItem };

import { MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "../ui";

interface StatCardProps {
  label: string;
  sublabel: string;
  value: string | number;
  background: string;
  footerText?: string;
  footerColor?: string;
  onViewAll?: () => void;
}

const StatCard = ({
  label,
  sublabel,
  value,
  background,
  footerText,
  footerColor,
  onViewAll,
}: StatCardProps) => {
  return (
    <Card className="border-0 shadow-none rounded-2xl" style={{ backgroundColor: background }}>
      <CardContent className="p-3 md:p-5">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-xs md:text-sm font-medium text-[#6B2C50]">{label}</span>
            <span className="text-xs font-normal text-[#8C4A6A]">{sublabel}</span>
          </div>
          <MoreHorizontal className="text-[#93406B]/40" size={14} />
        </div>

        <div className="text-2xl md:text-4xl font-bold text-[#3D1A2E] mt-3 md:mt-4">{value}</div>

        {(footerText || onViewAll) && (
          <div className="mt-4 flex justify-between items-center">
            <div>
              {footerText && (
                <span
                  className="text-xs font-normal"
                  style={{ color: footerColor }}
                >
                  {footerText}
                </span>
              )}
            </div>
            {onViewAll && (
              <button
                onClick={onViewAll}
                className="text-xs font-normal underline text-[#6B2C50] hover:opacity-80 transition-opacity"
              >
                View all
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { StatCard };

import { MoreHorizontal } from 'lucide-react';
import { StaffMember, StaffStatus } from "../../types";
import { Badge } from "../ui/Badge";

interface StaffRowProps {
  member: StaffMember;
}

const statusConfig: Record<StaffStatus, { dot: string; text: string; label: string }> = {
  active:    { dot: 'bg-green-500',  text: 'text-green-700',  label: 'Active' },
  invited:   { dot: 'bg-gray-400',   text: 'text-gray-500',   label: 'Invited' },
  suspended: { dot: 'bg-red-500',    text: 'text-red-600',    label: 'Suspended' },
};

const StaffRow = ({ member }: StaffRowProps) => {
  const { text, label } = statusConfig[member.status];

  return (
    <div className="grid grid-cols-[1fr_160px_144px_180px] items-center px-6 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
      {/* NAME */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#F7E8F0] text-[#93406B] font-semibold text-sm flex items-center justify-center flex-shrink-0">
          {member.initials}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-gray-900">{member.name}</span>
            {member.isCurrentUser && (
              <span className="text-xs bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">You</span>
            )}
          </div>
          <span className="text-sm text-gray-400">{member.email}</span>
        </div>
      </div>

      {/* ROLE */}
      <div>
        <span className="bg-gray-100 text-gray-700 rounded-md px-2.5 py-1 text-sm">
          {member.role}
        </span>
      </div>

      {/* STATUS */}
      <div>
        <Badge variant="outline" className={`border-gray-100 ${text}`} size="sm" dot>
          {label}
        </Badge>
      </div>

      {/* LAST ACTIVE + MENU */}
      <div className="flex items-center justify-end gap-3">
        <span className="text-sm text-gray-400">{member.lastActive}</span>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>
    </div>
  );
};

export { StaffRow };

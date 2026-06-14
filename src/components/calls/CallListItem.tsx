import { Call, CallStatus } from '../../types';
import { Badge } from '../ui/Badge';
import { getStatusBadgeClass } from '../../lib/badge-helpers';

interface CallListItemProps {
  call: Call;
  isSelected: boolean;
  onClick: () => void;
}

const statusLabel: Record<CallStatus, string> = {
  completed:   'Completed',
  in_progress: 'In progress',
  upcoming:    'Upcoming',
  missed:      'Missed',
};

const CallListItem = ({ call, isSelected, onClick }: CallListItemProps) => {
  const label = statusLabel[call.status];

  return (
    <div
      onClick={onClick}
      className={`
        w-full cursor-pointer px-4 py-3.5 transition-colors border-l-2
        ${isSelected ? 'border-[#93406B] bg-[#F7E8F0]' : 'border-transparent hover:bg-gray-50'}
      `}
    >
      <div className="flex justify-between items-start">
        <span className="text-sm font-semibold text-gray-900">{call.motherName}</span>
        <Badge variant="outline" className={getStatusBadgeClass(call.status)} size="sm">{label}</Badge>
      </div>
      <div className="text-xs text-gray-400 mt-0.5 font-normal">
        {call.callType} · {call.time}
      </div>
    </div>
  );
};

export { CallListItem };

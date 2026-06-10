import { Call, CallStatus } from '../../types';
import { Badge } from '../ui/Badge';

interface CallListItemProps {
  call: Call;
  isSelected: boolean;
  onClick: () => void;
}

const statusVariant: Record<CallStatus, { variant: 'routine' | 'monitor' | 'inactive' | 'crisis'; label: string }> = {
  completed:   { variant: 'routine',   label: 'Completed' },
  in_progress: { variant: 'monitor',   label: 'In progress' },
  upcoming:    { variant: 'inactive',  label: 'Upcoming' },
  missed:      { variant: 'crisis',    label: 'Missed' },
};

const CallListItem = ({ call, isSelected, onClick }: CallListItemProps) => {
  const { variant, label } = statusVariant[call.status];

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
        <Badge variant={variant} size="sm">{label}</Badge>
      </div>
      <div className="text-xs text-gray-400 mt-0.5 font-normal">
        {call.callType} · {call.time}
      </div>
    </div>
  );
};

export { CallListItem };

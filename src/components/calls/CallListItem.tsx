import { Call, CallStatus } from '../../types';
import { Badge } from '../ui/Badge';
import { getStatusBadgeClass } from '../../lib/badge-helpers';
import { TableRow, TableCell } from '../ui/table';

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
    <TableRow
      onClick={onClick}
      className={`
        cursor-pointer transition-colors
        ${isSelected ? 'bg-[#F7E8F0]' : 'hover:bg-gray-50'}
      `}
    >
      <TableCell className={`py-3.5 pl-4 border-l-2 ${isSelected ? 'border-[#93406B]' : 'border-transparent'}`}>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900">{call.motherName}</span>
          <span className="text-xs text-gray-400 mt-0.5 font-normal">
            {call.callType} · {call.time}
          </span>
        </div>
      </TableCell>
      <TableCell className="py-3.5 pr-4">
        <div className="flex justify-end">
          <Badge variant="outline" className={getStatusBadgeClass(call.status)} size="sm">{label}</Badge>
        </div>
      </TableCell>
    </TableRow>
  );
};

export { CallListItem };

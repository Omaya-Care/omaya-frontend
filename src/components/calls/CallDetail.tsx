import { PhoneCall, Clock, Heart, Calendar, Mic, Phone } from 'lucide-react';
import { Call, CallStatus } from '../../types';
import { Badge } from '../ui/Badge';
import { getSeverityBadgeClass, getStatusBadgeClass } from '../../lib/badge-helpers';
import { Button } from '../ui/Button';

interface CallDetailProps {
  call: Call | null;
}

const statusLabel: Record<CallStatus, string> = {
  completed:   'Completed',
  in_progress: 'In progress',
  upcoming:    'Upcoming',
  missed:      'Missed',
};

const CallDetail = ({ call }: CallDetailProps) => {
  if (!call) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <PhoneCall className="text-gray-300 mb-2" size={48} />
        <p className="text-sm text-gray-400 font-normal">Select a call to view details</p>
      </div>
    );
  }

  const label = statusLabel[call.status];

  return (
    <div className="flex flex-col min-h-full">
      {/* TOP: Mother name + call type + status badge */}
      <div className="pb-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900">{call.motherName}</h2>
          <Badge variant="outline" className={getStatusBadgeClass(call.status)} dot>{label}</Badge>
        </div>
        <p className="text-sm text-gray-500 font-normal mt-1">{call.callType}</p>
      </div>

      {/* META GRID 2×2 */}
      <div className="grid grid-cols-2 gap-x-16 gap-y-5 pt-5 pb-5 border-b border-gray-100">
        {[
          { icon: Clock,     label: 'Scheduled time', value: call.time },
          { icon: Mic,       label: 'Call duration',  value: call.duration ?? '—' },
          { icon: Heart,     label: 'Delivery type',  value: call.deliveryType ?? '—' },
          { icon: Calendar,  label: 'Day in care',    value: call.dayInCare != null ? `Day ${call.dayInCare} postpartum` : '—' },
        ].map((item, idx) => (
          <div key={idx} className="flex flex-col">
            <div className="flex items-center gap-1.5 mb-1">
              <item.icon size={16} className="text-gray-400" />
              <span className="text-xs text-gray-400 uppercase tracking-wide font-normal">{item.label}</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{item.value}</span>
          </div>
        ))}
      </div>

      {/* AI SUMMARY */}
      <div className="pt-5 flex-1">
        <h3 className="text-xs font-medium tracking-widest text-gray-400 uppercase mb-3">
          AI summary
        </h3>

        <div className="flex flex-col">
          {(call.summaryRows ?? []).length === 0 ? (
            <p className="text-sm text-gray-400 font-normal">
              {call.status === 'upcoming' || call.status === 'missed'
                ? 'No transcript available.'
                : 'No summary available.'}
            </p>
          ) : (
            (call.summaryRows ?? []).map((row, index, arr) => (
              <div
                key={index}
                className={`flex items-center py-3 ${index !== arr.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <div className="w-16 flex-shrink-0">
                  <span className={`text-xs font-semibold uppercase tracking-wide ${
                    row.speaker === 'omaya' ? 'text-[#93406B]' : 'text-gray-500'
                  }`}>
                    {row.speaker === 'omaya' ? 'Omaya' : 'Mother'}
                  </span>
                </div>
                <span className="text-sm text-gray-700 font-normal flex-1">{row.text}</span>
              </div>
            ))
          )}
        </div>

        {/* Summary stats */}
        <div className="border-t border-gray-100 pt-3 mt-1">
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-500 font-normal">Flags raised</span>
            <span className="text-sm font-semibold text-gray-900">{call.flagsRaised ?? 0}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-500 font-normal">Severity</span>
            {call.severity ? (
              <Badge variant="outline" className={getSeverityBadgeClass(call.severity)} size="sm" dot>
                {call.severity.charAt(0).toUpperCase() + call.severity.slice(1)}
              </Badge>
            ) : (
              <span className="text-sm text-gray-400 font-normal">—</span>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM ACTIONS — pinned to card bottom */}
      <div className="mt-auto pt-4 border-t border-gray-100 flex justify-end items-center gap-2 sticky bottom-0 bg-white">
        <Button variant="outline" size="sm" className="flex items-center gap-1.5">
          <PhoneCall size={16} />
          <span className="font-medium">View mother record</span>
        </Button>
        <Button variant="default" size="sm" className="flex items-center gap-1.5">
          <Phone size={16} />
          <span className="font-medium">Call now</span>
        </Button>
      </div>
    </div>
  );
};

export { CallDetail };

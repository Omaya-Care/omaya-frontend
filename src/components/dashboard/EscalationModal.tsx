import React from 'react';
import { AlertTriangle, Clock, Check } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EscalationItem } from '../../types';

interface EscalationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAcknowledge: () => void;
  item: EscalationItem | null;
}

const EscalationModal = ({ isOpen, onClose, onAcknowledge, item }: EscalationModalProps) => {
  if (!item) return null;

  const formatTimeLeft = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const getSummary = (severity: string) => {
    if (severity === 'crisis') {
      return "Has not responded to two consecutive calls. Last check-in flagged pain.";
    }
    return `Reported low mood and tearfulness during the Day ${item.dayPostpartum} check-in call.`;
  };

  const slaLimit = item.severity === 'crisis' ? 120 : 240;
  const progressPercent = Math.max(0, Math.min(100, (item.timeLeftMinutes / slaLimit) * 100));

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      <div className="flex flex-col">
        {/* TOP ROW */}
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="text-orange-400" size={22} />
          </div>
          <div className="flex flex-col">
            <h3 className="text-base font-semibold text-gray-900">{item.motherName}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-gray-400 font-normal">L3 ·</span>
              <Badge variant={item.severity} size="sm" dot>
                {item.severity.charAt(0).toUpperCase() + item.severity.slice(1)}
              </Badge>
            </div>
            <p className="text-xs text-gray-400 font-normal mt-0.5">
              Day {item.dayPostpartum} · 27 yrs · Maternity A
            </p>
          </div>
        </div>

        {/* TRIGGERED ROW */}
        <div className="mt-4 flex items-center gap-1.5 text-gray-500">
          <Clock size={14} className="text-gray-400" />
          <span className="text-sm font-normal">Triggered</span>
          <span className="text-sm font-medium text-gray-700">2 hours ago</span>
          <span className="text-gray-300">·</span>
          <span className="text-sm font-normal">10:15</span>
        </div>

        {/* SUMMARY TEXT */}
        <p className="mt-3 text-base font-medium text-gray-800 leading-relaxed">
          {getSummary(item.severity)}
        </p>

        {/* TRIGGERING EXCERPT */}
        <div className="mt-4">
          <h4 className="text-xs font-medium tracking-widest text-gray-400 mb-2 uppercase">TRIGGERING EXCERPT</h4>
          <div className="bg-gray-50 rounded-xl px-5 py-4 relative overflow-hidden">
            <span className="absolute top-2 left-4 text-5xl text-gray-200 font-serif leading-none select-none">"</span>
            <p className="italic text-sm text-gray-700 leading-relaxed relative z-10 pt-2">
              I've been feeling really low, and I keep crying for no reason. Even when she sleeps I just lie there, and I don't feel hungry at all.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400 font-normal">
              <span className="font-medium text-gray-500">{item.motherName}</span>
              <span>·</span>
              <span>10:15</span>
              <span>·</span>
              <span>AI check-in call</span>
            </div>
          </div>
        </div>

        {/* RESPONSE SLA */}
        <div className="mt-5">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium tracking-widest text-gray-400 uppercase">RESPONSE SLA</span>
            <span className="text-xs font-normal text-gray-500">4 hr · L3</span>
          </div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">{formatTimeLeft(item.timeLeftMinutes)}</span>
            <span className="text-sm font-normal text-gray-400 ml-2">remaining</span>
          </div>
          <div className="h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-[#93406B] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* ACKNOWLEDGE BUTTON */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          className="mt-5 gap-2"
          onClick={() => {
            onAcknowledge();
            onClose();
          }}
        >
          <Check size={20} />
          <span>Acknowledge</span>
        </Button>
      </div>
    </Modal>
  );
};

export { EscalationModal };

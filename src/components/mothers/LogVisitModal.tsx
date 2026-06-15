import { useState } from 'react';
import { ChevronDown, MessageSquare, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface LogVisitData {
  clinicalObservation: string;
  medicationAdvice: string;
  nextAction: string;
}

interface LogVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: LogVisitData) => void;
  motherName: string;
  dayPostpartum: number;
}

const LogVisitModal = ({ isOpen, onClose, onSave, motherName, dayPostpartum }: LogVisitModalProps) => {
  const [observation, setObservation] = useState('');
  const [advice, setAdvice] = useState('');
  const [nextAction] = useState('');

  const isFormValid = observation.trim() !== '' && advice.trim() !== '';

  const handleSave = () => {
    if (isFormValid) {
      onSave({
        clinicalObservation: observation,
        medicationAdvice: advice,
        nextAction: nextAction || 'None'
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <DialogTitle className="text-lg font-semibold text-gray-900">Log visit</DialogTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 font-normal">{motherName}</span>
              <Badge variant="outline" className="bg-gray-100 text-gray-500 border-gray-100" size="sm">
                Day {dayPostpartum}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* FORM */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Clinical observation *</label>
            <textarea
              rows={4}
              placeholder="What did you observe at this visit?"
              className="bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 w-full resize-none focus:outline-none focus:ring-2 focus:ring-[#93406B] focus:border-transparent transition-all font-normal"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Medication / advice given *</label>
            <textarea
              rows={4}
              placeholder="What did you prescribe or advise?"
              className="bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 w-full resize-none focus:outline-none focus:ring-2 focus:ring-[#93406B] focus:border-transparent transition-all font-normal"
              value={advice}
              onChange={(e) => setAdvice(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Next action *</label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-400 w-full flex justify-between items-center cursor-default font-normal">
              <span>{nextAction || 'Select next action...'}</span>
              <ChevronDown size={18} className="text-gray-400" />
            </div>
          </div>
        </div>

        {/* INFO BOX */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 flex gap-3 items-start">
          <MessageSquare size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-500 font-normal leading-relaxed">
            Saving sends <strong className="font-semibold">{motherName}</strong> a plain-language summary within an hour.
          </p>
        </div>

        <DialogFooter className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="default"
            className="gap-2"
            disabled={!isFormValid}
            onClick={handleSave}
          >
            <Check size={18} />
            <span>Save visit</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { LogVisitModal };

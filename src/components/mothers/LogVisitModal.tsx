import { useState } from 'react';
import { ClipboardList, Info, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/Input';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useLogVisit } from '../../hooks/useMutations';
import { toast } from 'sonner';

interface LogVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  motherId: string;
  motherName: string;
  dayPostpartum: number;
}

const LogVisitModal = ({ isOpen, onClose, motherId, motherName, dayPostpartum }: LogVisitModalProps) => {
  const logVisitMutation = useLogVisit();

  const [observation, setObservation] = useState('');
  const [advice, setAdvice] = useState('');
  const [nextAction, setNextAction] = useState('');

  const isFormValid = observation.trim() !== '' && advice.trim() !== '' && nextAction !== '';

  const handleClose = () => {
    setObservation('');
    setAdvice('');
    setNextAction('');
    onClose();
  };

  const handleSave = async () => {
    if (!isFormValid) return;
    try {
      await logVisitMutation.mutateAsync({
        motherId,
        clinicalObservation: observation,
        medicationAdvice: advice,
        nextAction,
      });
      toast.success('Visit logged successfully.');
      handleClose();
    } catch {
      toast.error('Could not log visit. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList size={18} className="text-[#93406B]" />
            <DialogTitle className="text-lg font-semibold text-gray-900">Log visit</DialogTitle>
            <span className="text-sm text-gray-400 font-normal">{motherName}</span>
            {dayPostpartum != null && (
              <Badge variant="outline" className="bg-gray-100 text-gray-500 border-gray-100" size="sm">
                Day {dayPostpartum}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-1">
          <Textarea
            label="Clinical observation *"
            rows={3}
            placeholder="What did you observe at this visit?"
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
          />

          <Textarea
            label="Medication / advice given *"
            rows={3}
            placeholder="What did you prescribe or advise?"
            value={advice}
            onChange={(e) => setAdvice(e.target.value)}
          />

          <Input
            label="Next action *"
            placeholder="e.g. Routine follow-up in 1 week"
            value={nextAction}
            onChange={(e) => setNextAction(e.target.value)}
            fullWidth
          />
        </div>

        <Alert className="border-blue-100 bg-blue-50 text-blue-700 mt-1">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-700 font-normal">
            Saving sends <strong className="font-semibold">{motherName}</strong> a plain-language summary within an hour.
          </AlertDescription>
        </Alert>

        <DialogFooter className="flex justify-end gap-3 mt-1">
          <Button variant="outline" onClick={handleClose} disabled={logVisitMutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="default"
            className="gap-2"
            disabled={!isFormValid || logVisitMutation.isPending}
            onClick={handleSave}
          >
            {logVisitMutation.isPending
              ? <Loader2 size={16} className="animate-spin" />
              : null}
            Save visit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { LogVisitModal };

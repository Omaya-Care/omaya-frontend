import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface DischargeDiscardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDiscard: () => void;
}

/** "Discard this discharge?" — shown when closing with unsaved progress. */
export const DischargeDiscardDialog = ({
  open,
  onOpenChange,
  onDiscard,
}: DischargeDiscardDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-sm">
      <DialogHeader>
        <DialogTitle>Discard this discharge?</DialogTitle>
        <DialogDescription>
          You'll lose the details you've entered so far. This can't be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="gap-2 sm:gap-2">
        <Button variant="ghost" onClick={() => onOpenChange(false)}>
          Keep editing
        </Button>
        <Button
          variant="destructive"
          onClick={() => {
            onOpenChange(false);
            onDiscard();
          }}
        >
          Discard
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

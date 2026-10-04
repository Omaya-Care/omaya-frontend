import { useState } from "react";
import { ClipboardList, Info, Loader2 } from "lucide-react";
import { toast } from "@/lib/notify";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { api } from "@/lib/api";

const LABEL = "mb-1.5 ml-0.5 text-sm font-medium text-gray-700";

const TEXTAREA =
  "w-full resize-none rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export function LogVisitModal({
  open,
  onClose,
  onLogged,
  motherId,
  motherName,
  dayPostpartum,
}: {
  open: boolean;
  onClose: () => void;
  onLogged: () => void;
  motherId: string;
  motherName: string;
  dayPostpartum: number | null;
}) {
  const [observation, setObservation] = useState("");
  const [advice, setAdvice] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [pending, setPending] = useState(false);

  const valid = observation.trim() !== "" && advice.trim() !== "" && nextAction.trim() !== "";

  const close = () => {
    if (pending) return;
    setObservation("");
    setAdvice("");
    setNextAction("");
    onClose();
  };

  const save = async () => {
    if (!valid) return;
    setPending(true);
    try {
      await api.post(`/mothers/${motherId}/visits`, {
        clinical_observation: observation,
        medication_advice: advice,
        next_action: nextAction,
      });
      toast.success("Visit logged successfully.");
      onLogged();
      setObservation("");
      setAdvice("");
      setNextAction("");
      onClose();
    } catch {
      toast.error("Could not log visit. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal open={open} onClose={close} labelledBy="log-visit-title" className="max-w-lg">
      <div className="flex flex-wrap items-center gap-2">
        <ClipboardList className="size-[18px] text-[#7A2850]" />
        <h2 id="log-visit-title" className="text-lg font-medium text-gray-900">Log visit</h2>
        <span className="text-sm text-gray-400">{motherName}</span>
        {dayPostpartum != null && (
          <span className="rounded-full bg-gray-100 px-2 py-px text-[11px] font-medium text-gray-500">
            Day {dayPostpartum}
          </span>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-4">
        <div className="flex flex-col">
          <label htmlFor="visit-observation" className={LABEL}>
            Clinical observation *
          </label>
          <textarea
            id="visit-observation"
            rows={3}
            placeholder="What did you observe at this visit?"
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            className={TEXTAREA}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="visit-advice" className={LABEL}>
            Medication / advice given *
          </label>
          <textarea
            id="visit-advice"
            rows={3}
            placeholder="What did you prescribe or advise?"
            value={advice}
            onChange={(e) => setAdvice(e.target.value)}
            className={TEXTAREA}
          />
        </div>
        <Input
          label="Next action *"
          placeholder="e.g. Routine follow-up in 1 week"
          value={nextAction}
          onChange={(e) => setNextAction(e.target.value)}
          fullWidth
        />
      </div>

      <p className="mt-4 flex items-start gap-2 rounded-xl bg-[#F7E8F0] px-4 py-3 text-sm text-[#7A2850]">
        <Info className="mt-0.5 size-4 shrink-0" />
        <span>
          Saving sends <strong className="font-semibold">{motherName}</strong> a plain-language
          summary within an hour.
        </span>
      </p>

      <div className="mt-5 flex justify-end gap-3">
        <Button variant="outline" onClick={close} disabled={pending}>
          Cancel
        </Button>
        <Button onClick={save} disabled={!valid || pending}>
          {pending && <Loader2 className="animate-spin" />}
          Save visit
        </Button>
      </div>
    </Modal>
  );
}

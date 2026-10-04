import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Native <dialog> modal — the browser gives us the focus trap, Escape and
 *  the top layer. `onClose` fires for Escape and backdrop clicks.
 *  `labelledBy` is the id of the heading that names the dialog. */
export function Modal({
  open,
  onClose,
  labelledBy,
  className,
  children,
}: {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  // Escape and backdrop clicks are dialog-level browser behaviour, not an
  // interactive control, so they're wired natively rather than as JSX handlers.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    const onBackdrop = (e: MouseEvent) => {
      if (e.target === el) onClose();
    };
    el.addEventListener("cancel", onCancel);
    el.addEventListener("click", onBackdrop);
    return () => {
      el.removeEventListener("cancel", onCancel);
      el.removeEventListener("click", onBackdrop);
    };
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      className={cn(
        "m-auto w-full max-w-md rounded-2xl bg-white p-0 shadow-xl backdrop:bg-black/30",
        className,
      )}
    >
      {open && <div className="p-6">{children}</div>}
    </dialog>
  );
}

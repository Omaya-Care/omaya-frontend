import { Button } from "./Button";
import { cn } from "@/lib/utils";

/** Inline "couldn't load" notice with a Retry — so a failed list or dashboard
 *  fetch never reads as an empty result ("No active mothers", 0 calls). */
export function LoadError({
  message,
  onRetry,
  className,
}: {
  message: string;
  onRetry: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700",
        className,
      )}
    >
      <span>{message}</span>
      <Button variant="outline" size="sm" onClick={onRetry} className="h-7 shrink-0 bg-white px-2.5 text-xs">
        Retry
      </Button>
    </div>
  );
}

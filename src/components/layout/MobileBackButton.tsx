import { ArrowLeft } from "lucide-react";

/** "Back to list" for the list/detail pages below `md`, where only one of the
 *  two panes shows at a time. Hidden from `md` up (both panes are visible). */
export function MobileBackButton({ onClick, label = "Back to list" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="-mt-1 mb-4 flex items-center gap-1.5 self-start text-sm text-gray-500 transition-colors hover:text-gray-900 md:hidden"
    >
      <ArrowLeft className="size-4" />
      {label}
    </button>
  );
}

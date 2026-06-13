import { Loader2 } from "lucide-react";

// Generic loading state for the data pages (dashboard, mothers, calls,
// staff) while their queries resolve. Distinct from DocsLoading, which is
// the Suspense fallback for the heavy lazy-loaded API-reference chunk.
export default function PageLoading() {
  return (
    <div className="flex h-full min-h-[240px] items-center justify-center text-gray-400">
      <Loader2 className="h-5 w-5 animate-spin" />
    </div>
  );
}

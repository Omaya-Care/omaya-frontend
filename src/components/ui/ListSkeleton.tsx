/** Loading rows for the split-view lists (Mothers, Calls). */
export function ListSkeleton({ rows = 6 }: { rows?: number }) {
  return Array.from({ length: rows }, (_, i) => (
    <li key={i} className="flex items-center gap-3 px-3 py-3">
      <div className="size-9 shrink-0 animate-pulse rounded-full bg-gray-100" />
      <div className="flex-1">
        <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
        <div className="mt-2 h-3 w-24 animate-pulse rounded bg-gray-100" />
      </div>
    </li>
  ));
}

/** Pill tab switcher with a sliding highlight — transform-only, so it stays
 *  on the compositor. Shared by the Mothers, Calls and Escalations lists and
 *  the mother profile. */
export function SegmentedTabs<T extends string>({
  tabs,
  value,
  onChange,
  className = "self-start",
}: {
  tabs: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  const index = Math.max(
    0,
    tabs.findIndex((t) => t.value === value),
  );
  return (
    <div
      role="tablist"
      className={`relative grid rounded-full bg-gray-100 p-1 ${className}`}
      style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-1 left-1 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out motion-reduce:transition-none"
        style={{ width: `calc((100% - 8px) / ${tabs.length})`, transform: `translateX(${index * 100}%)` }}
      />
      {tabs.map((t) => (
        <button
          key={t.value}
          type="button"
          role="tab"
          aria-selected={value === t.value}
          onClick={() => onChange(t.value)}
          className={`relative z-10 rounded-full px-3.5 py-1 text-sm transition-colors ${
            value === t.value ? "text-[#7A2850]" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

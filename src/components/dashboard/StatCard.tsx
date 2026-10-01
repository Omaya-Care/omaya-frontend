import { Link } from "react-router-dom";

interface StatCardProps {
  label: string;
  sublabel: string;
  value: string | number;
  loading?: boolean;
  footerText?: string;
  /** Route for the "View all" link, when the card has a list behind it. */
  to?: string;
}

export function StatCard({ label, sublabel, value, loading, footerText, to }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-surface-tint-3 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-surface-stat-label">{label}</span>
        <span className="text-xs text-surface-stat-label/70">{sublabel}</span>
      </div>

      {loading ? (
        <div className="mt-2 h-9 w-16 animate-pulse rounded-md bg-primary-200" />
      ) : (
        <div className="mt-2 text-2xl font-bold text-primary-900 md:text-4xl">{value}</div>
      )}

      {(footerText || to) && (
        <div className="mt-2.5 flex items-center justify-between">
          <span className="text-xs text-red-600">{footerText}</span>
          {to && (
            <Link to={to} className="ml-auto text-sm font-medium text-primary transition-opacity hover:opacity-80">
              View all
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

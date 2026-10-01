import { AlertTriangle } from 'lucide-react';

/* ─── Must-change-password banner ─────────────────────────────── */
export const MustChangePasswordBanner = ({ onChangeNow }: { onChangeNow: () => void }) => (
  <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3.5">
    <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-amber-900">Password change required</p>
      <p className="text-sm text-amber-700 mt-0.5">
        Your account requires a new password before you can continue using Omaya Care.
      </p>
    </div>
    <button
      type="button"
      onClick={onChangeNow}
      className="text-sm font-medium text-amber-800 hover:text-amber-900 underline underline-offset-2 flex-shrink-0 whitespace-nowrap"
    >
      Change now
    </button>
  </div>
);

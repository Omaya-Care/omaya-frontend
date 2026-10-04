import React from 'react';
import { Check, X } from 'lucide-react';

interface OnboardingShellProps {
  onClose: () => void;
  children: React.ReactNode;
  /** 1-based. Ignored when `totalSteps` is omitted (no stepper shown). */
  currentStep?: number;
  /** Omit on screens that sit outside the numbered steps (intro, search). */
  totalSteps?: number;
  stepLabel: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
}

/** (1)—(2)—(3) progression. Done steps are filled with a check, the current
 *  one is filled with its number, upcoming ones are outlined. */
const Stepper = ({ current, total }: { current: number; total: number }) => (
  <ol className="flex items-center w-full" aria-label={`Step ${current} of ${total}`}>
    {Array.from({ length: total }, (_, i) => {
      const n = i + 1;
      const done = n < current;
      const active = n === current;
      return (
        <li key={n} className={`flex items-center ${n < total ? 'flex-1' : ''}`}>
          <span
            aria-current={active ? 'step' : undefined}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors ${
              done
                ? 'border-primary bg-primary text-white'
                : active
                  ? 'border-primary bg-primary text-white ring-4 ring-primary-100'
                  : 'border-gray-200 bg-white text-gray-400'
            }`}
          >
            {done ? <Check size={14} /> : n}
          </span>
          {n < total && (
            <span
              className={`mx-2 h-0.5 flex-1 rounded-full transition-colors ${
                done ? 'bg-primary' : 'bg-gray-200'
              }`}
            />
          )}
        </li>
      );
    })}
  </ol>
);

const OnboardingShell = ({
  onClose,
  children,
  currentStep,
  totalSteps,
  stepLabel,
  leftAction,
  rightAction,
}: OnboardingShellProps) => {
  const showStepper = !!totalSteps && !!currentStep && currentStep > 0;

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex-shrink-0">
        <span className="text-sm font-medium text-gray-700">{stepLabel}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-50"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content area. overflow-x-hidden so the per-step slide animation can't
          flash a horizontal scrollbar (dropdowns here are portalled). */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-8 py-6 sm:py-10">
        {showStepper && (
          <div className="max-w-2xl w-full mx-auto mt-6 mb-10">
            <Stepper current={currentStep!} total={totalSteps!} />
          </div>
        )}
        {children}
        {/* Back / Continue sit below the content, left-aligned — same spot as
            "Start enrollment" on the intro screen. */}
        {(leftAction || rightAction) && (
          <div className="max-w-2xl w-full mx-auto mt-14 flex items-center gap-3">
            {leftAction}
            {rightAction}
          </div>
        )}
      </div>
    </div>
  );
};

export { OnboardingShell };

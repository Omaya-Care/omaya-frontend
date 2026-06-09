import React from 'react';
import { X } from 'lucide-react';

interface OnboardingShellProps {
  onClose: () => void;
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  stepLabel: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
}

const OnboardingShell = ({
  onClose,
  children,
  currentStep,
  totalSteps,
  stepLabel,
  leftAction,
  rightAction,
}: OnboardingShellProps) => {
  const progressPercent = (currentStep / totalSteps) * 100;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center">
          <div className="w-7 h-7 bg-[#93406B] rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
          <span className="text-sm font-medium text-gray-500 ml-3">Omaya Care</span>
        </div>

        <div className="text-sm font-medium text-gray-700">
          {stepLabel}
        </div>

        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full h-0.5 bg-gray-100 flex-shrink-0">
        <div
          className="h-full bg-[#93406B] transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-8 py-10">
          {children}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-100 px-8 py-5 flex justify-between items-center flex-shrink-0">
        <div>{leftAction}</div>
        <div>{rightAction}</div>
      </div>
    </div>
  );
};

export { OnboardingShell };

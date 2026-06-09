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

  const handleOutsideClick = () => {
    if (window.confirm('Close this flow? Your progress will be lost.')) {
      onClose();
    }
  };

  return (
    <div className="absolute inset-0 z-10 flex">
      {/* Dim overlay — hidden on mobile (drawer is full-width), visible sm+ */}
      <div
        className="hidden sm:block sm:flex-1 bg-black/20 cursor-pointer"
        onClick={handleOutsideClick}
      />

      {/* Drawer panel — full width on mobile, fixed 580px on sm+ */}
      <div className="w-full sm:w-[580px] flex-none h-full bg-white border-l border-gray-200 shadow-xl flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <span className="text-sm font-medium text-gray-700">{stepLabel}</span>
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
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-8 sm:py-10">
          {children}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-100 px-6 py-4 flex justify-between items-center flex-shrink-0">
          <div>{leftAction}</div>
          <div>{rightAction}</div>
        </div>
      </div>
    </div>
  );
};

export { OnboardingShell };

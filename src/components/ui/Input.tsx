import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, fullWidth, className = '', ...props }, ref) => {
    const wrapperStyles = `flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`;
    const labelStyles = 'text-sm font-medium text-gray-700';

    const inputBaseStyles = `
      bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm
      text-gray-900 placeholder:text-gray-400 w-full
      focus:outline-none focus:ring-2 focus:ring-[#93406B] focus:border-transparent
      transition-all
    `;

    const errorInputStyles = error ? 'border-red-300 focus:ring-red-500 bg-red-50' : '';
    const iconPaddingStyles = `${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''}`;

    const combinedInputClassName = `
      ${inputBaseStyles}
      ${errorInputStyles}
      ${iconPaddingStyles}
      ${className}
    `.trim().replace(/\s+/g, ' ');

    return (
      <div className={wrapperStyles}>
        {label && <label className={labelStyles}>{label}</label>}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            className={combinedInputClassName}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error && <span className="text-xs text-red-600 mt-1">{error}</span>}
        {hint && !error && <span className="text-xs text-gray-500 mt-1">{hint}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };

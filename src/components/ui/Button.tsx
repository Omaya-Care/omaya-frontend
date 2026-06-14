import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  fullWidth?: boolean;
}

function buttonVariants({
  variant = 'primary',
  size = 'md',
  className = '',
}: {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  className?: string;
} = {}) {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  const variants = {
    primary: 'bg-[#93406B] text-white hover:bg-[#7a3259] focus-visible:ring-[#93406B]',
    secondary: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-200',
    ghost: 'text-gray-600 hover:bg-gray-100 focus-visible:ring-gray-100',
    danger: 'bg-[#DC2626] text-white hover:bg-[#b91c1c] focus-visible:ring-[#DC2626]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
    icon: 'size-9 p-0',
  };

  return `
    ${baseStyles}
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `.trim().replace(/\s+/g, ' ');
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', loading, fullWidth, children, disabled, ...props }, ref) => {
    const loadingStyles = loading ? 'pointer-events-none opacity-70' : '';
    const widthStyles = fullWidth ? 'w-full' : '';

    const combinedClassName = `
      ${buttonVariants({ variant, size, className })}
      ${loadingStyles}
      ${widthStyles}
    `.trim().replace(/\s+/g, ' ');

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={combinedClassName}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };

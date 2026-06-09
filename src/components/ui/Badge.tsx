import React from 'react';

interface BadgeProps {
  variant?: 'crisis' | 'elevated' | 'monitor' | 'routine' | 'inactive' | 'default';
  size?: 'sm' | 'md';
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

const Badge = ({ variant = 'default', size = 'md', dot = false, children, className = '' }: BadgeProps) => {
  const baseStyles = 'inline-flex items-center gap-1.5 font-medium rounded-full';

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  const variants = {
    crisis: 'bg-[#FEE2E2] text-[#DC2626]',
    elevated: 'bg-[#FFEDD5] text-[#EA580C]',
    monitor: 'bg-[#FEF9C3] text-[#CA8A04]',
    routine: 'bg-[#DCFCE7] text-[#16A34A]',
    inactive: 'bg-[#F3F4F6] text-[#9CA3AF]',
    default: 'bg-gray-100 text-gray-600',
  };

  const dotColors = {
    crisis: 'bg-[#DC2626]',
    elevated: 'bg-[#EA580C]',
    monitor: 'bg-[#CA8A04]',
    routine: 'bg-[#16A34A]',
    inactive: 'bg-[#9CA3AF]',
    default: 'bg-gray-600',
  };

  const combinedClassName = `
    ${baseStyles}
    ${sizes[size]}
    ${variants[variant]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <span className={combinedClassName}>
      {dot && (
        <span className={`h-1.5 w-1.5 rounded-full ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
};

export { Badge };

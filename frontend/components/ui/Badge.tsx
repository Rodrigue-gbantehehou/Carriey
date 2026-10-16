import React from 'react';

export type BadgeVariant = 
  | 'default' 
  | 'primary' 
  | 'success' 
  | 'warning' 
  | 'danger' 
  | 'info' 
  | 'neutral'
  | 'outline';

export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  dotColor?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  dot = false,
  dotColor,
  icon,
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium transition-colors select-none';

  const sizeStyles: Record<BadgeSize, string> = {
    sm: 'text-ui-xs px-2 py-0.5 rounded-full gap-1.5',
    md: 'text-ui-sm px-2.5 py-1 rounded-full gap-1.5',
  };

  const variantStyles: Record<BadgeVariant, string> = {
    default: 'bg-background-subtle text-text-secondary border border-border',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
    primary: 'bg-primary-subtle text-primary border border-primary/20',
    info: 'bg-info-bg text-info-text border border-info-text/20',
    success: 'bg-success-bg text-success-text border border-success-text/20',
    warning: 'bg-warning-bg text-warning-text border border-warning-text/20',
    danger: 'bg-danger-bg text-danger-text border border-danger-text/20',
    outline: 'bg-transparent text-text-secondary border border-border',
  };

  const dotVariantColor: Record<BadgeVariant, string> = {
    default: 'bg-text-muted',
    neutral: 'bg-slate-400',
    primary: 'bg-primary',
    info: 'bg-info-text',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    outline: 'bg-text-muted',
  };

  return (
    <span
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {dot && (
        <span 
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor || dotVariantColor[variant]}`}
          aria-hidden="true" 
        />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

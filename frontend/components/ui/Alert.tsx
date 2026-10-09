import React from 'react';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  icon,
  className = '',
}) => {
  const styles = {
    info: 'bg-background-subtle border-border text-text-primary',
    success: 'bg-success-bg border-success-text/20 text-success-text',
    warning: 'bg-warning-bg border-warning-text/20 text-warning-text',
    danger: 'bg-danger-bg border-danger-text/20 text-danger-text',
  };

  const DefaultIcons = {
    info: (
      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    danger: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  const Icon = icon !== undefined ? icon : DefaultIcons[variant];

  return (
    <div className={`rounded-panel border p-4 ${styles[variant]} ${className}`} role="alert">
      <div className="flex gap-3">
        {Icon && <div className="flex-shrink-0 mt-0.5">{Icon}</div>}
        <div>
          {title && <h3 className="text-ui-sm font-semibold mb-1">{title}</h3>}
          <div className="text-ui-sm">{children}</div>
        </div>
      </div>
    </div>
  );
};

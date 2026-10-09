import React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, helperText, error, fullWidth = true, id, children, ...props }, ref) => {
    
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    
    const baseStyles = 'flex h-[40px] w-full rounded-field border bg-background px-3 py-2 text-ui-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors text-text-primary appearance-none';
    const errorStyles = error ? 'border-danger-text focus-visible:ring-danger-text' : 'border-border';
    const widthStyles = fullWidth ? 'w-full' : '';

    return (
      <div className={`flex flex-col gap-2 ${widthStyles}`}>
        {label && (
          <label htmlFor={selectId} className="text-ui-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={`${baseStyles} ${errorStyles} pr-8 ${className}`}
            {...props}
          >
            {children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-muted">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && <p className="text-ui-xs text-danger-text">{error}</p>}
        {helperText && !error && <p className="text-ui-xs text-text-muted">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

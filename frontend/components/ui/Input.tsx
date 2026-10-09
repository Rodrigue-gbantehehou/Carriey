import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, helperText, error, fullWidth = true, id, ...props }, ref) => {
    
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    
    const baseStyles = 'flex h-[40px] w-full rounded-field border bg-background px-3 py-2 text-ui-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors';
    const errorStyles = error ? 'border-danger-text focus-visible:ring-danger-text' : 'border-border';
    const widthStyles = fullWidth ? 'w-full' : '';

    return (
      <div className={`flex flex-col gap-2 ${widthStyles}`}>
        {label && (
          <label htmlFor={inputId} className="text-ui-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`${baseStyles} ${errorStyles} ${className}`}
          {...props}
        />
        {error && <p className="text-ui-xs text-danger-text">{error}</p>}
        {helperText && !error && <p className="text-ui-xs text-text-muted">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

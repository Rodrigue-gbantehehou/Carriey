import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, helperText, error, fullWidth = true, id, ...props }, ref) => {
    
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    
    const baseStyles = 'flex min-h-[96px] w-full rounded-field border bg-background px-3 py-2 text-ui-sm placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-y';
    const errorStyles = error ? 'border-danger-text focus-visible:ring-danger-text' : 'border-border';
    const widthStyles = fullWidth ? 'w-full' : '';

    return (
      <div className={`flex flex-col gap-2 ${widthStyles}`}>
        {label && (
          <label htmlFor={textareaId} className="text-ui-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
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

Textarea.displayName = 'Textarea';

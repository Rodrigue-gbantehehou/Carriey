import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  selected?: boolean;
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ hoverable = false, selected = false, className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-background rounded-panel border transition-all duration-200 ${
          selected
            ? 'border-primary ring-2 ring-primary/20 shadow-sm'
            : 'border-border shadow-sm'
        } ${
          hoverable
            ? 'hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
            : ''
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`px-5 py-4 border-b border-border flex items-center justify-between gap-4 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CardHeader.displayName = 'CardHeader';

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h2' | 'h3' | 'h4' | 'h5';
  children: React.ReactNode;
}

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ as: Tag = 'h3', className = '', children, ...props }, ref) => {
    return (
      <Tag
        ref={ref}
        className={`text-ui-base font-semibold text-text-primary tracking-tight leading-tight ${className}`}
        {...props}
      >
        {children}
      </Tag>
    );
  }
);
CardTitle.displayName = 'CardTitle';

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={`text-ui-sm text-text-muted mt-1 leading-normal ${className}`}
        {...props}
      >
        {children}
      </p>
    );
  }
);
CardDescription.displayName = 'CardDescription';

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={`p-5 ${className}`} {...props}>
        {children}
      </div>
    );
  }
);
CardContent.displayName = 'CardContent';

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`px-5 py-3.5 bg-background-subtle border-t border-border rounded-b-panel flex items-center justify-between gap-3 text-ui-sm ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CardFooter.displayName = 'CardFooter';

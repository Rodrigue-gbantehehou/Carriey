import React from 'react';
import { Button, ButtonProps } from './Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    variant?: ButtonProps['variant'];
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center rounded-panel border border-border border-dashed bg-background-subtle min-h-[320px] ${className}`}>
      {icon && (
        <div className="mb-4 text-text-muted flex justify-center">
          {icon}
        </div>
      )}
      
      <h3 className="text-ui-lg font-semibold text-text-primary mb-2">
        {title}
      </h3>
      
      <p className="text-ui-base text-text-secondary max-w-md mb-6">
        {description}
      </p>
      
      {action && (
        action.href ? (
          <a href={action.href} className="inline-block">
            <Button variant={action.variant || 'primary'}>
              {action.label}
            </Button>
          </a>
        ) : (
          <Button 
            variant={action.variant || 'primary'} 
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )
      )}
    </div>
  );
};

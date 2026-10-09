import React from 'react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  className = ''
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 ${className}`}>
      <div className="flex-1 min-w-0">
        <h1 className="text-ui-2xl font-semibold text-text-primary leading-tight truncate">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-ui-sm text-text-secondary sm:text-ui-base">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 gap-3">
          {actions}
        </div>
      )}
    </div>
  );
};

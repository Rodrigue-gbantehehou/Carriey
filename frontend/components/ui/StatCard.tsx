import React from 'react';
import Link from 'next/link';

export type StatCardColor = 'primary' | 'success' | 'warning' | 'info' | 'neutral';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  subtitle?: string;
  trend?: {
    value: string;
    label?: string;
    isPositive?: boolean;
  };
  color?: StatCardColor;
  onClick?: () => void;
  href?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  subtitle,
  trend,
  color = 'primary',
  onClick,
  href,
  className = '',
}) => {
  const iconBgColors: Record<StatCardColor, string> = {
    primary: 'bg-primary-subtle text-primary',
    success: 'bg-success-bg text-success-text',
    warning: 'bg-warning-bg text-warning-text',
    info: 'bg-info-bg text-info-text',
    neutral: 'bg-background-subtle text-text-muted',
  };

  const content = (
    <div
      className={`p-5 bg-background rounded-panel border border-border shadow-sm flex flex-col justify-between transition-all duration-200 ${
        href || onClick ? 'hover:border-primary/40 hover:shadow-md cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-ui-sm font-medium text-text-secondary truncate">
          {label}
        </span>
        {icon && (
          <div className={`w-9 h-9 rounded-panel flex items-center justify-center shrink-0 ${iconBgColors[color]}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-ui-3xl font-bold text-text-primary tracking-tight">
          {value}
        </span>
        {trend && (
          <span
            className={`text-ui-xs font-medium inline-flex items-center gap-0.5 ${
              trend.isPositive ? 'text-success-text' : 'text-danger-text'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.value}
            {trend.label && <span className="text-text-muted font-normal"> {trend.label}</span>}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-ui-xs text-text-muted mt-2 truncate">
          {subtitle}
        </p>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
};

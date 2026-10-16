import React from 'react';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
  style,
  ...props
}) => {
  const variantStyles: Record<SkeletonVariant, string> = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-panel',
  };

  const computedStyle: React.CSSProperties = {
    ...style,
    width: width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };

  return (
    <div
      className={`animate-pulse bg-slate-200/80 ${variantStyles[variant]} ${className}`}
      style={computedStyle}
      aria-hidden="true"
      {...props}
    />
  );
};

export interface SkeletonTextProps {
  lines?: number;
  className?: string;
  lastLineWidth?: string;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  className = '',
  lastLineWidth = '60%',
}) => {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, idx) => (
        <Skeleton
          key={idx}
          variant="text"
          style={idx === lines - 1 ? { width: lastLineWidth } : undefined}
        />
      ))}
    </div>
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`p-5 rounded-panel border border-border bg-background space-y-4 ${className}`}>
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" width="50%" height={16} />
          <Skeleton variant="text" width="30%" height={12} />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
};

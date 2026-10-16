import React from 'react';

export type RingColor = 'primary' | 'success' | 'warning' | 'danger';

export interface ProfileCompletionRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: RingColor;
  showValue?: boolean;
  unit?: string;
  className?: string;
}

export const ProfileCompletionRing: React.FC<ProfileCompletionRingProps> = ({
  value,
  max = 100,
  size = 144,
  strokeWidth = 8,
  color,
  showValue = true,
  unit = '/100',
  className = '',
}) => {
  const clampedValue = Math.min(Math.max(0, value), max);
  const percentage = (clampedValue / max) * 100;

  // Auto determine color based on percentage if not explicitly provided
  const activeColor =
    color ||
    (percentage >= 80 ? 'success' : percentage >= 50 ? 'primary' : 'warning');

  const strokeColors: Record<RingColor, string> = {
    primary: '#1D4ED8',
    success: '#166534',
    warning: '#D97706',
    danger: '#B91C1C',
  };

  const radius = 50 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={strokeColors[activeColor]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-ui-3xl font-bold text-text-primary leading-none">
            {Math.round(clampedValue)}
          </span>
          {unit && (
            <span className="text-ui-xs text-text-muted font-medium mt-1">
              {unit}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

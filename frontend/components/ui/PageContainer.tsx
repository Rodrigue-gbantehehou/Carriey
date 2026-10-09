import React from 'react';

export interface PageContainerProps {
  children: React.ReactNode;
  variant?: 'public' | 'dashboard' | 'form-standard' | 'form-long' | 'reading';
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({ 
  children, 
  variant = 'dashboard', 
  className = '' 
}) => {
  const baseStyles = 'mx-auto w-full px-4 md:px-6 lg:px-8';
  
  const variants = {
    'public': 'max-w-public',
    'dashboard': 'max-w-dashboard',
    'form-standard': 'max-w-form',
    'form-long': 'max-w-column',
    'reading': 'max-w-column',
  };

  return (
    <div className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

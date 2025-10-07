import React from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`page-transition-container ${className}`}
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: '#F8F8FA',
        opacity: 1,
        visibility: 'visible',
        zIndex: 1,
      }}
    >
      {children}
    </div>
  );
};

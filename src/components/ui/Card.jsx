import React from 'react';

export const Card = ({
  children,
  className = '',
  isHoverable = false,
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-premium-md transition-all duration-300 ${
        isHoverable ? 'hover:shadow-premium-lg hover:scale-[1.01] hover:-translate-y-0.5 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

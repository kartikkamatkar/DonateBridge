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
      className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-premium-sm transition-colors duration-150 ${
        isHoverable ? 'hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

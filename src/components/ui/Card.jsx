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
      className={`bg-white border border-slate-200 rounded-lg p-6 shadow-premium-sm transition-colors duration-150 ${
        isHoverable ? 'hover:border-slate-300 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

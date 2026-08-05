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
      className={`bg-white rounded-lg shadow-sm hover:shadow-md border border-slate-200/80 transition-all duration-200 p-4 md:p-6 ${
        isHoverable ? 'hover:border-emerald-200 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

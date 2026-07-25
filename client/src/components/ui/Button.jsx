import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loading = false,
  isDisabled = false,
  type = 'button',
  onClick,
  className = '',
  icon: Icon,
  ...props
}) => {
  const showLoading = isLoading || loading;
  const baseStyles = 'inline-flex items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 ease-out disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-primary hover:bg-primary-hover hover:shadow-premium-sm hover:-translate-y-[1px] text-white focus:ring-primary',
    secondary: 'bg-slate-100 hover:bg-slate-200 hover:shadow-premium-sm hover:-translate-y-[1px] text-slate-800 border border-slate-200/50 focus:ring-slate-400',
    danger: 'bg-red-600 hover:bg-red-700 hover:shadow-premium-sm hover:-translate-y-[1px] text-white focus:ring-red-500',
    ghost: 'bg-transparent hover:bg-slate-50 text-slate-700 focus:ring-slate-500',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs font-semibold rounded-lg',
    md: 'px-5 py-2.5 text-sm font-semibold rounded-xl',
    lg: 'px-6 py-3.5 text-base font-semibold rounded-xl',
  };

  return (
    <button
      type={type}
      disabled={isDisabled || showLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {showLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {!showLoading && Icon && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </button>
  );
};

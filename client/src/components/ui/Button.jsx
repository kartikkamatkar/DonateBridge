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
  const baseStyles = 'inline-flex items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ease-out disabled:opacity-50 disabled:pointer-events-none rounded-md';
  
  const variants = {
    primary: 'bg-[#4A7C59] text-white hover:bg-[#3B6647] shadow-sm focus:ring-[#4A7C59]',
    secondary: 'bg-[#E8F3EC] text-[#4A7C59] hover:bg-[#4A7C59] hover:text-white border border-[#4A7C59]/20 focus:ring-[#4A7C59]',
    outline: 'border border-[#4A7C59] text-[#4A7C59] hover:bg-[#4A7C59] hover:text-white focus:ring-[#4A7C59]',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500',
    ghost: 'bg-transparent hover:bg-[#E8F3EC] text-stone-700 hover:text-[#4A7C59] focus:ring-[#4A7C59]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-medium rounded-md',
    md: 'px-4 py-2 text-sm font-medium rounded-md',
    lg: 'px-5 py-2.5 text-base font-semibold rounded-lg',
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

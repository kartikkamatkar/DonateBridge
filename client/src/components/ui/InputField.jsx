import React from 'react';

export const InputField = React.forwardRef(({
  label,
  id,
  type = 'text',
  error,
  helperText,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-slate-600 ml-1 mb-0.5"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        type={type}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
        className={`w-full px-4 py-3 rounded-xl border bg-white border-slate-200/80 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-300 shadow-sm ${
          error ? 'ring-2 ring-red-500 border-transparent' : ''
        }`}
        {...props}
      />
      {error && (
        <span
          id={`${id}-error`}
          role="alert"
          className="text-xs font-medium text-red-500 mt-0.5"
        >
          {error.message || error}
        </span>
      )}
      {!error && helperText && (
        <span
          id={`${id}-helper`}
          className="text-xs text-slate-500 mt-0.5"
        >
          {helperText}
        </span>
      )}
    </div>
  );
});

InputField.displayName = 'InputField';

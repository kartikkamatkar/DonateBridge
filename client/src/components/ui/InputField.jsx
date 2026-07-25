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
        className={`w-full border border-slate-300 rounded-md px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all duration-200 text-sm text-slate-900 bg-white placeholder-slate-400 ${
          error ? 'ring-2 ring-rose-500 border-transparent' : ''
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

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
          className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
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
        className={`w-full px-3 py-2 rounded-sm border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
          error ? 'ring-2 ring-red-500 border-transparent' : ''
        }`}
        {...props}
      />
      {error && (
        <span
          id={`${id}-error`}
          role="alert"
          className="text-xs font-medium text-red-500 dark:text-red-400 mt-0.5"
        >
          {error.message || error}
        </span>
      )}
      {!error && helperText && (
        <span
          id={`${id}-helper`}
          className="text-xs text-slate-500 dark:text-slate-400 mt-0.5"
        >
          {helperText}
        </span>
      )}
    </div>
  );
});

InputField.displayName = 'InputField';

/*
 * Input.tsx
 * Renders form inputs, textareas, and select menus compliant with the design system.
 * Enforces 6px radius, 10x14px padding, indigo focus ring, and recessive hairline borders.
 */

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  suffix?: React.ReactNode;
}

export const Input: React.FC<InputProps> = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, suffix, className = "", id, ...props }, ref) => {
    const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, "-")}`;
    const baseInputStyle =
      "w-full px-3.5 py-2.5 text-sm font-body bg-[var(--surface)] border rounded-[var(--input-radius)] text-[var(--text-primary)] placeholder:text-[var(--neutral-muted)] transition-all duration-150 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--focus-ring)]";
    const borderStyle = error
      ? "border-[var(--destructive)] focus:border-[var(--destructive)] focus:ring-[var(--destructive)]/20"
      : "border-[var(--border)]";

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-[var(--text-secondary)]">
            {label}
          </label>
        )}
        <div className={suffix ? "relative flex items-center" : ""}>
          <input
            ref={ref}
            id={inputId}
            className={`${baseInputStyle} ${borderStyle} ${suffix ? "pr-9" : ""} ${className}`}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]">
              {suffix}
            </div>
          )}
        </div>
        {error && <span className="text-xs text-[var(--destructive)]">{error}</span>}
        {helperText && !error && (
          <span className="text-xs text-[var(--text-secondary)]">{helperText}</span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = React.forwardRef<
  HTMLTextAreaElement,
  TextareaProps
>(({ label, error, className = "", id, rows = 3, ...props }, ref) => {
  const textareaId = id || `textarea-${label?.toLowerCase().replace(/\s+/g, "-")}`;
  const baseTextareaStyle =
    "w-full px-3.5 py-2.5 text-sm font-body bg-[var(--surface)] border rounded-[var(--input-radius)] text-[var(--text-primary)] placeholder:text-[var(--neutral-muted)] transition-all duration-150 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--focus-ring)] resize-y";
  const borderStyle = error
    ? "border-[var(--destructive)] focus:border-[var(--destructive)] focus:ring-[var(--destructive)]/20"
    : "border-[var(--border)]";

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={textareaId} className="text-xs font-medium text-[var(--text-secondary)]">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={`${baseTextareaStyle} ${borderStyle} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-[var(--destructive)]">{error}</span>}
    </div>
  );
});

Textarea.displayName = "Textarea";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select: React.FC<SelectProps> = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = "", id, ...props }, ref) => {
    const selectId = id || `select-${label?.toLowerCase().replace(/\s+/g, "-")}`;
    const baseSelectStyle =
      "w-full px-3.5 py-2.5 text-sm font-body bg-[var(--surface)] border rounded-[var(--input-radius)] text-[var(--text-primary)] transition-all duration-150 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--focus-ring)] cursor-pointer";
    const borderStyle = error
      ? "border-[var(--destructive)] focus:border-[var(--destructive)] focus:ring-[var(--destructive)]/20"
      : "border-[var(--border)]";

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={selectId} className="text-xs font-medium text-[var(--text-secondary)]">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`${baseSelectStyle} ${borderStyle} ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-xs text-[var(--destructive)]">{error}</span>}
      </div>
    );
  },
);

Select.displayName = "Select";

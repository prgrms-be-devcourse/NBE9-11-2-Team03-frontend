import type { ComponentPropsWithoutRef } from "react";

type AuthTextFieldProps = ComponentPropsWithoutRef<"input"> & {
  errorText?: string;
  helperText?: string;
  label: string;
};

export function AuthTextField({
  className = "",
  errorText,
  helperText,
  id,
  label,
  ...props
}: AuthTextFieldProps) {
  const helperId = helperText && id ? `${id}-helper` : undefined;
  const errorId = errorText && id ? `${id}-error` : undefined;
  const describedBy = [helperId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>
      <input
        id={id}
        aria-describedby={describedBy}
        aria-invalid={Boolean(errorText)}
        className={`h-12 w-full rounded-lg border bg-white px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
          errorText
            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
            : "border-slate-200 focus:border-blue-400 focus:ring-blue-200"
        } ${className}`}
        {...props}
      />
      {helperText ? (
        <p id={helperId} className="mt-2 text-xs leading-5 text-slate-500">
          {helperText}
        </p>
      ) : null}
      {errorText ? (
        <p id={errorId} className="mt-2 text-xs font-medium leading-5 text-red-600">
          {errorText}
        </p>
      ) : null}
    </div>
  );
}

import type { ComponentPropsWithoutRef } from "react";

type AuthTextFieldProps = ComponentPropsWithoutRef<"input"> & {
  helperText?: string;
  label: string;
};

export function AuthTextField({
  className = "",
  helperText,
  id,
  label,
  ...props
}: AuthTextFieldProps) {
  const helperId = helperText && id ? `${id}-helper` : undefined;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-bold text-[#202426]"
      >
        {label}
      </label>
      <input
        id={id}
        aria-describedby={helperId}
        className={`h-12 w-full rounded-md border border-[#cbd8d3] bg-white px-4 text-base text-[#202426] outline-none transition placeholder:text-[#9aa6a1] focus:border-[#00a88f] focus:ring-4 focus:ring-[#00a88f]/15 ${className}`}
        {...props}
      />
      {helperText ? (
        <p id={helperId} className="mt-2 text-xs leading-5 text-[#65706b]">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

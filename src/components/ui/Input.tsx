import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: "#71717a" }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-[12px] px-3.5 py-2.5 text-sm outline-none transition-all duration-150 h-10",
            "placeholder:text-zinc-600",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
          style={{
            backgroundColor: "rgba(255,255,255,0.04)",
            border: error ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(255,255,255,0.08)",
            color: "#f4f4f5",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "rgba(246,185,20,0.5)";
            e.target.style.boxShadow = "0 0 0 3px rgba(246,185,20,0.08)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.08)";
            e.target.style.boxShadow = "none";
          }}
          {...props}
        />
        {error && <p className="text-xs" style={{ color: "#f87171" }}>{error}</p>}
        {hint && !error && <p className="text-xs" style={{ color: "#52525b" }}>{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium"
            style={{ color: "#d4d4d8" }}
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={3}
          className={cn(
            "w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all resize-none",
            "placeholder:text-zinc-600",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
          style={{
            backgroundColor: "#1e1e1e",
            border: error ? "1px solid rgba(239,68,68,0.6)" : "1px solid #2d2d2d",
            color: "#f4f4f5",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#f6b914";
            e.target.style.boxShadow = "0 0 0 3px rgba(246,185,20,0.1)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? "rgba(239,68,68,0.6)" : "#2d2d2d";
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

Textarea.displayName = "Textarea";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading = false, disabled, className, children, style, ...props }, ref) => {

    const base =
      "inline-flex items-center justify-center gap-2 font-bold rounded-[14px] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f6b914]/50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]";

    const variantClass = {
      primary:   "text-[#0a0a0a] hover:opacity-90",
      secondary: "text-zinc-300 hover:text-white",
      ghost:     "text-zinc-400 hover:text-white hover:bg-white/[0.045]",
      danger:    "text-white hover:opacity-90",
    }[variant];

    const variantStyle: React.CSSProperties = {
      primary:   { backgroundColor: "#f6b914", boxShadow: "0 0 0 0 rgba(246,185,20,0)" },
      secondary: { backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)" },
      ghost:     { border: "1px solid transparent" },
      danger:    { backgroundColor: "#dc2626" },
    }[variant];

    const hoverShadow = variant === "primary"
      ? { "--hover-shadow": "0 0 20px rgba(246,185,20,0.28)" } as React.CSSProperties
      : {};

    const sizeClass = {
      sm: "text-xs px-3.5 py-2 h-8",
      md: "text-sm px-4 py-2.5 h-10",
      lg: "text-[15px] px-5 py-3 h-11",
    }[size];

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          base,
          variantClass,
          sizeClass,
          variant === "primary" && "hover:shadow-[0_0_20px_rgba(246,185,20,0.28)]",
          className
        )}
        style={{ ...variantStyle, ...style }}
        {...props}
      >
        {loading && (
          <span
            className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0"
          />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

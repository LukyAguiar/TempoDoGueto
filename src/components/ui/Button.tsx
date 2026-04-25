import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary:  "text-black hover:opacity-90",
      secondary:"border text-zinc-300 hover:text-white hover:border-zinc-500",
      ghost:    "text-zinc-400 hover:text-white hover:bg-white/5",
      danger:   "bg-red-600 text-white hover:bg-red-700",
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      primary:   { backgroundColor: "#f6b914", color: "#0a0a0a" },
      secondary: { backgroundColor: "transparent", borderColor: "#3f3f46" },
      ghost:     {},
      danger:    {},
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5",
      md: "text-sm px-4 py-2.5",
      lg: "text-base px-5 py-3",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        style={variantStyles[variant]}
        {...props}
      >
        {loading && (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

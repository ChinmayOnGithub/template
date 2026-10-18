/*
 * Button.tsx
 * Renders standard accessible interactive buttons compliant with the Genesis design system.
 * Enforces 6px radius, hover lift with indigo glow, and standard 32/38/44px heights.
 */

import React from "react";
import { Slot } from "@radix-ui/react-slot";

export type ButtonVariant =
  "primary" | "secondary" | "outline" | "destructive" | "danger" | "ghost" | "warning" | "link";

export type ButtonSize = "sm" | "md" | "lg" | "icon" | "icon-sm";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      loading = false,
      disabled = false,
      icon,
      className = "",
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const isLoadingState = isLoading || loading;
    const baseStyle =
      "inline-flex items-center justify-center font-medium rounded-[var(--button-radius)] transition-all duration-150 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none";

    // Genesis token-based variants
    const variants: Record<ButtonVariant, string> = {
      primary:
        "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] hover:-translate-y-[1px] hover:shadow-[var(--button-glow)] active:translate-y-0",
      secondary:
        "bg-transparent text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--surface-muted)] hover:border-[var(--border-strong)] active:scale-[0.99]",
      outline:
        "bg-transparent text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--accent)] active:scale-[0.99]",
      destructive:
        "bg-transparent text-[var(--destructive)] border border-[var(--destructive)]/40 hover:bg-[var(--destructive)]/10 hover:border-[var(--destructive)] active:scale-[0.99]",
      danger:
        "bg-transparent text-[var(--destructive)] border border-[var(--destructive)]/40 hover:bg-[var(--destructive)]/10 hover:border-[var(--destructive)] active:scale-[0.99]",
      ghost:
        "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent)] active:scale-[0.99]",
      warning: "bg-[var(--warning)] text-white hover:opacity-90 active:scale-[0.99]",
      link: "bg-transparent text-[var(--primary)] underline-offset-4 hover:underline p-0 h-auto font-normal",
    };

    // Genesis size scale: Small (32px), Medium (38px), Large (44px)
    const sizes: Record<ButtonSize, string> = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-[38px] px-4 text-sm gap-2",
      lg: "h-11 px-5 text-[15px] gap-2.5",
      icon: "h-8 w-8 p-1.5 shrink-0",
      "icon-sm": "h-8 w-8 p-1.5 shrink-0",
    };

    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        disabled={disabled || isLoadingState}
        data-ui-control="button"
        data-ui-size={size}
        className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoadingState && (
          <svg
            className="animate-spin -ml-0.5 mr-2 h-3.5 w-3.5 text-current shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoadingState && icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

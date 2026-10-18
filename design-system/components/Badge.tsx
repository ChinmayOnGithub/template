/*
 * Badge.tsx
 * Renders status badges, category chips, and priority pills compliant with the design system.
 * Enforces rounded-full pill shape, 4x12px padding, and semantic color indicator tokens.
 */

"use client";

import React from "react";

export type BadgeVariant =
  | "default"
  | "secondary"
  | "outline"
  | "success"
  | "warning"
  | "destructive"
  | "danger"
  | "info"
  | "muted"
  | "brand";

export type BadgeSize = "sm" | "md";

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20",
  secondary: "bg-[var(--surface-muted)] text-[var(--text-secondary)] border border-[var(--border)]",
  outline: "bg-transparent text-[var(--text-primary)] border border-[var(--border)]",
  success: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
  destructive: "bg-rose-500/10 text-rose-500 border border-rose-500/20",
  danger: "bg-rose-500/10 text-rose-500 border border-rose-500/20",
  info: "bg-sky-500/10 text-sky-500 border border-sky-500/20",
  muted: "bg-[var(--surface-muted)] text-[var(--neutral-muted)] border border-[var(--border)]",
  brand: "bg-[#20970B]/10 text-[#20970B] border border-[#20970B]/25 font-semibold",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-[var(--primary)]",
  secondary: "bg-[var(--text-secondary)]",
  outline: "bg-[var(--text-primary)]",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  destructive: "bg-rose-500",
  danger: "bg-rose-500",
  info: "bg-sky-500",
  muted: "bg-[var(--neutral-muted)]",
  brand: "bg-[#20970B]",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "text-[11px] px-2 py-0.5 gap-1.5",
  md: "text-xs px-3 py-1 gap-1.5",
};

export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  size = "md",
  dot = false,
  children,
  className = "",
}) => {
  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[variant]}`} />}
      {children}
    </span>
  );
};

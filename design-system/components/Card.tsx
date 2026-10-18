/*
 * Card.tsx
 * Renders gallery-frame card surfaces compliant with the Genesis design system.
 * Enforces 12px radius, 1px subtle hairline border, and -2px hover lift with soft shadow.
 */

import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  compact?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  interactive = false,
  compact = false,
  ...props
}) => {
  const baseStyle = [
    "flex flex-col",
    "bg-[var(--surface)]",
    "border border-[var(--border)]",
    "rounded-[var(--card-radius)]",
    "overflow-hidden",
    "transition-all duration-200 ease-out",
  ].join(" ");

  const hoverStyle = interactive
    ? [
        "hover:-translate-y-0.5",
        "hover:shadow-[var(--card-hover-shadow)]",
        "hover:border-[var(--border-strong)]",
        "cursor-pointer",
      ].join(" ")
    : "";

  const paddingStyle = compact ? "p-3 sm:p-4" : "p-4 sm:p-6";

  return (
    <div className={`${baseStyle} ${paddingStyle} ${hoverStyle} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div
      className={`pb-3 mb-3 border-b border-[var(--border)] flex items-center justify-between gap-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div className={`flex-1 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div
      className={`pt-3 mt-3 border-t border-[var(--border)] flex items-center gap-3 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

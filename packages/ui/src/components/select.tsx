"use client";

import { forwardRef } from "react";

import { cn } from "../lib/cn";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> { }

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex h-10 w-full px-3 py-2",
        "bg-[hsl(var(--surface))] border border-[hsl(var(--border))]",
        "rounded-[var(--radius-sm)]",
        "text-[hsl(var(--text-1))]",
        "text-sm",
        "transition-all duration-200",
        "focus:outline-none focus:border-[hsl(var(--primary))]",
        "focus:shadow-[0_4px_12px_-4px_hsl(var(--primary)/0.2)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "[&>option]:bg-[hsl(var(--surface))] [&>option]:text-[hsl(var(--text-1))]",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);

Select.displayName = "Select";

"use client";

import { forwardRef } from "react";

import { cn } from "../lib/cn";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        // LAB / SECURE TERMINAL FIELD
        "flex h-12 w-full px-4",
        "bg-[color-mix(in_oklab,hsl(var(--surface))_35%,black_65%)]",
        "border border-[color-mix(in_oklab,hsl(var(--border))_55%,transparent_45%)]",
        "rounded-none",
        "text-[hsl(var(--text-1))] font-mono tracking-[0.08em]",
        "text-sm",
        "transition-[border-color,box-shadow,background-color] duration-200",
        "hover:border-[color-mix(in_oklab,hsl(var(--border))_65%,white_18%)]",
        "focus:outline-none focus:border-[hsl(var(--primary))]",
        "focus:shadow-[0_0_0_1px_hsl(var(--primary)/0.60),0_0_26px_-14px_hsl(var(--primary)/0.45)]",
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

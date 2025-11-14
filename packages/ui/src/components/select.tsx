"use client";

import { forwardRef } from "react";

import { cn } from "../lib/cn";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex h-auto min-h-[48px] w-full border border-[color-mix(in oklab,var(--border-color) 75%,transparent)] bg-[color-mix(in oklab,var(--surface-color) 92%,transparent)] backdrop-blur-[12px] px-[var(--space-4)] py-[var(--space-3)] text-[var(--fs-sm)] leading-[var(--lh-base)] text-[var(--fg)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition-colors duration-[var(--motion-duration-base)] ease-[var(--motion-ease)]",
        "focus:border-[color-mix(in oklab,var(--primary-color) 55%,transparent)] focus:shadow-[0_0_0_2px_rgba(91,138,255,0.22)] focus:ring-0",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "[&>option]:bg-[var(--surface-color)] [&>option]:text-[var(--fg)]",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);

Select.displayName = "Select";


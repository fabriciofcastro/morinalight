"use client";

import { forwardRef } from "react";

import { cn } from "../lib/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-auto min-h-[48px] w-full border border-[color-mix(in oklab,var(--border-color) 75%,transparent)] bg-[color-mix(in oklab,var(--surface-color) 92%,transparent)] backdrop-blur-[12px] px-[var(--space-4)] py-[var(--space-3)] text-[var(--fs-sm)] leading-[var(--lh-base)] text-[var(--fg)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition-colors duration-[var(--motion-duration-base)] ease-[var(--motion-ease)]",
        "placeholder:text-[color-mix(in oklab,var(--muted-soft) 68%,var(--fg) 32%)]",
        "focus:border-[color-mix(in oklab,var(--primary-color) 55%,transparent)] focus:shadow-[0_0_0_2px_rgba(91,138,255,0.22)] focus:ring-0",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";

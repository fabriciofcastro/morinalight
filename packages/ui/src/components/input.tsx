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
        "flex h-auto min-h-[48px] w-full rounded-[var(--r-md)] border border-[color-mix(in_oklab,var(--border)_75%,transparent)] bg-[color-mix(in_oklab,var(--surface-muted)_92%,transparent)] px-[var(--space-4)] py-[var(--space-3)] text-[var(--fs-sm)] leading-[var(--lh-base)] text-[var(--fg)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition-colors duration-[var(--motion-duration-base)] ease-[var(--motion-ease)]",
        "placeholder:text-[color-mix(in_oklab,var(--muted)_68%,var(--fg)_32%)]",
        "focus:border-[var(--border-strong)] focus:shadow-[0_0_0_2px_rgba(91,138,255,0.22)] focus:ring-0",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";

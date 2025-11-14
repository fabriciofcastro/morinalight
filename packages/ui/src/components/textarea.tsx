"use client";

import { forwardRef } from "react";

import { cn } from "../lib/cn";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[120px] w-full border border-[color-mix(in oklab,var(--border-color) 75%,transparent)] bg-[color-mix(in oklab,var(--surface-color) 92%,transparent)] backdrop-blur-[12px] px-[var(--space-4)] py-[var(--space-3)] text-[var(--fs-sm)] leading-[var(--lh-base)] text-[var(--fg)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition-colors duration-[var(--motion-duration-base)] ease-[var(--motion-ease)]",
        "placeholder:text-[color-mix(in oklab,var(--muted-soft) 68%,var(--fg) 32%)]",
        "focus:border-[color-mix(in oklab,var(--primary-color) 55%,transparent)] focus:shadow-[0_0_0_2px_rgba(91,138,255,0.22)] focus:ring-0",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "resize-y",
        className,
      )}
      {...props}
    />
  ),
);

Textarea.displayName = "Textarea";

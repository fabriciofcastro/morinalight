"use client";

import { forwardRef } from "react";

import { cn } from "../lib/cn";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[120px] w-full px-3 py-2",
        "bg-[hsl(var(--surface))] border border-[hsl(var(--border))]",
        "rounded-[var(--radius-sm)]",
        "text-[hsl(var(--text-1))] placeholder:text-[hsl(var(--text-3))]",
        "text-sm",
        "transition-all duration-200",
        "focus:outline-none focus:border-[hsl(var(--primary))]",
        "focus:shadow-[0_4px_12px_-4px_hsl(var(--primary)/0.2)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "resize-y",
        className,
      )}
      {...props}
    />
  ),
);

Textarea.displayName = "Textarea";

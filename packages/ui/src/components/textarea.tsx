"use client";

import { forwardRef } from "react";

import { cn } from "../lib/cn";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        // LAB / SECURE TERMINAL FIELD
        "flex min-h-[140px] w-full px-4 py-3",
        "bg-[color-mix(in_oklab,hsl(var(--surface))_35%,black_65%)]",
        "border border-[color-mix(in_oklab,hsl(var(--border))_55%,transparent_45%)]",
        "rounded-none",
        "text-[hsl(var(--text-1))] placeholder:text-[color-mix(in_oklab,hsl(var(--text-3))_78%,transparent_22%)]",
        "font-mono tracking-[0.06em] placeholder:uppercase placeholder:tracking-[0.18em]",
        "text-sm",
        "transition-[border-color,box-shadow,background-color] duration-200",
        "hover:border-[color-mix(in_oklab,hsl(var(--border))_65%,white_18%)]",
        "focus:outline-none focus:border-[hsl(var(--primary))]",
        "focus:shadow-[0_0_0_1px_hsl(var(--primary)/0.60),0_0_26px_-14px_hsl(var(--primary)/0.45)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "resize-y",
        className,
      )}
      {...props}
    />
  ),
);

Textarea.displayName = "Textarea";

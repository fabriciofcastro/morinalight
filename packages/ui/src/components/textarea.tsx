"use client";

import { forwardRef } from "react";

import { cn } from "../lib/cn";
import type { ValidationState } from "../theme/validation-tokens";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  validationState?: ValidationState;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, validationState, ...props }, ref) => {
    // Classes baseadas no estado de validação
    const validationClasses = {
      valid:
        "border-[hsl(158,72%,35%)] focus:border-[hsl(158,72%,35%)] focus:shadow-[0_0_0_1px_hsl(158,72%,35%/0.60),0_0_26px_-14px_hsl(158,72%,35%/0.45)]",
      invalid:
        "border-[hsl(0,82%,45%)] focus:border-[hsl(0,82%,45%)] focus:shadow-[0_0_0_1px_hsl(0,82%,45%/0.60),0_0_26px_-14px_hsl(0,82%,45%/0.45)]",
      pending:
        "border-[hsl(45,100%,45%)] focus:border-[hsl(45,100%,45%)] focus:shadow-[0_0_0_1px_hsl(45,100%,45%/0.60),0_0_26px_-14px_hsl(45,100%,45%/0.45)]",
      default: "",
    };

    return (
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
          validationState === "default" || !validationState
            ? "focus:outline-none focus:border-[hsl(var(--primary))] focus:shadow-[0_0_0_1px_hsl(var(--primary)/0.60),0_0_26px_-14px_hsl(var(--primary)/0.45)]"
            : validationClasses[validationState],
          "disabled:cursor-not-allowed disabled:opacity-50",
          "resize-y",
          className,
        )}
        aria-invalid={validationState === "invalid" ? true : undefined}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";

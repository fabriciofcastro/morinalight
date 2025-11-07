"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";

import { cn } from "../lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-[var(--space-2)] rounded-[var(--r-pill)] border font-semibold uppercase tracking-[var(--tracking-wide)] leading-[var(--lh-tight)] transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
  {
    variants: {
      variant: {
        primary:
          "border-[color-mix(in_oklab,var(--primary)_45%,transparent)] bg-[linear-gradient(135deg,rgba(91,138,255,0.94),rgba(91,138,255,0.68))] text-[var(--primary-contrast)] shadow-[var(--shadow-soft)] hover:translate-y-[2px] hover:shadow-[var(--shadow-strong)] focus-visible:outline-[color-mix(in_oklab,var(--primary)_70%,transparent)]",
        secondary:
          "border-[var(--border)] bg-[color-mix(in_oklab,var(--surface-muted)_88%,transparent)] text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)] hover:border-[var(--border-strong)] hover:text-[var(--fg)] focus-visible:outline-[color-mix(in_oklab,var(--primary)_55%,transparent)]",
        ghost:
          "border-transparent bg-transparent text-[color-mix(in_oklab,var(--primary)_78%,var(--fg)_22%)] hover:text-[var(--primary)]",
      },
      size: {
        md: "px-[var(--space-6)] py-[var(--space-3)] text-[var(--fs-sm)]",
        sm: "px-[var(--space-4)] py-[var(--space-2)] text-[var(--fs-xs)]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);

Button.displayName = "Button";

export { buttonVariants };

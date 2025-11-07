import { cn } from "@morina/ui";

import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-[var(--space-3)] py-[var(--space-2)] text-[var(--fs-xs)] font-semibold uppercase tracking-[var(--tracking-wide)] transition",
  {
    variants: {
      variant: {
        default:
          "border-[color-mix(in_oklab,var(--primary)_45%,transparent)] bg-[color-mix(in_oklab,var(--primary)_28%,transparent)] text-[var(--primary-contrast)]",
        secondary:
          "border-[color-mix(in_oklab,var(--muted)_55%,transparent)] bg-[color-mix(in_oklab,var(--surface)_95%,transparent)] text-[color-mix(in_oklab,var(--muted)_65%,var(--fg)_35%)]",
        outline:
          "border-[color-mix(in_oklab,var(--primary)_35%,transparent)] text-[color-mix(in_oklab,var(--primary)_80%,var(--fg)_20%)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends VariantProps<typeof badgeVariants> {
  className?: string;
  children: ReactNode;
}

export function Badge({ className, variant, children }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)}>{children}</span>;
}

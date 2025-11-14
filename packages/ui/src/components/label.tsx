"use client";

import { forwardRef, type ReactNode } from "react";

import { cn } from "../lib/cn";

export interface LabelProps extends Omit<React.LabelHTMLAttributes<HTMLLabelElement>, "htmlFor"> {
  children: ReactNode;
  htmlFor: string;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, htmlFor, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-[var(--fs-xs)] font-medium uppercase tracking-[var(--tracking-wide)] text-[color-mix(in oklab,var(--muted-soft) 72%,var(--fg) 28%)]",
        className,
      )}
      htmlFor={htmlFor}
      {...props}
    >
      {children}
    </label>
  ),
);

Label.displayName = "Label";

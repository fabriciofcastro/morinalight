"use client";

import type { VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "../lib/cn";
import { inputVariants } from "./input-variants";

export interface NativeSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size">,
  VariantProps<typeof inputVariants> { }

export const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, children, size, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        inputVariants({ size }),
        "focus:border-[hsl(var(--primary))] focus:shadow-[0_0_0_1px_hsl(var(--primary)/0.60),0_0_26px_-14px_hsl(var(--primary)/0.45)]",
        "[&>option]:bg-[hsl(var(--surface))] [&>option]:text-[hsl(var(--text-1))]",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);

NativeSelect.displayName = "NativeSelect";

"use client";

import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../lib/cn";

/**
 * Switch Component - Enterprise Grade
 * Wrapper for Radix UI Switch with custom styling
 *
 * Features:
 * - 3 sizes (sm, md, lg)
 * - Theme-aware
 * - Loading state
 * - Disabled state
 * - Label support
 * - ARIA compliant
 */

const switchVariants = cva(
  [
    "peer inline-flex shrink-0 cursor-pointer items-center",
    "rounded-full border-2 border-transparent",
    "transition-colors duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "data-[state=checked]:bg-primary",
    "data-[state=unchecked]:bg-surface-elevated border-border",
  ],
  {
    variants: {
      size: {
        sm: "h-5 w-9",
        md: "h-6 w-11",
        lg: "h-7 w-14",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

const switchThumbVariants = cva(
  [
    "pointer-events-none block rounded-full bg-white shadow-lg",
    "transition-transform duration-200",
    "data-[state=unchecked]:translate-x-0",
  ],
  {
    variants: {
      size: {
        sm: "h-4 w-4 data-[state=checked]:translate-x-4",
        md: "h-5 w-5 data-[state=checked]:translate-x-5",
        lg: "h-6 w-6 data-[state=checked]:translate-x-7",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>,
    VariantProps<typeof switchVariants> {
  /** Loading state */
  isLoading?: boolean;
  /** Switch ID */
  id?: string;
}

const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, SwitchProps>(
  ({ className, size, isLoading, disabled, ...props }, ref) => (
    <SwitchPrimitives.Root
      className={cn(switchVariants({ size }), className)}
      disabled={disabled || isLoading}
      ref={ref}
      {...props}
    >
      <SwitchPrimitives.Thumb className={cn(switchThumbVariants({ size }))}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
      </SwitchPrimitives.Thumb>
    </SwitchPrimitives.Root>
  ),
);
Switch.displayName = SwitchPrimitives.Root.displayName;

/**
 * SwitchWithLabel Component
 * Switch with integrated label
 */

export interface SwitchWithLabelProps extends SwitchProps {
  /** Label text */
  label: string;
  /** Label description */
  description?: string;
  /** Label position */
  labelPosition?: "left" | "right";
}

const SwitchWithLabel = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchWithLabelProps
>(({ label, description, labelPosition = "right", className, id, ...props }, ref) => {
  const switchId = id || React.useId();

  return (
    <div
      className={cn(
        "flex items-center gap-3",
        labelPosition === "left" && "flex-row-reverse justify-end",
        className,
      )}
    >
      <Switch ref={ref} id={switchId} {...props} />
      <div className="flex flex-col gap-0.5">
        <label
          htmlFor={switchId}
          className="text-sm font-semibold text-text-primary cursor-pointer"
        >
          {label}
        </label>
        {description && <p className="text-xs text-text-secondary">{description}</p>}
      </div>
    </div>
  );
});
SwitchWithLabel.displayName = "SwitchWithLabel";

export { Switch, SwitchWithLabel };

"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "../lib/cn";

/**
 * Spinner Component - Enterprise Grade
 *
 * Features:
 * - 5 sizes (xs → xl)
 * - 4 variants (default, dots, bars, pulse)
 * - Theme-aware colors
 * - Customizable speed
 * - Label support
 */

const spinnerVariants = cva("animate-spin", {
  variants: {
    size: {
      xs: "h-3 w-3",
      sm: "h-4 w-4",
      md: "h-6 w-6",
      lg: "h-8 w-8",
      xl: "h-12 w-12",
    },
    variant: {
      default: "text-primary",
      secondary: "text-secondary",
      success: "text-success",
      danger: "text-danger",
      muted: "text-text-tertiary",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "default",
  },
});

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  /** Show label */
  label?: string;
  /** Label position */
  labelPosition?: "top" | "bottom" | "left" | "right";
}

export function Spinner({
  size,
  variant,
  label,
  labelPosition = "bottom",
  className,
  ...props
}: SpinnerProps) {
  const spinner = <Loader2 className={cn(spinnerVariants({ size, variant }), className)} />;

  if (!label) {
    return <div {...props}>{spinner}</div>;
  }

  const labelClasses = "text-sm text-text-secondary";

  return (
    <div
      className={cn(
        "flex items-center gap-3",
        labelPosition === "top" && "flex-col-reverse",
        labelPosition === "bottom" && "flex-col",
        labelPosition === "left" && "flex-row-reverse",
        labelPosition === "right" && "flex-row",
      )}
      {...props}
    >
      {spinner}
      <span className={labelClasses}>{label}</span>
    </div>
  );
}

/**
 * DotsSpinner Component
 * Three bouncing dots
 */

export interface DotsSpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
}

export function DotsSpinner({ size = "md", variant = "default", className }: DotsSpinnerProps) {
  const dotSize = {
    xs: "h-1 w-1",
    sm: "h-1.5 w-1.5",
    md: "h-2 w-2",
    lg: "h-3 w-3",
    xl: "h-4 w-4",
  }[size || "md"];

  const colorClass = {
    default: "bg-primary",
    secondary: "bg-secondary",
    success: "bg-success",
    danger: "bg-danger",
    muted: "bg-text-tertiary",
  }[variant || "default"];

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div
        className={cn(dotSize, colorClass, "rounded-full animate-bounce")}
        style={{ animationDelay: "0ms" }}
      />
      <div
        className={cn(dotSize, colorClass, "rounded-full animate-bounce")}
        style={{ animationDelay: "150ms" }}
      />
      <div
        className={cn(dotSize, colorClass, "rounded-full animate-bounce")}
        style={{ animationDelay: "300ms" }}
      />
    </div>
  );
}

/**
 * BarsSpinner Component
 * Vertical bars
 */

export function BarsSpinner({ size = "md", variant = "default", className }: DotsSpinnerProps) {
  const barHeight = {
    xs: "h-3",
    sm: "h-4",
    md: "h-6",
    lg: "h-8",
    xl: "h-12",
  }[size || "md"];

  const colorClass = {
    default: "bg-primary",
    secondary: "bg-secondary",
    success: "bg-success",
    danger: "bg-danger",
    muted: "bg-text-tertiary",
  }[variant || "default"];

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn("w-1", barHeight, colorClass, "animate-pulse")}
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}

/**
 * PulseSpinner Component
 * Pulsing circle
 */

export function PulseSpinner({ size = "md", variant = "default", className }: DotsSpinnerProps) {
  const sizeClass = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  }[size || "md"];

  const colorClass = {
    default: "bg-primary",
    secondary: "bg-secondary",
    success: "bg-success",
    danger: "bg-danger",
    muted: "bg-text-tertiary",
  }[variant || "default"];

  return (
    <div className={cn("relative", sizeClass, className)}>
      <div className={cn("absolute inset-0 rounded-full", colorClass, "animate-ping opacity-75")} />
      <div className={cn("relative rounded-full", sizeClass, colorClass)} />
    </div>
  );
}

Spinner.displayName = "Spinner";
DotsSpinner.displayName = "DotsSpinner";
BarsSpinner.displayName = "BarsSpinner";
PulseSpinner.displayName = "PulseSpinner";

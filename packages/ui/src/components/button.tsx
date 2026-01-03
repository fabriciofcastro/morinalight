"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { forwardRef } from "react";

import { cn } from "../lib/cn";

const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2",
    "font-semibold transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "overflow-hidden", // For reflection effect
    // Reflection gradient overlay
    "before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/10 before:to-transparent before:pointer-events-none before:opacity-0 before:transition-opacity before:duration-200",
    "hover:before:opacity-100",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-[hsl(var(--primary))] text-white border border-[hsl(var(--primary))]",
          "hover:bg-[hsl(var(--primary)/0.9)]",
          "hover:shadow-[0_8px_16px_-4px_hsl(var(--primary)/0.4)]",
          "active:translate-y-[1px]",
          "focus-visible:ring-[hsl(var(--primary))]",
        ],
        secondary: [
          "bg-[hsl(var(--secondary))] text-white border border-[hsl(var(--secondary))]",
          "hover:bg-[hsl(var(--secondary)/0.9)]",
          "hover:shadow-[0_8px_16px_-4px_hsl(var(--secondary)/0.4)]",
          "active:translate-y-[1px]",
          "focus-visible:ring-[hsl(var(--secondary))]",
        ],
        success: [
          "bg-[hsl(var(--success))] text-white border border-[hsl(var(--success))]",
          "hover:bg-[hsl(var(--success)/0.9)]",
          "hover:shadow-[0_8px_16px_-4px_hsl(var(--success)/0.4)]",
          "active:translate-y-[1px]",
          "focus-visible:ring-[hsl(var(--success))]",
        ],
        danger: [
          "bg-[hsl(var(--danger))] text-white border border-[hsl(var(--danger))]",
          "hover:bg-[hsl(var(--danger)/0.9)]",
          "hover:shadow-[0_8px_16px_-4px_hsl(var(--danger)/0.4)]",
          "active:translate-y-[1px]",
          "focus-visible:ring-[hsl(var(--danger))]",
        ],
        outline: [
          "bg-transparent border-2 border-[hsl(var(--border))]",
          "text-[hsl(var(--text-1))]",
          "hover:bg-[hsl(var(--surface))]",
          "hover:shadow-md",
          "focus-visible:ring-[hsl(var(--primary))]",
        ],
        ghost: [
          "bg-transparent border-transparent",
          "text-[hsl(var(--text-2))]",
          "hover:bg-[hsl(var(--surface))]",
          "hover:text-[hsl(var(--text-1))]",
        ],
      },
      size: {
        sm: "h-9 px-3 text-sm rounded-none",
        md: "h-10 px-4 text-sm rounded-none",
        lg: "h-11 px-6 text-base rounded-none",
        xl: "h-12 px-8 text-base rounded-none",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, isLoading, leftIcon, rightIcon, children, disabled, ...props },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={isDisabled}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";

export { buttonVariants };

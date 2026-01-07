import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { forwardRef } from "react";

import { cn } from "../lib/cn";

const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2",
    "font-semibold transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "overflow-hidden",
    // Reflection gradient overlay
    "before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/10 before:to-transparent before:pointer-events-none before:opacity-0 before:transition-opacity before:duration-200",
    "hover:before:opacity-100",
  ],
  {
    variants: {
      variant: {
        // Original variants (updated with semantic tokens)
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
        warning: [
          "bg-[hsl(var(--warning))] text-white border border-[hsl(var(--warning))]",
          "hover:bg-[hsl(var(--warning)/0.9)]",
          "hover:shadow-[0_8px_16px_-4px_hsl(var(--warning)/0.4)]",
          "active:translate-y-[1px]",
          "focus-visible:ring-[hsl(var(--warning))]",
        ],
        info: [
          "bg-[hsl(var(--info))] text-white border border-[hsl(var(--info))]",
          "hover:bg-[hsl(var(--info)/0.9)]",
          "hover:shadow-[0_8px_16px_-4px_hsl(var(--info)/0.4)]",
          "active:translate-y-[1px]",
          "focus-visible:ring-[hsl(var(--info))]",
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
        link: [
          "bg-transparent border-transparent",
          "text-[hsl(var(--primary))]",
          "underline-offset-4",
          "hover:underline",
          "focus-visible:ring-[hsl(var(--primary))]",
        ],
        // NEW VARIANTS
        gradient: [
          "bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))]",
          "text-white border-none",
          "hover:shadow-[0_8px_20px_-4px_hsl(var(--primary)/0.5)]",
          "active:scale-[0.98]",
        ],
        neon: [
          "bg-transparent border-2 border-[hsl(var(--primary))]",
          "text-[hsl(var(--primary))]",
          "shadow-[0_0_20px_hsl(var(--primary)/0.3)]",
          "hover:shadow-[0_0_30px_hsl(var(--primary)/0.5)]",
          "hover:bg-[hsl(var(--primary)/0.1)]",
        ],
        glass: [
          "bg-white/10 backdrop-blur-md border border-white/20",
          "text-white",
          "hover:bg-white/15",
          "hover:border-white/30",
        ],
        minimal: [
          "bg-transparent border-none",
          "text-[hsl(var(--text-2))]",
          "hover:bg-white/5",
          "hover:text-[hsl(var(--text-1))]",
        ],
        destructive: [
          "bg-[hsl(var(--danger))] text-white border border-[hsl(var(--danger))]",
          "hover:bg-[hsl(var(--danger)/0.9)]",
          "hover:shadow-[0_8px_16px_-4px_hsl(var(--danger)/0.4)]",
        ],
        accent: [
          "bg-[hsl(var(--accent))] text-black border border-[hsl(var(--accent))]",
          "hover:bg-[hsl(var(--accent)/0.9)]",
          "hover:shadow-[0_8px_16px_-4px_hsl(var(--accent)/0.4)]",
        ],
      },
      size: {
        xs: "h-7 px-2 text-xs rounded-none",
        sm: "h-9 px-3 text-sm rounded-none",
        md: "h-10 px-4 text-sm rounded-none",
        lg: "h-11 px-6 text-base rounded-none",
        xl: "h-12 px-8 text-base rounded-none",
        // Icon-only sizes
        icon: "h-10 w-10 p-0",
        iconSm: "h-8 w-8 p-0",
        iconLg: "h-12 w-12 p-0",
        // Standard Shadcn sizes mapping
        default: "h-10 px-4 py-2",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      fullWidth: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, isLoading, leftIcon, rightIcon, children, disabled, asChild = false, ...props },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={isDisabled}
        {...props}
      >
        {isLoading ? (
          asChild ? (
            // If asChild is true, we cannot replace children easily. 
            // We render children but might want to inject spinner. 
            // For now, if loading+asChild, just render children (User responsibility). 
            children
          ) : (
            <Loader2 className="h-4 w-4 animate-spin" />
          )
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </Comp>
    );
  },
);

Button.displayName = "Button";

export { buttonVariants };

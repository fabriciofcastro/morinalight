import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { forwardRef } from "react";
import { cn } from "../lib/cn";

/**
 * Badge Component - Enterprise Grade
 *
 * Features:
 * - 8 semantic variants
 * - 3 sizes
 * - 3 shapes
 * - Removable option
 * - Icon support
 * - Dot indicator
 * - Animations
 */

const badgeVariants = cva(
  [
    "inline-flex items-center justify-center gap-1.5",
    "font-semibold whitespace-nowrap",
    "transition-all duration-200",
    "border",
    // Animations
    "animate-in fade-in-0 zoom-in-95",
  ],
  {
    variants: {
      variant: {
        default: ["bg-primary text-white border-primary", "hover:bg-primary-hover"],
        secondary: ["bg-secondary text-white border-secondary", "hover:bg-secondary-hover"],
        success: ["bg-success text-white border-success", "hover:bg-[hsl(var(--success)/0.9)]"],
        warning: ["bg-warning text-black border-warning", "hover:bg-[hsl(var(--warning)/0.9)]"],
        danger: ["bg-danger text-white border-danger", "hover:bg-[hsl(var(--danger)/0.9)]"],
        info: ["bg-info text-white border-info", "hover:bg-[hsl(var(--info)/0.9)]"],
        outline: ["bg-transparent text-text-primary border-border", "hover:bg-surface"],
        ghost: [
          "bg-transparent text-text-secondary border-transparent",
          "hover:bg-surface hover:text-text-primary",
        ],
      },
      size: {
        sm: "h-5 px-1.5 text-[10px] gap-1",
        md: "h-6 px-2 text-xs gap-1.5",
        lg: "h-7 px-2.5 text-sm gap-2",
      },
      shape: {
        square: "rounded-none",
        rounded: "rounded-md",
        pill: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      shape: "square",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> {
  /** Icon to display before text */
  icon?: React.ReactNode;
  /** Show dot indicator */
  dot?: boolean;
  /** Make badge removable */
  removable?: boolean;
  /** Callback when remove button is clicked */
  onRemove?: () => void;
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  (
    { className, variant, size, shape, icon, dot, removable, onRemove, children, ...props },
    ref,
  ) => {
    return (
      <div ref={ref} className={cn(badgeVariants({ variant, size, shape }), className)} {...props}>
        {dot && (
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              variant === "default" && "bg-white",
              variant === "secondary" && "bg-white",
              variant === "success" && "bg-white",
              variant === "warning" && "bg-black",
              variant === "danger" && "bg-white",
              variant === "info" && "bg-white",
              variant === "outline" && "bg-primary",
              variant === "ghost" && "bg-text-secondary",
            )}
          />
        )}
        {icon && <span className="shrink-0">{icon}</span>}
        {children}
        {removable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
            className={cn(
              "shrink-0 rounded-sm opacity-70 hover:opacity-100",
              "transition-opacity",
              "focus:outline-none focus:ring-1 focus:ring-offset-1",
              size === "sm" && "h-3 w-3",
              size === "md" && "h-3.5 w-3.5",
              size === "lg" && "h-4 w-4",
            )}
          >
            <X className="h-full w-full" />
            <span className="sr-only">Remove</span>
          </button>
        )}
      </div>
    );
  },
);

Badge.displayName = "Badge";

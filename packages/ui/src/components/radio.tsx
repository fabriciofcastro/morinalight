"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cva, type VariantProps } from "class-variance-authority";
import { Circle } from "lucide-react";
import * as React from "react";
import { cn } from "../lib/cn";

/**
 * Radio Component - Enterprise Grade
 * Wrapper for Radix UI Radio Group with custom styling
 *
 * Features:
 * - 3 sizes (sm, md, lg)
 * - Theme-aware
 * - Disabled state
 * - Description support
 * - ARIA compliant
 * - Keyboard navigation
 */

const radioGroupVariants = cva("grid gap-2", {
  variants: {
    orientation: {
      vertical: "grid-flow-row",
      horizontal: "grid-flow-col auto-cols-max",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
});

const radioItemVariants = cva(
  [
    "aspect-square rounded-full border-2",
    "transition-all duration-200",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "data-[state=checked]:border-primary data-[state=checked]:bg-primary",
    "data-[state=unchecked]:border-border data-[state=unchecked]:bg-surface",
  ],
  {
    variants: {
      size: {
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-6 w-6",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

const radioIndicatorVariants = cva("flex items-center justify-center text-white", {
  variants: {
    size: {
      sm: "h-2 w-2",
      md: "h-2.5 w-2.5",
      lg: "h-3 w-3",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface RadioGroupProps
  extends Omit<React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>, "orientation">,
    VariantProps<typeof radioGroupVariants> {}

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(({ className, orientation, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn(radioGroupVariants({ orientation }), className)}
      {...props}
      ref={ref}
    />
  );
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

export interface RadioGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
    VariantProps<typeof radioItemVariants> {}

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, size, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(radioItemVariants({ size }), className)}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className={cn(radioIndicatorVariants({ size }))}>
        <Circle className="h-full w-full fill-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

/**
 * RadioGroupItemWithLabel Component
 * Radio item with integrated label and description
 */

export interface RadioGroupItemWithLabelProps extends RadioGroupItemProps {
  /** Label text */
  label: string;
  /** Description text */
  description?: string;
  /** Item value */
  value: string;
}

const RadioGroupItemWithLabel = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemWithLabelProps
>(({ label, description, value, size, className, id, ...props }, ref) => {
  const itemId = id || React.useId();

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <RadioGroupItem ref={ref} value={value} id={itemId} size={size} {...props} />
      <div className="flex flex-col gap-0.5">
        <label
          htmlFor={itemId}
          className="text-sm font-semibold text-text-primary cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </label>
        {description && <p className="text-xs text-text-secondary">{description}</p>}
      </div>
    </div>
  );
});
RadioGroupItemWithLabel.displayName = "RadioGroupItemWithLabel";

export { RadioGroup, RadioGroupItem, RadioGroupItemWithLabel };

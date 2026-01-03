"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";

import { cn } from "../lib/cn";

const alertVariants = cva(
  "relative w-full rounded-[var(--r-lg)] border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-[hsl(var(--surface))] text-[hsl(var(--text-1))]",
        destructive:
          "border-[hsl(var(--danger)/0.5)] text-[hsl(var(--danger))] dark:border-[hsl(var(--danger))] [&>svg]:text-[hsl(var(--danger))]",
        error:
          "border-[hsl(var(--danger)/0.5)] text-[hsl(var(--danger))] dark:border-[hsl(var(--danger))] [&>svg]:text-[hsl(var(--danger))]",
        success:
          "border-[hsl(var(--success)/0.5)] text-[hsl(var(--success))] dark:border-[hsl(var(--success))] [&>svg]:text-[hsl(var(--success))]",
        warning:
          "border-[hsl(var(--warning)/0.5)] text-[hsl(var(--warning))] dark:border-[hsl(var(--warning))] [&>svg]:text-[hsl(var(--warning))]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const Alert = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
));
Alert.displayName = "Alert";

const AlertTitle = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    />
  ),
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };

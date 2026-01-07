"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../lib/cn";

/**
 * Tabs Component - Enterprise Grade
 * Wrapper for Radix UI Tabs with custom styling
 *
 * Features:
 * - 4 variants (default, pills, enclosed, vertical)
 * - 3 sizes
 * - Keyboard navigation
 * - ARIA compliant
 * - Animations
 */

const tabsListVariants = cva(
  ["inline-flex items-center justify-center", "transition-all duration-200"],
  {
    variants: {
      variant: {
        default: ["border-b border-border", "gap-6"],
        pills: ["bg-surface p-1 rounded-md", "gap-1"],
        enclosed: ["border border-border rounded-none bg-surface", "gap-0"],
        vertical: ["flex-col items-stretch border-r border-border", "gap-1"],
      },
      size: {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

const tabsTriggerVariants = cva(
  [
    "inline-flex items-center justify-center whitespace-nowrap",
    "font-semibold transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        default: [
          "border-b-2 border-transparent",
          "data-[state=active]:border-primary data-[state=active]:text-primary",
          "hover:text-text-primary",
          "text-text-secondary",
        ],
        pills: [
          "rounded-md px-3 py-1.5",
          "data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm",
          "hover:bg-background/50",
          "text-text-secondary",
        ],
        enclosed: [
          "border-r border-border px-4 py-2",
          "data-[state=active]:bg-background data-[state=active]:text-primary",
          "hover:bg-background/50",
          "text-text-secondary",
          "last:border-r-0",
        ],
        vertical: [
          "justify-start px-4 py-2 rounded-none",
          "data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-l-2 data-[state=active]:border-primary",
          "hover:bg-surface-elevated",
          "text-text-secondary",
        ],
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-12 px-6 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

const tabsContentVariants = cva(
  [
    "mt-4",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary",
    // Animations
    "data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:zoom-in-95",
    "data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0 data-[state=inactive]:zoom-out-95",
  ],
  {
    variants: {
      variant: {
        default: "",
        pills: "",
        enclosed: "border border-border border-t-0 rounded-b-md p-4",
        vertical: "",
      },
    },
  },
);

export interface TabsProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>,
    VariantProps<typeof tabsListVariants> {}

const Tabs = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Root>, TabsProps>(
  ({ className, ...props }, ref) => (
    <TabsPrimitive.Root ref={ref} className={cn("w-full", className)} {...props} />
  ),
);
Tabs.displayName = TabsPrimitive.Root.displayName;

export interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsListVariants> {}

const TabsList = React.forwardRef<React.ElementRef<typeof TabsPrimitive.List>, TabsListProps>(
  ({ className, variant, size, ...props }, ref) => (
    <TabsPrimitive.List
      ref={ref}
      className={cn(tabsListVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
TabsList.displayName = TabsPrimitive.List.displayName;

export interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>,
    VariantProps<typeof tabsTriggerVariants> {}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, variant, size, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(tabsTriggerVariants({ variant, size }), className)}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

export interface TabsContentProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>,
    VariantProps<typeof tabsContentVariants> {}

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  TabsContentProps
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(tabsContentVariants({ variant }), className)}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };

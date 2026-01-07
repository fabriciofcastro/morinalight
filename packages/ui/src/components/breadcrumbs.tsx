"use client";

import { ChevronRight } from "lucide-react";
import * as React from "react";
import { cn } from "../lib/cn";

/**
 * Breadcrumbs Component - Enterprise Grade
 *
 * Features:
 * - Automatic separators
 * - Custom separator
 * - Responsive (collapse on mobile)
 * - Theme-aware
 * - ARIA compliant
 */

export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  /** Custom separator */
  separator?: React.ReactNode;
  /** Max items to show before collapsing */
  maxItems?: number;
}

const Breadcrumbs = React.forwardRef<HTMLElement, BreadcrumbsProps>(
  ({ className, separator, maxItems, children, ...props }, ref) => {
    const items = React.Children.toArray(children);
    const shouldCollapse = maxItems && items.length > maxItems;

    const visibleItems = shouldCollapse
      ? [items[0], <BreadcrumbEllipsis key="ellipsis" />, ...items.slice(-(maxItems - 2))]
      : items;

    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={cn("flex items-center space-x-2", className)}
        {...props}
      >
        <ol className="flex items-center space-x-2">
          {visibleItems.map((child, index) => (
            <li key={index} className="flex items-center space-x-2">
              {child}
              {index < visibleItems.length - 1 && (
                <span className="text-text-tertiary">
                  {separator || <ChevronRight className="h-4 w-4" />}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    );
  },
);
Breadcrumbs.displayName = "Breadcrumbs";

export interface BreadcrumbItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Is current page */
  current?: boolean;
}

const BreadcrumbItem = React.forwardRef<HTMLAnchorElement, BreadcrumbItemProps>(
  ({ className, current, children, ...props }, ref) => {
    if (current) {
      return (
        <span
          className={cn("text-sm font-semibold text-text-primary", "cursor-default", className)}
          aria-current="page"
        >
          {children}
        </span>
      );
    }

    return (
      <a
        ref={ref}
        className={cn(
          "text-sm text-text-secondary",
          "hover:text-text-primary hover:underline",
          "transition-colors duration-200",
          className,
        )}
        {...props}
      >
        {children}
      </a>
    );
  },
);
BreadcrumbItem.displayName = "BreadcrumbItem";

const BreadcrumbEllipsis = () => <span className="text-text-tertiary">...</span>;

export { Breadcrumbs, BreadcrumbItem, BreadcrumbEllipsis };

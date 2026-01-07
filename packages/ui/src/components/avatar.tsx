"use client";

import { cva, type VariantProps } from "class-variance-authority";
import React, { forwardRef } from "react";
import { cn } from "../lib/cn";

/**
 * Avatar Component - Enterprise Grade
 *
 * Features:
 * - 7 sizes (xs → 3xl)
 * - Status indicator (online, offline, busy, away)
 * - Fallback with initials
 * - Image loading states
 * - Shape variants (circle, square)
 * - Border options
 */

const avatarVariants = cva(
  [
    "relative inline-flex shrink-0 overflow-hidden",
    "bg-surface-elevated",
    "transition-all duration-200",
  ],
  {
    variants: {
      size: {
        xs: "h-6 w-6 text-[10px]",
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
        xl: "h-16 w-16 text-lg",
        "2xl": "h-20 w-20 text-xl",
        "3xl": "h-24 w-24 text-2xl",
      },
      shape: {
        circle: "rounded-full",
        square: "rounded-none",
        rounded: "rounded-md",
      },
      bordered: {
        true: "ring-2 ring-border ring-offset-2 ring-offset-background",
      },
    },
    defaultVariants: {
      size: "md",
      shape: "circle",
      bordered: false,
    },
  },
);

const statusVariants = cva(
  ["absolute bottom-0 right-0", "rounded-full border-2 border-background"],
  {
    variants: {
      status: {
        online: "bg-success",
        offline: "bg-text-tertiary",
        busy: "bg-danger",
        away: "bg-warning",
      },
      size: {
        xs: "h-1.5 w-1.5",
        sm: "h-2 w-2",
        md: "h-2.5 w-2.5",
        lg: "h-3 w-3",
        xl: "h-4 w-4",
        "2xl": "h-5 w-5",
        "3xl": "h-6 w-6",
      },
    },
  },
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  /** Image source */
  src?: string;
  /** Alt text for image */
  alt?: string;
  /** Fallback text (usually initials) */
  fallback?: string;
  /** Status indicator */
  status?: "online" | "offline" | "busy" | "away";
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size, shape, bordered, src, alt, fallback, status, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(avatarVariants({ size, shape, bordered }), className)}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt || "Avatar"}
            className="h-full w-full object-cover"
            onError={(e) => {
              // Hide image on error, show fallback
              e.currentTarget.style.display = "none";
            }}
          />
        ) : null}
        {(!src || fallback) && (
          <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary font-semibold uppercase">
            {fallback || alt?.[0] || "?"}
          </div>
        )}
        {status && (
          <span className={cn(statusVariants({ status, size }))} aria-label={`Status: ${status}`} />
        )}
      </div>
    );
  },
);

Avatar.displayName = "Avatar";

/**
 * AvatarGroup Component
 *
 * Features:
 * - Stack avatars with overlap
 * - Max count with overflow indicator
 * - Hover to expand
 */

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Maximum avatars to show before overflow */
  max?: number;
  /** Size of avatars */
  size?: AvatarProps["size"];
  /** Shape of avatars */
  shape?: AvatarProps["shape"];
  /** Children (Avatar components) */
  children: React.ReactNode;
}

export function AvatarGroup({
  className,
  max = 3,
  size = "md",
  shape = "circle",
  children,
  ...props
}: AvatarGroupProps) {
  const childrenArray = React.Children.toArray(children);
  const visibleChildren = max ? childrenArray.slice(0, max) : childrenArray;
  const overflowCount = childrenArray.length - visibleChildren.length;

  return (
    <div className={cn("flex items-center -space-x-2", className)} {...props}>
      {visibleChildren.map((child, index) => (
        <div
          key={index}
          className="ring-2 ring-background transition-transform hover:scale-110 hover:z-10"
          style={{ zIndex: visibleChildren.length - index }}
        >
          {child}
        </div>
      ))}
      {overflowCount > 0 && (
        <Avatar
          size={size}
          shape={shape}
          fallback={`+${overflowCount}`}
          className="ring-2 ring-background"
        />
      )}
    </div>
  );
}

AvatarGroup.displayName = "AvatarGroup";

"use client";

import * as React from "react";
import { cn } from "../lib/cn";

/**
 * EmptyState Component - Enterprise Grade
 *
 * Features:
 * - Icon support
 * - Title + description
 * - Action button
 * - Theme-aware
 */

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Icon to display */
  icon?: React.ReactNode;
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Action button */
  action?: React.ReactNode;
  /** Image to display instead of icon */
  image?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  image,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        "py-12 px-6 text-center",
        className,
      )}
      {...props}
    >
      {/* Icon or Image */}
      {image ? (
        <img src={image} alt={title} className="w-64 h-64 object-contain mb-6 opacity-50" />
      ) : icon ? (
        <div className="mb-6 text-text-tertiary opacity-50">
          {React.cloneElement(icon as React.ReactElement<any>, {
            className: "h-16 w-16",
          })}
        </div>
      ) : null}

      {/* Title */}
      <h3 className="text-xl font-semibold text-text-primary mb-2">{title}</h3>

      {/* Description */}
      {description && <p className="text-sm text-text-secondary max-w-md mb-6">{description}</p>}

      {/* Action */}
      {action && <div>{action}</div>}
    </div>
  );
}

EmptyState.displayName = "EmptyState";

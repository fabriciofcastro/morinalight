"use client";

import { Star } from "lucide-react";
import * as React from "react";
import { cn } from "../lib/cn";

/**
 * Rating Component - Enterprise Grade
 *
 * Features:
 * - Star rating (1-5 or custom max)
 * - Half-star precision
 * - Read-only mode
 * - Custom icons
 * - Theme-aware
 */

export interface RatingProps {
  /** Current rating value */
  value: number;
  /** Change handler */
  onChange?: (value: number) => void;
  /** Maximum rating */
  max?: number;
  /** Precision (1 = whole stars, 0.5 = half stars) */
  precision?: number;
  /** Read-only mode */
  readOnly?: boolean;
  /** Size */
  size?: "sm" | "md" | "lg";
  /** Custom className */
  className?: string;
}

export function Rating({
  value,
  onChange,
  max = 5,
  precision = 1,
  readOnly = false,
  size = "md",
  className,
}: RatingProps) {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const handleClick = (index: number) => {
    if (readOnly || !onChange) return;
    const newValue = index + 1;
    onChange(newValue);
  };

  const handleMouseMove = (index: number, event: React.MouseEvent<HTMLButtonElement>) => {
    if (readOnly || !onChange) return;

    if (precision === 0.5) {
      const rect = event.currentTarget.getBoundingClientRect();
      const percent = (event.clientX - rect.left) / rect.width;
      const newValue = index + (percent > 0.5 ? 1 : 0.5);
      setHoverValue(newValue);
    } else {
      setHoverValue(index + 1);
    }
  };

  const handleMouseLeave = () => {
    setHoverValue(null);
  };

  const displayValue = hoverValue !== null ? hoverValue : value;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: max }, (_, index) => {
        const filled = displayValue >= index + 1;
        const halfFilled = displayValue > index && displayValue < index + 1;

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(index)}
            onMouseMove={(e) => handleMouseMove(index, e)}
            onMouseLeave={handleMouseLeave}
            disabled={readOnly}
            className={cn(
              "relative transition-transform",
              !readOnly && "hover:scale-110 cursor-pointer",
              readOnly && "cursor-default",
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                "transition-colors",
                filled && "fill-warning text-warning",
                !filled && !halfFilled && "fill-none text-border-strong",
              )}
            />
            {halfFilled && (
              <Star
                className={cn(
                  sizeClasses[size],
                  "absolute inset-0 fill-warning text-warning",
                  "clip-path-[polygon(0_0,50%_0,50%_100%,0_100%)]",
                )}
                style={{ clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)" }}
              />
            )}
          </button>
        );
      })}

      {!readOnly && (
        <span className="ml-2 text-sm text-text-secondary">
          {displayValue.toFixed(precision === 0.5 ? 1 : 0)} / {max}
        </span>
      )}
    </div>
  );
}

Rating.displayName = "Rating";

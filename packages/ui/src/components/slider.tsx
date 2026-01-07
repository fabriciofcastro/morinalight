"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";
import { cn } from "../lib/cn";

/**
 * Slider Component - Enterprise Grade
 *
 * Features:
 * - Single value or range
 * - Custom min/max/step
 * - Disabled state
 * - Theme-aware
 * - ARIA compliant
 */

export interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  /** Show value label */
  showValue?: boolean;
  /** Value formatter */
  formatValue?: (value: number) => string;
}

const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
  ({ className, showValue, formatValue, ...props }, ref) => {
    const value = props.value || props.defaultValue || [0];

    return (
      <div className="relative w-full">
        <SliderPrimitive.Root
          ref={ref}
          className={cn("relative flex w-full touch-none select-none items-center", className)}
          {...props}
        >
          <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-surface-elevated">
            <SliderPrimitive.Range className="absolute h-full bg-primary" />
          </SliderPrimitive.Track>
          {value.map((_, index) => (
            <SliderPrimitive.Thumb
              key={index}
              className={cn(
                "block h-5 w-5 rounded-full border-2 border-primary bg-background",
                "ring-offset-background transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                "disabled:pointer-events-none disabled:opacity-50",
              )}
            />
          ))}
        </SliderPrimitive.Root>

        {showValue && (
          <div className="mt-2 flex justify-between text-xs text-text-secondary">
            {value.map((v, index) => (
              <span key={index}>{formatValue ? formatValue(v) : v}</span>
            ))}
          </div>
        )}
      </div>
    );
  },
);
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };

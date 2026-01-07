"use client";

import { Check, Pipette } from "lucide-react";
import * as React from "react";
import { cn } from "../lib/cn";
import { Button } from "./button";
import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

/**
 * ColorPicker Component - Enterprise Grade
 *
 * Features:
 * - Color swatch trigger
 * - Hex input
 * - Preset colors
 * - Theme-aware
 */

export interface ColorPickerProps {
  /** Selected color (hex) */
  value?: string;
  /** Change handler */
  onChange?: (color: string) => void;
  /** Preset colors */
  presets?: string[];
  /** Disabled state */
  disabled?: boolean;
  /** Custom className */
  className?: string;
}

const DEFAULT_PRESETS = [
  "#000000",
  "#ffffff",
  "#ef4444", // red-500
  "#f97316", // orange-500
  "#f59e0b", // amber-500
  "#eab308", // yellow-500
  "#84cc16", // lime-500
  "#22c55e", // green-500
  "#10b981", // emerald-500
  "#14b8a6", // teal-500
  "#06b6d4", // cyan-500
  "#0ea5e9", // sky-500
  "#3b82f6", // blue-500
  "#6366f1", // indigo-500
  "#8b5cf6", // violet-500
  "#a855f7", // purple-500
  "#d946ef", // fuchsia-500
  "#ec4899", // pink-500
  "#f43f5e", // rose-500
];

export function ColorPicker({
  value = "#000000",
  onChange,
  presets = DEFAULT_PRESETS,
  disabled,
  className,
}: ColorPickerProps) {
  const [internalValue, setInternalValue] = React.useState(value);

  React.useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleChange = (newValue: string) => {
    setInternalValue(newValue);
    onChange?.(newValue);
  };

  return (
    <Popover>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          className={cn("w-full justify-start text-left font-normal px-3", className)}
        >
          <div
            className="w-4 h-4 rounded-sm mr-2 border border-border shadow-sm"
            style={{ backgroundColor: internalValue }}
          />
          <span className="flex-1 truncate">{internalValue}</span>
          <Pipette className="h-4 w-4 ml-2 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3">
        <div className="space-y-3">
          {/* Hex Input */}
          <div className="flex gap-2">
            <Input
              value={internalValue}
              onChange={(e) => handleChange(e.target.value)}
              className="h-8"
              placeholder="#000000"
            />
            <div
              className="w-8 h-8 rounded-md border border-border shadow-sm shrink-0"
              style={{ backgroundColor: internalValue }}
            />
          </div>

          {/* Presets */}
          <div className="grid grid-cols-5 gap-1">
            {presets.map((color) => (
              <button
                key={color}
                className={cn(
                  "w-8 h-8 rounded-md border border-border transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  "flex items-center justify-center",
                )}
                style={{ backgroundColor: color }}
                onClick={() => handleChange(color)}
              >
                {internalValue.toLowerCase() === color.toLowerCase() && (
                  <Check
                    className={cn(
                      "h-4 w-4",
                      // Simple contrast check or just always white/black with shadow
                      "text-white drop-shadow-md",
                    )}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

ColorPicker.displayName = "ColorPicker";

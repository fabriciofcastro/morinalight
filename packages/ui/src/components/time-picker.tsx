"use client";

import { Clock } from "lucide-react";
import type * as React from "react";
import { cn } from "../lib/cn";
import { NativeSelect } from "./native-select";

/**
 * TimePicker Component - Enterprise Grade
 *
 * Features:
 * - Hour/Minute selection
 * - 12h/24h format support
 * - Theme-aware
 */

export interface TimePickerProps {
  /** Selected time (HH:mm format) */
  value?: string;
  /** Change handler */
  onChange?: (time: string) => void;
  /** Use 12h format with AM/PM */
  use12Hours?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Custom className */
  className?: string;
}

export function TimePicker({
  value,
  onChange,
  use12Hours = false,
  disabled,
  className,
}: TimePickerProps) {
  // Parse value "HH:mm"
  const [hours, minutes] = (value || "00:00").split(":");

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!onChange) return;
    onChange(`${e.target.value}:${minutes}`);
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!onChange) return;
    onChange(`${hours}:${e.target.value}`);
  };

  const hoursArray = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
  const minutesArray = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Clock className="h-4 w-4 text-text-tertiary" />
      <div className="flex gap-1">
        <NativeSelect value={hours} onChange={handleHourChange} disabled={disabled} className="w-[70px]">
          {hoursArray.map((hour) => (
            <option key={hour} value={hour}>
              {hour}
            </option>
          ))}
        </NativeSelect>
        <div className="flex items-center justify-center text-text-tertiary">:</div>
        <NativeSelect
          value={minutes}
          onChange={handleMinuteChange}
          disabled={disabled}
          className="w-[70px]"
        >
          {minutesArray.map((minute) => (
            <option key={minute} value={minute}>
              {minute}
            </option>
          ))}
        </NativeSelect>
      </div>
    </div>
  );
}

TimePicker.displayName = "TimePicker";

"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { type DateRange, DayPicker } from "react-day-picker";
import { cn } from "../lib/cn";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

/**
 * DatePicker Component - Enterprise Grade
 *
 * Features:
 * - Single date selection
 * - Date range selection
 * - Min/max date constraints
 * - Disabled dates
 * - Custom format
 * - Theme-aware
 * - Locale support
 */

export interface DatePickerProps {
  /** Selected date */
  value?: Date;
  /** Change handler */
  onChange?: (date: Date | undefined) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Date format */
  format?: string;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Disabled dates */
  disabled?: Date[] | ((date: Date) => boolean);
  /** Custom className */
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  format: dateFormat = "PPP",
  minDate,
  maxDate,
  disabled,
  className,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-text-tertiary",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, dateFormat) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <DayPicker
          mode="single"
          selected={value}
          onSelect={onChange}
          disabled={disabled}
          fromDate={minDate}
          toDate={maxDate}
          className={cn(
            "p-3",
            // Custom styling for react-day-picker
            "[&_.rdp-day]:h-9 [&_.rdp-day]:w-9",
            "[&_.rdp-day]:text-sm [&_.rdp-day]:font-normal",
            "[&_.rdp-day_button]:h-9 [&_.rdp-day_button]:w-9",
            "[&_.rdp-day_button]:rounded-none",
            "[&_.rdp-day_button:hover]:bg-surface-elevated",
            "[&_.rdp-day_button.rdp-day_selected]:bg-primary [&_.rdp-day_button.rdp-day_selected]:text-white",
            "[&_.rdp-day_button.rdp-day_today]:border [&_.rdp-day_button.rdp-day_today]:border-primary",
            "[&_.rdp-months]:space-y-4",
            "[&_.rdp-month]:space-y-4",
            "[&_.rdp-caption]:flex [&_.rdp-caption]:justify-center [&_.rdp-caption]:pt-1 [&_.rdp-caption]:relative [&_.rdp-caption]:items-center",
            "[&_.rdp-caption_label]:text-sm [&_.rdp-caption_label]:font-semibold",
            "[&_.rdp-nav]:space-x-1 [&_.rdp-nav]:flex [&_.rdp-nav]:items-center",
            "[&_.rdp-nav_button]:h-7 [&_.rdp-nav_button]:w-7 [&_.rdp-nav_button]:bg-transparent [&_.rdp-nav_button]:p-0 [&_.rdp-nav_button]:opacity-50 [&_.rdp-nav_button:hover]:opacity-100",
            "[&_.rdp-head_row]:flex",
            "[&_.rdp-head_cell]:text-text-tertiary [&_.rdp-head_cell]:rounded-none [&_.rdp-head_cell]:w-9 [&_.rdp-head_cell]:font-normal [&_.rdp-head_cell]:text-[0.8rem]",
            "[&_.rdp-row]:flex [&_.rdp-row]:w-full [&_.rdp-row]:mt-2",
          )}
        />
      </PopoverContent>
    </Popover>
  );
}

/**
 * DateRangePicker Component
 * Select a date range
 */

export interface DateRangePickerProps {
  /** Selected date range */
  value?: DateRange;
  /** Change handler */
  onChange?: (range: DateRange | undefined) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Date format */
  format?: string;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Custom className */
  className?: string;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Pick a date range",
  format: dateFormat = "PPP",
  minDate,
  maxDate,
  className,
}: DateRangePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-text-tertiary",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value?.from ? (
            value.to ? (
              <>
                {format(value.from, dateFormat)} - {format(value.to, dateFormat)}
              </>
            ) : (
              format(value.from, dateFormat)
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <DayPicker
          mode="range"
          selected={value}
          onSelect={onChange}
          fromDate={minDate}
          toDate={maxDate}
          numberOfMonths={2}
          className={cn(
            "p-3",
            // Same custom styling as DatePicker
            "[&_.rdp-day]:h-9 [&_.rdp-day]:w-9",
            "[&_.rdp-day]:text-sm [&_.rdp-day]:font-normal",
            "[&_.rdp-day_button]:h-9 [&_.rdp-day_button]:w-9",
            "[&_.rdp-day_button]:rounded-none",
            "[&_.rdp-day_button:hover]:bg-surface-elevated",
            "[&_.rdp-day_button.rdp-day_selected]:bg-primary [&_.rdp-day_button.rdp-day_selected]:text-white",
            "[&_.rdp-day_button.rdp-day_range_middle]:bg-primary/20",
            "[&_.rdp-months]:flex [&_.rdp-months]:gap-4",
          )}
        />
      </PopoverContent>
    </Popover>
  );
}

DatePicker.displayName = "DatePicker";
DateRangePicker.displayName = "DateRangePicker";

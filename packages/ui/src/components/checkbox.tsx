"use client";

import { Check } from "lucide-react";
import { forwardRef } from "react";
import { cn } from "../lib/cn";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, onChange, ...props }, ref) => {
    return (
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          className={cn(
            "peer h-4 w-4 shrink-0 appearance-none rounded-[var(--radius-sm)] border border-[hsl(var(--primary))] shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--primary))] disabled:cursor-not-allowed disabled:opacity-50 checked:bg-[hsl(var(--primary))] checked:text-white",
            className,
          )}
          ref={ref}
          onChange={(e) => {
            onChange?.(e);
            onCheckedChange?.(e.target.checked);
          }}
          {...props}
        />
        <Check className="pointer-events-none absolute left-0 top-0 h-4 w-4 text-white opacity-0 peer-checked:opacity-100" />
      </div>
    );
  },
);
Checkbox.displayName = "Checkbox";

export { Checkbox };

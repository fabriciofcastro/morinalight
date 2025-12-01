"use client";

import { forwardRef } from "react";
import { cn } from "../lib/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full px-3 py-2",
          "bg-[hsl(var(--surface))] border border-[hsl(var(--border))]",
          "rounded-[var(--radius-sm)]", // Sharp corners
          "text-[hsl(var(--text-1))] placeholder:text-[hsl(var(--text-3))]",
          "text-sm",
          "transition-all duration-200",
          "focus:outline-none focus:border-[hsl(var(--primary))]",
          "focus:shadow-[0_4px_12px_-4px_hsl(var(--primary)/0.2)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

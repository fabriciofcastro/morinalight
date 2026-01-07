"use client";

import { forwardRef } from "react";

import { cn } from "../lib/cn";
import { FormField } from "./form-field";
import { NativeSelect, type NativeSelectProps } from "./native-select";

export interface FormSelectProps extends NativeSelectProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, error, hint, required, className, id, children, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <FormField label={label} error={error} hint={hint} required={required} fieldId={selectId}>
        <NativeSelect
          ref={ref}
          id={selectId}
          className={cn(
            error &&
            "border-[hsl(var(--danger))] focus:border-[hsl(var(--danger))] focus:shadow-[0_0_0_2px_rgba(239,68,68,0.22)]",
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
          {...props}
        >
          {children}
        </NativeSelect>
        {error && (
          <p id={`${selectId}-error`} className="sr-only">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${selectId}-hint`} className="sr-only">
            {hint}
          </p>
        )}
      </FormField>
    );
  },
);

FormSelect.displayName = "FormSelect";

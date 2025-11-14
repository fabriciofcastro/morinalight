"use client";

import type { PropsWithChildren, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "../lib/cn";
import { Input, type InputProps } from "./input";
import { Label, type LabelProps } from "./label";
import { Textarea, type TextareaProps } from "./textarea";

export interface FormFieldProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  fieldId?: string;
  children: ReactNode;
}

export function FormField({ label, error, hint, required, className, fieldId, children }: FormFieldProps) {
  const id = fieldId || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <Label htmlFor={id} className={error && "text-[hsl(var(--danger))]"}>
          {label}
          {required && <span className="ml-1 text-[hsl(var(--danger))]">*</span>}
        </Label>
      )}
      {children}
      {error && (
        <p className="text-xs text-[hsl(var(--danger))] uppercase tracking-wider">{error}</p>
      )}
      {hint && !error && (
        <p className="text-xs text-[hsl(var(--text-3))] uppercase tracking-wider">{hint}</p>
      )}
    </div>
  );
}

export interface FormInputProps extends InputProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, hint, required, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    
    return (
      <FormField label={label} error={error} hint={hint} required={required} fieldId={inputId}>
        <Input
          ref={ref}
          id={inputId}
          className={cn(
            error && "border-[hsl(var(--danger))] focus:border-[hsl(var(--danger))] focus:shadow-[0_0_0_2px_rgba(239,68,68,0.22)]",
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {error && <p id={`${inputId}-error`} className="sr-only">{error}</p>}
        {hint && !error && <p id={`${inputId}-hint`} className="sr-only">{hint}</p>}
      </FormField>
    );
  },
);

FormInput.displayName = "FormInput";

export interface FormTextareaProps extends TextareaProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, hint, required, className, id, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    
    return (
      <FormField label={label} error={error} hint={hint} required={required} fieldId={textareaId}>
        <Textarea
          ref={ref}
          id={textareaId}
          className={cn(
            error && "border-[hsl(var(--danger))] focus:border-[hsl(var(--danger))] focus:shadow-[0_0_0_2px_rgba(239,68,68,0.22)]",
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
          {...props}
        />
        {error && <p id={`${textareaId}-error`} className="sr-only">{error}</p>}
        {hint && !error && <p id={`${textareaId}-hint`} className="sr-only">{hint}</p>}
      </FormField>
    );
  },
);

FormTextarea.displayName = "FormTextarea";


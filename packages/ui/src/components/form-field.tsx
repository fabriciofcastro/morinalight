"use client";

import type { ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "../lib/cn";
import { Input, type InputProps } from "./input";
import { Label } from "./label";
import { Textarea, type TextareaProps } from "./textarea";
import type { ValidationState } from "../theme/validation-tokens";

export interface FormFieldProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  fieldId?: string;
  validationState?: ValidationState;
  children: ReactNode;
}

export function FormField({
  label,
  error,
  hint,
  required,
  className,
  fieldId,
  validationState,
  children,
}: FormFieldProps) {
  const id = fieldId || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  // Determina o estado de validação baseado em error e validationState
  const finalValidationState: ValidationState =
    validationState || (error ? "invalid" : hint?.toLowerCase().includes("valid") ? "valid" : "default");

  // Cores de texto baseadas no estado
  const labelColorClass =
    finalValidationState === "invalid"
      ? "text-[hsl(0,82%,45%)]"
      : finalValidationState === "valid"
        ? "text-[hsl(158,72%,35%)]"
        : "";
  const hintColorClass =
    finalValidationState === "valid"
      ? "text-[hsl(158,72%,35%)]"
      : finalValidationState === "pending"
        ? "text-[hsl(45,100%,45%)]"
        : "text-[hsl(var(--text-3))]";

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <Label htmlFor={id} className={cn(labelColorClass)}>
          {label}
          {required && <span className="ml-1 text-[hsl(var(--danger))]">*</span>}
        </Label>
      )}
      {children}
      {error && (
        <p className="text-xs text-[hsl(0,82%,45%)] uppercase tracking-wider" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className={cn("text-xs uppercase tracking-wider", hintColorClass)}>{hint}</p>
      )}
    </div>
  );
}

export interface FormInputProps extends InputProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  validationState?: ValidationState;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, hint, required, validationState, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    // Determina o estado de validação
    const finalValidationState: ValidationState =
      validationState || (error ? "invalid" : hint?.toLowerCase().includes("valid") ? "valid" : "default");

    return (
      <FormField
        label={label}
        error={error}
        hint={hint}
        required={required}
        fieldId={inputId}
        validationState={finalValidationState}
      >
        <Input
          ref={ref}
          id={inputId}
          validationState={finalValidationState}
          className={className}
          aria-invalid={finalValidationState === "invalid" ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="sr-only">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="sr-only">
            {hint}
          </p>
        )}
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
  validationState?: ValidationState;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, hint, required, validationState, className, id, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    // Determina o estado de validação
    const finalValidationState: ValidationState =
      validationState || (error ? "invalid" : hint?.toLowerCase().includes("valid") ? "valid" : "default");

    return (
      <FormField
        label={label}
        error={error}
        hint={hint}
        required={required}
        fieldId={textareaId}
        validationState={finalValidationState}
      >
        <Textarea
          ref={ref}
          id={textareaId}
          validationState={finalValidationState}
          className={className}
          aria-invalid={finalValidationState === "invalid" ? true : undefined}
          aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
          {...props}
        />
        {error && (
          <p id={`${textareaId}-error`} className="sr-only">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${textareaId}-hint`} className="sr-only">
            {hint}
          </p>
        )}
      </FormField>
    );
  },
);

FormTextarea.displayName = "FormTextarea";

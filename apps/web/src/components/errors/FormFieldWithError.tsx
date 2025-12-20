/**
 * Campo de Formulário com Tratamento Elegante de Erros
 * 
 * Componente que combina campo de formulário com tooltip de erro elegante.
 */

"use client";

import React from "react";
import { FieldErrorTooltip } from "./ErrorTooltip";
import { Input } from "@morina/ui";
import { cn } from "@/lib/utils";

interface FormFieldWithErrorProps {
  label?: string;
  error?: string | unknown;
  fieldName?: string;
  children?: React.ReactNode;
  className?: string;
  required?: boolean;
}

/**
 * Campo de formulário com erro elegante
 */
export function FormFieldWithError({
  label,
  error,
  fieldName,
  children,
  className,
  required,
}: FormFieldWithErrorProps) {
  const hasError = !!error;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="block text-sm font-medium text-white/90">
          {label}
          {required && <span className="ml-1 text-red-400">*</span>}
        </label>
      )}
      <FieldErrorTooltip error={error} fieldName={fieldName}>
        <div
          className={cn(
            "relative",
            hasError && "ring-1 ring-red-500/50 rounded-md"
          )}
        >
          {children}
        </div>
      </FieldErrorTooltip>
      {error && typeof error === "string" && (
        <p className="text-xs text-red-400/80 mt-1">{error}</p>
      )}
    </div>
  );
}

/**
 * Input com tratamento de erro elegante
 */
interface InputWithErrorProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | unknown;
  fieldName?: string;
  required?: boolean;
}

export function InputWithError({
  label,
  error,
  fieldName,
  required,
  className,
  ...props
}: InputWithErrorProps) {
  const hasError = !!error;

  return (
    <FormFieldWithError
      label={label}
      error={error}
      fieldName={fieldName}
      required={required}
    >
      <Input
        {...props}
        className={cn(
          hasError && "border-red-500/50 focus:border-red-500 focus:ring-red-500/20",
          className
        )}
      />
    </FormFieldWithError>
  );
}

/**
 * Textarea com tratamento de erro elegante
 */
interface TextareaWithErrorProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string | unknown;
  fieldName?: string;
  required?: boolean;
}

export function TextareaWithError({
  label,
  error,
  fieldName,
  required,
  className,
  ...props
}: TextareaWithErrorProps) {
  const hasError = !!error;

  return (
    <FormFieldWithError
      label={label}
      error={error}
      fieldName={fieldName}
      required={required}
    >
      <textarea
        {...props}
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 disabled:cursor-not-allowed disabled:opacity-50",
          hasError && "border-red-500/50 focus:border-red-500 focus:ring-red-500/20",
          className
        )}
      />
    </FormFieldWithError>
  );
}



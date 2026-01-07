"use client";

import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import type { z } from "zod";
import { cn } from "../lib/cn";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Textarea } from "./textarea";

/**
 * Form Components - TanStack Form Integration
 *
 * Features:
 * - Type-safe forms with Zod validation
 * - Real-time validation
 * - Design System styling
 * - Async validation support
 * - Field-level errors
 */

export interface FormFieldProps<TFormData, TName extends keyof TFormData> {
  /** Form instance from useForm */
  form: any;
  /** Field name */
  name: TName;
  /** Field label */
  label?: string;
  /** Field placeholder */
  placeholder?: string;
  /** Field type */
  type?: "text" | "email" | "password" | "number" | "textarea";
  /** Custom className */
  className?: string;
  /** Validation schema (Zod) */
  validators?: {
    onChange?: z.ZodType<any>;
    onBlur?: z.ZodType<any>;
  };
}

export function FormField<TFormData, TName extends keyof TFormData>({
  form,
  name,
  label,
  placeholder,
  type = "text",
  className,
  validators,
}: FormFieldProps<TFormData, TName>) {
  return (
    <form.Field
      name={name as string}
      validators={validators}
      children={(field: any) => {
        const hasError = field.state.meta.errors.length > 0;
        const errorMessage = field.state.meta.errors[0];

        return (
          <div className={cn("space-y-2", className)}>
            {label && (
              <Label htmlFor={name as string} className="text-sm font-semibold">
                {label}
              </Label>
            )}

            {type === "textarea" ? (
              <Textarea
                id={name as string}
                name={name as string}
                value={field.state.value as string}
                onChange={(e) => field.handleChange(e.target.value as any)}
                onBlur={field.handleBlur}
                placeholder={placeholder}
                className={cn(hasError && "border-danger focus:border-danger")}
              />
            ) : (
              <Input
                id={name as string}
                type={type}
                name={name as string}
                value={field.state.value as string}
                onChange={(e) => field.handleChange(e.target.value as any)}
                onBlur={field.handleBlur}
                placeholder={placeholder}
                validationState={hasError ? "invalid" : "default"}
              />
            )}

            {hasError && (
              <p className="text-xs text-danger animate-in fade-in-0 slide-in-from-top-1">
                {errorMessage}
              </p>
            )}

            {field.state.meta.isValidating && <p className="text-xs text-info">Validating...</p>}
          </div>
        );
      }}
    />
  );
}

/**
 * FormBuilder Component
 * Simplified form creation with TanStack Form
 */

export interface FormBuilderProps<TFormData> {
  /** Default values */
  defaultValues: TFormData;
  /** Submit handler */
  onSubmit: (values: TFormData) => void | Promise<void>;
  /** Form children (render prop) */
  children: (form: any) => React.ReactNode;
  /** Custom className */
  className?: string;
  /** Validator adapter */
  validatorAdapter?: any;
}

export function FormBuilder<TFormData>({
  defaultValues,
  onSubmit,
  children,
  className,
  validatorAdapter = zodValidator(),
}: FormBuilderProps<TFormData>) {
  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }: { value: TFormData }) => {
      await onSubmit(value);
    },
    validatorAdapter,
  } as any);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className={cn("space-y-6", className)}
    >
      {children(form)}
    </form>
  );
}

/**
 * FormActions Component
 * Styled action buttons for forms
 */

export interface FormActionsProps {
  /** Show cancel button */
  showCancel?: boolean;
  /** Cancel button text */
  cancelText?: string;
  /** Submit button text */
  submitText?: string;
  /** Cancel handler */
  onCancel?: () => void;
  /** Is submitting */
  isSubmitting?: boolean;
  /** Custom className */
  className?: string;
}

export function FormActions({
  showCancel = true,
  cancelText = "Cancel",
  submitText = "Submit",
  onCancel,
  isSubmitting = false,
  className,
}: FormActionsProps) {
  return (
    <div className={cn("flex items-center justify-end gap-3", className)}>
      {showCancel && (
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          {cancelText}
        </Button>
      )}
      <Button type="submit" variant="default" isLoading={isSubmitting} disabled={isSubmitting}>
        {submitText}
      </Button>
    </div>
  );
}

/**
 * Example Usage:
 *
 * ```tsx
 * import { z } from 'zod';
 *
 * const schema = z.object({
 *   name: z.string().min(3),
 *   email: z.string().email(),
 *   message: z.string().min(10),
 * });
 *
 * type FormData = z.infer<typeof schema>;
 *
 * function MyForm() {
 *   return (
 *     <FormBuilder
 *       defaultValues={{ name: '', email: '', message: '' }}
 *       onSubmit={async (values) => {
 *         await saveData(values);
 *       }}
 *     >
 *       {(form) => (
 *         <>
 *           <FormField
 *             form={form}
 *             name="name"
 *             label="Name"
 *             validators={{
 *               onChange: z.string().min(3, 'Name must be at least 3 characters'),
 *             }}
 *           />
 *           <FormField
 *             form={form}
 *             name="email"
 *             label="Email"
 *             type="email"
 *             validators={{
 *               onChange: z.string().email('Invalid email'),
 *             }}
 *           />
 *           <FormField
 *             form={form}
 *             name="message"
 *             label="Message"
 *             type="textarea"
 *           />
 *           <FormActions
 *             isSubmitting={form.state.isSubmitting}
 *             onCancel={() => form.reset()}
 *           />
 *         </>
 *       )}
 *     </FormBuilder>
 *   );
 * }
 * ```
 */

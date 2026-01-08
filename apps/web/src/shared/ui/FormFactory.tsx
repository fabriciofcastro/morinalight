import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { FieldValues, useForm, UseFormProps, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { FormFieldV2 } from './base/FormFieldV2';
import { Button } from './base/button';

interface FormFactoryProps<T extends FieldValues> {
  schema: z.ZodType<T, any, any>;
  defaultValues?: UseFormProps<T>['defaultValues'];
  onSubmit: (data: T, form: UseFormReturn<T>) => void | Promise<void>;
  children: (form: UseFormReturn<T>) => React.ReactNode;
  submitLabel?: string;
  isPending?: boolean;
}

export function FormFactory<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  children,
  submitLabel = 'Salvar',
  isPending = false,
}: FormFactoryProps<T>) {
  // Use a generic resolver casting to bypass complex Zod vs React Hook Form version mismatches
  const form = useForm<T>({
    resolver: zodResolver(schema) as any,
    defaultValues,
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data as T, form);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {children(form)}
      </div>
      
      <div className="flex justify-end pt-4">
        <Button 
          type="submit" 
          disabled={isPending || form.formState.isSubmitting}
          className="min-w-32"
        >
          {isPending || form.formState.isSubmitting ? 'Processando...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}

// Helper components for the factory
FormFactory.Field = FormFieldV2;

import { useState, useCallback } from "react";
import { ZodSchema, z } from "zod";
import { notificationCenter } from "@/components/notifications/notification-center";

type UseSmartFormProps<T> = {
    schema: ZodSchema<T>;
    defaultValues: T;
    onSubmit: (data: T) => Promise<void>;
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
    successMessage?: string;
};

export function useSmartForm<T>({
    schema,
    defaultValues,
    onSubmit,
    onSuccess,
    onError,
    successMessage = "Operação realizada com sucesso!",
}: UseSmartFormProps<T>) {
    const [formData, setFormData] = useState<T>(defaultValues);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const reset = useCallback(() => {
        setFormData(defaultValues);
        setErrors({});
    }, [defaultValues]);

    const setValue = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
        // Clear error for field on change
        setErrors((prev) => {
            if (!prev[key]) return prev;
            const newErrors = { ...prev };
            delete newErrors[key];
            return newErrors;
        });
    }, []);

    const validate = useCallback(() => {
        try {
            schema.parse(formData);
            setErrors({});
            return true;
        } catch (e) {
            if (e instanceof z.ZodError) {
                const fieldErrors: Partial<Record<keyof T, string>> = {};
                e.errors.forEach((err) => {
                    if (err.path[0]) {
                        fieldErrors[err.path[0] as keyof T] = err.message;
                    }
                });
                setErrors(fieldErrors);
            }
            return false;
        }
    }, [formData, schema]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!validate()) {
            notificationCenter.add({
                type: "error",
                title: "Erro de Validação",
                message: "Por favor, verifique os campos destacados.",
            });
            return;
        }

        setSubmitting(true);
        try {
            await onSubmit(formData);
            notificationCenter.add({
                type: "success",
                title: "Sucesso",
                message: successMessage,
            });
            onSuccess?.();
        } catch (err) {
            console.error(err);
            notificationCenter.add({
                type: "error",
                title: "Erro",
                message: err instanceof Error ? err.message : "Ocorreu um erro ao salvar.",
            });
            onError?.(err);
        } finally {
            setSubmitting(false);
        }
    };

    return {
        formData,
        errors,
        loading,
        submitting,
        setValue,
        handleSubmit,
        setFormData,
        reset,
    };
}

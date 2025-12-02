"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseFormWithAutosaveOptions {
  onSave: (data: Record<string, unknown>) => Promise<void>;
  debounceMs?: number;
  onAutoSaveStart?: () => void;
  onAutoSaveComplete?: () => void;
  onAutoSaveError?: (error: Error) => void;
}

interface UseFormWithAutosaveReturn {
  data: Record<string, unknown>;
  setFieldValue: (field: string, value: unknown) => void;
  setData: (data: Record<string, unknown>) => void;
  isAutoSaving: boolean;
  hasUnsavedChanges: boolean;
  lastSavedAt: Date | null;
  error: Error | null;
  manualSave: () => Promise<void>;
}

export function useFormWithAutosave(
  initialData: Record<string, unknown>,
  options: UseFormWithAutosaveOptions,
): UseFormWithAutosaveReturn {
  const {
    onSave,
    debounceMs = 1500,
    onAutoSaveStart,
    onAutoSaveComplete,
    onAutoSaveError,
  } = options;

  const [data, setData] = useState(initialData);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Atualizar campo individual
  const setFieldValue = useCallback((field: string, value: unknown) => {
    setData((prev) => {
      const newData = { ...prev, [field]: value };
      return newData;
    });
    setHasUnsavedChanges(true);
    setError(null);
  }, []);

  // Atualizar dados completos
  const updateData = useCallback((newData: Record<string, unknown>) => {
    setData(newData);
    setHasUnsavedChanges(true);
    setError(null);
  }, []);

  // Salvar manualmente
  const manualSave = useCallback(async () => {
    setIsAutoSaving(true);
    onAutoSaveStart?.();

    try {
      await onSave(data);
      setHasUnsavedChanges(false);
      setLastSavedAt(new Date());
      setError(null);
      onAutoSaveComplete?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Erro desconhecido ao salvar");
      setError(error);
      onAutoSaveError?.(error);
    } finally {
      setIsAutoSaving(false);
    }
  }, [data, onSave, onAutoSaveStart, onAutoSaveComplete, onAutoSaveError]);

  // Auto-save com debounce
  useEffect(() => {
    // Limpar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (hasUnsavedChanges && !isAutoSaving) {
      // Configurar novo timeout
      timeoutRef.current = setTimeout(() => {
        manualSave();
      }, debounceMs);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [hasUnsavedChanges, isAutoSaving, debounceMs, manualSave]);

  return {
    data,
    setFieldValue,
    setData: updateData,
    isAutoSaving,
    hasUnsavedChanges,
    lastSavedAt,
    error,
    manualSave,
  };
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type AutoSaveStatus = "idle" | "saving" | "saved" | "error";

export interface UseAutoSaveOptions {
  /** Função de salvamento */
  onSave: () => Promise<void>;
  /** Intervalo em milissegundos para auto-save (padrão: 30000 = 30s) */
  intervalMs?: number;
  /** Debounce em milissegundos antes de considerar mudanças (padrão: 1000 = 1s) */
  debounceMs?: number;
  /** Se deve habilitar auto-save (padrão: true) */
  enabled?: boolean;
  /** Callback quando auto-save inicia */
  onAutoSaveStart?: () => void;
  /** Callback quando auto-save completa */
  onAutoSaveComplete?: () => void;
  /** Callback quando auto-save falha */
  onAutoSaveError?: (error: Error) => void;
  /** Se deve salvar apenas quando o formulário está válido */
  requireValid?: boolean;
  /** Função para verificar se o formulário está válido */
  isValid?: () => boolean;
}

export interface UseAutoSaveReturn {
  /** Status atual do auto-save */
  status: AutoSaveStatus;
  /** Se há alterações não salvas */
  hasUnsavedChanges: boolean;
  /** Data/hora do último salvamento */
  lastSavedAt: Date | null;
  /** Erro do último salvamento (se houver) */
  error: Error | null;
  /** Marcar que há alterações não salvas */
  markDirty: () => void;
  /** Marcar que não há alterações (após salvar manualmente) */
  markClean: () => void;
  /** Salvar manualmente */
  manualSave: () => Promise<void>;
  /** Resetar estado */
  reset: () => void;
}

/**
 * Hook padronizado para Auto-Save
 * 
 * Gerencia o auto-save automático com intervalo configurável,
 * indicadores visuais e tratamento de erros.
 * 
 * @example
 * ```tsx
 * const {
 *   status,
 *   hasUnsavedChanges,
 *   markDirty,
 *   markClean,
 *   manualSave
 * } = useAutoSave({
 *   onSave: async () => {
 *     await saveFormData(formData);
 *   },
 *   intervalMs: 30000, // 30 segundos
 *   requireValid: true,
 *   isValid: () => formIsValid,
 * });
 * 
 * // Marcar como alterado quando o usuário edita
 * <input onChange={(e) => {
 *   setFormData({ ...formData, name: e.target.value });
 *   markDirty();
 * }} />
 * ```
 */
export function useAutoSave(options: UseAutoSaveOptions): UseAutoSaveReturn {
  const {
    onSave,
    intervalMs = 30000, // 30 segundos padrão
    debounceMs = 1000, // 1 segundo de debounce
    enabled = true,
    onAutoSaveStart,
    onAutoSaveComplete,
    onAutoSaveError,
    requireValid = false,
    isValid,
  } = options;

  const [status, setStatus] = useState<AutoSaveStatus>("idle");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  // Marcar como alterado
  const markDirty = useCallback(() => {
    // Debounce para evitar múltiplas marcações
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setHasUnsavedChanges(true);
      setError(null);
    }, debounceMs);
  }, [debounceMs]);

  // Marcar como limpo (sem alterações)
  const markClean = useCallback(() => {
    setHasUnsavedChanges(false);
    setError(null);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  // Salvar manualmente
  const manualSave = useCallback(async () => {
    if (isSavingRef.current) return;

    // Verificar se está válido (se necessário)
    if (requireValid && isValid && !isValid()) {
      return;
    }

    isSavingRef.current = true;
    setStatus("saving");
    onAutoSaveStart?.();

    try {
      await onSave();
      setStatus("saved");
      setLastSavedAt(new Date());
      setHasUnsavedChanges(false);
      setError(null);
      onAutoSaveComplete?.();

      // Resetar status após 2 segundos
      setTimeout(() => {
        setStatus("idle");
      }, 2000);
    } catch (err) {
      const saveError = err instanceof Error ? err : new Error("Erro desconhecido ao salvar");
      setError(saveError);
      setStatus("error");
      onAutoSaveError?.(saveError);

      // Resetar status de erro após 5 segundos
      setTimeout(() => {
        setStatus("idle");
      }, 5000);
    } finally {
      isSavingRef.current = false;
    }
  }, [onSave, requireValid, isValid, onAutoSaveStart, onAutoSaveComplete, onAutoSaveError]);

  // Auto-save com intervalo
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Verificar se deve salvar
    const shouldSave = hasUnsavedChanges && !isSavingRef.current;
    const canSave = !requireValid || !isValid || isValid();

    if (shouldSave && canSave) {
      // Limpar intervalo anterior
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Configurar novo intervalo
      intervalRef.current = setInterval(() => {
        if (hasUnsavedChanges && !isSavingRef.current) {
          void manualSave();
        }
      }, intervalMs);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, hasUnsavedChanges, requireValid, isValid, intervalMs, manualSave]);

  // Resetar estado
  const reset = useCallback(() => {
    setStatus("idle");
    setHasUnsavedChanges(false);
    setLastSavedAt(null);
    setError(null);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    isSavingRef.current = false;
  }, []);

  return {
    status,
    hasUnsavedChanges,
    lastSavedAt,
    error,
    markDirty,
    markClean,
    manualSave,
    reset,
  };
}



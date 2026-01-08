"use client";

import { useState, useCallback, useEffect } from "react";

export interface DraftVersion<T> {
  id: string;
  data: T;
  savedAt: Date;
  label?: string;
}

interface UseDraftHistoryOptions<T> {
  storageKey: string;
  maxVersions?: number;
  autoSaveInterval?: number;
  onVersionChange?: (version: DraftVersion<T>) => void;
}

export function useDraftHistory<T extends Record<string, unknown>>(
  initialData: T,
  options: UseDraftHistoryOptions<T>
) {
  const {
    storageKey,
    maxVersions = 10,
    autoSaveInterval = 30000, // 30 segundos
    onVersionChange,
  } = options;

  const [currentData, setCurrentData] = useState<T>(initialData);
  const [versions, setVersions] = useState<DraftVersion<T>[]>([]);
  const [currentVersionId, setCurrentVersionId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Carregar versões do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`${storageKey}-history`);
      if (stored) {
        const parsed = JSON.parse(stored);
        const loadedVersions: DraftVersion<T>[] = parsed.map((v: any) => ({
          ...v,
          savedAt: new Date(v.savedAt),
        }));
        setVersions(loadedVersions);
      }
    } catch (error) {
      console.error("Erro ao carregar histórico de rascunhos:", error);
    }
  }, [storageKey]);

  // Salvar versão
  const saveVersion = useCallback(
    (data: T, label?: string) => {
      setIsSaving(true);
      try {
        const newVersion: DraftVersion<T> = {
          id: `v-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          data: { ...data },
          savedAt: new Date(),
          label,
        };

        const updatedVersions = [newVersion, ...versions]
          .slice(0, maxVersions)
          .sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime());

        setVersions(updatedVersions);
        setCurrentVersionId(newVersion.id);
        setCurrentData(data);

        localStorage.setItem(
          `${storageKey}-history`,
          JSON.stringify(updatedVersions)
        );

        onVersionChange?.(newVersion);
      } catch (error) {
        console.error("Erro ao salvar versão:", error);
      } finally {
        setIsSaving(false);
      }
    },
    [storageKey, versions, maxVersions, onVersionChange]
  );

  // Restaurar versão
  const restoreVersion = useCallback(
    (versionId: string) => {
      const version = versions.find((v) => v.id === versionId);
      if (version) {
        setCurrentData(version.data);
        setCurrentVersionId(versionId);
        onVersionChange?.(version);
        return version.data;
      }
      return null;
    },
    [versions, onVersionChange]
  );

  // Deletar versão
  const deleteVersion = useCallback(
    (versionId: string) => {
      const updatedVersions = versions.filter((v) => v.id !== versionId);
      setVersions(updatedVersions);
      localStorage.setItem(
        `${storageKey}-history`,
        JSON.stringify(updatedVersions)
      );

      if (currentVersionId === versionId) {
        setCurrentVersionId(null);
      }
    },
    [storageKey, versions, currentVersionId]
  );

  // Limpar histórico
  const clearHistory = useCallback(() => {
    setVersions([]);
    setCurrentVersionId(null);
    localStorage.removeItem(`${storageKey}-history`);
  }, [storageKey]);

  // Auto-save
  useEffect(() => {
    if (autoSaveInterval <= 0) return;

    const hasData = Object.values(currentData).some(
      (value) => value !== "" && value !== null && value !== undefined
    );
    if (!hasData) return;

    const interval = setInterval(() => {
      saveVersion(currentData);
    }, autoSaveInterval);

    return () => clearInterval(interval);
  }, [currentData, autoSaveInterval, saveVersion]);

  return {
    currentData,
    setCurrentData,
    versions,
    currentVersionId,
    isSaving,
    saveVersion,
    restoreVersion,
    deleteVersion,
    clearHistory,
  };
}











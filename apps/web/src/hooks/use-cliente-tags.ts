"use client";

import { useState, useEffect, useCallback } from "react";
import type { Tag } from "@/components/clientes/tags-input";
import { notificationCenter } from "@/components/notifications/notification-center";

export function useClienteTags() {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTags = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/clientes/tags");
      if (response.ok) {
        const data = await response.json();
        setAvailableTags(data.tags || []);
      }
    } catch (error) {
      console.error("Erro ao carregar tags:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTag = useCallback(async (name: string, color?: string): Promise<Tag> => {
    const response = await fetch("/api/clientes/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color }),
    });

    if (!response.ok) {
      const error = await response.json();
      // Se a tag já existe, retornar ela
      if (response.status === 409 && error.tag) {
        return error.tag;
      }
      throw new Error(error.message || "Erro ao criar tag");
    }

    const newTag = await response.json();
    setAvailableTags((prev) => [...prev, newTag]);
    return newTag;
  }, []);

  const updateClienteTags = useCallback(async (clienteId: string, tagIds: string[]) => {
    const response = await fetch(`/api/clientes/${clienteId}/tags`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tagIds }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erro ao atualizar tags");
    }

    return await response.json();
  }, []);

  const loadClienteTags = useCallback(async (clienteId: string): Promise<Tag[]> => {
    try {
      const response = await fetch(`/api/clientes/${clienteId}/tags`);
      if (response.ok) {
        const data = await response.json();
        return data.tags || [];
      }
      return [];
    } catch (error) {
      console.error("Erro ao carregar tags do cliente:", error);
      return [];
    }
  }, []);

  useEffect(() => {
    void loadTags();
  }, [loadTags]);

  return {
    availableTags,
    loading,
    createTag,
    updateClienteTags,
    loadClienteTags,
    refreshTags: loadTags,
  };
}



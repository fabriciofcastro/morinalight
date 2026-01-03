"use client";

import { useState, useCallback } from "react";
import { getAuthHeadersWithTenant } from "@/lib/api/base";
import type { User } from "./use-users";

export interface CreateUserRequest {
  email: string;
  password: string;
  displayName: string;
  status?: "active" | "inactive" | "pending";
  departmentId?: string;
  sectorId?: string;
  positionId?: string;
  cpf?: string;
  phone?: string;
  birthDate?: string;
  admissionDate?: string;
  observations?: string;
  avatarUrl?: string;
}

export interface UpdateUserRequest {
  displayName?: string;
  status?: "active" | "inactive" | "suspended" | "pending";
  departmentId?: string;
  sectorId?: string;
  positionId?: string;
  cpf?: string;
  phone?: string;
  birthDate?: string;
  admissionDate?: string;
  observations?: string;
  avatarUrl?: string;
}

export function useUser(userId?: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseUserResponse = useCallback((data: unknown): User => {
    const payload = data as any;
    return (payload?.user ?? payload) as User;
  }, []);

  const fetchUser = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      const response = await fetch(`/api/users/${id}`, {
        headers,
        cache: "no-store",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Erro ao carregar usuário" }));
        throw new Error(errorData.message || "Não foi possível carregar o usuário.");
      }

      const data = await response.json();
      setUser(parseUserResponse(data));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro inesperado ao carregar usuário.";
      setError(errorMessage);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (data: CreateUserRequest): Promise<User> => {
    setLoading(true);
    setError(null);

    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      const response = await fetch("/api/users", {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Erro ao criar usuário" }));
        throw new Error(errorData.message || "Não foi possível criar o usuário.");
      }

      const data = await response.json();
      const newUser = parseUserResponse(data);
      setUser(newUser);
      return newUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro inesperado ao criar usuário.";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (id: string, data: UpdateUserRequest): Promise<User> => {
    setLoading(true);
    setError(null);

    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      const response = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Erro ao atualizar usuário" }));
        throw new Error(errorData.message || "Não foi possível atualizar o usuário.");
      }

      const data = await response.json();
      const updatedUser = parseUserResponse(data);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro inesperado ao atualizar usuário.";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteUser = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Erro ao deletar usuário" }));
        throw new Error(errorData.message || "Não foi possível deletar o usuário.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro inesperado ao deletar usuário.";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch if userId is provided
  const fetchUserIfNeeded = useCallback(() => {
    if (userId && !user && !loading) {
      fetchUser(userId);
    }
  }, [userId, user, loading, fetchUser]);

  return {
    user,
    loading,
    error,
    fetchUser,
    createUser,
    updateUser,
    deleteUser,
    fetchUserIfNeeded,
  };
}







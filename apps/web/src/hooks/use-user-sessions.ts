"use client";

import { useState, useCallback } from "react";
import { getAuthHeadersWithTenant } from "@/lib/api/base";

export interface UserSession {
  sessionId: string;
  device?: string;
  browser?: string;
  os?: string;
  ipAddress?: string;
  location?: string;
  createdAt: string;
  lastActivityAt: string;
  isCurrent: boolean;
}

export function useUserSessions(userId: string) {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      const response = await fetch(`/api/users/${userId}/sessions`, {
        headers,
        cache: "no-store",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Erro ao carregar sessões" }));
        throw new Error(errorData.message || "Não foi possível carregar as sessões.");
      }

      const data = (await response.json()) as { sessions: UserSession[] };
      setSessions(data.sessions ?? []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro inesperado ao carregar sessões.";
      setError(errorMessage);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const revokeSession = useCallback(async (sessionId: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      const response = await fetch(`/api/users/${userId}/sessions/${sessionId}`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Erro ao revogar sessão" }));
        throw new Error(errorData.message || "Não foi possível revogar a sessão.");
      }

      // Refresh sessions after revocation
      await fetchSessions();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro inesperado ao revogar sessão.";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, fetchSessions]);

  const revokeAllSessions = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      const response = await fetch(`/api/users/${userId}/sessions`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Erro ao revogar todas as sessões" }));
        throw new Error(errorData.message || "Não foi possível revogar todas as sessões.");
      }

      // Refresh sessions after revocation
      await fetchSessions();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro inesperado ao revogar todas as sessões.";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, fetchSessions]);

  return {
    sessions,
    loading,
    error,
    fetchSessions,
    revokeSession,
    revokeAllSessions,
    refetch: fetchSessions,
  };
}








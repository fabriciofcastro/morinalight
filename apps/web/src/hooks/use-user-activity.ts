"use client";

import { useState, useCallback } from "react";
import { getAuthHeadersWithTenant } from "@/lib/api/base";

export interface UserActivity {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export interface ListUserActivityParams {
  action?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface ListUserActivityResponse {
  itens: UserActivity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useUserActivity(userId: string, params: ListUserActivityParams = {}) {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      const searchParams = new URLSearchParams();
      if (params.action) searchParams.set("action", params.action);
      if (params.dateFrom) searchParams.set("dateFrom", params.dateFrom);
      if (params.dateTo) searchParams.set("dateTo", params.dateTo);
      if (params.page) searchParams.set("page", params.page.toString());
      if (params.limit) searchParams.set("limit", params.limit.toString());

      const response = await fetch(`/api/users/${userId}/activity?${searchParams.toString()}`, {
        headers,
        cache: "no-store",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Erro ao carregar atividades" }));
        throw new Error(errorData.message || "Não foi possível carregar as atividades.");
      }

      const data = (await response.json()) as ListUserActivityResponse;
      setActivities(data.itens ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro inesperado ao carregar atividades.";
      setError(errorMessage);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [userId, params.action, params.dateFrom, params.dateTo, params.page, params.limit]);

  return {
    activities,
    loading,
    error,
    total,
    totalPages,
    fetchActivities,
    refetch: fetchActivities,
  };
}








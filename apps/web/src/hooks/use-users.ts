"use client";

import { useState, useCallback, useEffect } from "react";
import { getAuthHeadersWithTenant } from "@/lib/api/base";

export interface User {
  userId: string;
  email: string;
  displayName: string;
  status: "active" | "inactive" | "suspended" | "pending";
  createdAt: string;
  lastLogin?: string;
  cpf?: string;
  phone?: string;
  birthDate?: string;
  admissionDate?: string;
  observations?: string;
  departmentId?: string;
  departmentName?: string;
  sectorId?: string;
  sectorName?: string;
  positionId?: string;
  positionName?: string;
  avatarUrl?: string;
  has2FA?: boolean;
}

export interface ListUsersParams {
  busca?: string;
  status?: "active" | "inactive" | "suspended" | "pending" | "all";
  departmentId?: string;
  sectorId?: string;
  positionId?: string;
  admissionDateFrom?: string;
  admissionDateTo?: string;
  lastAccessFrom?: string;
  lastAccessTo?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface ListUsersResponse {
  itens: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useUsers(params: ListUsersParams = {}) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      const searchParams = new URLSearchParams();
      if (params.busca) searchParams.set("busca", params.busca);
      if (params.status && params.status !== "all") searchParams.set("status", params.status);
      if (params.departmentId) searchParams.set("departmentId", params.departmentId);
      if (params.sectorId) searchParams.set("sectorId", params.sectorId);
      if (params.positionId) searchParams.set("positionId", params.positionId);
      if (params.admissionDateFrom) searchParams.set("admissionDateFrom", params.admissionDateFrom);
      if (params.admissionDateTo) searchParams.set("admissionDateTo", params.admissionDateTo);
      if (params.lastAccessFrom) searchParams.set("lastAccessFrom", params.lastAccessFrom);
      if (params.lastAccessTo) searchParams.set("lastAccessTo", params.lastAccessTo);
      if (params.sortBy) searchParams.set("sortBy", params.sortBy);
      if (params.sortDir) searchParams.set("sortDir", params.sortDir);
      if (params.page) searchParams.set("page", params.page.toString());
      if (params.limit) searchParams.set("limit", params.limit.toString());

      const response = await fetch(`/api/users?${searchParams.toString()}`, {
        headers,
        cache: "no-store",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Erro ao carregar usuários" }));
        throw new Error(errorData.message || "Não foi possível carregar a lista de usuários.");
      }

      const data = (await response.json()) as ListUsersResponse;
      setUsers(data.itens ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro inesperado ao carregar usuários.";
      setError(errorMessage);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [
    params.busca,
    params.status,
    params.departmentId,
    params.sectorId,
    params.positionId,
    params.admissionDateFrom,
    params.admissionDateTo,
    params.lastAccessFrom,
    params.lastAccessTo,
    params.sortBy,
    params.sortDir,
    params.page,
    params.limit,
  ]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const refetch = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    total,
    totalPages,
    refetch,
  };
}







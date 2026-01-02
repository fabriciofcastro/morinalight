/**
 * Users Query Hooks Tests
 * 
 * Testes para hooks de usuários
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from "@/hooks/queries/use-users";
import { apiClient } from "@/lib/api/base";
import { mockUser } from "../utils";

// Mock do apiClient
vi.mock("@/lib/api/base", () => ({
    apiClient: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}));

describe("useUsers", () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        });
        vi.clearAllMocks();
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client= { queryClient } > { children } </QueryClientProvider>
  );

it("should fetch users successfully", async () => {
    const mockUsers = [mockUser];
    vi.mocked(apiClient.get).mockResolvedValue(mockUsers);

    const { result } = renderHook(() => useUsers(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockUsers);
    expect(apiClient.get).toHaveBeenCalledWith("/users", { params: undefined });
});

it("should handle fetch error", async () => {
    const error = new Error("Network error");
    vi.mocked(apiClient.get).mockRejectedValue(error);

    const { result } = renderHook(() => useUsers(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeTruthy();
});

it("should fetch users with params", async () => {
    const mockUsers = [mockUser];
    const params = { search: "john", page: 1 };
    vi.mocked(apiClient.get).mockResolvedValue(mockUsers);

    const { result } = renderHook(() => useUsers(params), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.get).toHaveBeenCalledWith("/users", { params });
});
});

describe("useCreateUser", () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        });
        vi.clearAllMocks();
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client= { queryClient } > { children } </QueryClientProvider>
  );

it("should create user successfully", async () => {
    const newUser = { name: "Jane Doe", email: "jane@example.com", role: "user" };
    vi.mocked(apiClient.post).mockResolvedValue({ ...mockUser, ...newUser });

    const { result } = renderHook(() => useCreateUser(), { wrapper });

    await result.current.mutateAsync(newUser);

    expect(apiClient.post).toHaveBeenCalledWith("/users", newUser, undefined);
});

it("should handle create error", async () => {
    const error = new Error("Validation error");
    vi.mocked(apiClient.post).mockRejectedValue(error);

    const { result } = renderHook(() => useCreateUser(), { wrapper });

    await expect(result.current.mutateAsync({ name: "Test" })).rejects.toThrow("Validation error");
});
});

describe("useUpdateUser", () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        });
        vi.clearAllMocks();
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client= { queryClient } > { children } </QueryClientProvider>
  );

it("should update user successfully", async () => {
    const updatedData = { name: "Updated Name" };
    vi.mocked(apiClient.put).mockResolvedValue({ ...mockUser, ...updatedData });

    const { result } = renderHook(() => useUpdateUser(), { wrapper });

    await result.current.mutateAsync({ id: mockUser.id, data: updatedData });

    expect(apiClient.put).toHaveBeenCalledWith(`/users/${mockUser.id}`, updatedData, undefined);
});
});

describe("useDeleteUser", () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        });
        vi.clearAllMocks();
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client= { queryClient } > { children } </QueryClientProvider>
  );

it("should delete user successfully", async () => {
    vi.mocked(apiClient.delete).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteUser(), { wrapper });

    await result.current.mutateAsync(mockUser.id);

    expect(apiClient.delete).toHaveBeenCalledWith(`/users/${mockUser.id}`, undefined);
});
});

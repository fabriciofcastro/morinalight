/**
 * Products Query Hooks
 * 
 * Hooks do TanStack Query para gerenciar estado de produtos
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { createTypedApiClient, type QueryParams } from "@/lib/api/factory";
import { queryKeys, queryConfigs } from "@/lib/query/client";

/**
 * Tipo de produto
 */
export interface Product {
    id: string;
    name: string;
    description?: string;
    sku?: string;
    price?: number;
    category?: string;
    status: "active" | "inactive" | "draft";
    createdAt: string;
    updatedAt: string;
}

/**
 * API client para produtos
 */
const productsApi = createTypedApiClient<Product>("/products");

/**
 * Hook para listar produtos
 */
export function useProducts(params?: QueryParams) {
    return useQuery({
        queryKey: queryKeys.products.list(params || {}),
        queryFn: () => productsApi.list(params),
        ...queryConfigs.paginated,
    });
}

/**
 * Hook para listar produtos com infinite scroll
 */
export function useInfiniteProducts(params?: QueryParams) {
    return useInfiniteQuery({
        queryKey: [...queryKeys.products.lists(), "infinite", params],
        queryFn: ({ pageParam = 1 }) =>
            productsApi.list({ ...params, page: pageParam }),
        ...queryConfigs.infinite,
        initialPageParam: 1,
    });
}

/**
 * Hook para obter um produto específico
 */
export function useProduct(id: string, enabled = true) {
    return useQuery({
        queryKey: queryKeys.products.detail(id),
        queryFn: () => productsApi.get(id),
        enabled: enabled && !!id,
    });
}

/**
 * Hook para criar produto
 */
export function useCreateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<Product>) => productsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
        },
    });
}

/**
 * Hook para atualizar produto
 */
export function useUpdateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
            productsApi.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
        },
    });
}

/**
 * Hook para deletar produto
 */
export function useDeleteProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => productsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
        },
    });
}

/**
 * Hook para deletar múltiplos produtos
 */
export function useDeleteManyProducts() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (ids: string[]) => productsApi.deleteMany(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
        },
    });
}

/**
 * Hook para buscar produtos (debounced)
 */
export function useSearchProducts(search: string, debounceMs = 300) {
    const [debouncedSearch, setDebouncedSearch] = React.useState(search);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [search, debounceMs]);

    return useProducts({ search: debouncedSearch });
}

import React from "react";

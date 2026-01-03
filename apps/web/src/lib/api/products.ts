/**
 * Products API - Migrated to Factory Pattern
 */

import { createTypedApiClient } from "./factory";
import { apiClient } from "./base";

export interface Product {
    id: string;
    orgId: string;
    sku: string;
    name: string;
    description?: string;
    categoryId: string;
    brand?: string;
    unit: string;
    status: "ACTIVE" | "INACTIVE" | "ARCHIVED";

    // Pricing
    costPrice: number;
    sellingPrice: number;
    margin?: number;

    // Inventory
    minStock: number;
    maxStock: number;
    currentStock: number;

    // Media
    imageUrl?: string;

    createdAt: string;
    updatedAt: string;

    // Relations
    category?: {
        id: string;
        name: string;
    };
}

export interface CreateProductInput {
    sku: string;
    name: string;
    description?: string;
    categoryId: string;
    brand?: string;
    unit: string;
    status?: "ACTIVE" | "INACTIVE" | "ARCHIVED";
    costPrice: number;
    sellingPrice: number;
    minStock?: number;
    maxStock?: number;
    imageUrl?: string;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
    id: string;
}

export interface ListProductsQuery {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
    onlyLowStock?: boolean;
}

// Usar factory pattern
const baseProductsApi = createTypedApiClient<Product>("/products");

// Estender com métodos customizados
export const productsApi = {
    ...baseProductsApi,

    // Override list para suportar query params customizados
    list: async (params?: ListProductsQuery) => {
        return baseProductsApi.list(params);
    },

    // Métodos customizados
    updateStock: async (
        id: string,
        quantity: number,
        type: "IN" | "OUT",
        reason?: string,
    ): Promise<Product> => {
        return apiClient.post<Product>(`/products/${id}/stock`, {
            quantity,
            type,
            reason,
        });
    },

    getLowStock: async (params?: { limit?: number }): Promise<Product[]> => {
        return apiClient.get<Product[]>("/products/low-stock", { params });
    },

    bulkUpdatePrices: async (
        updates: Array<{ id: string; costPrice?: number; sellingPrice?: number }>,
    ): Promise<void> => {
        return apiClient.post<void>("/products/bulk-update-prices", { updates });
    },

    bulkUpdateStatus: async (
        productIds: string[],
        status: "ACTIVE" | "INACTIVE" | "ARCHIVED",
    ): Promise<void> => {
        return apiClient.post<void>("/products/bulk-update-status", {
            productIds,
            status,
        });
    },

    exportToExcel: async (params?: ListProductsQuery): Promise<Blob> => {
        return apiClient.get<Blob>("/products/export", {
            params,
            responseType: "blob",
        });
    },

    importFromExcel: async (file: File): Promise<{ success: number; errors: string[] }> => {
        const formData = new FormData();
        formData.append("file", file);

        return apiClient.post<{ success: number; errors: string[] }>(
            "/products/import",
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
            },
        );
    },
};

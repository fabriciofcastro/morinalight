import { apiClient } from './base';

export interface Product {
    id: string;
    orgId: string;
    sku: string;
    name: string;
    description?: string;
    categoryId: string;
    brand?: string;
    unit: string;
    status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

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
    status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
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

export interface ListProductsResponse {
    items: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const productsApi = {
    list: async (orgId: string, query?: ListProductsQuery): Promise<ListProductsResponse> => {
        const params = new URLSearchParams();
        if (query?.page) params.append('page', query.page.toString());
        if (query?.limit) params.append('limit', query.limit.toString());
        if (query?.search) params.append('search', query.search);
        if (query?.categoryId) params.append('categoryId', query.categoryId);
        if (query?.status) params.append('status', query.status);
        if (query?.minPrice) params.append('minPrice', query.minPrice.toString());
        if (query?.maxPrice) params.append('maxPrice', query.maxPrice.toString());
        if (query?.onlyLowStock) params.append('onlyLowStock', 'true');

        return apiClient.get<ListProductsResponse>(`/products?${params.toString()}`, {
            headers: { 'x-org-id': orgId }
        });
    },

    getById: async (orgId: string, id: string): Promise<Product> => {
        return apiClient.get<Product>(`/products/${id}`, {
            headers: { 'x-org-id': orgId }
        });
    },

    create: async (orgId: string, data: CreateProductInput): Promise<Product> => {
        return apiClient.post<Product>('/products', data, {
            headers: { 'x-org-id': orgId }
        });
    },

    update: async (orgId: string, id: string, data: UpdateProductInput): Promise<Product> => {
        return apiClient.put<Product>(`/products/${id}`, data, {
            headers: { 'x-org-id': orgId }
        });
    },

    delete: async (orgId: string, id: string): Promise<void> => {
        return apiClient.delete(`/products/${id}`, {
            headers: { 'x-org-id': orgId }
        });
    },

    updateStock: async (orgId: string, id: string, quantity: number, type: 'IN' | 'OUT', reason?: string): Promise<Product> => {
        return apiClient.post<Product>(`/products/${id}/stock`, { quantity, type, reason }, {
            headers: { 'x-org-id': orgId }
        });
    }
};

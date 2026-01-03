import { apiClient } from './base';

export interface Product {
    productId: string;
    name: string;
    sku: string;
    description?: string;
    price: number;
    categoryId?: string;
    categoryName?: string;
    status: 'active' | 'inactive';
    createdAt: string;
}

export interface Category {
    categoryId: string;
    name: string;
    slug: string;
    description?: string;
    productCount: number;
}

export class CatalogApi {
    async listProducts(): Promise<Product[]> {
        return apiClient.get<Product[]>('/catalogo/products');
    }

    async listCategories(): Promise<Category[]> {
        return apiClient.get<Category[]>('/catalogo/categories');
    }
}

export const catalogApi = new CatalogApi();

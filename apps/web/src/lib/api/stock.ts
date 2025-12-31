import { apiClient } from './base';

export interface StockMovement {
    id: string;
    productId: string;
    productName: string;
    productSku: string;
    quantity: number;
    type: 'IN' | 'OUT' | 'ADJUSTMENT';
    reason?: string;
    userId: string;
    userName: string;
    createdAt: string;
}

export interface ProductStock {
    productId: string;
    productName: string;
    sku: string;
    currentStock: number;
    minStock: number;
    maxStock: number;
    value: number;
    status: 'OK' | 'LOW' | 'CRITICAL' | 'OVERSTOCK';
}

export interface ListStockMovementsQuery {
    page?: number;
    limit?: number;
    productId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
}

export const stockApi = {
    listMovements: async (orgId: string, query?: ListStockMovementsQuery): Promise<{ items: StockMovement[]; total: number }> => {
        const params = new URLSearchParams();
        if (query?.page) params.append('page', query.page.toString());
        if (query?.limit) params.append('limit', query.limit.toString());
        if (query?.productId) params.append('productId', query.productId);
        if (query?.type) params.append('type', query.type);
        if (query?.startDate) params.append('startDate', query.startDate);
        if (query?.endDate) params.append('endDate', query.endDate);

        return apiClient.get<{ items: StockMovement[]; total: number }>(`/stock/movements?${params.toString()}`, {
            headers: { 'x-org-id': orgId }
        });
    },

    getDashboard: async (orgId: string): Promise<{
        totalValue: number;
        lowStockItems: number;
        movementsToday: number;
        topProducts: ProductStock[]
    }> => {
        return apiClient.get<{
            totalValue: number;
            lowStockItems: number;
            movementsToday: number;
            topProducts: ProductStock[]
        }>('/stock/dashboard', {
            headers: { 'x-org-id': orgId }
        });
    },

    // Quick adjustment
    adjustStock: async (orgId: string, productId: string, quantity: number, reason: string): Promise<void> => {
        return apiClient.post(`/stock/adjust`, { productId, quantity, reason }, {
            headers: { 'x-org-id': orgId }
        });
    }
};

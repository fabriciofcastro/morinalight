import { apiClient } from './base';

export interface DashboardKPIs {
    totalRevenue: number;
    revenueGrowth: number; // percentage
    totalOrders: number;
    ordersGrowth: number;
    activeCustomers: number;
    customersGrowth: number;
    lowStockItems: number;
    stockAlertGrowth: number;
}

export interface SalesData {
    month: string;
    revenue: number;
    orders: number;
    target: number;
}

export interface TopProduct {
    id: string;
    name: string;
    category: string;
    unitsSold: number;
    revenue: number;
}

export interface RecentActivity {
    id: string;
    type: 'order' | 'stock' | 'customer' | 'notification';
    title: string;
    description: string;
    timestamp: string;
    metadata?: any;
}

export interface SupplierPerformance {
    id: string;
    name: string;
    onTimeDelivery: number; // percentage
    quality: number; // percentage
    totalOrders: number;
}

export interface InventoryInsight {
    category: string;
    totalValue: number;
    itemCount: number;
    turnoverRate: number; // percentage
    lowStockItems: number;
}

export interface CustomerSegment {
    segment: string;
    count: number;
    totalRevenue: number;
    avgOrderValue: number;
    color: string;
}

export interface RevenueData {
    name: string;
    value: number;
}

export interface CategorySales {
    name: string;
    value: number;
    color: string;
}

export interface DeviceDistribution {
    name: string;
    value: number;
    color: string;
}

export interface DateRangeParams {
    startDate?: string;
    endDate?: string;
    period?: '7d' | '30d' | '90d' | '12m' | 'custom';
}

export const analyticsApi = {
    getDashboardKPIs: async (orgId: string): Promise<DashboardKPIs> => {
        return apiClient.get<DashboardKPIs>('/analytics/dashboard/kpis', {
            headers: { 'x-org-id': orgId }
        });
    },

    getSalesChart: async (orgId: string, period: '7d' | '30d' | '90d' | '12m'): Promise<SalesData[]> => {
        return apiClient.get<SalesData[]>(`/analytics/sales?period=${period}`, {
            headers: { 'x-org-id': orgId }
        });
    },

    getTopProducts: async (orgId: string, limit: number = 5): Promise<TopProduct[]> => {
        return apiClient.get<TopProduct[]>(`/analytics/top-products?limit=${limit}`, {
            headers: { 'x-org-id': orgId }
        });
    },

    getRecentActivity: async (orgId: string, limit: number = 10): Promise<RecentActivity[]> => {
        return apiClient.get<RecentActivity[]>(`/analytics/activity?limit=${limit}`, {
            headers: { 'x-org-id': orgId }
        });
    },

    getSupplierPerformance: async (orgId: string): Promise<SupplierPerformance[]> => {
        return apiClient.get<SupplierPerformance[]>('/analytics/suppliers/performance', {
            headers: { 'x-org-id': orgId }
        });
    },

    getInventoryInsights: async (orgId: string): Promise<InventoryInsight[]> => {
        return apiClient.get<InventoryInsight[]>('/analytics/inventory/insights', {
            headers: { 'x-org-id': orgId }
        });
    },

    getCustomerSegments: async (orgId: string): Promise<CustomerSegment[]> => {
        return apiClient.get<CustomerSegment[]>('/analytics/customers/segments', {
            headers: { 'x-org-id': orgId }
        });
    },

    // Dashboard-specific endpoints
    getDashboardRevenue: async (orgId: string, params?: DateRangeParams): Promise<RevenueData[]> => {
        const queryParams = new URLSearchParams();
        if (params?.period) queryParams.append('period', params.period);
        if (params?.startDate) queryParams.append('startDate', params.startDate);
        if (params?.endDate) queryParams.append('endDate', params.endDate);

        const query = queryParams.toString();
        return apiClient.get<RevenueData[]>(`/analytics/dashboard/revenue${query ? `?${query}` : ''}`, {
            headers: { 'x-org-id': orgId }
        });
    },

    getSalesByCategory: async (orgId: string, params?: DateRangeParams): Promise<CategorySales[]> => {
        const queryParams = new URLSearchParams();
        if (params?.period) queryParams.append('period', params.period);
        if (params?.startDate) queryParams.append('startDate', params.startDate);
        if (params?.endDate) queryParams.append('endDate', params.endDate);

        const query = queryParams.toString();
        return apiClient.get<CategorySales[]>(`/analytics/dashboard/sales-by-category${query ? `?${query}` : ''}`, {
            headers: { 'x-org-id': orgId }
        });
    },

    getDeviceDistribution: async (orgId: string, params?: DateRangeParams): Promise<DeviceDistribution[]> => {
        const queryParams = new URLSearchParams();
        if (params?.period) queryParams.append('period', params.period);
        if (params?.startDate) queryParams.append('startDate', params.startDate);
        if (params?.endDate) queryParams.append('endDate', params.endDate);

        const query = queryParams.toString();
        return apiClient.get<DeviceDistribution[]>(`/analytics/dashboard/device-distribution${query ? `?${query}` : ''}`, {
            headers: { 'x-org-id': orgId }
        });
    }
};

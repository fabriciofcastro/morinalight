import { faker } from '@faker-js/faker';
import {
    CustomerSegment,
    DashboardKPIs,
    InventoryInsight,
    RecentActivity,
    SalesData,
    SupplierPerformance,
    TopProduct
} from '../api/analytics';

// Helper to get random number between min and max
const randomNumber = (min: number, max: number) =>
    faker.number.int({ min, max });

// Helper to get random float between min and max
const randomFloat = (min: number, max: number, precision: number = 2) =>
    faker.number.float({ min, max, fractionDigits: precision });

export const mockAnalytics = {
    generateDashboardKPIs: (): DashboardKPIs => ({
        totalRevenue: randomFloat(100000, 500000),
        revenueGrowth: randomFloat(-10, 30),
        totalOrders: randomNumber(100, 1000),
        ordersGrowth: randomFloat(-5, 20),
        activeCustomers: randomNumber(500, 5000),
        customersGrowth: randomFloat(-2, 15),
        lowStockItems: randomNumber(0, 50),
        stockAlertGrowth: randomFloat(-20, 20)
    }),

    generateSalesData: (period: '7d' | '30d' | '90d' | '12m' = '30d'): SalesData[] => {
        const count = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 12 : 12; // Simplified logic
        const data: SalesData[] = [];
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

        for (let i = 0; i < count; i++) {
            const revenue = randomFloat(20000, 100000);
            data.push({
                month: period === '12m' ? (months[i % 12] ?? `${i + 1}`) : `${i + 1}`,
                revenue: revenue,
                orders: randomNumber(50, 300),
                target: 50000 + (i * 1000),
                online: revenue * 0.45,
                retail: revenue * 0.35,
                b2b: revenue * 0.20,
                profit: revenue * 0.25
            });
        }
        return data;
    },

    generateTopProducts: (count: number = 5): TopProduct[] => {
        return Array.from({ length: count }).map(() => ({
            id: faker.string.uuid(),
            name: faker.commerce.productName(),
            category: faker.commerce.department(),
            unitsSold: randomNumber(50, 500),
            revenue: randomFloat(5000, 50000)
        }));
    },

    generateRecentActivity: (count: number = 10): RecentActivity[] => {
        const types: RecentActivity['type'][] = ['order', 'stock', 'customer', 'notification'];
        return Array.from({ length: count }).map(() => ({
            id: faker.string.uuid(),
            type: faker.helpers.arrayElement(types),
            title: faker.lorem.sentence(3),
            description: faker.lorem.sentence(5),
            timestamp: faker.date.recent().toISOString()
        }));
    },

    generateSupplierPerformance: (count: number = 5): SupplierPerformance[] => {
        return Array.from({ length: count }).map(() => ({
            id: faker.string.uuid(),
            name: faker.company.name(),
            onTimeDelivery: randomNumber(70, 100),
            quality: randomNumber(70, 100),
            totalOrders: randomNumber(10, 200)
        }));
    },

    generateInventoryInsights: (count: number = 5): InventoryInsight[] => {
        return Array.from({ length: count }).map(() => ({
            category: faker.commerce.department(),
            totalValue: randomFloat(10000, 200000),
            itemCount: randomNumber(50, 500),
            turnoverRate: randomNumber(20, 100),
            lowStockItems: randomNumber(0, 20)
        }));
    },

    generateCustomerSegments: (): CustomerSegment[] => {
        const segments = ['VIP', 'Premium', 'Regular', 'Novos'];
        const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

        return segments.map((segment, idx) => ({
            segment,
            count: randomNumber(10, 500),
            totalRevenue: randomFloat(5000, 500000),
            avgOrderValue: randomFloat(100, 5000),
            color: colors[idx] ?? '#6b7280'
        }));
    }
};

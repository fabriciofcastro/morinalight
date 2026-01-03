"use client";

import { useEffect, useState } from "react";
import {
    analyticsApi,
    RevenueData,
    CategorySales,
    DeviceDistribution,
    DateRangeParams
} from "@/lib/api/analytics";

interface DashboardData {
    revenue: RevenueData[];
    salesByCategory: CategorySales[];
    deviceDistribution: DeviceDistribution[];
}

interface UseDashboardDataReturn {
    data: DashboardData | null;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
}

export function useDashboardData(
    orgId: string,
    dateRange?: DateRangeParams
): UseDashboardDataReturn {
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        let isMounted = true;

        async function fetchDashboardData() {
            if (!orgId) return;

            setIsLoading(true);
            setError(null);

            try {
                const [revenue, salesByCategory, deviceDistribution] = await Promise.all([
                    analyticsApi.getDashboardRevenue(orgId, dateRange),
                    analyticsApi.getSalesByCategory(orgId, dateRange),
                    analyticsApi.getDeviceDistribution(orgId, dateRange),
                ]);

                if (isMounted) {
                    setData({
                        revenue,
                        salesByCategory,
                        deviceDistribution,
                    });
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err : new Error("Failed to fetch dashboard data"));
                    // Fallback to mock data on error
                    setData({
                        revenue: [
                            { name: "Jan", value: 4000 },
                            { name: "Fev", value: 3000 },
                            { name: "Mar", value: 5000 },
                            { name: "Abr", value: 2780 },
                            { name: "Mai", value: 1890 },
                            { name: "Jun", value: 2390 },
                            { name: "Jul", value: 3490 },
                            { name: "Ago", value: 4200 },
                            { name: "Set", value: 3800 },
                            { name: "Out", value: 5500 },
                            { name: "Nov", value: 6000 },
                            { name: "Dez", value: 7000 },
                        ],
                        salesByCategory: [
                            { name: "Eletrônicos", value: 4000, color: "#3b82f6" },
                            { name: "Roupas", value: 3000, color: "#8b5cf6" },
                            { name: "Alimentos", value: 2000, color: "#ec4899" },
                            { name: "Livros", value: 2780, color: "#ef4444" },
                            { name: "Móveis", value: 1890, color: "#10b981" },
                        ],
                        deviceDistribution: [
                            { name: "Desktop", value: 400, color: "#3b82f6" },
                            { name: "Mobile", value: 300, color: "#8b5cf6" },
                            { name: "Tablet", value: 200, color: "#ec4899" },
                        ],
                    });
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        fetchDashboardData();

        return () => {
            isMounted = false;
        };
    }, [orgId, dateRange?.period, dateRange?.startDate, dateRange?.endDate, refreshKey]);

    const refetch = () => {
        setRefreshKey((prev) => prev + 1);
    };

    return {
        data,
        isLoading,
        error,
        refetch,
    };
}

"use client";

import { useSecurityWebSocket } from "@/hooks/use-security-websocket";
import {
    analyticsApi,
    CategorySales,
    DateRangeParams,
    DeviceDistribution,
    RevenueData
} from "@/lib/api/analytics";
import { useAbility } from "@/lib/auth/CaslContext";
import { useEffect, useState } from "react";

interface DashboardData {
    revenue: RevenueData[];
    salesByCategory: CategorySales[];
    deviceDistribution: DeviceDistribution[];
    // New fields for extended charts
    performanceHistory: { name: string; vendas: number; lucro: number; custos: number }[];
    metricsRadar: { metric: string; value: number; fullMark: number }[];
    categoryDistribution: { 
        name: string; 
        data: { x: number; y: number; z: number; category: string }[]; 
        color: string; 
    }[];
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
    // Security Context
    const { socket } = useSecurityWebSocket({ orgId });
    const ability = useAbility();

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
                        performanceHistory: [],
                        metricsRadar: [],
                        categoryDistribution: [],
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
                        // Enhanced Mock Data
                        performanceHistory: [
                            { name: "Jan", vendas: 4000, lucro: 2400, custos: 1600 },
                            { name: "Fev", vendas: 3000, lucro: 1398, custos: 1602 },
                            { name: "Mar", vendas: 5000, lucro: 3800, custos: 1200 },
                            { name: "Abr", vendas: 2780, lucro: 3908, custos: -1128 },
                            { name: "Mai", vendas: 1890, lucro: 4800, custos: -2910 },
                            { name: "Jun", vendas: 2390, lucro: 3800, custos: -1410 },
                        ],
                        metricsRadar: [
                            { metric: "Qualidade", value: 85, fullMark: 100 },
                            { metric: "Velocidade", value: 75, fullMark: 100 },
                            { metric: "Eficiência", value: 90, fullMark: 100 },
                            { metric: "Satisfação", value: 80, fullMark: 100 },
                            { metric: "Inovação", value: 70, fullMark: 100 },
                            { metric: "Custo", value: 65, fullMark: 100 },
                        ],
                        categoryDistribution: [
                            {
                                name: "Categoria A",
                                data: [
                                    { x: 100, y: 200, z: 200, category: "A" },
                                    { x: 120, y: 100, z: 260, category: "A" },
                                    { x: 170, y: 300, z: 400, category: "A" },
                                    { x: 140, y: 250, z: 280, category: "A" },
                                ],
                                color: "#3b82f6",
                            },
                            {
                                name: "Categoria B",
                                data: [
                                    { x: 200, y: 260, z: 240, category: "B" },
                                    { x: 240, y: 290, z: 220, category: "B" },
                                    { x: 190, y: 290, z: 250, category: "B" },
                                    { x: 198, y: 250, z: 210, category: "B" },
                                ],
                                color: "#10b981",
                            },
                        ]
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
    }, [orgId, dateRange?.period, dateRange?.startDate, dateRange?.endDate, refreshKey, ability]); // Added ability to dependencies

    // Real-time updates via Socket.io
    useEffect(() => {
        if (!socket || !data) return;

        socket.on('stats:update', (newStats: any) => {
            console.log("⚡ [Dashboard] Real-time update received:", newStats);
            // Example: Update revenue in real-time if we have a matching payload
            if (newStats.revenue) {
                setData(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        // This is a simplified update logic. Real world would be more complex merging.
                        revenue: prev.revenue.map((item, index, arr) => {
                             if (index === arr.length - 1) { // Apply to latest month
                                 return { ...item, value: parseFloat(newStats.revenue) };
                             }
                             return item;
                        })
                    };
                });
            }
        });

        return () => {
            socket.off('stats:update');
        };
    }, [socket, data]);

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

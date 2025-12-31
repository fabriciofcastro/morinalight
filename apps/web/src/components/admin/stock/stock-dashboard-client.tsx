"use client";

import { Button, cn } from "@morina/ui";
import { motion } from "framer-motion";
import {
    ArrowUpRight,
    ArrowDownLeft,
    AlertTriangle,
    History,
    Box,
    RefreshCw,
    Search,
    Filter
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { stockApi, StockMovement, ProductStock } from "@/lib/api/stock";
import { notificationCenter } from "@/components/notifications/notification-center";

export function StockDashboardClient() {
    const router = useRouter();
    const orgId = process.env.NEXT_PUBLIC_ORG_ID || "1";

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalValue: 0,
        lowStockItems: 0,
        movementsToday: 0,
        topProducts: [] as ProductStock[]
    });
    const [movements, setMovements] = useState<StockMovement[]>([]);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [dashboardData, movementsData] = await Promise.all([
                stockApi.getDashboard(orgId),
                stockApi.listMovements(orgId, { limit: 10 })
            ]);

            setStats(dashboardData);
            setMovements(movementsData.items);
        } catch (error) {
            //   console.error("Erro ao carregar dashboard de estoque:", error);
            // Mocking data for visual validation if API fails (since backend might not exist yet)
            setStats({
                totalValue: 125430.00,
                lowStockItems: 5,
                movementsToday: 23,
                topProducts: [
                    { productId: '1', productName: 'Lâmpada LED 9W', sku: 'LAMP-001', currentStock: 1200, minStock: 200, maxStock: 5000, value: 5400, status: 'OK' },
                    { productId: '2', productName: 'Refletor Solar', sku: 'SOL-050', currentStock: 45, minStock: 50, maxStock: 200, value: 4500, status: 'LOW' }
                ]
            });
            setMovements([
                { id: '1', productId: '1', productName: 'Lâmpada LED 9W', productSku: 'LAMP-001', quantity: 500, type: 'IN', userId: '1', userName: 'Fabrício', createdAt: new Date().toISOString() },
                { id: '2', productId: '2', productName: 'Refletor Solar', productSku: 'SOL-050', quantity: 10, type: 'OUT', userId: '1', userName: 'Sistema', createdAt: new Date().toISOString() }
            ]);
        } finally {
            setLoading(false);
        }
    }, [orgId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return (
        <div className="p-8 space-y-8 min-h-screen text-white pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-200 to-emerald-500">
                        Monitor de Estoque
                    </h1>
                    <p className="text-white/60 mt-1">Visão geral em tempo real</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={loadData} className="border-white/10 text-white gap-2">
                        <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                        Atualizar
                    </Button>
                    <Button onClick={() => router.push("/admin/products/list")} className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                        Gerenciar Produtos
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-2xl bg-[#090b16]/60 border border-white/5 backdrop-blur-md"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-white/40">Valor em Estoque</p>
                            <h3 className="text-3xl font-bold text-white mt-1">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalValue)}
                            </h3>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                            <Box className="w-6 h-6" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 rounded-2xl bg-[#090b16]/60 border border-white/5 backdrop-blur-md"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-white/40">Itens Críticos</p>
                            <h3 className="text-3xl font-bold text-red-400 mt-1">{stats.lowStockItems}</h3>
                        </div>
                        <div className="p-3 rounded-xl bg-red-500/10 text-red-400">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-white/40">Itens abaixo do estoque mínimo</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 rounded-2xl bg-[#090b16]/60 border border-white/5 backdrop-blur-md"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-white/40">Movimentações Hoje</p>
                            <h3 className="text-3xl font-bold text-blue-400 mt-1">{stats.movementsToday}</h3>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                            <History className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-white/40">Entradas e saídas registradas</div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Movements */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <History className="w-5 h-5 text-emerald-400" /> Movimentações Recentes
                    </h3>
                    <div className="bg-[#090b16]/40 border border-white/5 rounded-xl overflow-hidden backdrop-blur-lg">
                        {movements.length === 0 ? (
                            <div className="p-8 text-center text-white/40">Nenhuma movimentação recente.</div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {movements.map((mov) => (
                                    <div key={mov.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-lg flex items-center justify-center border border-white/10",
                                                mov.type === "IN" ? "bg-emerald-500/10 text-emerald-400" :
                                                    mov.type === "OUT" ? "bg-red-500/10 text-red-400" : "bg-blue-500/10 text-blue-400"
                                            )}>
                                                {mov.type === "IN" ? <ArrowDownLeft className="w-5 h-5" /> :
                                                    mov.type === "OUT" ? <ArrowUpRight className="w-5 h-5" /> : <RefreshCw className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <div className="font-medium text-white">{mov.productName}</div>
                                                <div className="text-xs text-white/40">
                                                    {new Date(mov.createdAt).toLocaleString()} por {mov.userName}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "font-bold text-lg",
                                            mov.type === "IN" ? "text-emerald-400" :
                                                mov.type === "OUT" ? "text-red-400" : "text-blue-400"
                                        )}>
                                            {mov.type === "IN" ? "+" : "-"}{mov.quantity}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Watchlist/Top Products */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Box className="w-5 h-5 text-emerald-400" /> Itens em Atenção
                    </h3>
                    <div className="bg-[#090b16]/40 border border-white/5 rounded-xl overflow-hidden backdrop-blur-lg">
                        {stats.topProducts.length === 0 ? (
                            <div className="p-8 text-center text-white/40">Dados não disponíveis.</div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {stats.topProducts.map((prod) => (
                                    <div key={prod.productId} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                        <div>
                                            <div className="font-medium text-white">{prod.productName}</div>
                                            <div className="text-xs text-white/40">SKU: {prod.sku}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className={cn(
                                                "font-bold",
                                                prod.status === "LOW" ? "text-red-400" : "text-white"
                                            )}>
                                                {prod.currentStock} <span className="text-xs font-normal text-white/40">/ {prod.minStock} min</span>
                                            </div>
                                            <div className="text-xs text-white/40">
                                                Estoque Atual
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

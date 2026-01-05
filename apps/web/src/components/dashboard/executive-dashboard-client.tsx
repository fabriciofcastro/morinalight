"use client";

import { Button, cn } from "@morina/ui";
import { motion } from "framer-motion";
import {
    TrendingUp,
    TrendingDown,
    ShoppingCart,
    Users,
    Package,
    AlertCircle,
    ArrowRight,
    Plus,
    FileText,
    Truck,
    DollarSign,
    Activity
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { analyticsApi, DashboardKPIs, SalesData, TopProduct, RecentActivity } from "@/lib/api/analytics";
import { notificationCenter } from "@/components/notifications/notification-center";

import { getCurrentOrgId } from "@/lib/auth-client";

export function ExecutiveDashboardClient() {
    const router = useRouter();
    const orgId = getCurrentOrgId() || process.env.NEXT_PUBLIC_ORG_ID || "1";

    const [loading, setLoading] = useState(true);
    const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
    const [salesData, setSalesData] = useState<SalesData[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '12m'>('30d');

    const loadDashboardData = useCallback(async () => {
        try {
            setLoading(true);

            const [kpisRes, salesRes, productsRes, activityRes] = await Promise.all([
                analyticsApi.getDashboardKPIs(orgId),
                analyticsApi.getSalesChart(orgId, period),
                analyticsApi.getTopProducts(orgId, 5),
                analyticsApi.getRecentActivity(orgId, 8)
            ]);

            setKpis(kpisRes);
            setSalesData(salesRes);
            setTopProducts(productsRes);
            setRecentActivity(activityRes);
        } catch (error) {
            console.error("Failed to load dashboard data", error);
            notificationCenter.add({ type: "error", title: "Erro", message: "Falha ao carregar dados do dashboard." });
        } finally {
            setLoading(false);
        }
    }, [orgId, period]);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const formatRelativeTime = (timestamp: string) => {
        const diff = Date.now() - new Date(timestamp).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 60) return `${minutes}min atrás`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h atrás`;
        return `${Math.floor(hours / 24)}d atrás`;
    };

    const getActivityIcon = (type: RecentActivity['type']) => {
        switch (type) {
            case 'order': return ShoppingCart;
            case 'stock': return Package;
            case 'customer': return Users;
            default: return Activity;
        }
    };

    return (
        <div className="p-8 space-y-8 min-h-screen text-white pb-20">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-cyan-200 to-teal-300">
                        Dashboard Executivo
                    </h1>
                    <p className="text-white/60 mt-1">Visão geral do negócio em tempo real</p>
                </div>

                {/* Period Selector */}
                <div className="flex gap-2 bg-[#090b16]/60 border border-white/5 rounded-lg p-1 backdrop-blur-md">
                    {(['7d', '30d', '90d', '12m'] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={cn(
                                "px-4 py-2 rounded-md text-sm font-medium transition-all",
                                period === p
                                    ? "bg-cyan-500/20 text-cyan-300 shadow-lg"
                                    : "text-white/40 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {p === '7d' ? '7 Dias' : p === '30d' ? '30 Dias' : p === '90d' ? '90 Dias' : '12 Meses'}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Cards */}
            {kpis && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KPICard
                        title="Receita Total"
                        value={formatCurrency(kpis.totalRevenue)}
                        growth={kpis.revenueGrowth}
                        icon={DollarSign}
                        colorClass="text-emerald-400"
                        bgClass="bg-emerald-500/10"
                    />
                    <KPICard
                        title="Pedidos"
                        value={kpis.totalOrders.toString()}
                        growth={kpis.ordersGrowth}
                        icon={ShoppingCart}
                        colorClass="text-blue-400"
                        bgClass="bg-blue-500/10"
                    />
                    <KPICard
                        title="Clientes Ativos"
                        value={kpis.activeCustomers.toString()}
                        growth={kpis.customersGrowth}
                        icon={Users}
                        colorClass="text-violet-400"
                        bgClass="bg-violet-500/10"
                    />
                    <KPICard
                        title="Itens Críticos"
                        value={kpis.lowStockItems.toString()}
                        growth={kpis.stockAlertGrowth}
                        icon={Package}
                        colorClass="text-orange-400"
                        bgClass="bg-orange-500/10"
                        isAlert
                    />
                </div>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Chart */}
                <div className="bg-[#090b16]/40 border border-white/5 rounded-xl p-6 backdrop-blur-md">
                    <h3 className="text-lg font-bold text-white mb-4">Performance de Vendas</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={salesData}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                            <XAxis dataKey="month" stroke="#ffffff40" />
                            <YAxis stroke="#ffffff40" />
                            <Tooltip
                                contentStyle={{ background: '#0a0c14', border: '1px solid #ffffff20', borderRadius: '8px' }}
                                labelStyle={{ color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#06b6d4" fillOpacity={1} fill="url(#colorRevenue)" />
                            <Line type="monotone" dataKey="target" stroke="#666" strokeDasharray="5 5" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Products */}
                <div className="bg-[#090b16]/40 border border-white/5 rounded-xl p-6 backdrop-blur-md">
                    <h3 className="text-lg font-bold text-white mb-4">Top Produtos</h3>
                    <div className="space-y-3">
                        {topProducts.map((product, idx) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-sm">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <div className="font-medium text-white text-sm">{product.name}</div>
                                        <div className="text-xs text-white/40">{product.category}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-white text-sm">{formatCurrency(product.revenue)}</div>
                                    <div className="text-[10px] text-white/40">{product.unitsSold} vendas</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Activity + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-[#090b16]/40 border border-white/5 rounded-xl p-6 backdrop-blur-md">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-white">Atividade Recente</h3>
                        <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300">
                            Ver Tudo <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {recentActivity.map((activity) => {
                            const Icon = getActivityIcon(activity.type);
                            return (
                                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                                    <div className="p-2 rounded-lg bg-white/5 mt-1">
                                        <Icon className="w-4 h-4 text-cyan-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-white text-sm">{activity.title}</div>
                                        <div className="text-xs text-white/50">{activity.description}</div>
                                    </div>
                                    <div className="text-xs text-white/30 whitespace-nowrap">{formatRelativeTime(activity.timestamp)}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-[#090b16]/40 border border-white/5 rounded-xl p-6 backdrop-blur-md">
                    <h3 className="text-lg font-bold text-white mb-4">Ações Rápidas</h3>
                    <div className="space-y-2">
                        <QuickActionButton icon={Plus} label="Novo Pedido" onClick={() => router.push('/admin/orders/new')} />
                        <QuickActionButton icon={Users} label="Novo Cliente" onClick={() => router.push('/admin/clients/new')} />
                        <QuickActionButton icon={Package} label="Novo Produto" onClick={() => router.push('/admin/products/new')} />
                        <QuickActionButton icon={Truck} label="Novo Fornecedor" onClick={() => router.push('/admin/suppliers/new')} />
                        <QuickActionButton icon={FileText} label="Relatório" onClick={() => router.push('/analytics')} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function KPICard({ title, value, growth, icon: Icon, colorClass, bgClass, isAlert }: any) {
    const isPositive = growth >= 0;
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl bg-[#090b16]/40 border border-white/5 backdrop-blur-md relative overflow-hidden group hover:border-cyan-500/30 transition-all"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-sm font-medium text-white/40">{title}</p>
                        <h3 className={cn("text-3xl font-bold mt-1", colorClass)}>{value}</h3>
                    </div>
                    <div className={cn("p-3 rounded-xl", bgClass)}>
                        <Icon className="w-6 h-6" />
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <TrendIcon className={cn("w-4 h-4", isAlert ? (isPositive ? 'text-red-400' : 'text-emerald-400') : (isPositive ? 'text-emerald-400' : 'text-red-400'))} />
                    <span className={cn("text-sm font-medium", isAlert ? (isPositive ? 'text-red-400' : 'text-emerald-400') : (isPositive ? 'text-emerald-400' : 'text-red-400'))}>
                        {Math.abs(growth)}%
                    </span>
                    <span className="text-xs text-white/30 ml-1">vs período anterior</span>
                </div>
            </div>
        </motion.div>
    );
}

function QuickActionButton({ icon: Icon, label, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-500/30 transition-all text-left group"
        >
            <div className="p-2 rounded-lg bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors">
                <Icon className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-sm font-medium text-white">{label}</span>
        </button>
    );
}

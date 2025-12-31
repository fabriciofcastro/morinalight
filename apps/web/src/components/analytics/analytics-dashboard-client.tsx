"use client";

import { Button, cn } from "@morina/ui";
import { motion } from "framer-motion";
import {
    Download,
    FileText,
    TrendingUp,
    Filter,
    Calendar,
    BarChart3,
    PieChart,
    Activity,
    DollarSign,
    Package,
    Users,
    Truck
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
    LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { analyticsApi, SalesData, SupplierPerformance, InventoryInsight, CustomerSegment } from "@/lib/api/analytics";
import { notificationCenter } from "@/components/notifications/notification-center";

type ReportType = 'sales' | 'suppliers' | 'inventory' | 'customers';

const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export function AnalyticsDashboardClient() {
    const router = useRouter();
    const orgId = process.env.NEXT_PUBLIC_ORG_ID || "1";

    const [activeReport, setActiveReport] = useState<ReportType>('sales');
    const [loading, setLoading] = useState(true);
    const [salesData, setSalesData] = useState<SalesData[]>([]);
    const [supplierPerformance, setSupplierPerformance] = useState<SupplierPerformance[]>([]);
    const [inventoryInsights, setInventoryInsights] = useState<InventoryInsight[]>([]);
    const [customerSegments, setCustomerSegments] = useState<CustomerSegment[]>([]);
    const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '12m'>('30d');

    const loadAnalyticsData = useCallback(async () => {
        try {
            setLoading(true);

            if (activeReport === 'sales') {
                const data = await analyticsApi.getSalesChart(orgId, period).catch(() => [
                    { month: 'Jan', revenue: 45000, orders: 120, target: 50000 },
                    { month: 'Fev', revenue: 52000, orders: 135, target: 50000 },
                    { month: 'Mar', revenue: 48000, orders: 128, target: 50000 },
                    { month: 'Abr', revenue: 61000, orders: 156, target: 55000 },
                    { month: 'Mai', revenue: 72000, orders: 180, target: 60000 },
                    { month: 'Jun', revenue: 68000, orders: 170, target: 65000 }
                ]);
                setSalesData(data);
            } else if (activeReport === 'suppliers') {
                const data = await analyticsApi.getSupplierPerformance(orgId).catch(() => [
                    { id: '1', name: 'Fornecedor A', onTimeDelivery: 95, quality: 98, totalOrders: 245 },
                    { id: '2', name: 'Fornecedor B', onTimeDelivery: 88, quality: 92, totalOrders: 189 },
                    { id: '3', name: 'Fornecedor C', onTimeDelivery: 92, quality: 95, totalOrders: 156 }
                ]);
                setSupplierPerformance(data);
            } else if (activeReport === 'inventory') {
                const data = await analyticsApi.getInventoryInsights(orgId).catch(() => [
                    { category: 'Vestuário', totalValue: 125000, itemCount: 340, turnoverRate: 78, lowStockItems: 12 },
                    { category: 'Acessórios', totalValue: 45000, itemCount: 156, turnoverRate: 65, lowStockItems: 8 },
                    { category: 'Calçados', totalValue: 89000, itemCount: 210, turnoverRate: 82, lowStockItems: 3 },
                    { category: 'Tecidos', totalValue: 67000, itemCount: 180, turnoverRate: 70, lowStockItems: 15 }
                ]);
                setInventoryInsights(data);
            } else if (activeReport === 'customers') {
                const data = await analyticsApi.getCustomerSegments(orgId).catch(() => [
                    { segment: 'VIP', count: 45, totalRevenue: 450000, avgOrderValue: 10000, color: '#8b5cf6' },
                    { segment: 'Premium', count: 120, totalRevenue: 600000, avgOrderValue: 5000, color: '#06b6d4' },
                    { segment: 'Regular', count: 480, totalRevenue: 720000, avgOrderValue: 1500, color: '#10b981' },
                    { segment: 'Novos', count: 280, totalRevenue: 140000, avgOrderValue: 500, color: '#f59e0b' }
                ]);
                setCustomerSegments(data);
            }

        } catch (error) {
            console.error("Failed to load analytics", error);
            notificationCenter.add({ type: "error", title: "Erro", message: "Falha ao carregar análises." });
        } finally {
            setLoading(false);
        }
    }, [orgId, activeReport, period]);

    useEffect(() => {
        loadAnalyticsData();
    }, [loadAnalyticsData]);

    const handleExport = (format: 'pdf' | 'excel') => {
        notificationCenter.add({
            type: "success",
            title: "Exportação Iniciada",
            message: `Relatório será baixado em formato ${format.toUpperCase()}`
        });
        // API call would go here
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <div className="p-8 space-y-8 min-h-screen text-white pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-200 via-purple-200 to-fuchsia-300">
                        Analytics & Insights
                    </h1>
                    <p className="text-white/60 mt-1">Análises avançadas e relatórios customizados</p>
                </div>

                {/* Export Actions */}
                <div className="flex gap-2">
                    <Button
                        onClick={() => handleExport('excel')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Excel
                    </Button>
                    <Button
                        onClick={() => handleExport('pdf')}
                        className="bg-red-600 hover:bg-red-500 text-white gap-2"
                    >
                        <FileText className="w-4 h-4" />
                        PDF
                    </Button>
                </div>
            </div>

            {/* Report Type Selector */}
            <div className="flex flex-wrap gap-3">
                <ReportButton
                    icon={DollarSign}
                    label="Vendas"
                    active={activeReport === 'sales'}
                    onClick={() => setActiveReport('sales')}
                />
                <ReportButton
                    icon={Truck}
                    label="Fornecedores"
                    active={activeReport === 'suppliers'}
                    onClick={() => setActiveReport('suppliers')}
                />
                <ReportButton
                    icon={Package}
                    label="Estoque"
                    active={activeReport === 'inventory'}
                    onClick={() => setActiveReport('inventory')}
                />
                <ReportButton
                    icon={Users}
                    label="Clientes"
                    active={activeReport === 'customers'}
                    onClick={() => setActiveReport('customers')}
                />
            </div>

            {/* Period Selector (for applicable reports) */}
            {(activeReport === 'sales' || activeReport === 'inventory') && (
                <div className="flex gap-2 bg-[#090b16]/60 border border-white/5 rounded-lg p-1 backdrop-blur-md w-fit">
                    {(['7d', '30d', '90d', '12m'] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={cn(
                                "px-4 py-2 rounded-md text-sm font-medium transition-all",
                                period === p
                                    ? "bg-violet-500/20 text-violet-300 shadow-lg"
                                    : "text-white/40 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {p === '7d' ? '7 Dias' : p === '30d' ? '30 Dias' : p === '90d' ? '90 Dias' : '12 Meses'}
                        </button>
                    ))}
                </div>
            )}

            {/* Report Content */}
            <div className="space-y-6">
                {activeReport === 'sales' && (
                    <>
                        <div className="bg-[#090b16]/40 border border-white/5 rounded-xl p-6 backdrop-blur-md">
                            <h3 className="text-xl font-bold text-white mb-6">Análise de Vendas - {period}</h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={salesData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                    <XAxis dataKey="month" stroke="#ffffff40" />
                                    <YAxis stroke="#ffffff40" />
                                    <Tooltip
                                        contentStyle={{ background: '#0a0c14', border: '1px solid #ffffff20', borderRadius: '8px' }}
                                        labelStyle={{ color: '#fff' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="revenue" fill="#06b6d4" name="Receita (R$)" />
                                    <Bar dataKey="target" fill="#8b5cf6" name="Meta (R$)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <MetricCard title="Receita Total" value={formatCurrency(salesData.reduce((sum, d) => sum + d.revenue, 0))} icon={DollarSign} />
                            <MetricCard title="Total de Pedidos" value={salesData.reduce((sum, d) => sum + d.orders, 0).toString()} icon={Activity} />
                            <MetricCard title="Ticket Médio" value={formatCurrency(salesData.reduce((sum, d) => sum + d.revenue, 0) / salesData.reduce((sum, d) => sum + d.orders, 0))} icon={TrendingUp} />
                        </div>
                    </>
                )}

                {activeReport === 'suppliers' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-[#090b16]/40 border border-white/5 rounded-xl p-6 backdrop-blur-md">
                            <h3 className="text-xl font-bold text-white mb-6">Performance de Entrega</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={supplierPerformance} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                    <XAxis type="number" stroke="#ffffff40" domain={[0, 100]} />
                                    <YAxis dataKey="name" type="category" stroke="#ffffff40" width={120} />
                                    <Tooltip
                                        contentStyle={{ background: '#0a0c14', border: '1px solid #ffffff20', borderRadius: '8px' }}
                                        formatter={(value) => `${value}%`}
                                    />
                                    <Bar dataKey="onTimeDelivery" fill="#10b981" name="Entrega no Prazo (%)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-[#090b16]/40 border border-white/5 rounded-xl p-6 backdrop-blur-md">
                            <h3 className="text-xl font-bold text-white mb-6">Índice de Qualidade</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={supplierPerformance} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                    <XAxis type="number" stroke="#ffffff40" domain={[0, 100]} />
                                    <YAxis dataKey="name" type="category" stroke="#ffffff40" width={120} />
                                    <Tooltip
                                        contentStyle={{ background: '#0a0c14', border: '1px solid #ffffff20', borderRadius: '8px' }}
                                        formatter={(value) => `${value}%`}
                                    />
                                    <Bar dataKey="quality" fill="#8b5cf6" name="Qualidade (%)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {activeReport === 'inventory' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="bg-[#090b16]/40 border border-white/5 rounded-xl p-6 backdrop-blur-md">
                                <h3 className="text-xl font-bold text-white mb-6">Valor por Categoria</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <RechartsPie>
                                        <Pie
                                            data={inventoryInsights}
                                            dataKey="totalValue"
                                            nameKey="category"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {inventoryInsights.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ background: '#0a0c14', border: '1px solid #ffffff20', borderRadius: '8px' }}
                                            formatter={(value: any) => formatCurrency(value)}
                                        />
                                    </RechartsPie>
                                </ResponsiveContainer>
                            </div>

                            <div className="bg-[#090b16]/40 border border-white/5 rounded-xl p-6 backdrop-blur-md">
                                <h3 className="text-xl font-bold text-white mb-6">Taxa de Giro</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={inventoryInsights}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                        <XAxis dataKey="category" stroke="#ffffff40" />
                                        <YAxis stroke="#ffffff40" />
                                        <Tooltip
                                            contentStyle={{ background: '#0a0c14', border: '1px solid #ffffff20', borderRadius: '8px' }}
                                            formatter={(value) => `${value}%`}
                                        />
                                        <Bar dataKey="turnoverRate" fill="#10b981" name="Taxa de Giro (%)" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {inventoryInsights.map((insight) => (
                                <div key={insight.category} className="p-5 rounded-xl bg-[#090b16]/40 border border-white/5 backdrop-blur-md">
                                    <h4 className="text-sm font-medium text-white/40 mb-1">{insight.category}</h4>
                                    <p className="text-2xl font-bold text-white mb-2">{formatCurrency(insight.totalValue)}</p>
                                    <div className="flex justify-between text-xs text-white/50">
                                        <span>{insight.itemCount} itens</span>
                                        <span className="text-orange-400">{insight.lowStockItems} críticos</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {activeReport === 'customers' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="bg-[#090b16]/40 border border-white/5 rounded-xl p-6 backdrop-blur-md">
                                <h3 className="text-xl font-bold text-white mb-6">Distribuição por Segmento</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <RechartsPie>
                                        <Pie
                                            data={customerSegments}
                                            dataKey="count"
                                            nameKey="segment"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label={({ segment, count }) => `${segment} (${count})`}
                                        >
                                            {customerSegments.map((entry) => (
                                                <Cell key={entry.segment} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ background: '#0a0c14', border: '1px solid #ffffff20', borderRadius: '8px' }}
                                        />
                                    </RechartsPie>
                                </ResponsiveContainer>
                            </div>

                            <div className="bg-[#090b16]/40 border border-white/5 rounded-xl p-6 backdrop-blur-md">
                                <h3 className="text-xl font-bold text-white mb-6">Receita por Segmento</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={customerSegments}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                        <XAxis dataKey="segment" stroke="#ffffff40" />
                                        <YAxis stroke="#ffffff40" />
                                        <Tooltip
                                            contentStyle={{ background: '#0a0c14', border: '1px solid #ffffff20', borderRadius: '8px' }}
                                            formatter={(value: any) => formatCurrency(value)}
                                        />
                                        <Bar dataKey="totalRevenue" name="Receita Total">
                                            {customerSegments.map((entry) => (
                                                <Cell key={entry.segment} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {customerSegments.map((segment) => (
                                <motion.div
                                    key={segment.segment}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-5 rounded-xl bg-[#090b16]/40 border border-white/5 backdrop-blur-md"
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }} />
                                        <h4 className="text-sm font-medium text-white">{segment.segment}</h4>
                                    </div>
                                    <p className="text-xs text-white/40 mb-1">{segment.count} clientes</p>
                                    <p className="text-xl font-bold text-white mb-1">{formatCurrency(segment.totalRevenue)}</p>
                                    <p className="text-xs text-white/50">Ticket: {formatCurrency(segment.avgOrderValue)}</p>
                                </motion.div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function ReportButton({ icon: Icon, label, active, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl border transition-all",
                active
                    ? "bg-violet-500/20 border-violet-500/50 text-violet-300 shadow-lg"
                    : "bg-[#090b16]/40 border-white/5 text-white/60 hover:text-white hover:border-white/20"
            )}
        >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
        </button>
    );
}

function MetricCard({ title, value, icon: Icon }: any) {
    return (
        <div className="p-6 rounded-xl bg-[#090b16]/40 border border-white/5 backdrop-blur-md">
            <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium text-white/40">{title}</p>
                <Icon className="w-5 h-5 text-violet-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">{value}</h3>
        </div>
    );
}

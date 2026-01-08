"use client";

import { BrazilSalesMap } from "@/components/analytics/brazil-sales-map";
import { notificationCenter } from "@/shared/ui/notification-center";
import { GridAnimatedBackground } from "@/shared/ui/base/animated-backgrounds";
import { analyticsApi, CustomerSegment, InventoryInsight, SalesData, SupplierPerformance } from "@/lib/api/analytics";
import { Button, cn } from "@morina/ui";
import { AnimatePresence, motion } from "framer-motion";
import {
    Activity,
    ArrowUpRight,
    BarChart3,
    DollarSign,
    Download,
    FileText,
    Layers,
    LocateFixed,
    MapPin,
    Package,
    PieChart,
    Settings,
    TrendingUp,
    Truck,
    Users,
    Zap
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ComposedChart,
    Legend,
    Line,
    Pie,
    PieChart as RechartsPie,
    Rectangle,
    ResponsiveContainer,
    Tooltip,
    XAxis, YAxis
} from 'recharts';

type ReportType = 'sales' | 'suppliers' | 'inventory' | 'customers';

const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

// Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

interface DetailedSalesData extends SalesData {
    online: number;
    retail: number;
    b2b: number;
    profit: number;
}

export function AnalyticsDashboardClient() {
    const router = useRouter();
    const orgId = process.env.NEXT_PUBLIC_ORG_ID || "1";

    const [activeReport, setActiveReport] = useState<ReportType>('sales');
    const [loading, setLoading] = useState(true);
    const [salesData, setSalesData] = useState<DetailedSalesData[]>([]);
    const [supplierPerformance, setSupplierPerformance] = useState<SupplierPerformance[]>([]);
    const [inventoryInsights, setInventoryInsights] = useState<InventoryInsight[]>([]);
    const [customerSegments, setCustomerSegments] = useState<CustomerSegment[]>([]);
    const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '12m'>('30d');

    const loadAnalyticsData = useCallback(async () => {
        try {
            setLoading(true);

            if (activeReport === 'sales') {
                // Get sales data from API
                const data = await analyticsApi.getSalesChart(orgId, period);
                setSalesData(data as any);
            } else if (activeReport === 'suppliers') {
                const data = await analyticsApi.getSupplierPerformance(orgId);
                setSupplierPerformance(data);
            } else if (activeReport === 'inventory') {
                const data = await analyticsApi.getInventoryInsights(orgId);
                setInventoryInsights(data);
            } else if (activeReport === 'customers') {
                const data = await analyticsApi.getCustomerSegments(orgId);
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
        <div className="relative min-h-screen">
            <GridAnimatedBackground variant="company" className="!fixed !inset-0 !z-0 opacity-80" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="relative z-10 p-8 space-y-8 pb-20 overflow-x-hidden text-white"
            >
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <motion.div variants={itemVariants}>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-200 via-purple-200 to-fuchsia-300 drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                            Analytics & Insights
                        </h1>
                        <p className="text-white/60 mt-1 font-light tracking-wide">
                            Visualização estratégica de dados e inteligência de negócios
                        </p>
                    </motion.div>

                    {/* Export Actions */}
                    <motion.div variants={itemVariants} className="flex gap-3">
                        <Button
                            onClick={() => router.push("/analytics/reports")}
                            variant="ghost"
                            className="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-violet-500/30 text-white gap-2 transition-all duration-300 cursor-pointer"
                        >
                            <Settings className="w-4 h-4" />
                            <span>Gestão</span>
                        </Button>
                        <div className="h-9 w-px bg-white/10 mx-1" />
                        <Button
                            onClick={() => handleExport('excel')}
                            className="bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-300 hover:border-emerald-500/40 cursor-pointer"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Excel
                        </Button>
                        <Button
                            onClick={() => handleExport('pdf')}
                            className="bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-300 hover:border-rose-500/40 cursor-pointer"
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            PDF
                        </Button>
                    </motion.div>
                </div>

                {/* Separator */}
                <motion.div variants={itemVariants} className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* Report Type Selector */}
                <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
                    <ReportButton
                        icon={DollarSign}
                        label="Vendas"
                        active={activeReport === 'sales'}
                        onClick={() => setActiveReport('sales')}
                        color="violet"
                    />
                    <ReportButton
                        icon={Truck}
                        label="Fornecedores"
                        active={activeReport === 'suppliers'}
                        onClick={() => setActiveReport('suppliers')}
                        color="emerald"
                    />
                    <ReportButton
                        icon={Package}
                        label="Estoque"
                        active={activeReport === 'inventory'}
                        onClick={() => setActiveReport('inventory')}
                        color="orange"
                    />
                    <ReportButton
                        icon={Users}
                        label="Clientes"
                        active={activeReport === 'customers'}
                        onClick={() => setActiveReport('customers')}
                        color="cyan"
                    />
                </motion.div>

                {/* Period Selector (for applicable reports) */}
                <AnimatePresence mode="wait">
                    {(activeReport === 'sales' || activeReport === 'inventory') && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="flex gap-1 bg-[#090b16]/60 border border-white/5 rounded-lg p-1.5 backdrop-blur-xl w-fit shadow-2xl">
                                {(['7d', '30d', '90d', '12m'] as const).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPeriod(p)}
                                        className={cn(
                                            "px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-300 cursor-pointer relative",
                                            period === p
                                                ? "text-white shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                                                : "text-white/40 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        {period === p && (
                                            <motion.div
                                                layoutId="period-indicator"
                                                className="absolute inset-0 bg-violet-600 rounded-md"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <span className="relative z-10">
                                            {p === '7d' ? '7 Dias' : p === '30d' ? '30 Dias' : p === '90d' ? '90 Dias' : '12 Meses'}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Content Area */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${activeReport}-${period}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        {activeReport === 'sales' && (
                            <>
                                {/* Main KPI Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <MetricCard
                                        title="Receita Total"
                                        value={formatCurrency(salesData.reduce((sum, d) => sum + d.revenue, 0))}
                                        icon={DollarSign}
                                        color="emerald"
                                        change="+12.5%"
                                    />
                                    <MetricCard
                                        title="Total de Pedidos"
                                        value={salesData.reduce((sum, d) => sum + d.orders, 0).toString()}
                                        icon={Package}
                                        color="blue"
                                        change="+5.2%"
                                    />
                                    <MetricCard
                                        title="Lucro Líquido"
                                        value={formatCurrency(salesData.reduce((sum, d) => sum + d.profit, 0))}
                                        icon={TrendingUp}
                                        color="violet"
                                        change="+8.1%"
                                    />
                                </div>

                                {/* Stacked Bar "Tower" Chart & Area Chart */}
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                    <GlassCard className="p-8">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                                <Layers className="w-5 h-5 text-violet-400" />
                                                Composição de Receita (Canais)
                                            </h3>
                                        </div>
                                        <div className="h-[350px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={salesData} barGap={0}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                                                    <XAxis dataKey="month" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                                    <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                                                    <Tooltip
                                                        cursor={{ fill: '#ffffff05' }}
                                                        contentStyle={{ background: '#090b16f2', borderColor: '#ffffff1a', borderRadius: '12px' }}
                                                        labelStyle={{ color: '#fff', fontWeight: 600 }}
                                                        formatter={(value: any) => formatCurrency(value)}
                                                    />
                                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                                    {/* Stacked Bars creating the "Tower" effect */}
                                                    <Bar dataKey="online" stackId="a" fill="#8b5cf6" name="Online" radius={[0, 0, 4, 4]} />
                                                    <Bar dataKey="retail" stackId="a" fill="#06b6d4" name="Varejo" />
                                                    <Bar dataKey="b2b" stackId="a" fill="#ec4899" name="B2B (Atacado)" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </GlassCard>

                                    <GlassCard className="p-8">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                                <Zap className="w-5 h-5 text-amber-400" />
                                                Tendência de Crescimento
                                            </h3>
                                        </div>
                                        <div className="h-[350px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={salesData}>
                                                    <defs>
                                                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                        </linearGradient>
                                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                                                    <XAxis dataKey="month" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                                    <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                                                    <Tooltip
                                                        contentStyle={{ background: '#090b16f2', borderColor: '#ffffff1a', borderRadius: '12px' }}
                                                        labelStyle={{ color: '#fff' }}
                                                        formatter={(value: any) => formatCurrency(value)}
                                                    />
                                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                                    <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Receita Bruta" />
                                                    <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" name="Lucro Real" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </GlassCard>
                                </div>

                                {/* Detailed Comparison Chart */}
                                <GlassCard className="p-8">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                            <BarChart3 className="w-5 h-5 text-cyan-400" />
                                            Comparativo Metas vs Realizado
                                        </h3>
                                    </div>
                                    <div className="h-[350px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <ComposedChart data={salesData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                                                <XAxis dataKey="month" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                                <YAxis yAxisId="left" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                                                <YAxis yAxisId="right" orientation="right" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                                                <Tooltip
                                                    contentStyle={{ background: '#090b16f2', borderColor: '#ffffff1a', borderRadius: '12px' }}
                                                    labelStyle={{ color: '#fff' }}
                                                    formatter={(value: any) => typeof value === 'number' && value > 1000 ? formatCurrency(value) : value}
                                                />
                                                <Legend />
                                                <Bar yAxisId="left" dataKey="revenue" name="Receita" fill="#06b6d4" barSize={30} radius={[4, 4, 0, 0]} />
                                                <Line yAxisId="left" type="monotone" dataKey="target" name="Meta" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} />
                                                <Line yAxisId="right" type="monotone" dataKey="orders" name="Pedidos" stroke="#f59e0b" strokeWidth={2} />
                                            </ComposedChart>
                                        </ResponsiveContainer>
                                    </div>
                                </GlassCard>
                            </>
                        )}

                        {activeReport === 'suppliers' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <GlassCard className="p-6">
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                        <Truck className="w-5 h-5 text-emerald-400" />
                                        Performance de Entrega
                                    </h3>
                                    <ResponsiveContainer width="100%" height={350}>
                                        <BarChart data={supplierPerformance} layout="vertical" barGap={4}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" horizontal={false} />
                                            <XAxis type="number" stroke="#ffffff40" domain={[0, 100]} hide />
                                            <YAxis
                                                dataKey="name"
                                                type="category"
                                                stroke="#ffffff80"
                                                width={100}
                                                tickLine={false}
                                                axisLine={false}
                                                fontSize={13}
                                            />
                                            <Tooltip
                                                cursor={{ fill: 'transparent' }}
                                                contentStyle={{
                                                    background: 'rgba(10, 12, 20, 0.95)',
                                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                                    borderRadius: '12px',
                                                }}
                                                formatter={(value) => [`${value}%`, 'Pontualidade']}
                                            />
                                            <Bar
                                                dataKey="onTimeDelivery"
                                                fill="#10b981"
                                                name="Entrega no Prazo (%)"
                                                radius={[0, 4, 4, 0]}
                                                barSize={24}
                                                background={<Rectangle fill="#ffffff05" radius={[0, 4, 4, 0]} />}
                                                className="cursor-pointer"
                                            >
                                                <code className="text-xs">
                                                    {/* Label logic would go here if supported naturally by Recharts inside Bar */}
                                                </code>
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </GlassCard>

                                <GlassCard className="p-6">
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-violet-400" />
                                        Índice de Qualidade
                                    </h3>
                                    <ResponsiveContainer width="100%" height={350}>
                                        <BarChart data={supplierPerformance} layout="vertical" barGap={4}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" horizontal={false} />
                                            <XAxis type="number" stroke="#ffffff40" domain={[0, 100]} hide />
                                            <YAxis
                                                dataKey="name"
                                                type="category"
                                                stroke="#ffffff80"
                                                width={100}
                                                tickLine={false}
                                                axisLine={false}
                                                fontSize={13}
                                            />
                                            <Tooltip
                                                cursor={{ fill: 'transparent' }}
                                                contentStyle={{
                                                    background: 'rgba(10, 12, 20, 0.95)',
                                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                                    borderRadius: '12px',
                                                }}
                                                formatter={(value) => [`${value}%`, 'Qualidade']}
                                            />
                                            <Bar
                                                dataKey="quality"
                                                fill="#8b5cf6"
                                                name="Qualidade (%)"
                                                radius={[0, 4, 4, 0]}
                                                barSize={24}
                                                background={<Rectangle fill="#ffffff05" radius={[0, 4, 4, 0]} />}
                                                className="cursor-pointer"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </GlassCard>
                            </div>
                        )}

                        {activeReport === 'inventory' && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <GlassCard className="p-6">
                                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                            <PieChart className="w-5 h-5 text-orange-400" />
                                            Valor por Categoria
                                        </h3>
                                        <ResponsiveContainer width="100%" height={350}>
                                            <RechartsPie>
                                                <Pie
                                                    data={inventoryInsights}
                                                    dataKey="totalValue"
                                                    nameKey="category"
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={5}
                                                    cornerRadius={4}
                                                >
                                                    {inventoryInsights.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={COLORS[index % COLORS.length]}
                                                            className="cursor-pointer stroke-none outline-none hover:opacity-80 transition-opacity"
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{
                                                        background: 'rgba(10, 12, 20, 0.95)',
                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                        borderRadius: '12px',
                                                    }}
                                                    formatter={(value: any) => formatCurrency(value)}
                                                />
                                                <Legend
                                                    iconType="circle"
                                                    layout="vertical"
                                                    verticalAlign="middle"
                                                    align="right"
                                                    wrapperStyle={{ paddingLeft: '20px' }}
                                                    formatter={(value) => <span className="text-white/70 text-sm ml-2">{value}</span>}
                                                />
                                            </RechartsPie>
                                        </ResponsiveContainer>
                                    </GlassCard>

                                    <GlassCard className="p-6">
                                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                            <Activity className="w-5 h-5 text-emerald-400" />
                                            Taxa de Giro
                                        </h3>
                                        <ResponsiveContainer width="100%" height={350}>
                                            <BarChart data={inventoryInsights}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                                                <XAxis dataKey="category" stroke="#ffffff40" tickLine={false} axisLine={false} />
                                                <YAxis stroke="#ffffff40" tickLine={false} axisLine={false} />
                                                <Tooltip
                                                    cursor={{ fill: '#ffffff05' }}
                                                    contentStyle={{
                                                        background: 'rgba(10, 12, 20, 0.95)',
                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                        borderRadius: '12px',
                                                    }}
                                                    formatter={(value) => [`${value}%`, 'Giro']}
                                                />
                                                <Bar
                                                    dataKey="turnoverRate"
                                                    fill="#10b981"
                                                    name="Taxa de Giro (%)"
                                                    radius={[4, 4, 0, 0]}
                                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </GlassCard>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {inventoryInsights.map((insight, idx) => (
                                        <motion.div
                                            key={insight.category}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="group p-5 rounded-xl bg-[#090b16]/40 border border-white/5 hover:border-white/20 backdrop-blur-md cursor-pointer transition-all duration-300 hover:bg-white/5 hover:-translate-y-1"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="text-sm font-medium text-white/40 group-hover:text-white/70 transition-colors">{insight.category}</h4>
                                                <Package className="w-4 h-4 text-white/20 group-hover:text-violet-400 transition-colors" />
                                            </div>
                                            <p className="text-2xl font-bold text-white mb-3 tracking-tight">{formatCurrency(insight.totalValue)}</p>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="bg-white/5 px-2 py-1 rounded-full text-white/50">{insight.itemCount} itens</span>
                                                {insight.lowStockItems > 0 && (
                                                    <span className="flex items-center gap-1 text-orange-400 font-medium px-2 py-1 rounded-full bg-orange-500/10">
                                                        <Activity className="w-3 h-3" />
                                                        {insight.lowStockItems} críticos
                                                    </span>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </>
                        )}

                        {activeReport === 'customers' && (
                            <>
                                {/* Geographic Sales Map */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                                    <div className="lg:col-span-2">
                                        <BrazilSalesMap />
                                    </div>
                                    <GlassCard className="p-6 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-5">
                                            <LocateFixed className="w-24 h-24 text-white" />
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-4 relative z-10 flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-violet-400" />
                                            Top Estados (Vendas)
                                        </h3>
                                        <div className="space-y-4 relative z-10">
                                            {[
                                                { code: 'SP', name: 'São Paulo', value: 850000, percentage: 45 },
                                                { code: 'RJ', name: 'Rio de Janeiro', value: 420000, percentage: 22 },
                                                { code: 'MG', name: 'Minas Gerais', value: 310000, percentage: 16 },
                                                { code: 'RS', name: 'Rio G. do Sul', value: 180000, percentage: 9 },
                                                { code: 'DF', name: 'Distrito Federal', value: 120000, percentage: 8 },
                                            ].map((state, i) => (
                                                <div key={state.code} className="flex items-center gap-3">
                                                    <span className="text-xs font-bold text-white/30 w-4">{i + 1}</span>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between text-sm mb-1">
                                                            <span className="text-white/80">{state.name}</span>
                                                            <span className="text-white font-medium">{formatCurrency(state.value)}</span>
                                                        </div>
                                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${state.percentage}%` }}
                                                                transition={{ delay: 0.5 + (i * 0.1), duration: 1 }}
                                                                className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-6 pt-4 border-t border-white/5 text-center">
                                            <button className="text-xs text-violet-300 hover:text-violet-200 transition-colors flex items-center justify-center gap-1 mx-auto">
                                                Ver relatório geográfico completo <ArrowUpRight className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </GlassCard>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <GlassCard className="p-6">
                                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                            <Users className="w-5 h-5 text-cyan-400" />
                                            Distribuição de Clientes
                                        </h3>
                                        <ResponsiveContainer width="100%" height={350}>
                                            <RechartsPie>
                                                <Pie
                                                    data={customerSegments}
                                                    dataKey="count"
                                                    nameKey="segment"
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={5}
                                                    cornerRadius={4}
                                                >
                                                    {customerSegments.map((entry) => (
                                                        <Cell key={entry.segment} fill={entry.color} className="cursor-pointer stroke-none hover:opacity-80 transition-opacity" />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{
                                                        background: 'rgba(10, 12, 20, 0.95)',
                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                        borderRadius: '12px',
                                                    }}
                                                />
                                                <Legend
                                                    verticalAlign="bottom"
                                                    formatter={(value) => <span className="text-white/70 text-sm ml-2">{value}</span>}
                                                />
                                            </RechartsPie>
                                        </ResponsiveContainer>
                                    </GlassCard>

                                    <GlassCard className="p-6">
                                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                            <DollarSign className="w-5 h-5 text-emerald-400" />
                                            Receita por Segmento
                                        </h3>
                                        <ResponsiveContainer width="100%" height={350}>
                                            <BarChart data={customerSegments}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                                                <XAxis dataKey="segment" stroke="#ffffff40" tickLine={false} axisLine={false} />
                                                <YAxis stroke="#ffffff40" tickFormatter={(v) => `R$${v / 1000}k`} tickLine={false} axisLine={false} />
                                                <Tooltip
                                                    cursor={{ fill: '#ffffff05' }}
                                                    contentStyle={{
                                                        background: 'rgba(10, 12, 20, 0.95)',
                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                        borderRadius: '12px',
                                                    }}
                                                    formatter={(value: any) => formatCurrency(value)}
                                                />
                                                <Bar dataKey="totalRevenue" name="Receita Total" radius={[4, 4, 0, 0]}>
                                                    {customerSegments.map((entry) => (
                                                        <Cell key={entry.segment} fill={entry.color} className="cursor-pointer hover:opacity-80 transition-opacity" />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </GlassCard>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {customerSegments.map((segment, idx) => (
                                        <motion.div
                                            key={segment.segment}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="relative overflow-hidden p-6 rounded-xl bg-[#090b16]/40 border border-white/5 backdrop-blur-md cursor-pointer group hover:border-white/20 transition-all duration-300"
                                        >
                                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <Users className="w-16 h-16" style={{ color: segment.color }} />
                                            </div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: segment.color, color: segment.color }} />
                                                <h4 className="text-sm font-bold text-white uppercase tracking-wider">{segment.segment}</h4>
                                            </div>
                                            <p className="text-xs text-white/40 mb-1">{segment.count} clientes</p>
                                            <p className="text-2xl font-bold text-white mb-2 tracking-tight">{formatCurrency(segment.totalRevenue)}</p>
                                            <div className="flex items-center gap-1 text-xs text-white/50 bg-white/5 w-fit px-2 py-1 rounded-md">
                                                <span className="opacity-70">Ticket:</span>
                                                <span className="text-white font-medium">{formatCurrency(segment.avgOrderValue)}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

// Helper Components
function GlassCard({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={cn(
            "bg-[#090b16]/60 border border-white/5 rounded-2xl backdrop-blur-xl shadow-xl transition-all hover:border-white/10",
            className
        )}>
            {children}
        </div>
    );
}

function ReportButton({ icon: Icon, label, active, onClick, color }: any) {
    const colorStyles: Record<string, string> = {
        violet: "from-violet-500/20 to-purple-500/20 text-violet-300 border-violet-500/30 hover:border-violet-500/50",
        emerald: "from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30 hover:border-emerald-500/50",
        orange: "from-orange-500/20 to-amber-500/20 text-orange-300 border-orange-500/30 hover:border-orange-500/50",
        cyan: "from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30 hover:border-cyan-500/50",
        default: "bg-[#090b16]/40 border-white/5 text-white/60 hover:text-white hover:border-white/20"
    };

    const activeStyle = active ? `bg-gradient-to-br ${colorStyles[color]} shadow-lg shadow-${color}-500/5` : colorStyles.default;

    return (
        <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 px-6 py-4 rounded-xl border transition-all duration-300 flex-1 md:flex-none justify-center md:justify-start min-w-[160px] cursor-pointer",
                activeStyle
            )}
        >
            <div className={cn(
                "p-2 rounded-lg transition-colors",
                active ? "bg-white/10" : "bg-white/5 group-hover:bg-white/10"
            )}>
                <Icon className={cn("w-5 h-5", active ? "text-current" : "text-white/70")} />
            </div>
            <div className="flex flex-col items-start">
                <span className={cn("font-semibold text-sm", active ? "text-white" : "text-white/80")}>{label}</span>
                {active && <motion.span layoutId="active-dot" className="text-[10px] opacity-80">Visualizando</motion.span>}
            </div>
        </motion.button>
    );
}

function MetricCard({ title, value, icon: Icon, color, change }: any) {
    const colorClasses: Record<string, string> = {
        emerald: "text-emerald-400 bg-emerald-400/10",
        blue: "text-blue-400 bg-blue-400/10",
        violet: "text-violet-400 bg-violet-400/10",
        orange: "text-orange-400 bg-orange-400/10",
    };

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="p-6 rounded-2xl bg-[#090b16]/40 border border-white/5 backdrop-blur-md shadow-lg hover:shadow-xl hover:border-white/10 transition-all cursor-pointer group relative overflow-hidden"
        >
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-20 ${colorClasses[color]?.split(" ")[0]!.replace("text", "bg")}`} />

            <div className="flex justify-between items-start mb-4 relative z-10">
                <p className="text-sm font-medium text-white/50">{title}</p>
                <div className={cn("p-2 rounded-lg", colorClasses[color]?.split(" ")[1])}>
                    <Icon className={cn("w-5 h-5", colorClasses[color]?.split(" ")[0])} />
                </div>
            </div>
            <div className="relative z-10">
                <h3 className="text-3xl font-bold text-white tracking-tight mb-1">{value}</h3>
                {change && (
                    <div className="flex items-center gap-1 text-xs">
                        <span className="text-emerald-400 font-medium flex items-center bg-emerald-400/10 px-1.5 py-0.5 rounded">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {change}
                        </span>
                        <span className="text-white/30">vs. período anterior</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

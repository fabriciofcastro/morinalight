"use client";

import { FuturisticAreaChart } from "@/components/charts/FuturisticAreaChart";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { DateRangePreset } from "@/components/dashboard/DateRangePicker";
import { PageShell } from "@/components/layout/PageShell";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { getCurrentOrgId } from "@/lib/auth-client";
import { GlassCard } from "@morina/ui";
import { motion } from "framer-motion";
import {
    DollarSign,
    Package,
    ShoppingCart,
    TrendingDown,
    TrendingUp,
    Users
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Squared Stat Card for Pilot
// We keep the visual flair but enforce squared corners
function PilotStatCard({
    title,
    value,
    change,
    trend,
    icon: Icon,
    color,
    href,
}: {
    title: string;
    value: string;
    change: string;
    trend: "up" | "down";
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    href: string;
}) {
    return (
        <Link href={href}>
            <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                className="group relative flex h-full min-h-[148px] flex-col justify-between overflow-hidden rounded-none border border-white/10 bg-linear-to-br from-white/5 to-white/2 p-5 backdrop-blur-xl transition-all hover:border-white/20 hover:shadow-lg hover:shadow-[hsl(var(--primary)/0.12)]"
            >
                <div
                    className={`absolute -right-4 -top-4 h-28 w-28 bg-linear-to-br ${color} opacity-10 blur-2xl rounded-none`}
                />

                <div className="relative flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-[10px] font-mono font-bold text-white/55 uppercase tracking-[0.22em]">
                            {title}
                        </p>
                        <p className="mt-2 text-3xl font-bold text-white">{value}</p>
                        <div className="mt-3 flex items-center gap-2">
                            {trend === "up" ? (
                                <TrendingUp className="h-4 w-4 text-emerald-400" />
                            ) : (
                                <TrendingDown className="h-4 w-4 text-red-400" />
                            )}
                            <span
                                className={`text-sm font-medium ${trend === "up" ? "text-emerald-400" : "text-red-400"}`}
                            >
                                {change}
                            </span>
                            <span className="text-xs text-white/40">vs. mês anterior</span>
                        </div>
                    </div>
                    <div
                        className={`relative flex h-12 w-12 items-center justify-center rounded-none bg-linear-to-br ${color} shadow-lg`}
                    >
                        <div className="absolute inset-0 border border-white/10 opacity-70" />
                        <Icon className="relative h-5 w-5 text-white" />
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-[hsl(var(--primary))] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </motion.div>
        </Link>
    );
}

export default function DashboardPilot() {
    const orgId = getCurrentOrgId() || "";
    const [dateRange, setDateRange] = useState<DateRangePreset>("30d");
    const { data, isLoading, error } = useDashboardData(orgId, { period: dateRange });

    const handleResetFilters = () => {
        setDateRange("30d");
    };

    return (
        <PageShell
            title="Dashboard"
            description="Visão 360 do negócio (Piloto Visual)"
            breadcrumbs={[
                { label: "Home", href: "/" },
                { label: "Dashboard", href: "/dashboard" },
                { label: "Piloto" },
            ]}
            actions={
                <DashboardFilters
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                    onReset={handleResetFilters}
                />
            }
        >
            <div className="grid gap-6">
                {/* Stats Row */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <PilotStatCard
                        title="Faturamento"
                        value="R$ 245.8K"
                        change="+23.5%"
                        trend="up"
                        icon={DollarSign}
                        color="from-emerald-500 to-teal-500"
                        href="/analytics"
                    />
                    <PilotStatCard
                        title="Clientes Ativos"
                        value="1,284"
                        change="+12.3%"
                        trend="up"
                        icon={Users}
                        color="from-blue-500 to-cyan-500"
                        href="/admin/clients/list"
                    />
                    <PilotStatCard
                        title="Produtos"
                        value="3,456"
                        change="+8.1%"
                        trend="up"
                        icon={Package}
                        color="from-purple-500 to-pink-500"
                        href="/admin/products/list"
                    />
                    <PilotStatCard
                        title="Pedidos"
                        value="892"
                        change="-2.4%"
                        trend="down"
                        icon={ShoppingCart}
                        color="from-orange-500 to-red-500"
                        href="/orders"
                    />
                </div>

                {/* Content Row */}
                <div className="grid gap-6 lg:grid-cols-3 h-[500px]">
                    {/* Main Chart */}
                    <div className="lg:col-span-2 h-full">
                        <FuturisticAreaChart
                            data={data?.revenue}
                            isLoading={isLoading}
                            error={error}
                        />
                    </div>

                    {/* Side Panel (GlassCard) */}
                    <GlassCard className="h-full p-6 flex flex-col rounded-none">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="font-semibold text-lg text-white">Atividade Recente</h3>
                            <Link href="#" className="text-xs text-primary hover:underline">Ver tudo</Link>
                        </div>
                        <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-start gap-3 p-3 border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                                    <div className="h-2 w-2 mt-2 rounded-none bg-emerald-500 shadow-[0_0_8px_currentColor]" />
                                    <div>
                                        <p className="text-sm font-medium text-white">Novo pedido #123{i}</p>
                                        <p className="text-xs text-white/50">Há {i * 15} minutos</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </PageShell>
    );
}

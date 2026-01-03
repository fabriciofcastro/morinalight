"use client";

import { useState, useEffect } from "react";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Calendar,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { JarvisAssistantPanel } from "@/components/dashboard/JarvisAssistantPanel";
import { FuturisticAreaChart } from "@/components/charts/FuturisticAreaChart";
import { FuturisticBarChart } from "@/components/charts/FuturisticBarChart";
import { FuturisticPieChart } from "@/components/charts/FuturisticPieChart";
import { FuturisticLineChart } from "@/components/charts/FuturisticLineChart";
import { FuturisticRadarChart } from "@/components/charts/FuturisticRadarChart";
import { FuturisticScatterChart } from "@/components/charts/FuturisticScatterChart";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { DateRangePreset } from "@/components/dashboard/DateRangePicker";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { getCurrentOrgId } from "@/lib/auth-client";

// Stat Card Component
function StatCard({
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
        whileHover={{ y: -4, scale: 1.02 }}
        className="group relative flex h-full min-h-[148px] flex-col justify-between overflow-hidden rounded-none border border-white/10 bg-linear-to-br from-white/5 to-white/2 p-5 backdrop-blur-xl transition-all hover:border-white/20 hover:shadow-lg hover:shadow-[hsl(var(--primary)/0.12)]"
      >
        {/* Icon */}
        <div
          className={`absolute -right-4 -top-4 h-28 w-28 bg-linear-to-br ${color} opacity-10 blur-2xl`}
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

        {/* Hover Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-[hsl(var(--primary))] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </motion.div>
    </Link>
  );
}

// Quick Action Card
function QuickAction({
  title,
  description,
  icon: Icon,
  href,
  color,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="flex h-full min-h-[88px] items-center gap-4 rounded-none border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/10"
      >
        <div
          className={`relative flex h-12 w-12 items-center justify-center rounded-none bg-linear-to-br ${color}`}
        >
          <div className="absolute inset-0 border border-white/10 opacity-70" />
          <Icon className="relative h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-xs text-white/50">{description}</p>
        </div>
        <ArrowUpRight className="h-5 w-5 text-white/30" />
      </motion.div>
    </Link>
  );
}

export default function DashboardPage() {
  const orgId = getCurrentOrgId() || "";

  // Filter state with URL persistence
  const [dateRange, setDateRange] = useState<DateRangePreset>("30d");

  // Load filter from URL on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const period = params.get("period") as DateRangePreset;
      if (period && ["7d", "30d", "90d", "12m"].includes(period)) {
        setDateRange(period);
      }
    }
  }, []);

  // Update URL when filter changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      params.set("period", dateRange);
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, "", newUrl);
    }
  }, [dateRange]);

  const { data, isLoading, error } = useDashboardData(orgId, { period: dateRange });

  const handleResetFilters = () => {
    setDateRange("30d");
  };

  // Mock data for new charts (TODO: Replace with real API data)
  const lineChartData = [
    { name: "Jan", vendas: 4000, lucro: 2400, custos: 1600 },
    { name: "Fev", vendas: 3000, lucro: 1398, custos: 1602 },
    { name: "Mar", vendas: 5000, lucro: 3800, custos: 1200 },
    { name: "Abr", vendas: 2780, lucro: 3908, custos: -1128 },
    { name: "Mai", vendas: 1890, lucro: 4800, custos: -2910 },
    { name: "Jun", vendas: 2390, lucro: 3800, custos: -1410 },
  ];

  const radarChartData = [
    { metric: "Qualidade", value: 85, fullMark: 100 },
    { metric: "Velocidade", value: 75, fullMark: 100 },
    { metric: "Eficiência", value: 90, fullMark: 100 },
    { metric: "Satisfação", value: 80, fullMark: 100 },
    { metric: "Inovação", value: 70, fullMark: 100 },
    { metric: "Custo", value: 65, fullMark: 100 },
  ];

  const scatterChartData = [
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
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="mt-1 text-sm text-white/50">Visão geral do sistema Morina</p>
          </div>
          <DashboardFilters
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onReset={handleResetFilters}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 auto-rows-fr">
          <StatCard
            title="Faturamento"
            value="R$ 245.8K"
            change="+23.5%"
            trend="up"
            icon={DollarSign}
            color="from-emerald-500 to-teal-500"
            href="/analytics"
          />
          <StatCard
            title="Clientes Ativos"
            value="1,284"
            change="+12.3%"
            trend="up"
            icon={Users}
            color="from-blue-500 to-cyan-500"
            href="/clients"
          />
          <StatCard
            title="Produtos"
            value="3,456"
            change="+8.1%"
            trend="up"
            icon={Package}
            color="from-purple-500 to-pink-500"
            href="/catalog"
          />
          <StatCard
            title="Pedidos"
            value="892"
            change="-2.4%"
            trend="down"
            icon={ShoppingCart}
            color="from-orange-500 to-red-500"
            href="/orders"
          />
        </div>

        {/* Charts Section - Row 1 */}
        <div className="grid gap-6 lg:grid-cols-3 h-[400px]">
          <div className="lg:col-span-2 h-full">
            <FuturisticAreaChart
              data={data?.revenue}
              isLoading={isLoading}
              error={error}
            />
          </div>
          <div className="h-full">
            <FuturisticPieChart
              data={data?.deviceDistribution}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>

        {/* Charts Section - Row 2 */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-[400px]">
            <FuturisticBarChart
              data={data?.salesByCategory}
              isLoading={isLoading}
              error={error}
            />
          </div>

          <div className="grid gap-6">
            {/* Quick Actions */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-white">Ações Rápidas</h2>
              <div className="grid gap-4 sm:grid-cols-2 auto-rows-fr">
                <QuickAction
                  title="Nova Comissão"
                  description="Registrar comissão"
                  icon={DollarSign}
                  href="/commissions/new"
                  color="from-emerald-500 to-teal-500"
                />
                <QuickAction
                  title="Adicionar Cliente"
                  description="Novo cadastro"
                  icon={Users}
                  href="/clients/new"
                  color="from-blue-500 to-cyan-500"
                />
                <QuickAction
                  title="Novo Produto"
                  description="Adicionar item"
                  icon={Package}
                  href="/catalog/new"
                  color="from-purple-500 to-pink-500"
                />
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-white">Atividade Recente</h2>
              <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden p-2">
                <div className="divide-y divide-white/10">
                  {[
                    {
                      action: "Comissão aprovada",
                      user: "João Silva",
                      time: "Há 5 minutos",
                      color: "text-emerald-400",
                    },
                    {
                      action: "Cliente adicionado",
                      user: "Maria Santos",
                      time: "Há 1 hora",
                      color: "text-blue-400",
                    },
                    {
                      action: "Produto atualizado",
                      user: "Pedro Costa",
                      time: "Há 2 horas",
                      color: "text-purple-400",
                    },
                    {
                      action: "Relatório gerado",
                      user: "Ana Lima",
                      time: "Há 3 horas",
                      color: "text-orange-400",
                    },
                  ].map((activity) => (
                    <div
                      key={`${activity.action}-${activity.user}-${activity.time}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full shadow-[0_0_10px_currentColor] ${activity.color}`} />
                        <div>
                          <p className="text-sm font-medium text-white">{activity.action}</p>
                          <p className="text-xs text-white/50">por {activity.user}</p>
                        </div>
                      </div>
                      <span className="text-xs text-white/40">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Analytics Section */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-white">Análises Avançadas</h2>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="h-[400px]">
              <FuturisticLineChart data={lineChartData} />
            </div>
            <div className="h-[400px]">
              <FuturisticRadarChart data={radarChartData} />
            </div>
            <div className="h-[400px]">
              <FuturisticScatterChart series={scatterChartData} />
            </div>
          </div>
        </div>
      </div>

      {/* JARVIS Assistant */}
      <div className="lg:sticky lg:top-6">
        <JarvisAssistantPanel />
      </div>
    </div>
  );
}

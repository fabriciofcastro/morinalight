"use client";

import {
    DollarSign,
    Package,
    ShoppingCart,
    Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import { FuturisticAreaChart } from "@/components/charts/FuturisticAreaChart";
import { FuturisticBarChart } from "@/components/charts/FuturisticBarChart";
import { FuturisticLineChart } from "@/components/charts/FuturisticLineChart";
import { FuturisticPieChart } from "@/components/charts/FuturisticPieChart";
import { FuturisticRadarChart } from "@/components/charts/FuturisticRadarChart";
import { FuturisticScatterChart } from "@/components/charts/FuturisticScatterChart";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { DateRangePreset } from "@/components/dashboard/DateRangePicker";
import { JarvisAssistantPanel } from "@/components/dashboard/JarvisAssistantPanel";
import { QuickAction } from "@/components/dashboard/QuickAction";
import { StatCard } from "@/components/dashboard/StatCard";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { getCurrentOrgId } from "@/lib/auth-client";
import { AppActions, AppSubjects } from "@morina/shared-kernel";

export function UnifiedDashboard() {
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

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start text-white">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white/80 to-white/60">Dashboard</h1>
            <p className="mt-1 text-sm font-mono text-white/40 tracking-wide uppercase">Visão geral do sistema Morina</p>
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
            permission={{ action: "read" as AppActions, subject: "Dashboard" as AppSubjects }} 
          />
          <StatCard
            title="Clientes Ativos"
            value="1,284"
            change="+12.3%"
            trend="up"
            icon={Users}
            color="from-blue-500 to-cyan-500"
            href="/admin/clients/list"
            permission={{ action: 'view' as AppActions, subject: 'Client' as AppSubjects }}
          />
          <StatCard
            title="Produtos"
            value="3,456"
            change="+8.1%"
            trend="up"
            icon={Package}
            color="from-purple-500 to-pink-500"
            href="/admin/products/list"
            permission={{ action: 'view' as AppActions, subject: 'Product' as AppSubjects }}
          />
          <StatCard
            title="Pedidos"
            value="892"
            change="-2.4%"
            trend="down"
            icon={ShoppingCart}
            color="from-orange-500 to-red-500"
            href="/orders"
            permission={{ action: 'view' as AppActions, subject: 'Order' as AppSubjects }}
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
              <h2 className="mb-4 text-xs font-mono font-bold text-white/60 uppercase tracking-widest">Ações Rápidas</h2>
              <div className="grid gap-4 sm:grid-cols-2 auto-rows-fr">
                <QuickAction
                  title="Nova Comissão"
                  description="Registrar comissão"
                  icon={DollarSign}
                  href="/admin/commissions/list"
                  color="from-emerald-500 to-teal-500"
                  permission={{ action: 'create' as AppActions, subject: 'Commission' as AppSubjects }}
                />
                <QuickAction
                  title="Adicionar Cliente"
                  description="Novo cadastro"
                  icon={Users}
                  href="/admin/clients/new"
                  color="from-blue-500 to-cyan-500"
                  permission={{ action: 'create' as AppActions, subject: 'Client' as AppSubjects }}
                />
                <QuickAction
                  title="Novo Produto"
                  description="Adicionar item"
                  icon={Package}
                  href="/admin/products/new"
                  color="from-purple-500 to-pink-500"
                  permission={{ action: 'create' as AppActions, subject: 'Product' as AppSubjects }}
                />
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="mb-4 text-xs font-mono font-bold text-white/60 uppercase tracking-widest">Atividade Recente</h2>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-xl overflow-hidden p-2">
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
          <h2 className="mb-4 text-xs font-mono font-bold text-white/60 uppercase tracking-widest">Análises Avançadas</h2>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="h-[400px]">
              <FuturisticLineChart data={data?.performanceHistory || []} />
            </div>
            <div className="h-[400px]">
              <FuturisticRadarChart data={data?.metricsRadar || []} />
            </div>
            <div className="h-[400px]">
              <FuturisticScatterChart series={data?.categoryDistribution || []} />
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

"use client";

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
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="mt-1 text-sm text-white/50">Visão geral do sistema Morina</p>
          </div>
          <div className="flex items-center gap-2 rounded-none border border-white/10 bg-white/5 px-4 py-2">
            <Calendar className="h-4 w-4 text-white/50" />
            <span className="text-sm text-white/70">
              {new Date().toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
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
            <FuturisticAreaChart />
          </div>
          <div className="h-full">
            <FuturisticPieChart />
          </div>
        </div>

        {/* Charts Section - Row 2 */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-[400px]">
            <FuturisticBarChart />
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
      </div>

      {/* JARVIS Assistant */}
      <div className="lg:sticky lg:top-6">
        <JarvisAssistantPanel />
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  ShoppingCart,
  ArrowUpRight,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { PageBackground } from "@/components/page-background";

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
  icon: any;
  color: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-5 backdrop-blur-xl transition-all hover:border-white/20 hover:shadow-lg hover:shadow-[hsl(var(--primary)/0.1)]"
      >
        {/* Icon */}
        <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br ${color} opacity-10 blur-2xl`} />

        <div className="relative flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-white/50 uppercase tracking-wider">{title}</p>
            <p className="mt-2 text-3xl font-bold text-white">{value}</p>
            <div className="mt-3 flex items-center gap-2">
              {trend === "up" ? (
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-400" />
              )}
              <span className={`text-sm font-medium ${trend === "up" ? "text-emerald-400" : "text-red-400"}`}>
                {change}
              </span>
              <span className="text-xs text-white/40">vs. mês anterior</span>
            </div>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>

        {/* Hover Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[hsl(var(--primary))] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </motion.div>
    </Link>
  );
}

// Quick Action Card
function QuickAction({ title, description, icon: Icon, href, color }: any) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/10"
      >
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${color}`}>
          <Icon className="h-5 w-5 text-white" />
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
    <>
      <PageBackground variant="dashboard" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="mt-1 text-sm text-white/50">Visão geral do sistema Morina</p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2">
            <Calendar className="h-4 w-4 text-white/50" />
            <span className="text-sm text-white/70">{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

        {/* Quick Actions */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">Ações Rápidas</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <QuickAction
              title="Nova Comissão"
              description="Registrar comissão de venda"
              icon={DollarSign}
              href="/commissions/new"
              color="from-emerald-500 to-teal-500"
            />
            <QuickAction
              title="Adicionar Cliente"
              description="Cadastrar novo cliente"
              icon={Users}
              href="/clients/new"
              color="from-blue-500 to-cyan-500"
            />
            <QuickAction
              title="Novo Produto"
              description="Adicionar ao catálogo"
              icon={Package}
              href="/catalog/new"
              color="from-purple-500 to-pink-500"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">Atividade Recente</h2>
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
            <div className="divide-y divide-white/10">
              {[
                { action: "Comissão aprovada", user: "João Silva", time: "Há 5 minutos", color: "text-emerald-400" },
                { action: "Cliente adicionado", user: "Maria Santos", time: "Há 1 hora", color: "text-blue-400" },
                { action: "Produto atualizado", user: "Pedro Costa", time: "Há 2 horas", color: "text-purple-400" },
                { action: "Relatório gerado", user: "Ana Lima", time: "Há 3 horas", color: "text-orange-400" },
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`h-2 w-2 rounded-full ${activity.color}`} />
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
    </>
  );
}

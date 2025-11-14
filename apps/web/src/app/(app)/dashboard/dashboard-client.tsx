"use client";

import { GlassCard } from "@morina/ui";
import { Package, Users, DollarSign, TrendingUp, ShoppingCart, BarChart3 } from "lucide-react";
import Link from "next/link";

type StatCard = {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
};

const stats: StatCard[] = [
  {
    title: "Produtos",
    value: "1.234",
    change: "+12%",
    icon: Package,
    href: "/products",
    color: "text-blue-500",
  },
  {
    title: "Clientes",
    value: "567",
    change: "+8%",
    icon: Users,
    href: "/clientes",
    color: "text-green-500",
  },
  {
    title: "Vendas",
    value: "R$ 45.678",
    change: "+23%",
    icon: ShoppingCart,
    href: "/sales",
    color: "text-purple-500",
  },
  {
    title: "Comissões",
    value: "R$ 2.345",
    change: "+15%",
    icon: DollarSign,
    href: "/comissoes",
    color: "text-yellow-500",
  },
];

export function DashboardClient() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-[var(--fg)]">Dashboard</h1>
        <p className="mt-2 text-sm text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
          Visão geral do sistema e métricas importantes
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} href={stat.href}>
              <GlassCard className="group p-6 transition-all hover:scale-[1.02] hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                      {stat.title}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-[var(--fg)]">{stat.value}</p>
                    <p className="mt-1 text-xs text-green-500">{stat.change}</p>
                  </div>
                  <div className={`rounded-lg bg-[color-mix(in_oklab,var(--surface)_80%,transparent)] p-3 ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </GlassCard>
            </Link>
          );
        })}
      </div>

      {/* Quick actions */}
      <GlassCard className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-[var(--fg)]">Ações Rápidas</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/products"
            className="flex items-center gap-3 rounded-lg border border-[color-mix(in_oklab,var(--border)_90%,transparent)] p-4 transition-all hover:border-[var(--primary)] hover:bg-[color-mix(in_oklab,var(--surface)_80%,transparent)]"
          >
            <Package className="h-5 w-5 text-[var(--primary)]" />
            <span className="text-sm font-medium">Novo Produto</span>
          </Link>
          <Link
            href="/clientes"
            className="flex items-center gap-3 rounded-lg border border-[color-mix(in_oklab,var(--border)_90%,transparent)] p-4 transition-all hover:border-[var(--primary)] hover:bg-[color-mix(in_oklab,var(--surface)_80%,transparent)]"
          >
            <Users className="h-5 w-5 text-[var(--primary)]" />
            <span className="text-sm font-medium">Novo Cliente</span>
          </Link>
          <Link
            href="/comissoes"
            className="flex items-center gap-3 rounded-lg border border-[color-mix(in_oklab,var(--border)_90%,transparent)] p-4 transition-all hover:border-[var(--primary)] hover:bg-[color-mix(in_oklab,var(--surface)_80%,transparent)]"
          >
            <DollarSign className="h-5 w-5 text-[var(--primary)]" />
            <span className="text-sm font-medium">Ver Comissões</span>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}

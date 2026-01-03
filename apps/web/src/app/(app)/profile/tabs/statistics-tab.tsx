"use client";

import { GlassCard, cn } from "@morina/ui";
import { Award, BarChart3, Clock, TrendingUp, Zap } from "lucide-react";

export function StatisticsTab() {
  const stats = {
    totalActions: 1247,
    mostUsedModules: [
      { name: "Catálogo", count: 342, percentage: 27 },
      { name: "Clientes", count: 289, percentage: 23 },
      { name: "Comissões", count: 198, percentage: 16 },
      { name: "Produção", count: 156, percentage: 12 },
      { name: "Outros", count: 262, percentage: 22 },
    ],
    peakHours: [
      { hour: "08:00", count: 45 },
      { hour: "09:00", count: 67 },
      { hour: "10:00", count: 89 },
      { hour: "11:00", count: 78 },
      { hour: "14:00", count: 92 },
      { hour: "15:00", count: 85 },
      { hour: "16:00", count: 71 },
    ],
    achievements: [
      { id: "1", name: "Primeiro Login", icon: "🎯", unlocked: true },
      { id: "2", name: "100 Ações", icon: "⚡", unlocked: true },
      { id: "3", name: "500 Ações", icon: "🔥", unlocked: true },
      { id: "4", name: "1000 Ações", icon: "💎", unlocked: true },
      { id: "5", name: "Mestre do Sistema", icon: "👑", unlocked: false },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/50">Total de Ações</p>
              <p className="text-3xl font-bold text-white">{stats.totalActions.toLocaleString()}</p>
            </div>
            <Zap className="h-12 w-12 text-[hsl(var(--primary))]/30" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/50">Módulo Mais Usado</p>
              <p className="text-xl font-bold text-white">{stats.mostUsedModules[0].name}</p>
              <p className="text-sm text-white/50">{stats.mostUsedModules[0].count} ações</p>
            </div>
            <BarChart3 className="h-12 w-12 text-[hsl(var(--primary))]/30" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/50">Horário de Pico</p>
              <p className="text-xl font-bold text-white">
                {stats.peakHours.reduce((max, h) => (h.count > max.count ? h : max), stats.peakHours[0]).hour}
              </p>
              <p className="text-sm text-white/50">Maior produtividade</p>
            </div>
            <Clock className="h-12 w-12 text-[hsl(var(--primary))]/30" />
          </div>
        </GlassCard>
      </div>

      {/* Módulos Mais Usados */}
      <GlassCard className="p-6">
        <div className="mb-6 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-[hsl(var(--primary))]" />
          <h2 className="text-xl font-semibold text-white">Módulos Mais Usados</h2>
        </div>

        <div className="space-y-3">
          {stats.mostUsedModules.map((module) => (
            <div key={module.name}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-white/70">{module.name}</span>
                <span className="text-white/50">{module.count} ações</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] transition-all"
                  style={{ width: `${module.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Horários de Maior Produtividade */}
      <GlassCard className="p-6">
        <div className="mb-6 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[hsl(var(--primary))]" />
          <h2 className="text-xl font-semibold text-white">Horários de Maior Produtividade</h2>
        </div>

        <div className="space-y-2">
          {stats.peakHours.map((hour) => {
            const maxCount = Math.max(...stats.peakHours.map((h) => h.count));
            const percentage = (hour.count / maxCount) * 100;
            return (
              <div key={hour.hour} className="flex items-center gap-3">
                <span className="w-16 text-sm text-white/70">{hour.hour}</span>
                <div className="flex-1">
                  <div className="h-6 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <span className="w-12 text-right text-sm text-white/50">{hour.count}</span>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Conquistas */}
      <GlassCard className="p-6">
        <div className="mb-6 flex items-center gap-2">
          <Award className="h-5 w-5 text-[hsl(var(--primary))]" />
          <h2 className="text-xl font-semibold text-white">Conquistas</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stats.achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={cn(
                "rounded border p-4 transition-all",
                achievement.unlocked
                  ? "border-[hsl(var(--primary))]/30 bg-[hsl(var(--primary))]/10"
                  : "border-white/10 bg-white/5 opacity-50",
              )}
            >
              <div className="mb-2 text-3xl">{achievement.icon}</div>
              <p className="font-semibold text-white">{achievement.name}</p>
              {achievement.unlocked && (
                <p className="mt-1 text-xs text-green-400">Desbloqueada</p>
              )}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}





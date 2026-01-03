"use client";

import { motion } from "framer-motion";
import { Users, UserCheck, UserX, Clock, UserPlus, Shield } from "lucide-react";

interface UsersStatsProps {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  suspended?: number;
  with2FA?: number;
  newLast30Days?: number;
}

export function UsersStats({
  total,
  active,
  inactive,
  pending,
  suspended = 0,
  with2FA = 0,
  newLast30Days = 0,
}: UsersStatsProps) {
  const stats = [
    {
      label: "Total de Usuários",
      value: total,
      icon: Users,
      color: "from-blue-500/20 to-cyan-500/20",
      borderColor: "border-blue-500/30",
      textColor: "text-blue-400",
    },
    {
      label: "Usuários Ativos",
      value: active,
      icon: UserCheck,
      color: "from-green-500/20 to-emerald-500/20",
      borderColor: "border-green-500/30",
      textColor: "text-green-400",
    },
    {
      label: "Usuários Inativos",
      value: inactive,
      icon: UserX,
      color: "from-gray-500/20 to-slate-500/20",
      borderColor: "border-gray-500/30",
      textColor: "text-gray-400",
    },
    {
      label: "Pendentes",
      value: pending,
      icon: Clock,
      color: "from-yellow-500/20 to-amber-500/20",
      borderColor: "border-yellow-500/30",
      textColor: "text-yellow-400",
    },
    ...(suspended > 0
      ? [
          {
            label: "Suspensos",
            value: suspended,
            icon: Shield,
            color: "from-red-500/20 to-rose-500/20",
            borderColor: "border-red-500/30",
            textColor: "text-red-400",
          },
        ]
      : []),
    ...(with2FA > 0
      ? [
          {
            label: "Com 2FA",
            value: with2FA,
            icon: Shield,
            color: "from-purple-500/20 to-violet-500/20",
            borderColor: "border-purple-500/30",
            textColor: "text-purple-400",
          },
        ]
      : []),
    ...(newLast30Days > 0
      ? [
          {
            label: "Novos (30 dias)",
            value: newLast30Days,
            icon: UserPlus,
            color: "from-indigo-500/20 to-blue-500/20",
            borderColor: "border-indigo-500/30",
            textColor: "text-indigo-400",
          },
        ]
      : []),
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`relative p-4 rounded-xl border ${stat.borderColor} bg-gradient-to-br ${stat.color} backdrop-blur-sm`}
          >
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white/20" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white/20" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white/20" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white/20" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <Icon className={`h-5 w-5 ${stat.textColor}`} />
                <span className="text-xs font-medium text-white/60">{stat.label}</span>
              </div>
              <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value.toLocaleString()}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}








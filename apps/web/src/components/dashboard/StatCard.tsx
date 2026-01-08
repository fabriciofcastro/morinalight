"use client";

import { useAbility } from "@/lib/auth/CaslContext";
import { AppActions, AppSubjects } from "@morina/shared-kernel";
import { motion } from "framer-motion";
import Link from "next/link";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  href: string;
  permission?: {
    action: AppActions;
    subject: AppSubjects;
  };
}

export function StatCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color,
  href,
  permission,
}: StatCardProps) {
  const ability = useAbility();

  if (permission && !ability.can(permission.action, permission.subject)) {
    return null;
  }

  return (
    <Link href={href} className="block group">
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-2xl transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04] hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]"
      >
        {/* Glow Effects */}
        <div className={`absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br ${color} opacity-[0.08] blur-[40px] transition-all duration-500 group-hover:opacity-[0.15]`} />
        
        <div className="relative z-10 flex items-start justify-between mb-4">
          <div className="rounded-lg border border-white/10 bg-white/5 p-2.5 shadow-inner transition-colors duration-300 group-hover:border-white/20 group-hover:bg-white/10">
            <Icon className="h-5 w-5 text-white/80 transition-colors duration-300 group-hover:text-white" />
          </div>
          <div className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-medium tracking-wider uppercase border border-white/5 bg-white/[0.02] ${trend === "up" ? "text-emerald-400/90" : "text-red-400/90"}`}>
             {change}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-[10px] font-mono font-medium text-white/40 uppercase tracking-[0.2em] mb-1">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-white/90 tracking-tight transition-colors duration-300 group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                {value}
            </p>
          </div>
        </div>

        {/* Bottom Progress/Accent Line */}
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-30 group-hover:opacity-60 transition-opacity" />
        <div className={`absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r ${color} transition-all duration-500 group-hover:w-full opacity-50`} />
      </motion.div>
    </Link>
  );
}

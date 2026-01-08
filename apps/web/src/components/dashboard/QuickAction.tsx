"use client";

import { useAbility } from "@/lib/auth/CaslContext";
import { AppActions, AppSubjects } from "@morina/shared-kernel";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  permission?: {
    action: AppActions;
    subject: AppSubjects;
  };
}

export function QuickAction({
  title,
  description,
  icon: Icon,
  href,
  color,
  permission,
}: QuickActionProps) {
  const ability = useAbility();

  if (permission && !ability.can(permission.action, permission.subject)) {
    return null;
  }

  return (
    <Link href={href} className="flex-1 group">
      <motion.div
        whileHover={{ scale: 1.01, y: -2 }}
        className="relative flex h-full min-h-[88px] items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur-2xl transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04] hover:shadow-lg"
      >
        <div className={`relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${color} shadow-inner bg-opacity-10 ring-1 ring-white/5 group-hover:ring-white/10 transition-all`}>
          <Icon className="relative h-5 w-5 text-white/90 transition-transform duration-300 group-hover:scale-110" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white/90 truncate group-hover:text-white transition-colors">
            {title}
          </p>
          <p className="text-xs text-white/40 truncate group-hover:text-white/60 transition-colors font-mono tracking-wide">
            {description}
          </p>
        </div>
        
        <div className="rounded-full border border-white/5 bg-white/[0.02] p-2 transition-all duration-300 group-hover:border-white/10 group-hover:bg-white/5">
             <ArrowUpRight className="h-4 w-4 text-white/30 transition-colors duration-300 group-hover:text-white" />
        </div>
      </motion.div>
    </Link>
  );
}

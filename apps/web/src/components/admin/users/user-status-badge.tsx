"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { cn } from "@morina/ui";

export type UserStatus = "active" | "inactive" | "suspended" | "pending";

interface UserStatusBadgeProps {
  status: UserStatus;
  className?: string;
}

const statusConfig: Record<
  UserStatus,
  {
    label: string;
    icon: typeof CheckCircle2;
    bgColor: string;
    textColor: string;
    borderColor: string;
    glowColor: string;
  }
> = {
  active: {
    label: "Ativo",
    icon: CheckCircle2,
    bgColor: "bg-green-500/20",
    textColor: "text-green-400",
    borderColor: "border-green-500/50",
    glowColor: "shadow-[0_0_12px_rgba(34,197,94,0.3)]",
  },
  inactive: {
    label: "Inativo",
    icon: XCircle,
    bgColor: "bg-gray-500/20",
    textColor: "text-gray-400",
    borderColor: "border-gray-500/50",
    glowColor: "shadow-[0_0_12px_rgba(156,163,175,0.2)]",
  },
  suspended: {
    label: "Suspenso",
    icon: AlertCircle,
    bgColor: "bg-red-500/20",
    textColor: "text-red-400",
    borderColor: "border-red-500/50",
    glowColor: "shadow-[0_0_12px_rgba(239,68,68,0.3)]",
  },
  pending: {
    label: "Pendente",
    icon: Clock,
    bgColor: "bg-yellow-500/20",
    textColor: "text-yellow-400",
    borderColor: "border-yellow-500/50",
    glowColor: "shadow-[0_0_12px_rgba(234,179,8,0.3)]",
  },
};

export function UserStatusBadge({ status, className }: UserStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border backdrop-blur-sm",
        config.bgColor,
        config.textColor,
        config.borderColor,
        config.glowColor,
        className
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="text-sm font-semibold">{config.label}</span>
    </motion.div>
  );
}








"use client";

import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

export type StatusBadgeType = "complete" | "incomplete" | "error";

interface StatusBadgeProps {
  status: StatusBadgeType;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StatusBadge({ status, label, size = "md", className }: StatusBadgeProps) {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "px-2 py-1 text-xs gap-1";
      case "md":
        return "px-3 py-1.5 text-sm gap-1.5";
      case "lg":
        return "px-4 py-2 text-base gap-2";
      default:
        return "px-3 py-1.5 text-sm gap-1.5";
    }
  };

  const getStatusStyles = () => {
    switch (status) {
      case "complete":
        return {
          bg: "bg-green-100 dark:bg-green-950/50",
          text: "text-green-800 dark:text-green-200",
          border: "border border-green-300 dark:border-green-700",
          icon: CheckCircle2,
        };
      case "error":
        return {
          bg: "bg-red-100 dark:bg-red-950/50",
          text: "text-red-800 dark:text-red-200",
          border: "border border-red-300 dark:border-red-700",
          icon: AlertCircle,
        };
      case "incomplete":
      default:
        return {
          bg: "bg-yellow-100 dark:bg-yellow-950/50",
          text: "text-yellow-800 dark:text-yellow-200",
          border: "border border-yellow-300 dark:border-yellow-700",
          icon: Clock,
        };
    }
  };

  const styles = getStatusStyles();
  const Icon = styles.icon;

  return (
    <div
      className={`
        inline-flex items-center
        rounded-full font-medium
        ${getSizeClasses()}
        ${styles.bg} ${styles.text} ${styles.border}
        ${className || ""}
      `}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label && <span>{label}</span>}
    </div>
  );
}

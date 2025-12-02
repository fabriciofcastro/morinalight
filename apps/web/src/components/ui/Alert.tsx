"use client";

import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import type { ReactNode } from "react";

export type AlertType = "success" | "error" | "warning" | "info";

interface AlertProps {
  type?: AlertType;
  title?: string;
  message: string | ReactNode;
  onClose?: () => void;
  icon?: ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

export function Alert({
  type = "info",
  title,
  message,
  onClose,
  icon,
  className,
  showCloseButton = true,
}: AlertProps) {
  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-50 dark:bg-green-950/30",
          border: "border-green-200 dark:border-green-900",
          text: "text-green-800 dark:text-green-200",
          icon: "text-green-600 dark:text-green-400",
        };
      case "error":
        return {
          bg: "bg-red-50 dark:bg-red-950/30",
          border: "border-red-200 dark:border-red-900",
          text: "text-red-800 dark:text-red-200",
          icon: "text-red-600 dark:text-red-400",
        };
      case "warning":
        return {
          bg: "bg-yellow-50 dark:bg-yellow-950/30",
          border: "border-yellow-200 dark:border-yellow-900",
          text: "text-yellow-800 dark:text-yellow-200",
          icon: "text-yellow-600 dark:text-yellow-400",
        };
      case "info":
      default:
        return {
          bg: "bg-blue-50 dark:bg-blue-950/30",
          border: "border-blue-200 dark:border-blue-900",
          text: "text-blue-800 dark:text-blue-200",
          icon: "text-blue-600 dark:text-blue-400",
        };
    }
  };

  const getDefaultIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-5 w-5" />;
      case "error":
        return <AlertCircle className="h-5 w-5" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5" />;
      case "info":
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      className={`
        rounded-lg border p-4
        ${styles.bg} ${styles.border} ${styles.text}
        ${className || ""}
      `}
    >
      <div className="flex gap-3">
        <div className={`shrink-0 mt-0.5 ${styles.icon}`}>{icon || getDefaultIcon()}</div>
        <div className="flex-1">
          {title && <h3 className="font-semibold text-sm mb-1">{title}</h3>}
          <p className="text-sm">{message}</p>
        </div>
        {showCloseButton && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 ml-2 hover:opacity-70 transition-opacity"
            aria-label="Close alert"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

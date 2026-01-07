"use client";

import { AlertDescription, AlertTitle, Alert as UiAlert } from "@morina/ui";
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

  const variantMap: Record<AlertType, "default" | "destructive" | "success" | "warning"> = {
    info: "default" as const,
    success: "success",
    warning: "warning",
    error: "destructive", // Using destructive for error
  };

  const IconMap = {
    info: Info,
    success: CheckCircle2,
    warning: AlertTriangle,
    error: AlertCircle
  }

  const IconComponent = icon ? (() => icon as any) : IconMap[type] || Info;

  return (
    <UiAlert variant={variantMap[type]} className={className}>
      <IconComponent className="h-4 w-4" />
      <div className="flex w-full justify-between items-start gap-2">
        <div className="flex-1">
          {title && <AlertTitle>{title}</AlertTitle>}
          <AlertDescription>{message}</AlertDescription>
        </div>
        {showCloseButton && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </UiAlert>
  );
}

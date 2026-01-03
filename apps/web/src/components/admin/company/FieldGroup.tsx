"use client";

import { AlertCircle, CheckCircle2, HelpCircle } from "lucide-react";
import type { ReactNode } from "react";

interface FieldGroupProps {
  title: string;
  description?: string;
  children: ReactNode;
  status?: "complete" | "incomplete" | "error";
  helpText?: string;
  helpUrl?: string;
  className?: string;
}

export function FieldGroup({
  title,
  description,
  children,
  status,
  helpText,
  helpUrl,
  className,
}: FieldGroupProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "complete":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "incomplete":
        return <div className="h-5 w-5 rounded-full border-2 border-yellow-500/50" />;
      default:
        return null;
    }
  };

  const baseClasses =
    "rounded-lg border border-white/10 bg-white/[0.02] p-4 space-y-3 dark:border-gray-700 dark:bg-gray-900/50";
  const errorClasses = "border-red-500/20 bg-red-500/5 dark:border-red-900/50 dark:bg-red-950/20";
  const incompleteClasses =
    "border-yellow-500/20 bg-yellow-500/5 dark:border-yellow-900/50 dark:bg-yellow-950/20";

  const statusClass =
    status === "error" ? errorClasses : status === "incomplete" ? incompleteClasses : "";

  return (
    <div className={`${baseClasses} ${statusClass} ${className || ""}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h4>
            {getStatusIcon()}
          </div>
          {description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {helpText && (
          <div className="group relative cursor-help shrink-0 mt-1">
            <HelpCircle className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300 transition-colors" />
            <div className="absolute right-0 top-full mt-2 w-48 rounded-lg bg-black/90 dark:bg-gray-950 p-2 text-xs text-white opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 z-50 shadow-lg border border-white/10">
              {helpText}
              {helpUrl && (
                <a
                  href={helpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-2 text-blue-500 hover:underline"
                >
                  Saiba mais →
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3">{children}</div>
    </div>
  );
}

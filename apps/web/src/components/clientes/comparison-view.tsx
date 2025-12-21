"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@morina/ui";
import { ArrowRight, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface ComparisonViewProps<T> {
  before: T;
  after: T;
  fieldLabels?: Record<string, string>;
  className?: string;
}

export function ComparisonView<T extends Record<string, unknown>>({
  before,
  after,
  fieldLabels = {},
  className,
}: ComparisonViewProps<T>) {
  const getFieldLabel = (key: string): string => {
    return fieldLabels[key] || key;
  };

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined || value === "") {
      return "(vazio)";
    }
    if (typeof value === "boolean") {
      return value ? "Sim" : "Não";
    }
    if (value instanceof Date) {
      return value.toLocaleString("pt-BR");
    }
    return String(value);
  };

  const hasChanges = Object.keys(before).some(
    (key) => before[key] !== after[key]
  );

  if (!hasChanges) {
    return (
      <GlassCard className={`p-6 ${className}`}>
        <div className="flex items-center justify-center gap-2 text-[color-mix(in oklab,var(--muted-soft)_70%,var(--fg)_30%)]">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <p>Nenhuma alteração detectada</p>
        </div>
      </GlassCard>
    );
  }

  const changedFields = Object.keys(before).filter(
    (key) => before[key] !== after[key]
  );

  return (
    <GlassCard className={`p-6 ${className}`}>
      <div className="mb-4 flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-yellow-500" />
        <h3 className="text-lg font-semibold">
          Comparação de Alterações ({changedFields.length})
        </h3>
      </div>

      <div className="space-y-4">
        {changedFields.map((key) => {
          const beforeValue = before[key];
          const afterValue = after[key];
          const isRemoved = beforeValue && !afterValue;
          const isAdded = !beforeValue && afterValue;
          const isModified = beforeValue && afterValue && beforeValue !== afterValue;

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg border border-[color-mix(in oklab,var(--muted-soft)_20%,transparent)] bg-[color-mix(in oklab,var(--muted-soft)_5%,transparent)]"
            >
              <div className="mb-2">
                <span className="font-medium text-sm">{getFieldLabel(key)}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Antes */}
                <div
                  className={`p-3 rounded border ${
                    isRemoved
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : "border-[color-mix(in oklab,var(--muted-soft)_20%,transparent)]"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-xs font-medium text-red-700 dark:text-red-300">
                      Antes
                    </span>
                  </div>
                  <p
                    className={`text-sm ${
                      isRemoved
                        ? "text-red-700 dark:text-red-300 line-through"
                        : "text-[var(--fg)]"
                    }`}
                  >
                    {formatValue(beforeValue)}
                  </p>
                </div>

                {/* Depois */}
                <div
                  className={`p-3 rounded border ${
                    isAdded
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : isModified
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-[color-mix(in oklab,var(--muted-soft)_20%,transparent)]"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2
                      className={`h-4 w-4 ${
                        isAdded
                          ? "text-green-500"
                          : isModified
                            ? "text-blue-500"
                            : "text-[var(--primary)]"
                      }`}
                    />
                    <span
                      className={`text-xs font-medium ${
                        isAdded
                          ? "text-green-700 dark:text-green-300"
                          : isModified
                            ? "text-blue-700 dark:text-blue-300"
                            : "text-[var(--fg)]"
                      }`}
                    >
                      Depois
                    </span>
                  </div>
                  <p
                    className={`text-sm ${
                      isAdded
                        ? "text-green-700 dark:text-green-300 font-medium"
                        : isModified
                          ? "text-blue-700 dark:text-blue-300 font-medium"
                          : "text-[var(--fg)]"
                    }`}
                  >
                    {formatValue(afterValue)}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </GlassCard>
  );
}




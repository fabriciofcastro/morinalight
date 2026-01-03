"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GlassCard, Button } from "@morina/ui";
import { GitCompare, X, ArrowRight, CheckCircle2, XCircle } from "lucide-react";

interface CompareVersionsModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  oldVersion: T;
  newVersion: T;
  getFieldLabel?: (key: string) => string;
  formatValue?: (key: string, value: unknown) => string;
}

export function CompareVersionsModal<T extends Record<string, unknown>>({
  isOpen,
  onClose,
  oldVersion,
  newVersion,
  getFieldLabel = (key) => key,
  formatValue = (_, value) => String(value || "-"),
}: CompareVersionsModalProps<T>) {
  if (!isOpen) return null;

  // Encontrar diferenças
  const getDifferences = () => {
    const differences: Array<{
      key: string;
      oldValue: unknown;
      newValue: unknown;
    }> = [];

    const allKeys = new Set([
      ...Object.keys(oldVersion),
      ...Object.keys(newVersion),
    ]);

    allKeys.forEach((key) => {
      const oldVal = oldVersion[key];
      const newVal = newVersion[key];

      // Comparar valores (considerando null, undefined, string vazia como equivalentes)
      const normalize = (val: unknown) => {
        if (val === null || val === undefined || val === "") return null;
        return val;
      };

      const normalizedOld = normalize(oldVal);
      const normalizedNew = normalize(newVal);

      if (normalizedOld !== normalizedNew) {
        differences.push({
          key,
          oldValue: oldVal,
          newValue: newVal,
        });
      }
    });

    return differences;
  };

  const differences = getDifferences();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <GlassCard className="w-full max-w-4xl max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-[color-mix(in oklab,var(--muted-soft)_20%,transparent)]">
                <div className="flex items-center gap-3">
                  <GitCompare className="h-5 w-5 text-[var(--primary)]" />
                  <h2 className="text-lg font-semibold">Comparação de Versões</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {differences.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <p className="text-[color-mix(in oklab,var(--muted-soft)_70%,var(--fg)_30%)]">
                      Nenhuma diferença encontrada entre as versões
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>{differences.length}</strong> campo(s) foram alterado(s)
                      </p>
                    </div>

                    {differences.map((diff) => (
                      <motion.div
                        key={diff.key}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-4 rounded-lg border border-[color-mix(in oklab,var(--muted-soft)_20%,transparent)] bg-[color-mix(in oklab,var(--muted-soft)_5%,transparent)]"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <h3 className="font-medium text-sm mb-2">
                              {getFieldLabel(diff.key)}
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-[color-mix(in oklab,var(--muted-soft)_70%,var(--fg)_30%)] mb-1">
                                  Versão Anterior
                                </p>
                                <div className="p-2 rounded bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                  <p className="text-sm line-through text-red-600 dark:text-red-400">
                                    {formatValue(diff.key, diff.oldValue)}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-[color-mix(in oklab,var(--muted-soft)_70%,var(--fg)_30%)] mb-1">
                                  Versão Nova
                                </p>
                                <div className="p-2 rounded bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                                    {formatValue(diff.key, diff.newValue)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 text-[color-mix(in oklab,var(--muted-soft)_70%,var(--fg)_30%)] mt-6" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-[color-mix(in oklab,var(--muted-soft)_20%,transparent)] flex justify-end">
                <Button onClick={onClose}>Fechar</Button>
              </div>
            </GlassCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}









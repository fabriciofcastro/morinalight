"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button, GlassCard } from "@morina/ui";
import { Lightbulb, X, Check, Sparkles } from "lucide-react";
import type { SmartSuggestion } from "@/hooks/use-smart-suggestions";

interface SmartSuggestionsPanelProps {
  suggestions: SmartSuggestion[];
  isLoading: boolean;
  onApply: (suggestion: SmartSuggestion) => void;
  onDismiss: (suggestion: SmartSuggestion) => void;
  getFieldLabel?: (key: string) => string;
}

export function SmartSuggestionsPanel({
  suggestions,
  isLoading,
  onApply,
  onDismiss,
  getFieldLabel = (key) => key,
}: SmartSuggestionsPanelProps) {
  if (isLoading) {
    return (
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 text-sm text-[color-mix(in oklab,var(--muted-soft)_70%,var(--fg)_30%)]">
          <Sparkles className="h-4 w-4 animate-pulse" />
          <span>Analisando padrões...</span>
        </div>
      </GlassCard>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        <GlassCard className="p-4 border-[color-mix(in oklab,var(--primary)_20%,transparent)]">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[color-mix(in oklab,var(--primary)_10%,transparent)]">
              <Lightbulb className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                Sugestões Inteligentes
                <span className="text-xs font-normal text-[color-mix(in oklab,var(--muted-soft)_70%,var(--fg)_30%)]">
                  ({suggestions.length})
                </span>
              </h3>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <motion.div
                    key={`${suggestion.field}-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 rounded-lg bg-[color-mix(in oklab,var(--muted-soft)_5%,transparent)] border border-[color-mix(in oklab,var(--muted-soft)_20%,transparent)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-xs font-medium mb-1">
                          {getFieldLabel(suggestion.field)}
                        </p>
                        <p className="text-sm mb-1">{suggestion.value}</p>
                        <p className="text-xs text-[color-mix(in oklab,var(--muted-soft)_70%,var(--fg)_30%)]">
                          {suggestion.reason}
                        </p>
                        <div className="mt-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-[color-mix(in oklab,var(--muted-soft)_20%,transparent)] overflow-hidden">
                              <div
                                className="h-full bg-[var(--primary)] transition-all"
                                style={{ width: `${suggestion.confidence * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-[color-mix(in oklab,var(--muted-soft)_70%,var(--fg)_30%)]">
                              {Math.round(suggestion.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onApply(suggestion)}
                          className="gap-1.5 h-8 px-2"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Aplicar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDismiss(suggestion)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </AnimatePresence>
  );
}









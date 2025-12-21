"use client";

import { Button } from "@morina/ui";
import { ArrowLeft, Save, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { motion } from "framer-motion";
import type { AutoSaveStatus } from "@/hooks/useAutoSave";

export interface StandardFormPageProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  onSave?: (e?: React.FormEvent) => void | Promise<void>;
  onCancel?: () => void;
  backUrl?: string;
  isValid?: boolean;
  loading?: boolean;
  loadingMessage?: string;
  autoSaveStatus?: AutoSaveStatus;
  hasUnsavedChanges?: boolean;
  headerActions?: ReactNode;
  showSaveButton?: boolean;
  showCancelButton?: boolean;
}

export function StandardFormPage({
  title,
  subtitle,
  icon,
  children,
  onSave,
  onCancel,
  backUrl,
  isValid = true,
  loading = false,
  loadingMessage = "Carregando...",
  autoSaveStatus = "idle",
  hasUnsavedChanges = false,
  headerActions,
  showSaveButton = true,
  showCancelButton = true,
}: StandardFormPageProps) {
  const router = useRouter();

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S ou Cmd+S para salvar
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (onSave && isValid) {
          void onSave();
        }
      }
      // Escape para cancelar/voltar
      if (e.key === "Escape") {
        if (onCancel) {
          onCancel();
        } else if (backUrl) {
          router.push(backUrl);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSave, onCancel, backUrl, router, isValid]);

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (backUrl) {
      router.push(backUrl);
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
          <p className="text-white/60">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen p-6 space-y-8">
      {/* Header Futurista */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary)/0.15)] via-transparent to-[hsl(var(--accent)/0.15)] blur-3xl -z-10" />

        <div className="relative flex items-center justify-between p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent backdrop-blur-xl shadow-2xl">
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />

          <div className="relative z-10 flex-1">
            <div className="flex items-center gap-4 mb-3">
              {icon || null}
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent tracking-tight">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm text-white/60 font-medium mt-1">{subtitle}</p>
                )}
              </div>
            </div>

            {/* Indicador de Auto-Save */}
            <div className="flex items-center gap-3 mt-4">
              {autoSaveStatus === "saving" && (
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Salvando...</span>
                </div>
              )}
              {autoSaveStatus === "saved" && (
                <div className="flex items-center gap-2 text-xs text-green-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Salvo automaticamente</span>
                </div>
              )}
              {autoSaveStatus === "error" && (
                <div className="flex items-center gap-2 text-xs text-red-400">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>Erro ao salvar</span>
                </div>
              )}
              {hasUnsavedChanges && autoSaveStatus === "idle" && (
                <div className="text-xs text-yellow-400">
                  Alterações não salvas
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {headerActions}
            {showCancelButton && (backUrl || onCancel) && (
              <Button
                variant="secondary"
                type="button"
                onClick={handleCancel}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            )}
            {showSaveButton && onSave && (
              <Button
                type="button"
                onClick={() => void onSave()}
                disabled={!isValid}
                className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white shadow-lg shadow-[hsl(var(--primary))]/25 hover:shadow-[hsl(var(--primary))]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Formulário */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="p-8 rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-sm"
      >
        {children}
      </motion.div>
    </div>
  );
}



/**
 * Componente de Exibição de Erros Amigável
 * 
 * Exibe erros de forma amigável e acionável para o usuário.
 */

"use client";

import React from "react";
import {
  AlertCircle,
  AlertTriangle,
  Info,
  XCircle,
  RefreshCw,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { Button, GlassCard } from "@morina/ui";
import { parseError, type AppError } from "@/lib/errors";
import { getUserFriendlyMessage } from "@/lib/errors/user-messages";
import { cn } from "@/lib/utils";

interface ErrorDisplayProps {
  error: unknown;
  onRetry?: () => void;
  onGoBack?: () => void;
  className?: string;
  variant?: "inline" | "card" | "fullscreen";
  showDetails?: boolean;
}

/**
 * Componente de exibição de erro amigável
 */
export function ErrorDisplay({
  error,
  onRetry,
  onGoBack,
  className,
  variant = "card",
  showDetails = false,
}: ErrorDisplayProps) {
  const appError = parseError(error);
  const friendly = getUserFriendlyMessage(appError);

  // Ícones baseados na severidade
  const iconMap = {
    critical: AlertTriangle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const Icon = iconMap[friendly.severity] || AlertCircle;

  // Cores baseadas na severidade
  const colorMap = {
    critical: "text-red-400 border-red-500/20 bg-red-500/10",
    error: "text-red-400 border-red-500/20 bg-red-500/10",
    warning: "text-yellow-400 border-yellow-500/20 bg-yellow-500/10",
    info: "text-blue-400 border-blue-500/20 bg-blue-500/10",
  };

  const colors = colorMap[friendly.severity] || colorMap.error;

  // Renderizar inline
  if (variant === "inline") {
    return (
      <div className={cn("flex items-start gap-3 rounded-lg border p-4", colors, className)}>
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="flex-1">
          <h4 className="mb-1 font-semibold text-white">{friendly.title}</h4>
          <p className="text-sm text-white/80 whitespace-pre-line">{friendly.message}</p>
          {appError.fields && appError.fields.length > 0 && (
            <ul className="mt-2 list-disc list-inside text-sm text-white/70">
              {appError.fields.map((field, index) => (
                <li key={index}>
                  <strong>{field.field}:</strong> {field.message}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 flex gap-2">
            {onRetry && (
              <Button
                size="sm"
                variant="outline"
                onClick={onRetry}
                className="h-8"
              >
                <RefreshCw className="mr-2 h-3 w-3" />
                Tentar Novamente
              </Button>
            )}
            {onGoBack && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onGoBack}
                className="h-8"
              >
                <ArrowLeft className="mr-2 h-3 w-3" />
                Voltar
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Renderizar card
  if (variant === "card") {
    return (
      <GlassCard className={cn("p-6", className)}>
        <div className="mb-4 flex justify-center">
          <div className={cn("flex h-16 w-16 items-center justify-center rounded-full border-2", colors)}>
            <Icon className="h-8 w-8" />
          </div>
        </div>

        <h2 className="mb-2 text-center text-xl font-bold text-white">
          {friendly.title}
        </h2>

        <p className="mb-6 text-center text-white/70 whitespace-pre-line">
          {friendly.message}
        </p>

        {appError.fields && appError.fields.length > 0 && (
          <div className="mb-6 rounded-lg border border-white/10 bg-white/5 p-4">
            <h3 className="mb-2 text-sm font-semibold text-white">
              Detalhes da Validação:
            </h3>
            <ul className="space-y-1 text-sm text-white/70">
              {appError.fields.map((field, index) => (
                <li key={index} className="flex items-start gap-2">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                  <span>
                    <strong className="text-white">{field.field}:</strong> {field.message}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {showDetails && process.env.NODE_ENV === "development" && (
          <details className="mb-6 rounded-lg border border-white/10 bg-black/20 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-white/70">
              Detalhes Técnicos (Desenvolvimento)
            </summary>
            <div className="mt-2 space-y-2 text-xs text-white/60">
              <div>
                <strong>Código:</strong> {appError.code}
              </div>
              <div>
                <strong>Status:</strong> {appError.statusCode}
              </div>
              <div>
                <strong>Categoria:</strong> {appError.category}
              </div>
              {appError.correlationId && (
                <div>
                  <strong>Correlation ID:</strong> {appError.correlationId}
                </div>
              )}
              {appError.traceId && (
                <div>
                  <strong>Trace ID:</strong> {appError.traceId}
                </div>
              )}
              {appError.stack && (
                <pre className="mt-2 max-h-40 overflow-auto rounded bg-black/40 p-2">
                  {appError.stack}
                </pre>
              )}
            </div>
          </details>
        )}

        <div className="flex justify-center gap-3">
          {onRetry && (
            <Button onClick={onRetry} variant="default" className="min-w-[140px]">
              <RefreshCw className="mr-2 h-4 w-4" />
              {friendly.action || "Tentar Novamente"}
            </Button>
          )}
          {onGoBack && (
            <Button onClick={onGoBack} variant="outline" className="min-w-[140px]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          )}
        </div>
      </GlassCard>
    );
  }

  // Renderizar fullscreen
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <GlassCard className={cn("max-w-2xl p-8", className)}>
        <div className="mb-6 flex justify-center">
          <div className={cn("flex h-20 w-20 items-center justify-center rounded-full border-2", colors)}>
            <Icon className="h-10 w-10" />
          </div>
        </div>

        <h1 className="mb-4 text-center text-2xl font-bold text-white">
          {friendly.title}
        </h1>

        <p className="mb-6 text-center text-white/70 whitespace-pre-line">
          {friendly.message}
        </p>

        {appError.fields && appError.fields.length > 0 && (
          <div className="mb-6 rounded-lg border border-white/10 bg-white/5 p-4">
            <h3 className="mb-3 text-sm font-semibold text-white">
              Campos com Erro:
            </h3>
            <ul className="space-y-2 text-sm text-white/70">
              {appError.fields.map((field, index) => (
                <li key={index} className="flex items-start gap-2">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                  <span>
                    <strong className="text-white">{field.field}:</strong> {field.message}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-center gap-4">
          {onRetry && (
            <Button onClick={onRetry} variant="default" className="min-w-[140px]">
              <RefreshCw className="mr-2 h-4 w-4" />
              {friendly.action || "Tentar Novamente"}
            </Button>
          )}
          {onGoBack && (
            <Button onClick={onGoBack} variant="outline" className="min-w-[140px]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          )}
        </div>
      </GlassCard>
    </div>
  );
}

/**
 * Componente de sucesso (para feedback positivo)
 */
interface SuccessDisplayProps {
  title: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

export function SuccessDisplay({
  title,
  message,
  onClose,
  className,
}: SuccessDisplayProps) {
  return (
    <div className={cn("flex items-start gap-3 rounded-lg border border-green-500/20 bg-green-500/10 p-4", className)}>
      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
      <div className="flex-1">
        <h4 className="mb-1 font-semibold text-white">{title}</h4>
        <p className="text-sm text-white/80">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white"
          aria-label="Fechar"
        >
          ×
        </button>
      )}
    </div>
  );
}


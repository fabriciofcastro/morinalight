/**
 * Error Boundary do React
 * 
 * Captura erros de renderização e exibe uma UI de fallback.
 */

"use client";

import React, { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button, GlassCard } from "@morina/ui";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary Component
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({
      error,
      errorInfo,
    });

    // Log do erro
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Chamar callback se fornecido
    this.props.onError?.(error, errorInfo);

    // Enviar para serviço de monitoramento (ex: Sentry)
    // TODO: Integrar com serviço de monitoramento
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <GlassCard className="max-w-2xl p-8">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-red-500/20 bg-red-500/10">
                <AlertTriangle className="h-10 w-10 text-red-400" />
              </div>
            </div>

            <h1 className="mb-4 text-center text-2xl font-bold text-white">
              Oops! Algo deu errado
            </h1>

            <p className="mb-6 text-center text-white/70">
              Ocorreu um erro inesperado. Por favor, tente recarregar a página
              ou entre em contato com o suporte se o problema persistir.
            </p>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                <p className="mb-2 font-mono text-sm font-semibold text-red-400">
                  {this.state.error.name}: {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <pre className="max-h-64 overflow-auto rounded bg-black/20 p-2 text-xs text-white/60">
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex justify-center gap-4">
              <Button
                onClick={this.handleReset}
                variant="outline"
                className="min-w-[140px]"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Tentar Novamente
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="default"
                className="min-w-[140px]"
              >
                Recarregar Página
              </Button>
            </div>
          </GlassCard>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook para usar Error Boundary funcionalmente
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void,
): React.ComponentType<P> {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback} onError={onError}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}


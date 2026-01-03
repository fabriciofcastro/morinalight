"use client";

import * as React from "react";
import * as Sentry from "@sentry/nextjs";
import { SentryUserFeedback } from "@/components/monitoring/sentry-user-feedback";
import { parseError } from "./error-parser";
import { getUserFriendlyMessage } from "./user-messages";
import { errorTracking } from "./error-tracking";

interface AdvancedErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: (error: Error, reset: () => void) => React.ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    module?: string;
    resetKeys?: unknown[];
    autoResetDelay?: number;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
    resetCount: number;
    lastResetTime?: number;
    eventId?: string; // Sentry Event ID
}

export class AdvancedErrorBoundary extends React.Component<
    AdvancedErrorBoundaryProps,
    ErrorBoundaryState
> {
    private resetTimeout?: NodeJS.Timeout;

    constructor(props: AdvancedErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            resetCount: 0,
        };
        this.reset = this.reset.bind(this);
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        // Enviar para Sentry e obter ID
        const eventId = Sentry.captureException(error, {
            contexts: {
                react: {
                    componentStack: errorInfo.componentStack,
                },
            },
        });

        // Rastrear erro (Analytics interno)
        const appError = parseError(error, false);
        errorTracking
            .trackError(appError, {
                component: "ErrorBoundary",
                module: this.props.module,
                componentStack: errorInfo.componentStack,
                resetCount: this.state.resetCount,
                sentryEventId: eventId,
            })
            .catch(console.error);

        // Atualizar state incluindo eventId
        this.setState({
            errorInfo,
            eventId,
        });

        // Call onError callback if provided
        this.props.onError?.(error, errorInfo);

        // Auto-reset if configured
        if (this.props.autoResetDelay) {
            this.resetTimeout = setTimeout(() => {
                this.reset();
            }, this.props.autoResetDelay);
        }
    }

    componentDidUpdate(prevProps: AdvancedErrorBoundaryProps): void {
        // Reset if resetKeys change
        if (this.props.resetKeys && prevProps.resetKeys) {
            const hasChanged = this.props.resetKeys.some(
                (key, index) => key !== prevProps.resetKeys?.[index]
            );
            if (hasChanged && this.state.hasError) {
                this.reset();
            }
        }
    }

    componentWillUnmount(): void {
        if (this.resetTimeout) {
            clearTimeout(this.resetTimeout);
        }
    }

    private reset = (): void => {
        const now = Date.now();
        const timeSinceLastReset = this.state.lastResetTime
            ? now - this.state.lastResetTime
            : Infinity;

        // Prevent rapid resets (debounce)
        if (timeSinceLastReset < 1000) {
            return;
        }

        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            resetCount: this.state.resetCount + 1,
            lastResetTime: now,
            eventId: undefined,
        });
    };

    render(): React.ReactNode {
        if (this.state.hasError && this.state.error) {
            // Usar fallback customizado se fornecido
            if (this.props.fallback) {
                return this.props.fallback(this.state.error, this.reset);
            }

            // Fallback padrão com suporte a Feedback
            return (
                <DefaultErrorFallback
                    error={this.state.error}
                    resetCount={this.state.resetCount}
                    onReset={this.reset}
                    module={this.props.module}
                    eventId={this.state.eventId}
                />
            );
        }

        return this.props.children;
    }
}

function DefaultErrorFallback({
    error,
    resetCount,
    onReset,
    module,
    eventId,
}: {
    error: Error;
    resetCount: number;
    onReset: () => void;
    module?: string;
    eventId?: string;
}) {
    const appError = parseError(error);
    const friendly = getUserFriendlyMessage(appError);
    const [showFeedback, setShowFeedback] = React.useState(false);

    return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
            <div className="w-full max-w-md rounded-lg border border-red-500/20 bg-red-500/10 p-6 text-center">
                <div className="mb-4 flex justify-center">
                    <div className="rounded-full bg-red-500/20 p-3">
                        <svg
                            className="h-8 w-8 text-red-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                </div>

                <h2 className="mb-2 text-xl font-bold text-red-300">
                    {friendly.title}
                </h2>

                <p className="mb-4 text-sm text-red-200/80">{friendly.message}</p>

                {module && (
                    <p className="mb-4 text-xs text-red-200/60">Módulo: {module}</p>
                )}

                <div className="flex flex-col gap-3 justify-center sm:flex-row">
                    <button
                        onClick={onReset}
                        className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
                    >
                        {resetCount > 0 ? `Tentar Novamente (${resetCount})` : "Tentar Novamente"}
                    </button>

                    {eventId && (
                        <button
                            onClick={() => setShowFeedback(true)}
                            className="rounded-lg border border-red-500/50 px-4 py-2 text-sm font-medium text-red-200 transition-colors hover:bg-red-500/20"
                        >
                            Reportar Problema
                        </button>
                    )}
                </div>

                {process.env.NODE_ENV === "development" && (
                    <details className="mt-4 text-left">
                        <summary className="cursor-pointer text-xs text-red-200/60">
                            Detalhes técnicos {eventId && `(ID: ${eventId})`}
                        </summary>
                        <pre className="mt-2 overflow-auto rounded bg-black/20 p-2 text-xs text-red-200/80">
                            {error.stack}
                        </pre>
                    </details>
                )}
            </div>

            {/* Feedback Dialog */}
            {eventId && showFeedback && (
                <SentryUserFeedback eventId={eventId} onClose={() => setShowFeedback(false)} />
            )}
        </div>
    );
}

// Higher-Order Component wrapper
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    errorBoundaryProps?: Omit<AdvancedErrorBoundaryProps, 'children'>
): React.ComponentType<P> {
    const WrappedComponent = (props: P) => (
        <AdvancedErrorBoundary {...errorBoundaryProps}>
            <Component {...props} />
        </AdvancedErrorBoundary>
    );

    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;

    return WrappedComponent;
}

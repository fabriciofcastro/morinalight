"use client";

import { SentryUserFeedback } from "@/components/monitoring/sentry-user-feedback";
import * as Sentry from "@sentry/nextjs";
import * as React from "react";
import { parseError } from "./error-parser";
import { errorTracking } from "./error-tracking";
import { getUserFriendlyMessage } from "./user-messages";

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
    const [showLog, setShowLog] = React.useState(false);
    const [isResetting, setIsResetting] = React.useState(false);

    const handleCopyReport = () => {
        const report = {
            error: error.message,
            stack: error.stack,
            module: module,
            eventId: eventId,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
        };
        navigator.clipboard.writeText(JSON.stringify(report, null, 2));
        // We could add a toast here but for simplicity we'll just copy
    };

    const handleReset = () => {
        setIsResetting(true);
        setTimeout(() => {
            onReset();
            setIsResetting(false);
        }, 1500); // Animation duration
    };

    return (
        <div className="flex min-h-[500px] flex-col items-center justify-center p-8 bg-black/5 animate-in fade-in duration-700">
            <div className="relative w-full max-w-2xl overflow-hidden bg-[#0a0505]/95 border border-red-500/20 shadow-[0_0_60px_rgba(239,68,68,0.1)] py-10 px-8">
                
                {/* HUD Background Elements */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(239,68,68,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(239,68,68,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent animate-scan" />
                    
                    {/* Corner Brackets */}
                    <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-red-500/40" />
                    <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-red-500/40" />
                    <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-red-500/40" />
                    <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-red-500/40" />
                </div>

                {/* Content */}
                <div className="relative flex flex-col items-center">
                    {/* Header with Warning Sync */}
                    <div className="mb-8 flex flex-col items-center gap-4">
                        <div className="relative">
                           <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl animate-pulse" />
                           <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-red-500/30 bg-red-500/5 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                                <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                           </div>
                        </div>
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-white uppercase tracking-tighter sm:text-3xl">
                                {isResetting ? "Re-inicializando Módulo..." : friendly.title}
                            </h2>
                            <div className="flex items-center justify-center gap-2 mt-1">
                                <div className="h-px w-8 bg-red-500/30" />
                                <span className="text-[10px] font-mono text-red-500/70 tracking-[0.3em] uppercase">Status::Error_Intercepted</span>
                                <div className="h-px w-8 bg-red-500/30" />
                            </div>
                        </div>
                    </div>

                    <p className="mb-8 text-center text-zinc-400 max-w-md leading-relaxed">
                        {isResetting 
                            ? "Tentando restaurar a integridade do sistema e retomar as operações." 
                            : friendly.message}
                    </p>

                    {/* Technical Metadata Mini Hudson */}
                    <div className="mb-8 flex flex-wrap justify-center gap-4 opacity-70">
                        {module && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/10">
                                <span className="text-[10px] font-mono text-white/40 uppercase">Module::</span>
                                <span className="text-[10px] font-mono text-red-400">{module}</span>
                            </div>
                        )}
                        {eventId && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/10">
                                <span className="text-[10px] font-mono text-white/40 uppercase">Event_ID::</span>
                                <span className="text-[10px] font-mono text-amber-500">{eventId}</span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col w-full gap-4 sm:flex-row">
                        <button
                            disabled={isResetting}
                            onClick={handleReset}
                            className={cn(
                                "flex-1 relative group overflow-hidden px-6 py-3 bg-red-600 text-white font-mono uppercase text-xs tracking-widest transition-all",
                                isResetting ? "opacity-50 cursor-not-allowed" : "hover:bg-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                            )}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {isResetting ? (
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                ) : null}
                                {resetCount > 0 ? `Retry_Sequence (${resetCount})` : "Retry_Sequence"}
                            </span>
                        </button>

                        <button
                            disabled={isResetting}
                            onClick={handleCopyReport}
                            className="flex-1 px-6 py-3 border border-white/10 bg-white/[0.03] text-zinc-400 font-mono uppercase text-xs tracking-widest hover:text-white hover:border-white/20 transition-all"
                        >
                            Copy_Diagnostic
                        </button>
                    </div>

                    {/* Secondary Actions */}
                    <div className="mt-8 flex gap-6">
                        <button 
                            onClick={() => setShowLog(!showLog)}
                            className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-2"
                        >
                            {showLog ? "[-] Hide_System_Log" : "[+] Toggle_System_Log"}
                        </button>
                        {eventId && (
                            <button 
                                onClick={() => setShowFeedback(true)}
                                className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                            >
                                Report_Issue::Sentry
                            </button>
                        )}
                    </div>

                    {/* System Log / Tech Details */}
                    <AnimatePresence>
                        {showLog && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="w-full mt-6 overflow-hidden"
                            >
                                <div className="bg-black/50 border border-white/10 p-4 font-mono text-[10px] text-red-500/80 max-h-60 overflow-y-auto custom-scrollbar">
                                    <div className="flex items-center gap-2 mb-2 border-b border-red-500/20 pb-1">
                                        <span className="text-red-500 animate-pulse">●</span>
                                        <span className="uppercase text-white/40">Technical_Trace</span>
                                    </div>
                                    <pre className="whitespace-pre-wrap lowercase opacity-80 leading-relaxed">
                                        {`>> error_caught: ${error.name}\n`}
                                        {`>> message: ${error.message}\n`}
                                        {`>> trace_active: true\n`}
                                        {`>> stack_trace_following:\n`}
                                        {error.stack}
                                    </pre>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
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

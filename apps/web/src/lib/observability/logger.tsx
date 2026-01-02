/**
 * Structured Logging System
 * 
 * Sistema de logging estruturado com níveis, contexto e integração com serviços externos
 */

export enum LogLevel {
    DEBUG = "debug",
    INFO = "info",
    WARN = "warn",
    ERROR = "error",
    FATAL = "fatal",
}

export interface LogContext {
    userId?: string;
    sessionId?: string;
    requestId?: string;
    organizationId?: string;
    [key: string]: any;
}

export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    context?: LogContext;
    error?: {
        name: string;
        message: string;
        stack?: string;
    };
    metadata?: Record<string, any>;
}

/**
 * Logger Class
 */
class Logger {
    private context: LogContext = {};
    private isProduction = process.env.NODE_ENV === "production";

    /**
     * Define contexto global para todos os logs
     */
    setContext(context: LogContext) {
        this.context = { ...this.context, ...context };
    }

    /**
     * Limpa contexto
     */
    clearContext() {
        this.context = {};
    }

    /**
     * Cria entrada de log estruturada
     */
    private createLogEntry(
        level: LogLevel,
        message: string,
        metadata?: Record<string, any>,
        error?: Error,
    ): LogEntry {
        return {
            level,
            message,
            timestamp: new Date().toISOString(),
            context: this.context,
            error: error
                ? {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                }
                : undefined,
            metadata,
        };
    }

    /**
     * Envia log para serviços externos
     */
    private async sendToExternalServices(entry: LogEntry) {
        // Enviar para API de logs
        if (this.isProduction && typeof window !== "undefined") {
            try {
                await fetch("/api/logs", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(entry),
                });
            } catch (error) {
                // Falha silenciosa para não quebrar a aplicação
                console.error("Failed to send log:", error);
            }
        }

        // Integração com Sentry para erros
        if (entry.level === LogLevel.ERROR || entry.level === LogLevel.FATAL) {
            if (typeof window !== "undefined" && (window as any).Sentry) {
                (window as any).Sentry.captureException(entry.error || new Error(entry.message), {
                    level: entry.level === LogLevel.FATAL ? "fatal" : "error",
                    contexts: {
                        custom: entry.context,
                    },
                    extra: entry.metadata,
                });
            }
        }
    }

    /**
     * Formata log para console
     */
    private formatForConsole(entry: LogEntry): string {
        const emoji = {
            [LogLevel.DEBUG]: "🔍",
            [LogLevel.INFO]: "ℹ️",
            [LogLevel.WARN]: "⚠️",
            [LogLevel.ERROR]: "❌",
            [LogLevel.FATAL]: "💀",
        };

        return `${emoji[entry.level]} [${entry.level.toUpperCase()}] ${entry.message}`;
    }

    /**
     * Log genérico
     */
    private log(
        level: LogLevel,
        message: string,
        metadata?: Record<string, any>,
        error?: Error,
    ) {
        const entry = this.createLogEntry(level, message, metadata, error);

        // Console output
        if (process.env.NODE_ENV === "development") {
            const formatted = this.formatForConsole(entry);
            const consoleMethod = level === LogLevel.ERROR || level === LogLevel.FATAL ? "error" : level === LogLevel.WARN ? "warn" : "log";

            console[consoleMethod](formatted);
            if (entry.context && Object.keys(entry.context).length > 0) {
                console.log("  Context:", entry.context);
            }
            if (entry.metadata) {
                console.log("  Metadata:", entry.metadata);
            }
            if (entry.error) {
                console.error("  Error:", entry.error);
            }
        } else {
            // Produção: JSON estruturado
            console.log(JSON.stringify(entry));
        }

        // Enviar para serviços externos
        this.sendToExternalServices(entry);
    }

    /**
     * Métodos públicos
     */
    debug(message: string, metadata?: Record<string, any>) {
        this.log(LogLevel.DEBUG, message, metadata);
    }

    info(message: string, metadata?: Record<string, any>) {
        this.log(LogLevel.INFO, message, metadata);
    }

    warn(message: string, metadata?: Record<string, any>) {
        this.log(LogLevel.WARN, message, metadata);
    }

    error(message: string, error?: Error, metadata?: Record<string, any>) {
        this.log(LogLevel.ERROR, message, metadata, error);
    }

    fatal(message: string, error?: Error, metadata?: Record<string, any>) {
        this.log(LogLevel.FATAL, message, metadata, error);
    }

    /**
     * Log de performance
     */
    performance(operation: string, duration: number, metadata?: Record<string, any>) {
        this.info(`Performance: ${operation}`, {
            ...metadata,
            duration,
            operation,
        });
    }

    /**
     * Log de auditoria
     */
    audit(action: string, metadata?: Record<string, any>) {
        this.info(`Audit: ${action}`, {
            ...metadata,
            action,
            type: "audit",
        });
    }
}

/**
 * Instância singleton do logger
 */
export const logger = new Logger();

/**
 * Hook para usar logger com contexto automático
 */
export function useLogger(componentContext?: Record<string, any>) {
    React.useEffect(() => {
        if (componentContext) {
            logger.setContext(componentContext);
        }
        return () => {
            if (componentContext) {
                logger.clearContext();
            }
        };
    }, [componentContext]);

    return logger;
}

/**
 * HOC para adicionar logging automático
 */
export function withLogging<P extends object>(
    Component: React.ComponentType<P>,
    componentName: string,
) {
    return function LoggedComponent(props: P) {
        React.useEffect(() => {
            logger.debug(`Component mounted: ${componentName}`);
            return () => {
                logger.debug(`Component unmounted: ${componentName}`);
            };
        }, []);

        return <Component {...props} />;
    };
}

import React from "react";

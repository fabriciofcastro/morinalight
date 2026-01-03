/**
 * Contextual Error Handlers
 * 
 * Handlers específicos por módulo com mensagens e ações contextuais
 */

import type { AppError } from "./types";
import { ErrorCode } from "./error-codes";

/**
 * Interface de handler contextual
 */
export interface ContextualErrorHandler {
    module: string;
    handleError: (error: AppError, context?: any) => {
        message: string;
        action?: () => void | Promise<void>;
        actionLabel?: string;
        recoverable: boolean;
        severity: "low" | "medium" | "high" | "critical";
    };
}

/**
 * Handler para módulo de autenticação
 */
export const authErrorHandler: ContextualErrorHandler = {
    module: "auth",
    handleError: (error, context) => {
        switch (error.code) {
            case ErrorCode.INVALID_CREDENTIALS:
            case "INVALID_CREDENTIALS":
                return {
                    message: "🔐 Email ou senha incorretos. Verifique suas credenciais e tente novamente.",
                    action: () => {
                        // Focar no campo de senha
                        document.querySelector<HTMLInputElement>('input[type="password"]')?.focus();
                    },
                    actionLabel: "Tentar Novamente",
                    recoverable: true,
                    severity: "medium",
                };

            case "USER_NOT_FOUND":
                return {
                    message: "👤 Usuário não encontrado. Verifique o email ou crie uma nova conta.",
                    action: () => {
                        if (typeof window !== "undefined") {
                            window.location.href = "/register";
                        }
                    },
                    actionLabel: "Criar Conta",
                    recoverable: true,
                    severity: "medium",
                };

            case "ACCOUNT_LOCKED":
                return {
                    message: "🔒 Sua conta foi bloqueada por segurança. Entre em contato com o suporte.",
                    action: () => {
                        if (typeof window !== "undefined") {
                            window.location.href = "/support";
                        }
                    },
                    actionLabel: "Contatar Suporte",
                    recoverable: false,
                    severity: "high",
                };

            case ErrorCode.SESSION_EXPIRED:
                return {
                    message: "⏱️ Sua sessão expirou. Por favor, faça login novamente.",
                    action: () => {
                        if (typeof window !== "undefined") {
                            window.location.href = "/login";
                        }
                    },
                    actionLabel: "Fazer Login",
                    recoverable: true,
                    severity: "medium",
                };

            default:
                return {
                    message: "❌ Erro de autenticação. Tente novamente.",
                    recoverable: true,
                    severity: "medium",
                };
        }
    },
};

/**
 * Handler para módulo de pagamentos
 */
export const paymentErrorHandler: ContextualErrorHandler = {
    module: "payment",
    handleError: (error, context) => {
        if (error.message.includes("insufficient")) {
            return {
                message: "💳 Saldo insuficiente. Adicione fundos ou use outro método de pagamento.",
                action: async () => {
                    // Abrir modal de pagamento
                    const event = new CustomEvent("open-payment-modal");
                    window.dispatchEvent(event);
                },
                actionLabel: "Adicionar Fundos",
                recoverable: true,
                severity: "high",
            };
        }

        if (error.message.includes("card")) {
            return {
                message: "💳 Erro no cartão. Verifique os dados ou use outro cartão.",
                action: async () => {
                    const event = new CustomEvent("open-card-form");
                    window.dispatchEvent(event);
                },
                actionLabel: "Alterar Cartão",
                recoverable: true,
                severity: "high",
            };
        }

        return {
            message: "💰 Erro no processamento do pagamento. Tente novamente.",
            recoverable: true,
            severity: "high",
        };
    },
};

/**
 * Handler para módulo de upload
 */
export const uploadErrorHandler: ContextualErrorHandler = {
    module: "upload",
    handleError: (error, context) => {
        if (error.message.includes("size") || error.message.includes("large")) {
            return {
                message: `📦 Arquivo muito grande. Tamanho máximo: ${context?.maxSize || "10MB"}`,
                recoverable: true,
                severity: "medium",
            };
        }

        if (error.message.includes("type") || error.message.includes("format")) {
            return {
                message: `📄 Formato não suportado. Formatos aceitos: ${context?.allowedTypes?.join(", ") || "PDF, JPG, PNG"}`,
                recoverable: true,
                severity: "medium",
            };
        }

        return {
            message: "📤 Erro no upload. Verifique o arquivo e tente novamente.",
            recoverable: true,
            severity: "medium",
        };
    },
};

/**
 * Handler para módulo de API
 */
export const apiErrorHandler: ContextualErrorHandler = {
    module: "api",
    handleError: (error, context) => {
        if (error.statusCode === 429) {
            return {
                message: "⏸️ Muitas requisições. Aguarde alguns instantes antes de tentar novamente.",
                recoverable: true,
                severity: "medium",
            };
        }

        if (error.statusCode >= 500) {
            return {
                message: "🔧 Erro no servidor. Nossa equipe foi notificada. Tente novamente em alguns instantes.",
                action: async () => {
                    // Retry após 5 segundos
                    await new Promise((resolve) => setTimeout(resolve, 5000));
                    window.location.reload();
                },
                actionLabel: "Recarregar Página",
                recoverable: true,
                severity: "high",
            };
        }

        return {
            message: "🌐 Erro na comunicação com o servidor. Verifique sua conexão.",
            recoverable: true,
            severity: "medium",
        };
    },
};

/**
 * Handler para módulo de formulários
 */
export const formErrorHandler: ContextualErrorHandler = {
    module: "form",
    handleError: (error, context) => {
        if (error.fields && error.fields.length > 0) {
            const fieldNames = error.fields.map((f) => f.field).join(", ");
            return {
                message: `📝 Campos inválidos: ${fieldNames}. Corrija e tente novamente.`,
                action: () => {
                    // Focar no primeiro campo com erro
                    const firstField = error.fields![0].field;
                    const input = document.querySelector<HTMLInputElement>(`[name="${firstField}"]`);
                    input?.focus();
                },
                actionLabel: "Corrigir",
                recoverable: true,
                severity: "low",
            };
        }

        return {
            message: "📋 Erro no formulário. Verifique os dados e tente novamente.",
            recoverable: true,
            severity: "low",
        };
    },
};

/**
 * Gerenciador de handlers contextuais
 */
export class ContextualHandlerManager {
    private handlers = new Map<string, ContextualErrorHandler>();

    constructor() {
        // Registrar handlers padrão
        this.registerHandler(authErrorHandler);
        this.registerHandler(paymentErrorHandler);
        this.registerHandler(uploadErrorHandler);
        this.registerHandler(apiErrorHandler);
        this.registerHandler(formErrorHandler);
    }

    registerHandler(handler: ContextualErrorHandler): void {
        this.handlers.set(handler.module, handler);
    }

    getHandler(module: string): ContextualErrorHandler | undefined {
        return this.handlers.get(module);
    }

    handleError(
        error: AppError,
        module: string,
        context?: any,
    ): ReturnType<ContextualErrorHandler["handleError"]> {
        const handler = this.handlers.get(module);

        if (handler) {
            return handler.handleError(error, context);
        }

        // Handler genérico
        return {
            message: error.message || "Ocorreu um erro. Tente novamente.",
            recoverable: error.isRetryable,
            severity: error.severity === "critical" ? "critical" : "medium",
        };
    }

    listHandlers(): string[] {
        return Array.from(this.handlers.keys());
    }
}

/**
 * Instância global do gerenciador
 */
export const contextualHandlerManager = new ContextualHandlerManager();

/**
 * Hook React para handlers contextuais
 */
export function useContextualErrorHandler(module: string) {
    const handleError = React.useCallback(
        (error: AppError, context?: any) => {
            return contextualHandlerManager.handleError(error, module, context);
        },
        [module],
    );

    return { handleError };
}

import React from "react";

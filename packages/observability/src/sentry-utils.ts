/**
 * Sentry Utilities
 * Funções compartilhadas para limpeza de dados e normalização
 */

/**
 * Remove dados sensíveis de objetos antes de enviar para o Sentry
 * Útil para LGPD compliance
 */
export function scrubSensitiveData(event: any) {
    if (!event) return event;

    // Clonar para evitar mutação do original se necessário (o sdk do sentry geralmente já faz isso, mas por segurança)
    const scrubbed = { ...event };

    if (scrubbed.request) {
        // Limpar headers sensíveis
        if (scrubbed.request.headers) {
            const sensitiveHeaders = ["authorization", "cookie", "x-api-key", "password"];
            Object.keys(scrubbed.request.headers).forEach((header) => {
                if (sensitiveHeaders.some(h => header.toLowerCase().includes(h))) {
                    scrubbed.request.headers[header] = "[REDACTED]";
                }
            });
        }

        // Limpar body se contiver campos sensíveis conhecidos
        if (scrubbed.request.data) {
            scrubbed.request.data = sanitizeObject(scrubbed.request.data);
        }
    }

    return scrubbed;
}

function sanitizeObject(obj: any): any {
    if (!obj) return obj;
    if (typeof obj !== "object") return obj;

    const sensitiveKeys = [
        "password",
        "token",
        "secret",
        "credit_card",
        "cpf",
        "rg",
        "phone"
    ];

    if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
    }

    const newObj = { ...obj };
    Object.keys(newObj).forEach((key) => {
        if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
            newObj[key] = "[REDACTED]";
        } else if (typeof newObj[key] === "object") {
            newObj[key] = sanitizeObject(newObj[key]);
        }
    });

    return newObj;
}

/**
 * Normaliza erros para garantir que sempre sejam objetos Error válidos
 */
export function normalizeError(error: any): Error {
    if (error instanceof Error) {
        return error;
    }

    if (typeof error === "string") {
        return new Error(error);
    }

    if (typeof error === "object" && error !== null && "message" in error) {
        const err = new Error(error.message);
        if (error.stack) err.stack = error.stack;
        return err;
    }

    try {
        return new Error(JSON.stringify(error));
    } catch {
        return new Error("Unknown error occurred");
    }
}

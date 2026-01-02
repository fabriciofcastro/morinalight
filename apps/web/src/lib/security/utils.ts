/**
 * Security Utilities
 * 
 * Funções utilitárias de segurança
 */

/**
 * Sanitizar input para prevenir XSS
 */
export function sanitizeInput(input: string): string {
    return input
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/\//g, "&#x2F;");
}

/**
 * Validar email
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validar senha forte
 */
export function isStrongPassword(password: string): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push("Senha deve ter no mínimo 8 caracteres");
    }

    if (!/[a-z]/.test(password)) {
        errors.push("Senha deve conter letras minúsculas");
    }

    if (!/[A-Z]/.test(password)) {
        errors.push("Senha deve conter letras maiúsculas");
    }

    if (!/[0-9]/.test(password)) {
        errors.push("Senha deve conter números");
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push("Senha deve conter caracteres especiais");
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Gerar hash seguro (client-side)
 */
export async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

/**
 * Validar URL segura
 */
export function isSecureURL(url: string): boolean {
    try {
        const parsed = new URL(url);
        return parsed.protocol === "https:" || parsed.protocol === "http:";
    } catch {
        return false;
    }
}

/**
 * Remover dados sensíveis de objetos
 */
export function sanitizeObject<T extends Record<string, any>>(
    obj: T,
    sensitiveKeys: string[] = ["password", "token", "secret", "apiKey"],
): T {
    const sanitized = { ...obj };

    for (const key of sensitiveKeys) {
        if (key in sanitized) {
            sanitized[key] = "***REDACTED***";
        }
    }

    return sanitized;
}

/**
 * Gerar ID aleatório seguro
 */
export function generateSecureId(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Verificar se está em ambiente seguro (HTTPS)
 */
export function isSecureContext(): boolean {
    if (typeof window === "undefined") return true;
    return window.isSecureContext;
}

/**
 * Constant-time string comparison
 */
export function constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
        return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
}

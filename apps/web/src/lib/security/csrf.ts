/**
 * CSRF Protection
 * 
 * Sistema de proteção contra Cross-Site Request Forgery
 */

import { randomBytes } from "crypto";

/**
 * Gerar token CSRF
 */
export function generateCSRFToken(): string {
    return randomBytes(32).toString("hex");
}

/**
 * Validar token CSRF
 */
export function validateCSRFToken(token: string, sessionToken: string): boolean {
    if (!token || !sessionToken) {
        return false;
    }

    // Comparação constant-time para prevenir timing attacks
    if (token.length !== sessionToken.length) {
        return false;
    }

    let result = 0;
    for (let i = 0; i < token.length; i++) {
        result |= token.charCodeAt(i) ^ sessionToken.charCodeAt(i);
    }

    return result === 0;
}

/**
 * Middleware CSRF para API routes
 */
export function withCSRFProtection(handler: any) {
    return async (req: any, res: any) => {
        // Apenas para métodos que modificam dados
        if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
            const token = req.headers["x-csrf-token"];
            const sessionToken = req.cookies["csrf-token"];

            if (!validateCSRFToken(token, sessionToken)) {
                return res.status(403).json({
                    error: "CSRF_TOKEN_INVALID",
                    message: "Invalid CSRF token",
                });
            }
        }

        return handler(req, res);
    };
}

/**
 * Hook React para obter CSRF token
 */
export function useCSRFToken() {
    const [token, setToken] = React.useState<string>("");

    React.useEffect(() => {
        // Obter token do cookie
        const cookies = document.cookie.split(";");
        const csrfCookie = cookies.find((c) => c.trim().startsWith("csrf-token="));

        if (csrfCookie) {
            const value = csrfCookie.split("=")[1];
            setToken(value);
        } else {
            // Solicitar novo token
            fetch("/api/auth/csrf")
                .then((res) => res.json())
                .then((data) => setToken(data.token))
                .catch(console.error);
        }
    }, []);

    return token;
}

/**
 * Adicionar CSRF token aos headers do axios
 */
export function setupCSRFInterceptor(axiosInstance: any) {
    axiosInstance.interceptors.request.use((config: any) => {
        // Obter token do cookie
        const cookies = document.cookie.split(";");
        const csrfCookie = cookies.find((c) => c.trim().startsWith("csrf-token="));

        if (csrfCookie && ["post", "put", "patch", "delete"].includes(config.method?.toLowerCase())) {
            const token = csrfCookie.split("=")[1];
            config.headers["x-csrf-token"] = token;
        }

        return config;
    });
}

import React from "react";

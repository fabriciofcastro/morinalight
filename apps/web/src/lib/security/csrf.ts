/**
 * CSRF Protection
 * 
 * Sistema de proteção contra Cross-Site Request Forgery
 */

import { CookieService } from "@/shared/kernel/utils/cookie-service";
import { randomBytes } from "crypto";
import React from "react";

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
    if (!token || !sessionToken || typeof token !== 'string' || typeof sessionToken !== 'string') {
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
        // Obter token do CookieService
        const csrfToken = CookieService.get("csrf-token");

        if (csrfToken) {
            setToken(csrfToken);
        } else {
            // Solicitar novo token
            fetch("/api/auth/csrf")
                .then((res) => res.json())
                .then((data) => {
                  setToken(data.token);
                  // Opcional: O backend geralmente seta o cookie via Set-Cookie,
                  // mas se precisarmos setar manualmente no cliente para testes:
                  // CookieService.set("csrf-token", data.token);
                })
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
        // Obter token do CookieService
        const csrfToken = CookieService.get("csrf-token");

        if (csrfToken && ["post", "put", "patch", "delete"].includes(config.method?.toLowerCase())) {
            config.headers["x-csrf-token"] = csrfToken;
        }

        return config;
    });
}


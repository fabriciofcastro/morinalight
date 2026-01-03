/**
 * Rate Limiting
 * 
 * Sistema de rate limiting para prevenir abuso de APIs
 */

/**
 * Configuração de rate limit
 */
export interface RateLimitConfig {
    /**
     * Número máximo de requisições
     */
    maxRequests: number;

    /**
     * Janela de tempo em milissegundos
     */
    windowMs: number;

    /**
     * Mensagem de erro customizada
     */
    message?: string;

    /**
     * Chave para identificar o cliente (IP, user ID, etc)
     */
    keyGenerator?: (req: any) => string;
}

/**
 * Store de rate limits
 */
class RateLimitStore {
    private store = new Map<string, { count: number; resetTime: number }>();

    /**
     * Incrementar contador
     */
    increment(key: string, windowMs: number): { count: number; resetTime: number } {
        const now = Date.now();
        const existing = this.store.get(key);

        if (existing && existing.resetTime > now) {
            // Dentro da janela, incrementar
            existing.count++;
            return existing;
        } else {
            // Nova janela
            const entry = {
                count: 1,
                resetTime: now + windowMs,
            };
            this.store.set(key, entry);
            return entry;
        }
    }

    /**
     * Resetar contador
     */
    reset(key: string): void {
        this.store.delete(key);
    }

    /**
     * Limpar entradas expiradas
     */
    cleanup(): void {
        const now = Date.now();
        for (const [key, value] of this.store.entries()) {
            if (value.resetTime <= now) {
                this.store.delete(key);
            }
        }
    }
}

const store = new RateLimitStore();

// Cleanup a cada minuto
if (typeof window === "undefined") {
    setInterval(() => store.cleanup(), 60000);
}

/**
 * Middleware de rate limiting
 */
export function rateLimit(config: RateLimitConfig) {
    const {
        maxRequests,
        windowMs,
        message = "Too many requests, please try again later",
        keyGenerator = (req) => req.ip || req.headers["x-forwarded-for"] || "unknown",
    } = config;

    return async (req: any, res: any, next?: any) => {
        const key = keyGenerator(req);
        const { count, resetTime } = store.increment(key, windowMs);

        // Adicionar headers de rate limit
        res.setHeader("X-RateLimit-Limit", maxRequests.toString());
        res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - count).toString());
        res.setHeader("X-RateLimit-Reset", new Date(resetTime).toISOString());

        if (count > maxRequests) {
            const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
            res.setHeader("Retry-After", retryAfter.toString());

            return res.status(429).json({
                error: "RATE_LIMIT_EXCEEDED",
                message,
                retryAfter,
            });
        }

        if (next) {
            return next();
        }
    };
}

/**
 * Rate limiters pré-configurados
 */
export const RateLimiters = {
    /**
     * Rate limit estrito para login (5 tentativas por 15 minutos)
     */
    login: rateLimit({
        maxRequests: 5,
        windowMs: 15 * 60 * 1000,
        message: "Muitas tentativas de login. Tente novamente em 15 minutos.",
    }),

    /**
     * Rate limit para APIs gerais (100 requisições por minuto)
     */
    api: rateLimit({
        maxRequests: 100,
        windowMs: 60 * 1000,
        message: "Limite de requisições excedido. Tente novamente em breve.",
    }),

    /**
     * Rate limit para criação de recursos (10 por minuto)
     */
    create: rateLimit({
        maxRequests: 10,
        windowMs: 60 * 1000,
        message: "Limite de criações excedido. Aguarde um momento.",
    }),

    /**
     * Rate limit para uploads (5 por minuto)
     */
    upload: rateLimit({
        maxRequests: 5,
        windowMs: 60 * 1000,
        message: "Limite de uploads excedido. Aguarde um momento.",
    }),

    /**
     * Rate limit para busca (30 por minuto)
     */
    search: rateLimit({
        maxRequests: 30,
        windowMs: 60 * 1000,
        message: "Muitas buscas. Aguarde um momento.",
    }),
};

/**
 * Rate limiter client-side
 */
export class ClientRateLimiter {
    private attempts = new Map<string, number[]>();

    /**
     * Verificar se pode fazer requisição
     */
    canAttempt(key: string, maxAttempts: number, windowMs: number): boolean {
        const now = Date.now();
        const attempts = this.attempts.get(key) || [];

        // Filtrar tentativas dentro da janela
        const recentAttempts = attempts.filter((time) => now - time < windowMs);

        if (recentAttempts.length >= maxAttempts) {
            return false;
        }

        // Adicionar nova tentativa
        recentAttempts.push(now);
        this.attempts.set(key, recentAttempts);

        return true;
    }

    /**
     * Resetar tentativas
     */
    reset(key: string): void {
        this.attempts.delete(key);
    }

    /**
     * Obter tempo restante até poder tentar novamente
     */
    getRetryAfter(key: string, maxAttempts: number, windowMs: number): number {
        const attempts = this.attempts.get(key) || [];
        if (attempts.length < maxAttempts) {
            return 0;
        }

        const oldestAttempt = Math.min(...attempts);
        const retryTime = oldestAttempt + windowMs;
        return Math.max(0, retryTime - Date.now());
    }
}

/**
 * Hook React para rate limiting client-side
 */
export function useRateLimit(key: string, maxAttempts: number, windowMs: number) {
    const limiterRef = React.useRef(new ClientRateLimiter());

    const canAttempt = React.useCallback(() => {
        return limiterRef.current.canAttempt(key, maxAttempts, windowMs);
    }, [key, maxAttempts, windowMs]);

    const reset = React.useCallback(() => {
        limiterRef.current.reset(key);
    }, [key]);

    const getRetryAfter = React.useCallback(() => {
        return limiterRef.current.getRetryAfter(key, maxAttempts, windowMs);
    }, [key, maxAttempts, windowMs]);

    return { canAttempt, reset, getRetryAfter };
}

import React from "react";

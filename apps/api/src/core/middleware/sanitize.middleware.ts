/**
 * Sanitização de Inputs
 * Protege contra XSS e injeção de código
 */

import type { FastifyRequest } from "fastify";

/**
 * Sanitiza string removendo tags HTML e caracteres perigosos
 */
export function sanitizeString(input: string): string {
  if (typeof input !== "string") return input;

  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove scripts
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "") // Remove iframes
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Remove event handlers (onclick, onerror, etc.)
    .replace(/<[^>]+>/g, "") // Remove todas as tags HTML
    .trim();
}

/**
 * Sanitiza objeto recursivamente
 */
export function sanitizeObject<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === "string") {
    return sanitizeString(obj) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as T;
  }

  if (typeof obj === "object") {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized as T;
  }

  return obj;
}

/**
 * Middleware para sanitizar body, query e params
 */
export async function sanitizeInputs(request: FastifyRequest) {
  // Sanitizar body
  if (request.body && typeof request.body === "object") {
    request.body = sanitizeObject(request.body);
  }

  // Sanitizar query
  if (request.query && typeof request.query === "object") {
    request.query = sanitizeObject(request.query) as any;
  }

  // Sanitizar params
  if (request.params && typeof request.params === "object") {
    request.params = sanitizeObject(request.params) as any;
  }
}

/**
 * Valida e sanitiza email
 */
export function sanitizeEmail(email: string): string | null {
  if (!email || typeof email !== "string") return null;
  const sanitized = email.trim().toLowerCase();
  // Validar formato básico
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized)) {
    return null;
  }
  return sanitized;
}

/**
 * Valida e sanitiza URL
 */
export function sanitizeUrl(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  const sanitized = url.trim();
  try {
    const parsed = new URL(sanitized);
    // Permitir apenas http e https
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

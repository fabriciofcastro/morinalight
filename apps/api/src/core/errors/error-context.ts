/**
 * Sistema de Contextualização Avançada de Erros
 * 
 * Captura contexto rico para debug e análise.
 */

import type { FastifyRequest } from "fastify";
import type { AppError } from "./app-error";
import type { ErrorCorrelationContext } from "./error-correlation";

/**
 * Contexto rico de erro
 */
export interface RichErrorContext {
  // Contexto básico
  correlation: ErrorCorrelationContext;
  
  // Request context
  request: {
    method: string;
    url: string;
    path: string;
    query: Record<string, unknown>;
    params: Record<string, unknown>;
    headers: Record<string, string>;
    body?: unknown;
    ip: string;
    userAgent?: string;
  };

  // User context
  user?: {
    id: string;
    email?: string;
    role?: string;
    permissions?: string[];
  };

  // Application context
  application: {
    version: string;
    environment: string;
    service: string;
    region?: string;
  };

  // Performance context
  performance?: {
    requestDuration: number;
    memoryUsage: number;
    cpuUsage?: number;
  };

  // Business context
  business?: {
    orgId?: string;
    tenantId?: string;
    feature?: string;
    action?: string;
  };

  // Stack trace
  stack?: string;
  
  // Breadcrumbs (user actions leading to error)
  breadcrumbs: Array<{
    timestamp: number;
    category: string;
    message: string;
    data?: Record<string, unknown>;
  }>;
}

/**
 * Gerenciador de contexto de erros
 */
export class ErrorContextManager {
  private static breadcrumbs = new Map<string, Array<RichErrorContext["breadcrumbs"][0]>>();
  private static readonly MAX_BREADCRUMBS = 50;

  /**
   * Adicionar breadcrumb
   */
  static addBreadcrumb(
    correlationId: string,
    category: string,
    message: string,
    data?: Record<string, unknown>,
  ): void {
    const breadcrumbs = this.breadcrumbs.get(correlationId) || [];
    breadcrumbs.push({
      timestamp: Date.now(),
      category,
      message,
      data,
    });

    // Limitar número de breadcrumbs
    if (breadcrumbs.length > this.MAX_BREADCRUMBS) {
      breadcrumbs.shift();
    }

    this.breadcrumbs.set(correlationId, breadcrumbs);
  }

  /**
   * Enriquecer erro com contexto
   */
  static enrichError(
    error: AppError,
    request: FastifyRequest,
    correlationContext: ErrorCorrelationContext,
  ): RichErrorContext {
    const breadcrumbs = this.breadcrumbs.get(
      correlationContext.correlationId,
    ) || [];

    // Limpar breadcrumbs após uso
    this.breadcrumbs.delete(correlationContext.correlationId);

    return {
      correlation: correlationContext,
      request: {
        method: request.method,
        url: request.url,
        path: request.routerPath || request.url.split("?")[0],
        query: request.query as Record<string, unknown>,
        params: request.params as Record<string, unknown>,
        headers: this.sanitizeHeaders(request.headers as Record<string, string>),
        body: this.sanitizeBody(request.body),
        ip: request.ip,
        userAgent: request.headers["user-agent"],
      },
      user: request.user
        ? {
            id: (request.user as { userId: string }).userId,
            email: (request.user as { email?: string }).email,
            role: (request.user as { role?: string }).role,
            permissions: (request.user as { permissions?: string[] }).permissions,
          }
        : undefined,
      application: {
        version: process.env.APP_VERSION || "unknown",
        environment: process.env.NODE_ENV || "development",
        service: "morina-api",
        region: process.env.AWS_REGION,
      },
      performance: {
        requestDuration: request.metrics?.start
          ? Number(process.hrtime.bigint() - request.metrics.start) / 1e9
          : 0,
        memoryUsage: process.memoryUsage().heapUsed,
      },
      business: {
        orgId: correlationContext.orgId,
        tenantId: correlationContext.orgId,
      },
      stack: error.stack,
      breadcrumbs,
    };
  }

  /**
   * Sanitizar headers (remover sensíveis)
   */
  private static sanitizeHeaders(
    headers: Record<string, string>,
  ): Record<string, string> {
    const sensitive = ["authorization", "cookie", "x-api-key", "x-auth-token"];
    const sanitized = { ...headers };

    for (const key of sensitive) {
      if (sanitized[key]) {
        sanitized[key] = "[REDACTED]";
      }
    }

    return sanitized;
  }

  /**
   * Sanitizar body (remover sensíveis)
   */
  private static sanitizeBody(body: unknown): unknown {
    if (!body || typeof body !== "object") {
      return body;
    }

    const sensitive = ["password", "token", "secret", "apiKey", "creditCard"];
    const sanitized = { ...body } as Record<string, unknown>;

    for (const key of Object.keys(sanitized)) {
      if (
        sensitive.some((s) => key.toLowerCase().includes(s.toLowerCase()))
      ) {
        sanitized[key] = "[REDACTED]";
      }
    }

    return sanitized;
  }

  /**
   * Limpar breadcrumbs antigos
   */
  static cleanup(maxAge: number = 3600000): void {
    const now = Date.now();
    for (const [correlationId, breadcrumbs] of this.breadcrumbs.entries()) {
      const oldest = breadcrumbs[0]?.timestamp || now;
      if (now - oldest > maxAge) {
        this.breadcrumbs.delete(correlationId);
      }
    }
  }
}






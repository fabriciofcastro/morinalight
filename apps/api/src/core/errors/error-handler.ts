import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { env } from "../config/env";
import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  DatabaseError,
  NotFoundError,
  RateLimitError,
  ValidationError,
} from "./app-error";
import { ErrorAnalyticsManager } from "./error-analytics";
import { ErrorContextManager } from "./error-context";
import { ErrorCorrelationManager } from "./error-correlation";
import { ErrorMetricsManager } from "./error-metrics";
import { ErrorNotificationManager } from "./error-notification";
import { ErrorPreventionManager } from "./error-prevention";

/**
 * Determine if error should be logged
 */
function shouldLogError(error: unknown): boolean {
  if (error instanceof AppError) {
    return !error.isOperational || env.NODE_ENV === "development";
  }
  return true;
}

/**
 * Sanitize error for production responses
 */
function sanitizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof ZodError) {
    const fields = error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    return new ValidationError("Validation failed", fields);
  }

  // Handle Prisma errors
  if (error && typeof error === "object" && "code" in error) {
    const prismaError = error as { code: string; meta?: Record<string, unknown> };

    switch (prismaError.code) {
      case "P2002":
        return new ConflictError("Resource already exists", { field: prismaError.meta?.target });
      case "P2025":
        return new NotFoundError("Resource", String(prismaError.meta?.cause));
      case "P2003":
        return new ValidationError("Foreign key constraint failed");
      case "P2014":
        return new ConflictError("Required relation missing");
      default:
        return new DatabaseError(
          "Database operation failed",
          error instanceof Error ? error : new Error(String(error)),
        );
    }
  }

  // Handle Fastify errors
  if (error && typeof error === "object" && "statusCode" in error) {
    const fastifyError = error as FastifyError;
    if (fastifyError.statusCode === 401) {
      return new AuthenticationError(fastifyError.message);
    }
    if (fastifyError.statusCode === 403) {
      return new AuthorizationError(fastifyError.message);
    }
    if (fastifyError.statusCode === 404) {
      return new NotFoundError("Resource");
    }
    if (fastifyError.statusCode === 409) {
      return new ConflictError(fastifyError.message);
    }
    if (fastifyError.statusCode === 429) {
      const retryAfter = (fastifyError as { retryAfter?: number }).retryAfter || 60;
      return new RateLimitError(retryAfter, fastifyError.message);
    }
  }

  // Generic error
  return new AppError(
    "INTERNAL_ERROR",
    env.NODE_ENV === "production" ? "An internal error occurred" : String(error),
    500,
    { isOperational: false, cause: error as Error },
  );
}

/**
 * Generate request ID for tracing
 */
function getRequestId(request: FastifyRequest): string {
  return (
    (request.id as string) ||
    (request.headers["x-request-id"] as string) ||
    `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  );
}

/**
 * Global error handler for Fastify
 */
export async function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const requestId = getRequestId(request);
  const sanitizedError = sanitizeError(error);

  // Extrair contexto de correlação
  const correlationContext = ErrorCorrelationManager.extractFromRequest(request);

  // Verificar prevenção de erros
  const prevention = ErrorPreventionManager.shouldPrevent(sanitizedError, {
    method: request.method,
    url: request.url,
    orgId: correlationContext.orgId,
    userId: correlationContext.userId,
  });

  if (prevention.prevent && prevention.action === "block") {
    reply.status(429).send({
      error: {
        code: "REQUEST_BLOCKED",
        message: "Request blocked due to error pattern detection",
        reason: prevention.reason,
      },
    });
    return;
  }

  // Registrar para analytics
  ErrorAnalyticsManager.recordError(sanitizedError, correlationContext);
  ErrorPreventionManager.recordErrorOccurrence(sanitizedError, {
    method: request.method,
    url: request.url,
    orgId: correlationContext.orgId,
  });

  // Enriquecer erro com contexto de correlação
  const errorWithContext = ErrorCorrelationManager.enrichError(sanitizedError, correlationContext);

  // Enriquecer com contexto rico
  const richContext = ErrorContextManager.enrichError(
    errorWithContext,
    request,
    correlationContext,
  );

  // Adicionar contexto adicional da requisição
  const enrichedError = new AppError(
    errorWithContext.code,
    errorWithContext.message,
    errorWithContext.statusCode,
    {
      isOperational: errorWithContext.isOperational,
      context: {
        ...errorWithContext.context,
        requestId,
        method: request.method,
        url: request.url,
        ip: request.ip,
        userAgent: request.headers["user-agent"],
      },
      cause: errorWithContext.cause,
    },
  );

  // Calcular duração da requisição se disponível
  const requestDuration = request.metrics?.start
    ? Number(process.hrtime.bigint() - request.metrics.start) / 1e9
    : undefined;

  // Registrar métricas
  ErrorMetricsManager.recordError(enrichedError, correlationContext, requestDuration);

  // Notificar sobre erros críticos
  if (enrichedError.statusCode >= 500 || !enrichedError.isOperational) {
    await ErrorNotificationManager.notify(enrichedError, correlationContext).catch(
      (notificationError) => {
        // Não falhar se a notificação falhar
        request.log.warn({ err: notificationError }, "Failed to send error notification");
      },
    );
  }

  // Log error if necessary
  if (shouldLogError(error)) {
    const logLevel = enrichedError.statusCode >= 500 ? "error" : "warn";

    request.log[logLevel](
      {
        err: enrichedError,
        requestId,
        correlationId: correlationContext.correlationId,
        traceId: correlationContext.traceId,
        spanId: correlationContext.spanId,
        statusCode: enrichedError.statusCode,
        code: enrichedError.code,
        ...enrichedError.context,
      },
      enrichedError.message,
    );

    // Log stack trace in development or for non-operational errors
    if (env.NODE_ENV === "development" || !enrichedError.isOperational) {
      if (error instanceof Error && error.stack) {
        request.log.debug({ stack: error.stack }, "Error stack trace");
      }
      if (
        enrichedError.cause &&
        enrichedError.cause instanceof Error &&
        enrichedError.cause.stack
      ) {
        request.log.debug({ stack: enrichedError.cause.stack }, "Caused by");
      }
    }
  }

  // Adicionar headers de correlação e request ID
  const correlationHeaders = ErrorCorrelationManager.toHeaders(correlationContext);
  for (const [key, value] of Object.entries(correlationHeaders)) {
    reply.header(key, value);
  }
  reply.header("X-Request-ID", requestId);

  // Send error response
  const statusCode = enrichedError.statusCode;
  const body = enrichedError.toJSON();

  // Strict Contract Compliance: Inject traceId at top level
  if (body.error) {
    (body.error as any).traceId = correlationContext.traceId || requestId;
  }

  // Add retry-after header for rate limit errors
  if (enrichedError instanceof RateLimitError) {
    reply.header("Retry-After", enrichedError.retryAfter);
  }

  reply.status(statusCode).send(body);
}

/**
 * Handle not found routes
 */
export async function notFoundHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const requestId = getRequestId(request);
  const error = new NotFoundError("Route", request.url);

  reply.header("X-Request-ID", requestId);
  reply.status(404).send({
    error: {
      code: error.code,
      message: error.message,
      path: request.url,
      method: request.method,
    },
  });
}

/**
 * Async error wrapper to catch and handle errors in async route handlers
 */
export function asyncHandler<T extends Array<unknown>>(
  fn: (...args: T) => Promise<unknown>,
): (...args: T) => Promise<unknown> {
  return async (...args: T) => {
    try {
      return await fn(...args);
    } catch (error) {
      // Re-throw to be caught by error handler
      throw error;
    }
  };
}

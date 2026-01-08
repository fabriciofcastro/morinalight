/**
 * Logger Helper
 * Utilitários para logging contextualizado
 */

import type { FastifyLoggerInstance, FastifyRequest } from "fastify";

/**
 * Obtém logger contextualizado do request
 */
export function getContextualLogger(request: FastifyRequest): FastifyLoggerInstance {
  return request.log;
}

/**
 * Cria um logger filho com contexto adicional
 */
export function createChildLogger(
  logger: FastifyLoggerInstance,
  context: Record<string, unknown>,
): FastifyLoggerInstance {
  return logger.child(context);
}

/**
 * Log estruturado com contexto padrão
 */
export function logWithContext(
  logger: FastifyLoggerInstance,
  level: "info" | "warn" | "error" | "debug",
  message: string,
  context?: Record<string, unknown>,
): void {
  logger[level](context || {}, message);
}

/**
 * Log de erro estruturado
 */
export function logError(
  logger: FastifyLoggerInstance,
  error: Error | unknown,
  context?: Record<string, unknown>,
): void {
  const errorContext = {
    ...context,
    error: {
      name: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    },
  };

  logger.error(errorContext, error instanceof Error ? error.message : String(error));
}

/**
 * Log de operação de negócio
 */
export function logBusinessOperation(
  logger: FastifyLoggerInstance,
  operation: string,
  entityType: string,
  entityId: string,
  action: string,
  context?: Record<string, unknown>,
): void {
  logger.info(
    {
      ...context,
      type: "business_operation",
      operation,
      entityType,
      entityId,
      action,
    },
    `${operation}: ${action} ${entityType} ${entityId}`,
  );
}

/**
 * Log de acesso/permissão
 */
export function logAccess(
  logger: FastifyLoggerInstance,
  resource: string,
  action: string,
  granted: boolean,
  reason?: string,
  context?: Record<string, unknown>,
): void {
  logger.info(
    {
      ...context,
      type: "access_control",
      resource,
      action,
      granted,
      reason,
    },
    `Access ${granted ? "granted" : "denied"}: ${action} on ${resource}${reason ? ` - ${reason}` : ""}`,
  );
}

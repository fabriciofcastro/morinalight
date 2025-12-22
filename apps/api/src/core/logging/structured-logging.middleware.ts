/**
 * Structured Logging Middleware
 * Adiciona contexto estruturado (requestId, userId, orgId) aos logs
 */

import type { FastifyRequest, FastifyReply } from "fastify";
import { randomUUID } from "node:crypto";

declare module "fastify" {
  interface FastifyRequest {
    requestId?: string;
    logContext?: {
      requestId: string;
      userId?: string;
      orgId?: string;
      method: string;
      url: string;
      ip?: string;
      userAgent?: string;
    };
  }
}

/**
 * Middleware para adicionar contexto estruturado aos logs
 */
export async function structuredLoggingMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  // Gerar requestId único para cada requisição
  const requestId = randomUUID();

  // Extrair informações do request
  const userId = request.auth?.userId;
  const orgId = request.headers["x-organization-id"] as string | undefined;

  // Criar contexto estruturado
  const logContext = {
    requestId,
    userId,
    orgId,
    method: request.method,
    url: request.url,
    ip: request.ip,
    userAgent: request.headers["user-agent"],
  };

  // Adicionar ao request para uso posterior
  request.requestId = requestId;
  request.logContext = logContext;

  // Adicionar requestId ao header de resposta (útil para debugging)
  reply.header("X-Request-Id", requestId);

  // Adicionar contexto ao logger do Fastify
  // Isso faz com que todos os logs subsequentes incluam esse contexto
  request.log = request.log.child({
    requestId,
    userId,
    orgId,
    method: request.method,
    url: request.url,
  });

  // Log da requisição recebida
  request.log.info(
    {
      ...logContext,
      type: "http_request",
      statusCode: reply.statusCode,
    },
    `${request.method} ${request.url}`,
  );
}

/**
 * Hook para logar resposta
 */
export async function logResponse(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const duration = reply.getResponseTime();
  const logContext = request.logContext || {};

  request.log.info(
    {
      ...logContext,
      type: "http_response",
      statusCode: reply.statusCode,
      duration,
    },
    `${request.method} ${request.url} - ${reply.statusCode} (${duration.toFixed(2)}ms)`,
  );
}









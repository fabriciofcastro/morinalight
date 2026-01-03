/**
 * Rate Limiting Middleware
 * Protege APIs sensíveis contra abuso
 */

import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { extractOrgId } from "../auth/rbac.guards";
import { getPrisma } from "../../infra/database/prisma.service";

const prisma = getPrisma();

type RateLimitOptions = {
  windowMs: number; // Janela de tempo em milissegundos
  max: number; // Máximo de requisições por janela
  keyGenerator?: (request: FastifyRequest) => string; // Função para gerar chave única
  skipSuccessfulRequests?: boolean; // Não contar requisições bem-sucedidas
  skipFailedRequests?: boolean; // Não contar requisições falhadas
  message?: string; // Mensagem de erro personalizada
};

// Cache em memória (em produção, usar Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function getClientIdentifier(request: FastifyRequest): string {
  // Priorizar userId se autenticado
  if (request.auth?.userId) {
    return `user:${request.auth.userId}`;
  }
  // Caso contrário, usar IP
  const ip = request.ip || request.socket.remoteAddress || "unknown";
  return `ip:${ip}`;
}

export function createRateLimit(options: RateLimitOptions) {
  const {
    windowMs,
    max,
    keyGenerator = getClientIdentifier,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    message = "Muitas requisições. Tente novamente mais tarde.",
  } = options;

  return async (request: FastifyRequest, reply: FastifyReply) => {
    const key = keyGenerator(request);
    const now = Date.now();

    // Limpar entradas expiradas periodicamente
    if (Math.random() < 0.01) {
      // 1% de chance de limpar (evita limpeza constante)
      for (const [k, v] of rateLimitStore.entries()) {
        if (v.resetTime < now) {
          rateLimitStore.delete(k);
        }
      }
    }

    // Buscar ou criar entrada
    let entry = rateLimitStore.get(key);
    if (!entry || entry.resetTime < now) {
      entry = {
        count: 0,
        resetTime: now + windowMs,
      };
      rateLimitStore.set(key, entry);
    }

    // Incrementar contador
    entry.count++;

    // Verificar limite
    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      return reply.status(429).send({
        message,
        code: "RATE_LIMIT_EXCEEDED",
        retryAfter,
      });
    }

    // Registrar tentativa de rate limit (para auditoria)
    if (entry.count === max) {
      // Última requisição permitida antes do limite
      try {
        const orgId = extractOrgId(request) || "system";
        await prisma.organizationAuditLog.create({
          data: {
            orgId,
            action: "rate_limit_warning",
            actorId: request.auth?.userId || "anonymous",
            payload: {
              key,
              count: entry.count,
              endpoint: request.url,
            },
          },
        });
      } catch (error) {
        // Ignorar erros de auditoria para não afetar a requisição
        console.error("Erro ao registrar rate limit warning:", error);
      }
    }
  };
}

/**
 * Rate limits pré-configurados
 */
export const rateLimits = {
  // Limite geral para APIs públicas
  general: createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // 100 requisições
  }),

  // Limite para autenticação (mais restritivo)
  auth: createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // 10 tentativas de login (aumentado de 5 para 10)
    message: "Muitas tentativas de login. Tente novamente em alguns minutos.",
  }),

  // Limite para criação de recursos
  create: createRateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 10, // 10 criações por minuto
    message: "Muitas criações. Aguarde um momento antes de tentar novamente.",
  }),

  // Limite para operações sensíveis (senha, 2FA, etc.)
  sensitive: createRateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5, // 5 operações por hora
    message: "Muitas operações sensíveis. Tente novamente mais tarde.",
  }),

  // Limite para buscas
  search: createRateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 30, // 30 buscas por minuto
  }),

  // Limite para uploads
  upload: createRateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 5, // 5 uploads por minuto
    message: "Muitos uploads. Aguarde um momento antes de tentar novamente.",
  }),
};












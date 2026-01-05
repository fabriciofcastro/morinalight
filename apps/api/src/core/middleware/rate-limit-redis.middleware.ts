/**
 * Rate Limiting Middleware com Redis
 * Versão distribuída que persiste estado entre restarts
 */

import { type FastifyInstance, type FastifyReply, type FastifyRequest } from "fastify";
import { env } from "../config/env";
import { extractOrgId } from "../auth/rbac.guards";
import { getPrisma } from "../../infra/database/prisma.service";
import { getRedisClient, isRedisAvailable } from "../../infra/cache/redis.service";

const prisma = getPrisma();

type RateLimitOptions = {
  windowMs: number; // Janela de tempo em milissegundos
  max: number; // Máximo de requisições por janela
  keyGenerator?: (request: FastifyRequest) => string; // Função para gerar chave única
  skipSuccessfulRequests?: boolean; // Não contar requisições bem-sucedidas
  skipFailedRequests?: boolean; // Não contar requisições falhadas
  message?: string; // Mensagem de erro personalizada
};

// Fallback em memória caso Redis não esteja disponível
const fallbackStore = new Map<string, { count: number; resetTime: number }>();

function getClientIdentifier(request: FastifyRequest): string {
  const orgId = extractOrgId(request);
  const userId = request.auth?.userId;
  const ip = request.ip || request.socket.remoteAddress || "unknown";

  // Prioridade: orgId > userId > IP
  if (orgId) {
    return userId ? `org:${orgId}:user:${userId}` : `org:${orgId}:ip:${ip}`;
  }
  if (userId) {
    return `user:${userId}`;
  }
  return `ip:${ip}`;
}

/**
 * Rate limiting usando Redis (distribuído) com fallback em memória
 */
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
    const redisKey = `ratelimit:${key}`;
    const windowSeconds = Math.ceil(windowMs / 1000);

    try {
      // Tentar usar Redis primeiro
      const redisAvailable = await isRedisAvailable();

      if (redisAvailable) {
        const redis = getRedisClient();

        // Garantir que Redis está conectado
        if (redis.status !== "ready" && redis.status !== "connect") {
          if (redis.status === "wait" || redis.status === "end") {
            await redis.connect();
          }
        }

        // Usar INCR com EXPIRE para implementar sliding window
        const count = await redis.incr(redisKey);

        // Se é a primeira requisição nesta janela, definir TTL
        if (count === 1) {
          await redis.expire(redisKey, windowSeconds);
        }

        // Verificar limite
        if (count > max) {
          // Obter TTL restante
          const ttl = await redis.ttl(redisKey);
          const retryAfter = ttl > 0 ? ttl : windowSeconds;

          // Registrar tentativa de rate limit (para auditoria)
          await logRateLimitWarning(request, key, count, redisKey);

          return reply.status(429).send({
            message,
            code: "RATE_LIMIT_EXCEEDED",
            retryAfter,
          });
        }

        // Registrar warning quando próximo do limite
        if (count === max) {
          await logRateLimitWarning(request, key, count, redisKey);
        }

        return; // Continuar com a requisição
      }
    } catch (error) {
      // Se Redis falhar, usar fallback em memória
      console.warn("⚠️ [RATE-LIMIT] Redis indisponível, usando fallback em memória:", error);
    }

    // Fallback: usar Map em memória (comportamento original)
    const nowFallback = Date.now();

    // Limpar entradas expiradas periodicamente
    if (Math.random() < 0.01) {
      for (const [k, v] of fallbackStore.entries()) {
        if (v.resetTime < nowFallback) {
          fallbackStore.delete(k);
        }
      }
    }

    // Buscar ou criar entrada
    let entry = fallbackStore.get(key);
    if (!entry || entry.resetTime < nowFallback) {
      entry = {
        count: 0,
        resetTime: nowFallback + windowMs,
      };
      fallbackStore.set(key, entry);
    }

    // Incrementar contador
    entry.count++;

    // Verificar limite
    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetTime - nowFallback) / 1000);
      await logRateLimitWarning(request, key, entry.count, `fallback:${key}`);
      return reply.status(429).send({
        message,
        code: "RATE_LIMIT_EXCEEDED",
        retryAfter,
      });
    }

    // Registrar warning quando próximo do limite
    if (entry.count === max) {
      await logRateLimitWarning(request, key, entry.count, `fallback:${key}`);
    }
  };
}

/**
 * Registra warning de rate limit para auditoria
 */
async function logRateLimitWarning(
  request: FastifyRequest,
  key: string,
  count: number,
  storageKey: string,
): Promise<void> {
  try {
    const orgId = extractOrgId(request);

    // ✅ SOLUÇÃO DEFINITIVA: Só criar log se houver orgId válido
    // Evita erro de foreign key quando orgId é null, undefined ou "system"
    if (!orgId || orgId === "system") {
      console.warn(
        `[RATE-LIMIT] Warning não registrado - orgId inválido: ${orgId || 'null'} - ` +
        `key: ${key}, count: ${count}, endpoint: ${request.url}`
      );
      return;
    }

    await prisma.organizationAuditLog.create({
      data: {
        orgId,
        action: "rate_limit_warning",
        actorId: request.auth?.userId || "anonymous",
        payload: {
          key,
          count,
          endpoint: request.url,
          storageKey,
          method: request.method,
        },
      },
    });
  } catch (error) {
    // Ignorar erros de auditoria para não afetar a requisição
    console.error("Erro ao registrar rate limit warning:", error);
  }
}

/**
 * Rate limits pré-configurados (usando Redis)
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
    max: env.NODE_ENV === "development" ? 100 : 10, // 10 tentativas de login (100 em dev)
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

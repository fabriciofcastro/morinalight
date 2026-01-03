/**
 * CSRF Protection Middleware
 * Protege contra Cross-Site Request Forgery
 */

import type { FastifyReply, FastifyRequest } from "fastify";
import { randomBytes } from "node:crypto";
import { getRedisClient, isRedisAvailable } from "../../infra/cache/redis.service";

// Fallback em memória caso Redis não esteja disponível
const csrfStore = new Map<string, { token: string; expiresAt: number }>();

/**
 * Gera token CSRF
 */
function generateCsrfToken(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * Obtém chave CSRF para usuário/IP
 */
function getCsrfKey(request: FastifyRequest): string {
  if (request.auth?.userId) {
    return `csrf:user:${request.auth.userId}`;
  }
  const ip = request.ip || request.socket.remoteAddress || "unknown";
  return `csrf:ip:${ip}`;
}

/**
 * Middleware CSRF para GET requests (gera token)
 */
export function csrfGenerateToken() {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    // Apenas para GET requests
    if (request.method !== "GET") {
      return;
    }

    const key = getCsrfKey(request);
    const token = generateCsrfToken();
    const expiresIn = 3600; // 1 hora

    try {
      const available = await isRedisAvailable();
      if (available) {
        const redis = getRedisClient();
        await redis.setex(key, expiresIn, token);
      } else {
        // Fallback em memória
        csrfStore.set(key, {
          token,
          expiresAt: Date.now() + expiresIn * 1000,
        });
      }

      // Enviar token no header
      reply.header("X-CSRF-Token", token);
    } catch (error) {
      console.error("Erro ao gerar token CSRF:", error);
      // Não falhar a requisição se CSRF falhar
    }
  };
}

/**
 * Middleware CSRF para POST/PUT/DELETE/PATCH (valida token)
 */
export function csrfValidateToken() {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    // Apenas para métodos mutantes
    const mutatingMethods = ["POST", "PUT", "DELETE", "PATCH"];
    if (!mutatingMethods.includes(request.method)) {
      return;
    }

    // Excluir rotas públicas que não precisam de CSRF
    const publicRoutes = ["/auth/login", "/auth/register", "/health", "/realtime/token"];
    const isPublic = publicRoutes.some((route) => request.url.startsWith(route));

    if (isPublic) {
      return;
    }

    const token = request.headers["x-csrf-token"] as string | undefined;
    const key = getCsrfKey(request);

    if (!token) {
      return reply.status(403).send({
        message: "CSRF token não fornecido",
        code: "CSRF_TOKEN_MISSING",
      });
    }

    try {
      let storedToken: string | null = null;

      const available = await isRedisAvailable();
      if (available) {
        const redis = getRedisClient();
        storedToken = await redis.get(key);
      } else {
        // Fallback em memória
        const entry = csrfStore.get(key);
        if (entry && entry.expiresAt > Date.now()) {
          storedToken = entry.token;
        } else {
          csrfStore.delete(key);
        }
      }

      if (!storedToken || storedToken !== token) {
        return reply.status(403).send({
          message: "CSRF token inválido",
          code: "CSRF_TOKEN_INVALID",
        });
      }

      // Token válido, continuar
    } catch (error) {
      console.error("Erro ao validar token CSRF:", error);
      // Em caso de erro, negar acesso por segurança
      return reply.status(403).send({
        message: "Erro ao validar CSRF token",
        code: "CSRF_VALIDATION_ERROR",
      });
    }
  };
}

import type { FastifyInstance } from "fastify";

/**
 * Registra ambos os middlewares CSRF
 */
export function registerCsrfProtection(app: FastifyInstance): void {
  // Gerar token em GET requests (antes da validação)
  app.addHook("onRequest", csrfGenerateToken());

  // Validar token em métodos mutantes (depois da geração)
  app.addHook("onRequest", csrfValidateToken());
}

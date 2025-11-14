import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type JwtPayload = {
  sub: string; // userId
  email: string;
  defaultOrgId: string | null;
  iat?: number;
  exp?: number;
};

export type AuthContext = {
  userId: string;
  email: string;
  defaultOrgId: string | null;
};

declare module "fastify" {
  interface FastifyRequest {
    auth?: AuthContext;
  }
}

type JwtMiddlewareOptions = {
  excludeRoutes?: Array<string | RegExp>;
};

/**
 * Extrai o token JWT do header Authorization
 */
function extractToken(request: FastifyRequest): string | null {
  const authHeader = request.headers.authorization;
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
}

/**
 * Valida e decodifica o token JWT
 */
function validateToken(token: string): JwtPayload | null {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Cria middleware JWT para validar tokens nas requisições
 */
export function createJwtMiddleware(options: JwtMiddlewareOptions) {
  const { excludeRoutes } = options;

  return async function validateJwt(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
    const url = request.url.split("?")[0];

    // Verificar se a rota deve ser excluída
    if (excludeRoutes) {
      const isExcluded = excludeRoutes.some((pattern) => {
        if (typeof pattern === "string") {
          return url.includes(pattern);
        }
        return pattern.test(url);
      });

      if (isExcluded) {
        return;
      }
    }

    // Extrair token (opcional - se não houver token, apenas não adicionar request.auth)
    const token = extractToken(request);

    // Se houver token, validar e adicionar contexto
    if (token) {
      const payload = validateToken(token);

      if (payload) {
        // Adicionar contexto de autenticação à requisição
        request.auth = {
          userId: payload.sub,
          email: payload.email,
          defaultOrgId: payload.defaultOrgId,
        };
      }
      // Se o token for inválido, apenas não adicionar request.auth
      // O tenant middleware pode usar headers diretos como fallback
    }
    // Se não houver token, apenas continuar sem request.auth
    // O tenant middleware pode usar headers diretos (x-user-id, x-org-id)
  };
}

/**
 * Registra o middleware JWT globalmente no Fastify
 */
export function registerJwtMiddleware(app: FastifyInstance, options: JwtMiddlewareOptions) {
  const validateJwt = createJwtMiddleware(options);

  app.addHook("onRequest", async (request, reply) => {
    await validateJwt(request, reply);
  });
}

/**
 * Decorator para exigir autenticação em uma rota específica
 */
export function requireAuth() {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }
  };
}

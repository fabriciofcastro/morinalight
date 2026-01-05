import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { verifyToken } from "./jwt-rs256.service";
import type { JwtPayload } from "./jwt-rs256.service";

export type { JwtPayload };

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
  // Priority 1: Check for access_token cookie (HttpOnly, secure)
  const cookieToken = request.cookies?.access_token;
  if (cookieToken) {
    return cookieToken;
  }

  // Priority 2: Check Authorization header (Bearer token)
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
 * Valida e decodifica o token JWT (usando RS256 com fallback HS256)
 */
function verifyAndDecodeToken(token: string): JwtPayload | null {
  return verifyToken(token);
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
      const payload = verifyAndDecodeToken(token);

      if (payload) {
        // Verificar se token está na blacklist (se tiver jti)
        if (payload.jti) {
          const { isTokenBlacklisted } = await import("./token-blacklist.service");
          const isBlacklisted = await isTokenBlacklisted(payload.jti);
          if (isBlacklisted) {
            // Token revogado, não adicionar contexto
            return;
          }
        }

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

/**
 * Middleware para exigir role de admin
 */
export async function adminRouteMiddleware(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  if (!request.auth) {
    return reply.status(401).send({
      message: "Autenticação necessária",
      code: "UNAUTHORIZED",
    });
  }

  // TODO: Implement role check when user roles are available
  // For now, just ensure authentication is present
}

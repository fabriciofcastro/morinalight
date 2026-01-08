import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import type { OrganizationRepository } from "../../modules/organizations/repositories/organization.repository";
import { RequestContextService } from "../context/request-context.service";
import type { TenantContext } from "./tenant.types";


const _headersSchema = z.object({
  "x-user-id": z.string().min(1),
});

const paramsSchema = z.object({
  orgId: z.string().min(1),
});

type TenantMiddlewareOptions = {
  organizationRepository: OrganizationRepository;
  extractOrgId?: (request: FastifyRequest) => string | null;
  requireRole?: Array<string>;
};

/**
 * Middleware de validação de tenant
 * Valida se o usuário tem acesso à organização e adiciona contexto de tenant à requisição
 */
export function createTenantMiddleware(options: TenantMiddlewareOptions) {
  const { organizationRepository, extractOrgId, requireRole } = options;

  return async function validateTenant(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      // Extrair userId do header ou do JWT
      let userId: string | null = null;

      // Tentar obter do header primeiro
      const headerUserId = request.headers["x-user-id"];
      if (typeof headerUserId === "string") {
        userId = headerUserId;
      } else if (request.auth) {
        // Se não houver no header, tentar obter do contexto JWT (se disponível)
        userId = request.auth.userId;
      }

      if (!userId) {
        return reply.status(400).send({
          message: "Usuário não identificado. Forneça x-user-id no header ou token JWT válido",
        });
      }

      // Extrair orgId do parâmetro ou header ou JWT
      let orgId: string | null = null;

      if (extractOrgId) {
        orgId = extractOrgId(request);
      } else {
        // Tentar extrair de params primeiro
        try {
          const params = paramsSchema.safeParse(request.params);
          if (params.success) {
            orgId = params.data.orgId;
          }
        } catch {
          // Ignorar erro de parsing
        }

        // Se não tiver em params, tentar header
        if (!orgId) {
          const headerOrgId = request.headers["x-org-id"];
          if (typeof headerOrgId === "string") {
            orgId = headerOrgId;
          }
        }

        // Se ainda não tiver, tentar obter do JWT (defaultOrgId)
        if (!orgId && request.auth?.defaultOrgId) {
          orgId = request.auth.defaultOrgId;
        }
      }

      if (!orgId) {
        return reply.status(400).send({
          message:
            "Organização não especificada. Forneça orgId em params, header x-org-id ou token JWT com defaultOrgId",
        });
      }

      // Verificar se o usuário tem acesso à organização
      const membership = await organizationRepository.encontrarMembership?.(orgId, userId);

      if (!membership) {
        return reply.status(403).send({
          message: "Sem acesso à organização especificada",
          orgId,
          userId,
        });
      }

      // Verificar se o role é suficiente (se especificado)
      if (requireRole && requireRole.length > 0 && !requireRole.includes(membership.role)) {
        return reply.status(403).send({
          message: "Sem permissão suficiente para esta ação",
          requiredRoles: requireRole,
          userRole: membership.role,
        });
      }

      // Adicionar contexto de tenant à requisição e ao Contexto Global (AsyncLocalStorage)
      const context = {
        orgId,
        userId,
        role: membership.role as TenantContext["role"],
      };
      
      request.tenant = context;
      RequestContextService.enterWith(context);

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          message: "Dados de tenant inválidos",
          errors: error.errors,
        });
      }

      request.log.error(error, "Erro ao validar tenant");
      return reply.status(500).send({
        message: "Erro interno ao validar tenant",
      });
    }
  };
}

/**
 * Hook para aplicar validação de tenant em rotas específicas
 */
export function registerTenantHook(
  app: FastifyInstance,
  options: TenantMiddlewareOptions & {
    routes?: Array<string | RegExp>;
    excludeRoutes?: Array<string | RegExp>;
  },
) {
  const { routes, excludeRoutes, ...middlewareOptions } = options;
  const validateTenant = createTenantMiddleware(middlewareOptions);

  app.addHook("onRequest", async (request, reply) => {
    const url = request.url.split("?")[0] ?? "/";

    // Se não houver especificação de rotas, aplicar em todas
    // Caso contrário, verificar se a rota deve ser incluída
    if (routes && routes.length > 0) {
      const isIncluded = routes.some((pattern) => {
        if (typeof pattern === "string") {
          // Para strings, usar match mais preciso
          // /organizations/:orgId deve corresponder a /organizations/qualquer-coisa/members
          const patternRegex = new RegExp(
            `^${pattern.replace(/:\w+/g, "[^/]+").replace(/\//g, "\\/")}($|/)`,
          );
          return patternRegex.test(url);
        }
        return pattern.test(url);
      });

      if (!isIncluded) {
        return; // Não aplicar validação de tenant nesta rota
      }
    }

    // Verificar se a rota deve ser excluída (após verificação de inclusão)
    if (excludeRoutes && excludeRoutes.length > 0) {
      const isExcluded = excludeRoutes.some((pattern) => {
        if (typeof pattern === "string") {
          return url.includes(pattern);
        }
        return pattern.test(url);
      });

      if (isExcluded) {
        return; // Não aplicar validação de tenant nesta rota
      }
    }

    // Aplicar validação de tenant
    await validateTenant(request, reply);
  });
}

/**
 * Decorator para aplicar validação de tenant em uma rota específica
 */
export function requireTenant(options?: { requireRole?: Array<string> }) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    // Esta função deve ser chamada dentro da rota após ter acesso ao organizationRepository
    // Por enquanto, apenas valida se o tenant foi definido
    if (!request.tenant) {
      return reply.status(403).send({
        message: "Validação de tenant não aplicada",
      });
    }

    // Verificar role se especificado
    if (options?.requireRole && options.requireRole.length > 0) {
      if (!options.requireRole.includes(request.tenant.role)) {
        return reply.status(403).send({
          message: "Sem permissão suficiente para esta ação",
          requiredRoles: options.requireRole,
          userRole: request.tenant.role,
        });
      }
    }
  };
}

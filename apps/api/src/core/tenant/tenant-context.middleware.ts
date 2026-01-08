/**
 * Tenant Context Middleware
 * Valida e garante isolamento multi-tenant obrigatório
 */

import type { FastifyReply, FastifyRequest } from "fastify";
import { getPrisma } from "../../infra/database/prisma.service";
import { extractOrgId } from "../auth/rbac.guards";
import type { TenantContext } from "./tenant.types";

const prisma = getPrisma();

declare module "fastify" {
  interface FastifyRequest {
    tenant?: TenantContext;
  }
}

/**
 * Middleware para validar acesso à organização (tenant)
 * Deve ser aplicado em todas as rotas que usam orgId
 */
export function requireTenantContext() {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    // Extrair orgId de diferentes fontes
    const orgId = extractOrgId(request);

    // Se não houver orgId, retornar erro
    if (!orgId) {
      return reply.status(400).send({
        message: "Organização não especificada. Header 'x-org-id' é obrigatório.",
        code: "MISSING_ORG_ID",
      });
    }

    // Se não houver autenticação, não podemos validar acesso
    if (!request.auth?.userId) {
      return reply.status(401).send({
        message: "Autenticação necessária para acessar recursos da organização",
        code: "UNAUTHORIZED",
      });
    }

    // Validar se o usuário tem acesso à organização
    const membership = await prisma.organizationMembership.findFirst({
      where: {
        organizationId: orgId,
        userId: request.auth.userId,
      },
      select: {
        role: true,
      },
    });

    if (!membership) {
      // Logar tentativa de acesso não autorizado
      try {
        await prisma.organizationAuditLog.create({
          data: {
            orgId,
            action: "unauthorized_access_attempt",
            actorId: request.auth.userId,
            payload: {
              endpoint: request.url,
              method: request.method,
              ip: request.ip,
              userAgent: request.headers["user-agent"],
            },
          },
        });
      } catch (error) {
        // Ignorar erros de auditoria
        console.error("Erro ao registrar tentativa de acesso não autorizado:", error);
      }

      return reply.status(403).send({
        message: "Acesso negado à organização",
        code: "FORBIDDEN",
        orgId,
      });
    }

    // Adicionar contexto de tenant à requisição
    const userId = request.auth?.userId;
    if (!userId) {
      return reply.status(401).send({
        message: "Usuário não autenticado",
        code: "UNAUTHORIZED",
      });
    }

    request.tenant = {
      orgId,
      userId,
      role: membership.role,
    };

    // Definir contexto para o Prisma middleware
    const { setTenantContext } = await import("../database/tenant-filter.middleware");
    setTenantContext(orgId);
  };
}

/**
 * Middleware para validar acesso a recursos específicos da organização
 * Garante que o recurso pertence à organização do tenant
 */
export function validateResourceOwnership(resourceModel: string, resourceIdParam: string = "id") {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.tenant) {
      return reply.status(400).send({
        message: "Contexto de tenant não encontrado",
        code: "MISSING_TENANT_CONTEXT",
      });
    }

    const resourceId = (request.params as Record<string, string>)[resourceIdParam];

    if (!resourceId) {
      return reply.status(400).send({
        message: `Parâmetro '${resourceIdParam}' não encontrado`,
        code: "MISSING_RESOURCE_ID",
      });
    }

    // Verificar se o recurso pertence à organização
    // Isso depende do modelo, então vamos fazer uma verificação genérica
    try {
      const resource = await (prisma as any)[resourceModel].findFirst({
        where: {
          id: resourceId,
          orgId: request.tenant.orgId,
        },
        select: {
          id: true,
        },
      });

      if (!resource) {
        return reply.status(404).send({
          message: "Recurso não encontrado ou não pertence à organização",
          code: "RESOURCE_NOT_FOUND",
        });
      }
    } catch (error) {
      // Se o modelo não existir ou não tiver orgId, logar e continuar
      // (alguns recursos podem não precisar dessa validação)
      console.warn(`Validação de ownership não aplicável para modelo '${resourceModel}':`, error);
    }
  };
}

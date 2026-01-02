import type { OrganizationRole } from "@prisma/client";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { OrganizationRepository } from "../../modules/organizations/repositories/organization.repository";

declare module "fastify" {
  interface FastifyRequest {
    orgAccess?: {
      orgId: string;
      role: OrganizationRole;
    };
  }
}

export type RoleHierarchy = {
  [key in OrganizationRole]: number;
};

/**
 * Hierarquia de roles (quanto maior o número, mais permissões)
 */
export const ROLE_HIERARCHY: RoleHierarchy = {
  viewer: 1,
  member: 2,
  manager: 3,
  admin: 4,
  owner: 5,
};

/**
 * Verifica se um role tem permissão suficiente
 */
export function hasRole(userRole: OrganizationRole, requiredRole: OrganizationRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Verifica se um role está na lista de roles permitidos
 */
export function hasAnyRole(userRole: OrganizationRole, allowedRoles: OrganizationRole[]): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Verifica se o usuário tem acesso à organização com o role necessário
 */
export async function checkOrganizationAccess(
  organizationRepository: OrganizationRepository,
  userId: string,
  orgId: string,
  requiredRole?: OrganizationRole,
): Promise<
  | { hasAccess: true; role: OrganizationRole }
  | { hasAccess: false; role?: OrganizationRole; error?: string }
> {
  const membership = await organizationRepository.encontrarMembership?.(orgId, userId);

  if (!membership) {
    return {
      hasAccess: false,
      error: "Usuário não é membro da organização",
    };
  }

  if (requiredRole && !hasRole(membership.role as OrganizationRole, requiredRole)) {
    return {
      hasAccess: false,
      role: membership.role as OrganizationRole,
      error: `Role insuficiente. Necessário: ${requiredRole}, atual: ${membership.role}`,
    };
  }

  return {
    hasAccess: true,
    role: membership.role as OrganizationRole,
  };
}

/**
 * Guard para verificar acesso à organização
 */
export function requireOrganizationAccess(
  organizationRepository: OrganizationRepository,
  requiredRole?: OrganizationRole,
) {
  return async (
    request: FastifyRequest<{ Params: { orgId?: string } }>,
    reply: FastifyReply,
  ): Promise<void> => {
    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const orgId = request.params.orgId || (request.headers["x-org-id"] as string);

    if (!orgId) {
      return reply.status(400).send({
        message: "Organização não especificada",
        code: "MISSING_ORG_ID",
      });
    }

    const access = await checkOrganizationAccess(
      organizationRepository,
      request.auth.userId,
      orgId,
      requiredRole,
    );

    if (!access.hasAccess) {
      // Security Observability: Monitorar tentativas de acesso negado
      const Sentry = await import("@sentry/node");
      Sentry.withScope((scope) => {
        scope.setLevel("warning");
        scope.setTag("security_event", "access_denied");
        scope.setTag("violation_type", "insufficient_role");
        scope.setContext("access_attempt", {
          userId: request.auth?.userId,
          orgId,
          requiredRole,
          actualRole: access.role
        });
        Sentry.captureMessage(`Access Denied: ${access.error || "Insufficient Permissions"}`);
      });

      return reply.status(403).send({
        message: access.error || "Acesso negado à organização",
        code: "FORBIDDEN",
        requiredRole,
        userRole: access.role,
      });
    }

    // Adicionar informações ao request para uso posterior
    request.orgAccess = {
      orgId,
      role: access.role,
    };
  };
}

/**
 * Guard para verificar múltiplos roles
 */
export function requireAnyRole(
  organizationRepository: OrganizationRepository,
  allowedRoles: OrganizationRole[],
) {
  return async (
    request: FastifyRequest<{ Params: { orgId?: string } }>,
    reply: FastifyReply,
  ): Promise<void> => {
    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const orgId = request.params.orgId || (request.headers["x-org-id"] as string);

    if (!orgId) {
      return reply.status(400).send({
        message: "Organização não especificada",
        code: "MISSING_ORG_ID",
      });
    }

    const membership = await organizationRepository.encontrarMembership?.(
      orgId,
      request.auth.userId,
    );

    if (!membership) {
      return reply.status(403).send({
        message: "Usuário não é membro da organização",
        code: "NOT_MEMBER",
      });
    }

    const userRole = membership.role as OrganizationRole;

    if (!hasAnyRole(userRole, allowedRoles)) {
      return reply.status(403).send({
        message: "Role insuficiente para esta ação",
        code: "INSUFFICIENT_ROLE",
        allowedRoles,
        userRole,
      });
    }

    request.orgAccess = {
      orgId,
      role: userRole,
    };
  };
}

/**
 * Helper para extrair orgId de diferentes fontes
 */
export function extractOrgId(request: FastifyRequest): string | null {
  // Tentar params primeiro
  const params = request.params as { orgId?: string };
  if (params?.orgId) {
    return params.orgId;
  }

  // Tentar header
  const headerOrgId = request.headers["x-org-id"];
  if (typeof headerOrgId === "string") {
    return headerOrgId;
  }

  // Tentar query
  const query = request.query as { orgId?: string };
  if (query?.orgId) {
    return query.orgId;
  }

  return null;
}

/**
 * Permission Check Middleware
 * Verifica permissões antes de executar ações
 */

import type { FastifyRequest, FastifyReply } from "fastify";
import { getPrisma } from "../../infra/database/prisma.service";
import { extractOrgId } from "../auth/rbac.guards";
import type { ResolverPermissoesEfetivasUseCase } from "../../modules/permissions/application/use-cases/resolver-permissoes-efetivas.use-case";

const prisma = getPrisma();

type PermissionCheckOptions = {
  permission: string; // ID ou código da permissão
  resource?: string; // Recurso específico (opcional)
  requireAll?: boolean; // Se true, requer todas as permissões (para array)
};

/**
 * Middleware para verificar permissão
 */
export function requirePermission(options: PermissionCheckOptions) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.auth) {
      return reply.status(401).send({
        message: "Autenticação necessária",
        code: "UNAUTHORIZED",
      });
    }

    const { permission, resource, requireAll = false } = options;
    const userId = request.auth?.userId;
    const orgId = extractOrgId(request);

    if (!userId || !orgId) {
      return reply.status(403).send({
        message: "Permissão negada",
        code: "FORBIDDEN",
      });
    }

    try {
      // Buscar permissões efetivas do usuário
      // Por enquanto, verificação simples - em produção, usar ResolverPermissoesEfetivasUseCase
      const userPermissions = await prisma.userPermission.findMany({
        where: {
          userId,
          orgId,
          permission: {
            id: permission,
          },
        },
        include: {
          permission: true,
        },
      });

      // Verificar se usuário tem a permissão
      const hasPermission = userPermissions.length > 0;

      if (!hasPermission) {
        // Verificar permissões herdadas (departamento, setor, cargo)
        const departmentPermissions = await prisma.departmentPermission.findMany({
          where: {
            orgId,
            permissionId: permission,
            department: {
              memberships: {
                some: {
                  userId,
                },
              },
            },
          },
        });

        const sectorPermissions = await prisma.sectorPermission.findMany({
          where: {
            orgId,
            permissionId: permission,
            sector: {
              memberships: {
                some: {
                  userId,
                },
              },
            },
          },
        });

        const positionPermissions = await prisma.positionPermission.findMany({
          where: {
            orgId,
            permissionId: permission,
            position: {
              memberships: {
                some: {
                  userId,
                },
              },
            },
          },
        });

        const hasInheritedPermission =
          departmentPermissions.length > 0 ||
          sectorPermissions.length > 0 ||
          positionPermissions.length > 0;

        if (!hasInheritedPermission) {
          return reply.status(403).send({
            message: "Permissão negada",
            code: "FORBIDDEN",
            requiredPermission: permission,
          });
        }
      }

      // Registrar auditoria de verificação de permissão (opcional, para debug)
      // await prisma.organizationAuditLog.create({...});
    } catch (error) {
      console.error("Erro ao verificar permissão:", error);
      return reply.status(500).send({
        message: "Erro ao verificar permissão",
        code: "PERMISSION_CHECK_ERROR",
      });
    }
  };
}

/**
 * Helper para verificar múltiplas permissões
 */
export function requireAnyPermission(permissions: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    for (const permission of permissions) {
      const check = requirePermission({ permission });
      try {
        await check(request, reply);
        if (!reply.sent) {
          // Se não retornou erro, usuário tem a permissão
          return;
        }
      } catch {
        // Continuar para próxima permissão
      }
    }
    // Se chegou aqui, usuário não tem nenhuma permissão
    return reply.status(403).send({
      message: "Permissão negada",
      code: "FORBIDDEN",
      requiredPermissions: permissions,
    });
  };
}













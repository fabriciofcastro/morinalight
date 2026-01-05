/**
 * Permission Check Middleware
 * Verifica permissões antes de executar ações usando CASL
 */

import type { FastifyRequest, FastifyReply } from "fastify";
import { getPrisma } from "../../infra/database/prisma.service";
import { extractOrgId } from "../auth/rbac.guards";
import { CaslAbilityFactory } from "../../modules/permissions/domain/factories/casl-ability.factory";
import { ResolverPermissoesEfetivasUseCase } from "../../modules/permissions/application/use-cases/resolver-permissoes-efetivas.use-case";
import { PrismaPermissionRepository } from "../../modules/permissions/infra/prisma/prisma-permission.repository";
import { PrismaOrganizationRepository } from "../../modules/organizations/infra/prisma/prisma-organization.repository";
import { PrismaPositionPermissionRepository } from "../../modules/permissions/infra/prisma/prisma-position-permission.repository";
import { PrismaSectorPermissionRepository } from "../../modules/permissions/infra/prisma/prisma-sector-permission.repository";
import { PrismaDepartmentPermissionRepository } from "../../modules/permissions/infra/prisma/prisma-department-permission.repository";
import { PrismaUserPermissionRepository } from "../../modules/permissions/infra/prisma/prisma-user-permission.repository";
import { PrismaPositionMembershipRepository } from "../../modules/organizational-structure/infra/prisma/prisma-position-membership.repository";
import { PrismaDepartmentMembershipRepository } from "../../modules/organizational-structure/infra/prisma/prisma-department-membership.repository";
import { PrismaPositionRepository } from "../../modules/organizational-structure/infra/prisma/prisma-position.repository";
import { env } from "../../core/config/env";
import { InMemoryPermissionCacheService } from "../../modules/permissions/infra/cache/in-memory-permission-cache.service";
import { RedisPermissionCacheService } from "../../modules/permissions/infra/cache/redis-permission-cache.service";
import { PermissionInheritanceServiceImpl } from "../../modules/permissions/infra/services/permission-inheritance.service";
import { PrismaDepartmentRepository } from "../../modules/organizational-structure/infra/prisma/prisma-department.repository";
import { PrismaSectorRepository } from "../../modules/organizational-structure/infra/prisma/prisma-sector.repository";

// Instância única de cache para o middleware
const permissionCache = env.REDIS_URL
  ? new RedisPermissionCacheService()
  : new InMemoryPermissionCacheService();

// Instâncias globais ou lazy-loaded seriam melhores, 
// mas para manter consistência vamos instanciar sob demanda aproveitando o cache do PrismaService
function makeResolverPermissoesEfetivas() {
  const permissionRepo = new PrismaPermissionRepository();
  const orgRepo = new PrismaOrganizationRepository();
  const posPermRepo = new PrismaPositionPermissionRepository();
  const secPermRepo = new PrismaSectorPermissionRepository();
  const depPermRepo = new PrismaDepartmentPermissionRepository();
  const userPermRepo = new PrismaUserPermissionRepository();
  const posMemRepo = new PrismaPositionMembershipRepository();
  const depMemRepo = new PrismaDepartmentMembershipRepository();
  const posRepo = new PrismaPositionRepository();

  // Dependências de Herança
  const depRepo = new PrismaDepartmentRepository();
  const secRepo = new PrismaSectorRepository();

  const inheritanceService = new PermissionInheritanceServiceImpl({
    departmentRepository: depRepo,
    sectorRepository: secRepo,
    positionRepository: posRepo,
    departmentPermissionRepository: depPermRepo,
    sectorPermissionRepository: secPermRepo,
    positionPermissionRepository: posPermRepo,
    permissionRepository: permissionRepo
  });

  // O cache agora é compartilhado através do singleton acima

  return new ResolverPermissoesEfetivasUseCase({
    permissionRepository: permissionRepo,
    organizationRepository: orgRepo,
    positionPermissionRepository: posPermRepo,
    sectorPermissionRepository: secPermRepo,
    departmentPermissionRepository: depPermRepo,
    userPermissionRepository: userPermRepo,
    positionMembershipRepository: posMemRepo,
    departmentMembershipRepository: depMemRepo,
    positionRepository: posRepo,
    permissionCacheService: permissionCache,
    permissionInheritanceService: inheritanceService
  });
}

type PermissionCheckOptions = {
  permission: string; // ID ou código da permissão (ex: "products:view")
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

    const { permission } = options;
    const userId = request.auth?.userId;
    const orgId = extractOrgId(request);

    if (!userId || !orgId) {
      return reply.status(403).send({
        message: "Permissão negada (Contexto Inválido)",
        code: "FORBIDDEN",
      });
    }

    try {
      // 1. Resolver todas as permissões efetivas do usuário (com cache)
      const useCase = makeResolverPermissoesEfetivas();
      const effectivePermissions = await useCase.execute({ orgId, userId });

      // 2. Criar Ability do CASL
      const ability = CaslAbilityFactory.createForUser(effectivePermissions);

      // 3. Traduzir a permissão string (ex: "products:view") para Ação/Sujeito (ex: "read", "Product")
      const { action, subject } = CaslAbilityFactory.parsePermissionKey(permission);

      if (!action || !subject) {
        // Se a permissão não pode ser mapeada para o sistema CASL, 
        // caímos para uma verificação de segurança (negar por padrão ou checar a string crua se suportado)
        // Por segurança, negamos e logamos.
        request.log.warn(`Permissão desconhecida solicitada: ${permission}`);
        return reply.status(403).send({
          message: "Permissão desconhecida ou inválida",
          code: "FORBIDDEN",
          requiredPermission: permission,
        });
      }

      // 4. Verificar autorização
      if (ability.cannot(action, subject)) {
        return reply.status(403).send({
          message: "Permissão negada",
          code: "FORBIDDEN",
          requiredPermission: permission,
        });
      }

      // Se passou, injetar ability no request para uso posterior nos controllers se necessário
      // (request as any).ability = ability; 

    } catch (error) {
      request.log.error(error, "Erro ao verificar permissão com CASL");
      return reply.status(500).send({
        message: "Erro interno ao verificar permissões",
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
    // Implementação otimizada: Carregar permissões UMA VEZ e checar todas
    if (!request.auth) {
      return reply.status(401).send({ message: "Autenticação necessária", code: "UNAUTHORIZED" });
    }

    const userId = request.auth?.userId;
    const orgId = extractOrgId(request);

    if (!userId || !orgId) return reply.status(403).send({ message: "Contexto inválido", code: "FORBIDDEN" });

    try {
      const useCase = makeResolverPermissoesEfetivas();
      const effectivePermissions = await useCase.execute({ orgId, userId });
      const ability = CaslAbilityFactory.createForUser(effectivePermissions);

      let hasAny = false;
      for (const permission of permissions) {
        const { action, subject } = CaslAbilityFactory.parsePermissionKey(permission);
        if (action && subject && ability.can(action, subject)) {
          hasAny = true;
          break;
        }
      }

      if (!hasAny) {
        return reply.status(403).send({
          message: "Permissão negada",
          code: "FORBIDDEN",
          requiredPermissions: permissions,
        });
      }
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ message: "Erro de permissão", code: "INTERNAL_ERROR" });
    }
  };
}














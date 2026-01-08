/**
 * Permission Check Middleware
 * Verifica permissões antes de executar ações usando CASL
 */

import { unifiedPolicyEngine } from "@morina/shared-kernel";
import type { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticationError, AuthorizationError, RateLimitError, ServiceUnavailableError } from "../errors/app-error";

import { env } from "../../core/config/env";
import { getPrisma } from "../../infra/database/prisma.service";
import { PrismaDepartmentMembershipRepository } from "../../modules/organizational-structure/infra/prisma/prisma-department-membership.repository";
import { PrismaDepartmentRepository } from "../../modules/organizational-structure/infra/prisma/prisma-department.repository";
import { PrismaPositionMembershipRepository } from "../../modules/organizational-structure/infra/prisma/prisma-position-membership.repository";
import { PrismaPositionRepository } from "../../modules/organizational-structure/infra/prisma/prisma-position.repository";
import { PrismaSectorRepository } from "../../modules/organizational-structure/infra/prisma/prisma-sector.repository";
import { PrismaOrganizationRepository } from "../../modules/organizations/infra/prisma/prisma-organization.repository";
import { ResolverPermissoesEfetivasUseCase } from "../../modules/permissions/application/use-cases/resolver-permissoes-efetivas.use-case";
import {
  CaslAbilityFactory,
} from "../../modules/permissions/domain/factories/casl-ability.factory";
import { ImmutableAuditService } from "../../modules/permissions/domain/services/immutable-audit.service";
import { OpaDecisionProvider } from "../../modules/permissions/infra/opa/opa-decision.provider";
import { OpaService } from "../../modules/permissions/infra/opa/opa.service";
import { GovernancePepService } from "../../modules/permissions/services/governance-pep.service";
import { MlEnsembleService } from "../../modules/permissions/services/ml-ensemble.service";
import { RiskScoringService } from "../../modules/permissions/services/risk-scoring.service";
import { UebaService } from "../../modules/permissions/services/ueba.service";
import { extractOrgId } from "../auth/rbac.guards";

// Restore missing imports for makeResolverPermissoesEfetivas
import { InMemoryPermissionCacheService } from "../../modules/permissions/infra/cache/in-memory-permission-cache.service";
import { RedisPermissionCacheService } from "../../modules/permissions/infra/cache/redis-permission-cache.service";
import { PrismaDepartmentPermissionRepository } from "../../modules/permissions/infra/prisma/prisma-department-permission.repository";
import { PrismaPermissionRepository } from "../../modules/permissions/infra/prisma/prisma-permission.repository";
import { PrismaPositionPermissionRepository } from "../../modules/permissions/infra/prisma/prisma-position-permission.repository";
import { PrismaSectorPermissionRepository } from "../../modules/permissions/infra/prisma/prisma-sector-permission.repository";
import { PrismaUserPermissionRepository } from "../../modules/permissions/infra/prisma/prisma-user-permission.repository";
import { PermissionInheritanceServiceImpl } from "../../modules/permissions/infra/services/permission-inheritance.service";




// Instância única de cache para o middleware
const permissionCache = env.REDIS_URL
  ? new RedisPermissionCacheService()
  : new InMemoryPermissionCacheService();

/**
 * Instância única do use case de resolução de permissões para evitar instanciamento em cada requisição
 */
function createResolverUseCase() {
  const permissionRepo = new PrismaPermissionRepository();
  const orgRepo = new PrismaOrganizationRepository();
  const posPermRepo = new PrismaPositionPermissionRepository();
  const secPermRepo = new PrismaSectorPermissionRepository();
  const depPermRepo = new PrismaDepartmentPermissionRepository();
  const userPermRepo = new PrismaUserPermissionRepository();
  const posMemRepo = new PrismaPositionMembershipRepository();
  const depMemRepo = new PrismaDepartmentMembershipRepository();
  const posRepo = new PrismaPositionRepository();

  const depRepo = new PrismaDepartmentRepository();
  const secRepo = new PrismaSectorRepository();

  const inheritanceService = new PermissionInheritanceServiceImpl({
    departmentRepository: depRepo,
    sectorRepository: secRepo,
    positionRepository: posRepo,
    departmentPermissionRepository: depPermRepo,
    sectorPermissionRepository: secPermRepo,
    positionPermissionRepository: posPermRepo,
    permissionRepository: permissionRepo,
  });

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
    permissionInheritanceService: inheritanceService,
  });
}

const resolverPermissoesEfetivasUseCase = createResolverUseCase();


type PermissionCheckOptions = {
  permission: string; // ID ou código da permissão (ex: "products:view")
  resource?: string; // Recurso específico (opcional)
  requireAll?: boolean; // Se true, requer todas as permissões (para array)
};

/**
 * Instâncias globais de serviços de segurança avançada
 */
const prisma = getPrisma();
const opaService = new OpaService();
const opaProvider = new OpaDecisionProvider(opaService);
const mlEnsemble = new MlEnsembleService(prisma);
const riskService = new RiskScoringService(mlEnsemble, opaService);
const immutableAudit = new ImmutableAuditService(prisma);
const uebaService = new UebaService(prisma);
const governancePep = new GovernancePepService(prisma);


// Registrar OPA no Engine
unifiedPolicyEngine.registerProvider(opaProvider);

/**
 * Middleware para verificar permissão (Primary PEP - Policy Enforcement Point)
 */
export function requirePermission(options: PermissionCheckOptions) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // 1. AuthN (Identity)
    if (!request.auth) {
      throw new AuthenticationError("Autenticação necessária");
    }


    const { permission } = options;
    const userId = request.auth?.userId;
    const orgId = extractOrgId(request);

    if (!userId || !orgId) {
      throw new AuthorizationError("Permissão negada (Contexto Inválido)");
    }


    try {
      // 2. Security Governance Layer (SGS) - Risk & Behavioral Analysis
      
      // 2.1 Behavioral Analysis (UEBA)
      const uebaResult = await uebaService.analyzeBehavior(userId, orgId, {
        action: permission,
        ip: request.ip
      });

      // 2.2 Risk Scoring (ML + UEBA Adjustment)
      let baseRiskScore = await riskService.calculateRiskScore(userId, orgId, {
        ip: request.ip,
        userAgent: request.headers['user-agent']
      });
      
      const riskScore = Math.min(100, baseRiskScore + uebaResult.riskScoreAdjustment);

      // 2.3 Runtime Security Controls (Governance PEP)
      
      // Check for Kill Switch
      if (governancePep.isFeatureDisabled(permission)) {
        throw new ServiceUnavailableError(
          "SecurityGovernance",
          60,
          "Esta funcionalidade está temporariamente desativada por motivos de segurança"
        );
      }


      // Check for Rate Limit per permission
      const withinRateLimit = await governancePep.checkRateLimit(userId, permission);
      if (!withinRateLimit) {
        throw new RateLimitError(60, "Limite de frequência excedido para esta ação");
      }


      // Check for Session Quarantine (Extreme Risk or Manual Lock)
      if (riskScore > 90 || governancePep.isUserQuarantined(userId)) {
        await immutableAudit.logEvent({
          orgId, userId, type: 'SECURITY_QUARANTINE',
          payload: { reason: 'CRITICAL_RISK', score: riskScore, uebaReasons: uebaResult.reasons },
          metadata: { ip: request.ip, userAgent: request.headers['user-agent'] }
        });
        return reply.status(403).send({ 
          message: "Acesso bloqueado por anomalia de segurança identificada", 
          code: "SECURITY_QUARANTINE",
          riskScore 
        });
      }

      // 3. Authorization (PBAC + ABAC + TBAC)
      const effectivePermissions = await resolverPermissoesEfetivasUseCase.execute({ orgId, userId });

      
      const userContext: any = { // UserContext
        userId,
        orgId,
        riskScore,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        role: request.auth?.role,
        isDegraded: riskScore > 60 // "Degraded Access" mode if risk is medium-high
      };

      const { action, subject } = CaslAbilityFactory.parsePermissionKey(permission);
      
      // Hybrid OPA Check (Asynchronous)
      if (action && subject) {
        const securityContext = {
           user: { id: userId, role: request.auth?.role || 'member' },
           environment: { 
             time: new Date(), 
             riskScore, 
             ip: request.ip, 
             userAgent: request.headers['user-agent'] as string,
             mfaVerified: false 
           }
        };

        const isAllowedByOpa = await unifiedPolicyEngine.evaluateAsync(
          action, 
          subject as string, 
          securityContext
        );

        if (!isAllowedByOpa) {
          await immutableAudit.logEvent({
            orgId, userId, type: 'POLICY_VIOLATION_OPA',
            payload: { permission, riskScore, action, subject }
          });
          throw new AuthorizationError("Acesso negado por governança centralizada");
        }

      }

      // Fine-Grained CASL Check
      const ability = CaslAbilityFactory.createForUserWithConditions(effectivePermissions, userContext);

      if (!action || !subject || ability.cannot(action, subject)) {
        await immutableAudit.logEvent({
          orgId, userId, type: 'POLICY_VIOLATION_CASL',
          payload: { permission, riskScore }
        });
        throw new AuthorizationError(`Permissão negada para ${permission}`);
      }


      // 4. Immutable Forensics (Success Log with Hash Chain)
      await immutableAudit.logEvent({
        orgId, userId, type: 'ACCESS_GRANTED',
        payload: { permission, riskScore, uebaAdjustment: uebaResult.riskScoreAdjustment },
        metadata: { ip: request.ip, userAgent: request.headers['user-agent'] }
      });

    } catch (error) {
      request.log.error(error, "SGS Error during PEP execution");
      return reply.status(500).send({ message: "Erro de processamento de segurança", code: "SGS_ERROR" });
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

    if (!userId || !orgId)
      return reply.status(403).send({ message: "Contexto inválido", code: "FORBIDDEN" });

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

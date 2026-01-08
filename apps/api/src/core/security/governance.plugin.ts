import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { AccessEngine } from "../../lib/governance/engine/core";
import type { AccessContext } from "../../lib/governance/types/context.types";

// Extensão de tipos
declare module "fastify" {
  interface FastifyContextConfig {
    governance?: {
      screen: string;
      action: string;
    };
  }
}

const governancePlugin: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", async (request, reply) => {
    // 1. Verificar se a rota exige governança
    const config = request.routeOptions.config;
    if (!config?.governance) {
      return;
    }

    // 2. Montar Contexto (AccessContext)
    const user = (request as any).user || { id: "anonymous", role: "GUEST", orgId: "system" };

    if (!user.id || user.id === "anonymous") {
      return reply.status(401).send({ message: "Authentication required for governed routes" });
    }

    const context: AccessContext = {
      userId: user.id,
      role: (user as any).role || "MEMBER",
      screen: config.governance.screen,
      action: config.governance.action,
      timestamp: new Date(),
      ip: request.ip,
      device: request.headers["user-agent"] || "unknown",
    };

    // 3. Carregar Política Real do Banco (PBAC - Zero Mocks)
    const { GovernancePolicyService } = await import(
      "../../lib/governance/services/governance-policy.service"
    );
    const policy = await GovernancePolicyService.getActivePolicy((user as any).orgId || "system");

    // 4. Executar Engine com Histórico Real (AuBAC)
    const { SecurityAuditService } = await import("../security/security-audit.service");
    const history = await SecurityAuditService.getUserSecurityHistory(user.id);

    const result = await AccessEngine.evaluateAccess(context, policy, history);

    // 5. Aplicar Decisão
    if (result.decision === "DENY" || result.decision === "REQUIRE_MANAGER_APPROVAL") {
      request.log.warn({ governance: result }, "Access Denied by Governance Engine");
      return reply.status(403).send({
        message: "Access Denied",
        code: "GOVERNANCE_VIOLATION",
        reasons: result.reasons,
      });
    }

    // 6. Anexar decisão para Auditoria (AuditInterceptor)
    (request as any).governanceDecision = result;
  });

  // Interceptor de Auditoria Forense (onResponse) - Zero Mocks
  app.addHook("onResponse", async (request, reply) => {
    const decision = (request as any).governanceDecision;
    if (decision) {
      const { UnifiedAuditService } = await import("../security/unified-audit.service");
      const user = (request as any).user;

      await UnifiedAuditService.log("SECURITY_ALERT", {
        severity: decision.decision === "ALLOW" ? "INFO" : "AUDIT",
        metadata: {
          decision,
          screen: (request.routeOptions.config as any)?.governance?.screen,
        },
        context: {
          userId: user?.id,
          orgId: user?.orgId,
          ipAddress: request.ip,
          userAgent: request.headers["user-agent"],
        },
      });
    }
  });
};

export default fp(governancePlugin);

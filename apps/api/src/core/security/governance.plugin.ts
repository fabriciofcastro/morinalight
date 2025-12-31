import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { AccessEngine } from "../../lib/governance/engine/core";
import { PolicyLoader } from "../../lib/governance/loader";

// Mock de política (deve vir de um singleton ou DB cache)
import { AccessContext } from "../../lib/governance/types/context.types";

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
    // Configuração global: Carregar política na inicialização
    // TODO: Em prod, carregar do DB/Cache
    const policy = PolicyLoader.load({
        meta: { system: "Morina", version: "1.0", timezone: "America/Sao_Paulo", audit_retention_days: 365, immutable: true },
        working_hours: { default: { days: ["MON", "TUE", "WED", "THU", "FRI"], start: "08:00", end: "18:00" }, tolerance_minutes: 15 },
        roles: {
            "ADMIN": { allowed_screens: ["*"] },
            "MEMBER": { allowed_screens: ["DASHBOARD"] }
        },
        policies: [],
        pbac: { active_policies: [], policy_versioning: { enabled: false, decision_log: true } },
        aubac: {
            risk_scoring: { outside_hours_access: { weight: 5 }, foreign_ip_access: { weight: 10 } },
            thresholds: { medium_risk: { score: 20, action: "AUDIT" }, high_risk: { score: 50, action: "BLOCK" } }
        }
    });

    app.addHook("preHandler", async (request, reply) => {
        // 1. Verificar se a rota exige governança
        const config = request.routeOptions.config;
        if (!config?.governance) {
            return;
        }

        // 2. Montar Contexto (AccessContext)
        // Assumindo que o Auth Middleware já populou request.auth ou request.user
        const user = (request as any).user || { id: "anonymous", role: "GUEST" };

        // Se não tiver user, talvez falhar ou assumir GUEST?
        if (!user.id) {
            // Se o auth middleware falhou em barrar, barramos aqui se a rota tiver governança
            return reply.status(401).send({ message: "Authentication required for governed routes" });
        }

        const context: AccessContext = {
            userId: user.id,
            role: user.role || "MEMBER", // Falback
            screen: config.governance.screen,
            action: config.governance.action,
            timestamp: new Date(),
            ip: request.ip,
            device: request.headers["user-agent"] || "unknown"
        };

        // 3. Executar Engine
        // Mock History por enquanto
        const result = AccessEngine.evaluateAccess(context, policy, { outsideHoursCount: 0, foreignIpCount: 0 });

        // 4. Aplicar Decisão
        if (result.decision === 'DENY' || result.decision === 'REQUIRE_MANAGER_APPROVAL') {
            request.log.warn({ governance: result }, "Access Denied by Governance Engine");
            return reply.status(403).send({
                message: "Access Denied",
                code: "GOVERNANCE_VIOLATION",
                reasons: result.reasons
            });
        }

        // 5. Anexar decisão para Auditoria (AuditInterceptor)
        (request as any).governanceDecision = result;
    });

    // Interceptor de Auditoria (onResponse)
    app.addHook("onResponse", async (request, reply) => {
        const decision = (request as any).governanceDecision;
        if (decision) {
            // TODO: Despachar para o IntegrityService / Database
            // Ex: AuditService.log(decision)...
            request.log.info({ audit: true, decision }, "Governance Audit Log");
        }
    });
};

export default fp(governancePlugin);

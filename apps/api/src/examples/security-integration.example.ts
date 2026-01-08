import { PrismaClient } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { AdvancedAuditService } from "../modules/audit/domain/services/advanced-audit.service";
import { AuditInterceptor } from "../modules/audit/interceptors/audit.interceptor";
import { auditRoutes } from "../modules/audit/routes/audit.routes";
import { SessionManagementService } from "../modules/auth/domain/services/session-management.service";
import { GeoControlService } from "../modules/permissions/domain/services/geo-control.service";
// Serviços
import { TbacService } from "../modules/permissions/domain/services/tbac.service";
import { GeoFencingMiddleware } from "../modules/permissions/middleware/geo-fencing.middleware";
// Middleware
import { TbacMiddleware } from "../modules/permissions/middleware/tbac.middleware";
import { geoControlRoutes } from "../modules/permissions/routes/geo-control.routes";
// Rotas
import { tbacRoutes } from "../modules/permissions/routes/tbac.routes";
import { AlertService } from "../modules/security/domain/services/alert.service";
import { BehavioralAnalysisService } from "../modules/security/domain/services/behavioral-analysis.service";
import { BehavioralAnalysisMiddleware } from "../modules/security/middleware/behavioral-analysis.middleware";
import { monitoringRoutes } from "../modules/security/routes/monitoring.routes";

/**
 * Plugin de Segurança Avançada
 * Integra todos os componentes de segurança
 */
export async function securityPlugin(fastify: FastifyInstance) {
  const prisma = new PrismaClient();

  // Registra Prisma no Fastify
  fastify.decorate("prisma", prisma);

  // Inicializa serviços
  const tbacService = new TbacService(prisma);
  const geoService = new GeoControlService(prisma);
  const behavioralService = new BehavioralAnalysisService(prisma);
  const auditService = new AdvancedAuditService(prisma);
  const alertService = new AlertService(prisma);
  const sessionService = new SessionManagementService(prisma);

  // ========================================
  // MIDDLEWARE GLOBAL (Aplicado a todas as rotas)
  // ========================================

  // 1. Audit Interceptor - Registra todas as requisições
  fastify.addHook("onRequest", AuditInterceptor.create(auditService));

  // 2. Behavioral Analysis - Analisa comportamento
  fastify.addHook(
    "onRequest",
    BehavioralAnalysisMiddleware.create(behavioralService, alertService),
  );

  // ========================================
  // MIDDLEWARE SELETIVO (Aplicado apenas em rotas específicas)
  // ========================================

  // Exemplo: Aplicar TBAC apenas em rotas sensíveis
  const tbacMiddleware = TbacMiddleware.create(tbacService);
  const geoMiddleware = GeoFencingMiddleware.create(geoService);

  // Rotas com TBAC
  fastify.register(async (instance) => {
    instance.addHook("onRequest", tbacMiddleware);

    // Suas rotas protegidas aqui
    instance.get("/api/sensitive-data", async (request, reply) => {
      return { message: "Dados sensíveis - acesso controlado por TBAC" };
    });
  });

  // Rotas com Geo-Fencing
  fastify.register(async (instance) => {
    instance.addHook("onRequest", geoMiddleware);

    // Suas rotas com restrição geográfica
    instance.get("/api/geo-restricted", async (request, reply) => {
      return { message: "Acesso restrito geograficamente" };
    });
  });

  // Rotas com TBAC + Geo-Fencing
  fastify.register(async (instance) => {
    instance.addHook("onRequest", tbacMiddleware);
    instance.addHook("onRequest", geoMiddleware);

    // Suas rotas com máxima segurança
    instance.get("/api/maximum-security", async (request, reply) => {
      return { message: "Máxima segurança - TBAC + Geo" };
    });
  });

  // ========================================
  // ROTAS DE ADMINISTRAÇÃO
  // ========================================

  // Registra rotas de gerenciamento
  fastify.register(tbacRoutes, { prefix: "/api" });
  fastify.register(geoControlRoutes, { prefix: "/api" });
  fastify.register(auditRoutes, { prefix: "/api" });
  fastify.register(monitoringRoutes, { prefix: "/api" });

  // ========================================
  // LIMPEZA DE SESSÕES EXPIRADAS (Cron Job)
  // ========================================

  // Executa a cada 1 hora
  setInterval(
    async () => {
      try {
        const cleaned = await sessionService.cleanupExpiredSessions();
        console.log(`[Security] Limpou ${cleaned} sessões expiradas`);
      } catch (error) {
        console.error("[Security] Erro ao limpar sessões:", error);
      }
    },
    60 * 60 * 1000,
  ); // 1 hora

  // ========================================
  // GRACEFUL SHUTDOWN
  // ========================================

  fastify.addHook("onClose", async () => {
    await prisma.$disconnect();
  });
}

/**
 * Exemplo de uso em app.ts
 */
export async function createApp() {
  const fastify = require("fastify")({
    logger: true,
  });

  // Registra plugin de segurança
  await fastify.register(securityPlugin);

  // Suas outras rotas e plugins aqui...

  return fastify;
}

// ========================================
// EXEMPLO DE USO PROGRAMÁTICO
// ========================================

/**
 * Exemplo: Validar acesso temporal programaticamente
 */
export async function exampleTbacUsage() {
  const prisma = new PrismaClient();
  const tbacService = new TbacService(prisma);

  const userId = "user-123";

  // Verifica se pode acessar agora
  const allowed = await tbacService.isAccessAllowedNow(userId);

  if (!allowed) {
    console.log("Acesso negado: fora do horário");
    return;
  }

  console.log("Acesso permitido");
}

/**
 * Exemplo: Criar acesso emergencial
 */
export async function exampleEmergencyAccess() {
  const prisma = new PrismaClient();
  const tbacService = new TbacService(prisma);

  const userId = "user-123";
  const orgId = "org-456";
  const durationMinutes = 60; // 1 hora

  const emergencyWindow = await tbacService.createEmergencyAccess(userId, durationMinutes, orgId);

  console.log("Acesso emergencial criado:", emergencyWindow);
}

/**
 * Exemplo: Validar acesso geográfico
 */
export async function exampleGeoValidation() {
  const prisma = new PrismaClient();
  const geoService = new GeoControlService(prisma);

  const userId = "user-123";
  const ipAddress = "192.168.1.100";

  const result = await geoService.validateAccess(userId, ipAddress);

  if (!result.allowed) {
    console.log("Acesso bloqueado:", result.reason);
    return;
  }

  console.log("Acesso permitido");
}

/**
 * Exemplo: Analisar comportamento
 */
export async function exampleBehavioralAnalysis() {
  const prisma = new PrismaClient();
  const behavioralService = new BehavioralAnalysisService(prisma);

  const userId = "user-123";
  const context = {
    userId,
    ipAddress: "192.168.1.100",
    country: "BR",
    city: "São Paulo",
    deviceId: "device-fingerprint-123",
    resource: "/api/sensitive-data",
    timestamp: new Date(),
  };

  const analysis = await behavioralService.analyzeAccess(userId, context);

  console.log("Risk Score:", analysis.riskScore);
  console.log("Anomalias:", analysis.anomalies);
  console.log("É normal?", analysis.isNormal);
}

/**
 * Exemplo: Buscar logs de auditoria
 */
export async function exampleAuditSearch() {
  const prisma = new PrismaClient();
  const auditService = new AdvancedAuditService(prisma);

  const orgId = "org-456";

  // Busca acessos negados nas últimas 24h
  const result = await auditService.searchLogs({
    orgId,
    effect: "DENY",
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    page: 1,
    limit: 50,
  });

  console.log("Total de acessos negados:", result.total);
  console.log("Logs:", result.data);
}

/**
 * Exemplo: Gerar relatório de compliance
 */
export async function exampleComplianceReport() {
  const prisma = new PrismaClient();
  const auditService = new AdvancedAuditService(prisma);

  const orgId = "org-456";
  const report = await auditService.getComplianceReport("LGPD", orgId, {
    start: new Date("2024-01-01"),
    end: new Date("2024-12-31"),
  });

  console.log("Relatório LGPD:", report);
}

/**
 * Exemplo: Criar alerta de segurança
 */
export async function exampleCreateAlert() {
  const prisma = new PrismaClient();
  const alertService = new AlertService(prisma);

  const userId = "user-123";

  const alert = await alertService.createMultipleFailedLoginsAlert(userId, 5, "192.168.1.100");

  console.log("Alerta criado:", alert);
}

/**
 * Exemplo: Gerenciar sessões
 */
export async function exampleSessionManagement() {
  const prisma = new PrismaClient();
  const sessionService = new SessionManagementService(prisma);

  const userId = "user-123";

  // Lista sessões ativas
  const sessions = await sessionService.getActiveSessions(userId);
  console.log("Sessões ativas:", sessions.length);

  // Detecta sessões simultâneas suspeitas
  const suspicious = await sessionService.detectSimultaneousSessions(userId);

  if (suspicious.hasSuspiciousActivity) {
    console.log("⚠️ Atividade suspeita detectada!");
    console.log("Sessões:", suspicious.sessions);
  }

  // Revoga todas as sessões
  await sessionService.revokeAllUserSessions(userId, "admin-user-id");
  console.log("Todas as sessões foram revogadas");
}

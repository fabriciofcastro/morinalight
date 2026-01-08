import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { AdvancedAuditService } from "../domain/services/advanced-audit.service";
import {
  type AuditSearchDto,
  auditSearchSchema,
  type ComplianceReportDto,
  complianceReportSchema,
  type ExportLogsDto,
  exportLogsSchema,
} from "../schemas/audit.schemas";

/**
 * Rotas de Auditoria Avançada
 */
export async function auditRoutes(fastify: FastifyInstance) {
  const auditService = new AdvancedAuditService(fastify.prisma);

  /**
   * GET /api/audit/permissions
   * Log de mudanças de permissões
   */
  fastify.get("/audit/permissions", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const orgId = request.user.orgId;

      // Busca mudanças de permissões (subject = Permission)
      const logs = await auditService.searchLogs({
        orgId,
        subject: "Permission",
        limit: 100,
      });

      return reply.send(logs);
    } catch (error) {
      return reply.status(500).send({ error: "Erro ao buscar log de permissões" });
    }
  });

  /**
   * GET /api/audit/access-decisions
   * Log de decisões de acesso
   */
  fastify.get("/audit/access-decisions", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const orgId = request.user.orgId;

      const logs = await auditService.searchLogs({
        orgId,
        limit: 100,
      });

      return reply.send(logs);
    } catch (error) {
      return reply.status(500).send({ error: "Erro ao buscar decisões de acesso" });
    }
  });

  /**
   * GET /api/audit/users/:id/activity
   * Atividade de um usuário específico
   */
  fastify.get<{ Params: { id: string } }>("/audit/users/:id/activity", async (request, reply) => {
    try {
      const orgId = request.user.orgId;
      const { id: userId } = request.params;

      const logs = await auditService.searchLogs({
        orgId,
        userId,
        limit: 200,
      });

      return reply.send(logs);
    } catch (error) {
      return reply.status(500).send({ error: "Erro ao buscar atividade do usuário" });
    }
  });

  /**
   * GET /api/audit/suspicious-activity
   * Atividades suspeitas
   */
  fastify.get(
    "/audit/suspicious-activity",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = request.user.orgId;
        const suspicious = await auditService.getSuspiciousActivity(orgId);
        return reply.send({ data: suspicious });
      } catch (error) {
        return reply.status(500).send({ error: "Erro ao buscar atividades suspeitas" });
      }
    },
  );

  /**
   * GET /api/audit/failed-attempts
   * Tentativas de acesso negadas
   */
  fastify.get("/audit/failed-attempts", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const orgId = request.user.orgId;
      const threshold = 3; // Mínimo de tentativas para aparecer

      const attempts = await auditService.getFailedAttempts(orgId, threshold);
      return reply.send({ data: attempts });
    } catch (error) {
      return reply.status(500).send({ error: "Erro ao buscar tentativas falhadas" });
    }
  });

  /**
   * GET /api/audit/export
   * Exporta logs de auditoria
   */
  fastify.get<{ Querystring: ExportLogsDto }>(
    "/audit/export",
    {
      schema: {
        querystring: exportLogsSchema,
      },
    },
    async (request, reply) => {
      try {
        const orgId = request.user.orgId;
        const { format, ...searchParams } = request.query;

        const buffer = await auditService.exportLogs({ orgId, ...searchParams }, format);

        const contentTypes = {
          CSV: "text/csv",
          JSON: "application/json",
          PDF: "application/pdf",
        };

        const extensions = {
          CSV: "csv",
          JSON: "json",
          PDF: "pdf",
        };

        return reply
          .header("Content-Type", contentTypes[format])
          .header("Content-Disposition", `attachment; filename=audit-log.${extensions[format]}`)
          .send(buffer);
      } catch (error) {
        return reply.status(500).send({ error: "Erro ao exportar logs" });
      }
    },
  );

  /**
   * POST /api/audit/search
   * Busca avançada de logs
   */
  fastify.post<{ Body: AuditSearchDto }>(
    "/audit/search",
    {
      schema: {
        body: auditSearchSchema,
      },
    },
    async (request, reply) => {
      try {
        const orgId = request.user.orgId;
        const result = await auditService.searchLogs({
          orgId,
          ...request.body,
        });
        return reply.send(result);
      } catch (error) {
        return reply.status(500).send({ error: "Erro ao buscar logs" });
      }
    },
  );

  /**
   * GET /api/audit/compliance-report
   * Gera relatório de compliance
   */
  fastify.get<{ Querystring: ComplianceReportDto }>(
    "/audit/compliance-report",
    {
      schema: {
        querystring: complianceReportSchema,
      },
    },
    async (request, reply) => {
      try {
        const orgId = request.user.orgId;
        const { type, startDate, endDate } = request.query;

        const report = await auditService.getComplianceReport(type, orgId, {
          start: startDate,
          end: endDate,
        });

        return reply.send({ data: report });
      } catch (error) {
        return reply.status(500).send({ error: "Erro ao gerar relatório de compliance" });
      }
    },
  );
}

import type { PrismaClient } from "@prisma/client";
import type { FastifyInstance } from "fastify";

interface AuditLog {
  id: string;
  orgId: string;
  action: string;
  entity: string;
  fieldName: string | null;
  fieldLabel: string | null;
  oldValue: any;
  newValue: any;
  actorId: string;
  actorName: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  justification: string | null;
  metadata: any;
  createdAt: Date;
}

interface AuditQueryParams {
  limit?: string;
  offset?: string;
  fieldName?: string;
  actorId?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Rotas de auditoria para Company Settings
 */
export async function registerAuditRoutes(app: FastifyInstance, prisma: PrismaClient) {
  // GET /company-settings/audit - Listar histórico de alterações
  app.get<{ Querystring: AuditQueryParams }>("/company-settings/audit", async (request, reply) => {
    // Obter orgId do header
    const orgId = request.headers["x-org-id"] as string;

    if (!orgId) {
      return reply.status(400).send({
        message: "x-org-id é obrigatório",
      });
    }

    const { limit = "50", offset = "0", fieldName, actorId, startDate, endDate } = request.query;

    // Construir filtro
    const where: any = {
      orgId,
    };

    if (fieldName) {
      where.fieldName = fieldName;
    }

    if (actorId) {
      where.actorId = actorId;
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    try {
      const [logs, total] = await Promise.all([
        prisma.companySettingsAuditLog.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: parseInt(limit, 10),
          skip: parseInt(offset, 10),
        }),
        prisma.companySettingsAuditLog.count({ where }),
      ]);

      return reply.send({
        logs,
        total,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
      });
    } catch (error) {
      console.error("[AuditRoutes] Erro ao buscar logs:", error);
      return reply.status(500).send({
        message: "Erro ao buscar logs de auditoria",
      });
    }
  });

  // GET /company-settings/audit/export - Exportar para CSV
  app.get("/company-settings/audit/export", async (request, reply) => {
    const orgId = request.headers["x-org-id"] as string;

    if (!orgId) {
      return reply.status(400).send({
        message: "x-org-id é obrigatório",
      });
    }

    try {
      const logs = await prisma.companySettingsAuditLog.findMany({
        where: { orgId },
        orderBy: { createdAt: "desc" },
      });

      // Converter para CSV
      const csv = convertToCSV(logs);

      return reply
        .type("text/csv")
        .header("Content-Disposition", `attachment; filename="audit-log-${Date.now()}.csv"`)
        .send(csv);
    } catch (error) {
      console.error("[AuditRoutes] Erro ao exportar logs:", error);
      return reply.status(500).send({
        message: "Erro ao exportar logs de auditoria",
      });
    }
  });
}

/**
 * Converte array de logs para CSV
 */
function convertToCSV(logs: AuditLog[]): string {
  if (logs.length === 0) {
    return "Data,Ação,Campo,Valor Anterior,Valor Novo,Usuário,IP\n";
  }

  const header = "Data,Ação,Entidade,Campo,Label,Valor Anterior,Valor Novo,Usuário,IP,User-Agent\n";

  const rows = logs.map((log) => {
    const formatValue = (val: any) => {
      if (val === null || val === undefined) return "";
      if (typeof val === "object") return JSON.stringify(val);
      return String(val).replace(/"/g, '""'); // Escape aspas
    };

    return [
      log.createdAt.toISOString(),
      log.action,
      log.entity,
      log.fieldName || "",
      log.fieldLabel || "",
      formatValue(log.oldValue),
      formatValue(log.newValue),
      log.actorName || log.actorId,
      log.ipAddress || "",
      log.userAgent || "",
    ]
      .map((field) => `"${field}"`)
      .join(",");
  });

  return header + rows.join("\n");
}

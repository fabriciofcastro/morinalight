import type { PrismaService } from "@/core/database/prisma.service";
import type { AccessDecisionLog } from "@prisma/client";

/**
 * Query de busca de auditoria
 */
export interface AuditSearchQuery {
  orgId: string;
  userId?: string;
  action?: string;
  subject?: string;
  effect?: "ALLOW" | "DENY";
  startDate?: Date;
  endDate?: Date;
  minRiskScore?: number;
  hasAnomalies?: boolean;
  ipAddress?: string;
  country?: string;
  page?: number;
  limit?: number;
}

/**
 * Resultado paginado
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Tipo de compliance
 */
export type ComplianceType = "LGPD" | "SOC2" | "ISO27001";

/**
 * Relatório de compliance
 */
export interface ComplianceReport {
  type: ComplianceType;
  period: { start: Date; end: Date };
  totalAccesses: number;
  deniedAccesses: number;
  highRiskAccesses: number;
  anomalies: number;
  piiAccessCount: number; // Novo: Acessos a dados sensíveis
  topUsers: Array<{ userId: string; accessCount: number }>;
  topResources: Array<{ subject: string; accessCount: number }>;
  summary: string;
}

const PII_SUBJECTS = ["User", "Cliente", "Supplier", "Representante", "Contrato"];

/**
 * Formato de exportação
 */
export type ExportFormat = "CSV" | "JSON" | "PDF";

/**
 * Resumo de tentativas falhadas
 */
export interface FailedAttemptSummary {
  userId?: string;
  ipAddress?: string;
  count: number;
  lastAttempt: Date;
}

/**
 * AdvancedAuditService
 * Serviço de auditoria avançada com busca, relatórios e exportação
 */
export class AdvancedAuditService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registra decisão de acesso
   */
  async logAccessDecision(log: {
    orgId: string;
    userId?: string;
    action: string;
    subject: string;
    resourceId?: string;
    resource?: any;
    effect: "ALLOW" | "DENY";
    reason?: string;
    context?: any;
    ipAddress?: string;
    userAgent?: string;
    country?: string;
    city?: string;
    isVpn?: boolean;
    isProxy?: boolean;
    isTor?: boolean;
    riskScore?: number;
    anomalies?: string[];
  }): Promise<void> {
    await this.prisma.accessDecisionLog.create({
      data: {
        orgId: log.orgId,
        userId: log.userId,
        action: log.action,
        subject: log.subject,
        resourceId: log.resourceId,
        resource: log.resource,
        effect: log.effect,
        reason: log.reason,
        context: log.context,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        country: log.country,
        city: log.city,
        isVpn: log.isVpn || false,
        isProxy: log.isProxy || false,
        isTor: log.isTor || false,
        riskScore: log.riskScore || 0,
        anomalies: log.anomalies || [],
      },
    });
  }

  /**
   * Busca logs com filtros avançados
   */
  async searchLogs(query: AuditSearchQuery): Promise<PaginatedResult<AccessDecisionLog>> {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {
      orgId: query.orgId,
    };

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.action) {
      where.action = query.action;
    }

    if (query.subject) {
      where.subject = query.subject;
    }

    if (query.effect) {
      where.effect = query.effect;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = query.startDate;
      }
      if (query.endDate) {
        where.createdAt.lte = query.endDate;
      }
    }

    if (query.minRiskScore !== undefined) {
      where.riskScore = { gte: query.minRiskScore };
    }

    if (query.hasAnomalies) {
      where.anomalies = { isEmpty: false };
    }

    if (query.ipAddress) {
      where.ipAddress = query.ipAddress;
    }

    if (query.country) {
      where.country = query.country;
    }

    const [data, total] = await Promise.all([
      this.prisma.accessDecisionLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.accessDecisionLog.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Gera relatório de compliance
   */
  async getComplianceReport(
    type: ComplianceType,
    orgId: string,
    dateRange: { start: Date; end: Date },
  ): Promise<ComplianceReport> {
    const logs = await this.prisma.accessDecisionLog.findMany({
      where: {
        orgId,
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      },
    });

    const totalAccesses = logs.length;
    const deniedAccesses = logs.filter((l) => l.effect === "DENY").length;
    const highRiskAccesses = logs.filter((l) => l.riskScore >= 70).length;
    const anomalies = logs.filter((l) => l.anomalies.length > 0).length;

    // Top usuários
    const userCounts = new Map<string, number>();
    logs.forEach((log) => {
      if (log.userId) {
        userCounts.set(log.userId, (userCounts.get(log.userId) || 0) + 1);
      }
    });
    const topUsers = Array.from(userCounts.entries())
      .map(([userId, accessCount]) => ({ userId, accessCount }))
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, 10);

    // Top recursos
    const resourceCounts = new Map<string, number>();
    logs.forEach((log) => {
      resourceCounts.set(log.subject, (resourceCounts.get(log.subject) || 0) + 1);
    });
    const topResources = Array.from(resourceCounts.entries())
      .map(([subject, accessCount]) => ({ subject, accessCount }))
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, 10);

    const piiAccessCount = logs.filter((l) => PII_SUBJECTS.includes(l.subject)).length;

    // Gera resumo baseado no tipo
    let summary = "";
    switch (type) {
      case "LGPD":
        summary = `Relatório LGPD: ${totalAccesses} acessos registrados, ${deniedAccesses} negados. `;
        summary += `${piiAccessCount} acessos a dados sensíveis (PII) identificados. `;
        summary += `${highRiskAccesses} acessos de alto risco requerem auditoria imediata.`;
        break;
      case "SOC2":
        summary = `Relatório SOC2: Controles de acesso monitorados. `;
        summary += `Taxa de negação: ${((deniedAccesses / totalAccesses) * 100).toFixed(2)}%. `;
        summary += `${anomalies} anomalias detectadas.`;
        break;
      case "ISO27001":
        summary = `Relatório ISO27001: Gestão de segurança da informação. `;
        summary += `${totalAccesses} eventos de acesso auditados. `;
        summary += `${highRiskAccesses} eventos de alto risco requerem atenção.`;
        break;
    }

    return {
      type,
      period: dateRange,
      totalAccesses,
      deniedAccesses,
      highRiskAccesses,
      anomalies,
      piiAccessCount,
      topUsers,
      topResources,
      summary,
    };
  }

  /**
   * Exporta logs em formato específico
   */
  async exportLogs(query: AuditSearchQuery, format: ExportFormat): Promise<Buffer> {
    const result = await this.searchLogs({ ...query, limit: 10000 }); // Max 10k registros

    switch (format) {
      case "CSV":
        return this.exportToCsv(result.data);
      case "JSON":
        return this.exportToJson(result.data);
      case "PDF":
        return this.exportToPdf(result.data);
      default:
        throw new Error(`Formato não suportado: ${format}`);
    }
  }

  /**
   * Obtém atividades suspeitas
   */
  async getSuspiciousActivity(orgId: string, limit: number = 100): Promise<AccessDecisionLog[]> {
    return this.prisma.accessDecisionLog.findMany({
      where: {
        orgId,
        OR: [
          { riskScore: { gte: 70 } },
          { anomalies: { isEmpty: false } },
          { isVpn: true },
          { isTor: true },
        ],
      },
      orderBy: [{ riskScore: "desc" }, { createdAt: "desc" }],
      take: limit,
    });
  }

  /**
   * Obtém tentativas de acesso falhadas
   */
  async getFailedAttempts(orgId: string, threshold: number = 3): Promise<FailedAttemptSummary[]> {
    const failedLogs = await this.prisma.accessDecisionLog.findMany({
      where: {
        orgId,
        effect: "DENY",
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // últimas 24h
        },
      },
      select: {
        userId: true,
        ipAddress: true,
        createdAt: true,
      },
    });

    // Agrupa por usuário
    const byUser = new Map<string, { count: number; lastAttempt: Date }>();
    failedLogs.forEach((log) => {
      if (log.userId) {
        const current = byUser.get(log.userId);
        if (!current || log.createdAt > current.lastAttempt) {
          byUser.set(log.userId, {
            count: (current?.count || 0) + 1,
            lastAttempt: log.createdAt,
          });
        } else {
          byUser.set(log.userId, {
            ...current,
            count: current.count + 1,
          });
        }
      }
    });

    // Agrupa por IP
    const byIp = new Map<string, { count: number; lastAttempt: Date }>();
    failedLogs.forEach((log) => {
      if (log.ipAddress) {
        const current = byIp.get(log.ipAddress);
        if (!current || log.createdAt > current.lastAttempt) {
          byIp.set(log.ipAddress, {
            count: (current?.count || 0) + 1,
            lastAttempt: log.createdAt,
          });
        } else {
          byIp.set(log.ipAddress, {
            ...current,
            count: current.count + 1,
          });
        }
      }
    });

    const results: FailedAttemptSummary[] = [];

    // Adiciona usuários que excederam threshold
    byUser.forEach((data, userId) => {
      if (data.count >= threshold) {
        results.push({ userId, count: data.count, lastAttempt: data.lastAttempt });
      }
    });

    // Adiciona IPs que excederam threshold
    byIp.forEach((data, ipAddress) => {
      if (data.count >= threshold) {
        results.push({ ipAddress, count: data.count, lastAttempt: data.lastAttempt });
      }
    });

    return results.sort((a, b) => b.count - a.count);
  }

  /**
   * Exporta para CSV
   */
  private exportToCsv(logs: AccessDecisionLog[]): Buffer {
    const headers = [
      "Timestamp",
      "User ID",
      "Action",
      "Subject",
      "Effect",
      "Reason",
      "IP Address",
      "Country",
      "Risk Score",
      "Anomalies",
    ].join(",");

    const rows = logs.map((log) =>
      [
        log.createdAt.toISOString(),
        log.userId || "",
        log.action,
        log.subject,
        log.effect,
        log.reason || "",
        log.ipAddress || "",
        log.country || "",
        log.riskScore,
        log.anomalies.join(";"),
      ].join(","),
    );

    const csv = [headers, ...rows].join("\n");
    return Buffer.from(csv, "utf-8");
  }

  /**
   * Exporta para JSON
   */
  private exportToJson(logs: AccessDecisionLog[]): Buffer {
    return Buffer.from(JSON.stringify(logs, null, 2), "utf-8");
  }

  /**
   * Exporta para PDF utilizando pdfkit
   */
  private async exportToPdf(logs: AccessDecisionLog[]): Promise<Buffer> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const PDFDocument = require("pdfkit");

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Cabeçalho
      doc
        .fillColor("#1f2937")
        .fontSize(24)
        .text("Security Audit & Compliance Report", { align: "center" });
      doc.moveDown();
      doc
        .fontSize(10)
        .fillColor("#6b7280")
        .text(`Generated on: ${new Date().toLocaleString("pt-BR")}`, { align: "right" });
      doc.moveDown(2);

      // Resumo Executivo
      doc.fillColor("#111827").fontSize(16).text("Executive Summary", { underline: true });
      doc.moveDown();
      doc.fontSize(10).fillColor("#374151");
      doc.text(`Total Events Analyzed: ${logs.length}`);
      doc.text(`PII Data Accesses: ${logs.filter((l) => PII_SUBJECTS.includes(l.subject)).length}`);
      doc.text(`High Risk Events (Score >= 70): ${logs.filter((l) => l.riskScore >= 70).length}`);
      doc.text(`Denied Access Attempts: ${logs.filter((l) => l.effect === "DENY").length}`);
      doc.text(`Anomalies Detected: ${logs.filter((l) => l.anomalies.length > 0).length}`);
      doc.moveDown(2);

      // Seção LGPD (se houver muitos acessos PII ou se solicitado)
      const piiLogs = logs.filter((l) => PII_SUBJECTS.includes(l.subject));
      if (piiLogs.length > 0) {
        doc
          .fillColor("#4338ca")
          .fontSize(16)
          .text("LGPD - PII Access Summary", { underline: true });
        doc.moveDown();
        doc.fontSize(10).fillColor("#374151");
        doc.text("Os seguintes recursos contendo dados pessoais foram acessados no período:", {
          oblique: true,
        });
        doc.moveDown();

        const piiSummary = new Map<string, number>();
        piiLogs.forEach((l) => piiSummary.set(l.subject, (piiSummary.get(l.subject) || 0) + 1));

        piiSummary.forEach((count, subject) => {
          doc.text(`- ${subject}: ${count} acessos registrados`);
        });
        doc.moveDown(2);
      }

      // Tabela de Logs (Top 50 recentes)
      doc.fontSize(16).text("Detailed Activity Log (Latest 50)", { underline: true });
      doc.moveDown();

      const tableTop = doc.y;
      const col1 = 50;
      const col2 = 180;
      const col3 = 280;
      const col4 = 380;
      const col5 = 480;

      // Header da Tabela
      doc.fontSize(8).font("Helvetica-Bold");
      doc.text("Date", col1, tableTop);
      doc.text("User", col2, tableTop);
      doc.text("Action", col3, tableTop);
      doc.text("Effect", col4, tableTop);
      doc.text("Risk", col5, tableTop);
      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke("#e5e7eb");
      doc.moveDown();

      // Linhas
      doc.font("Helvetica");
      logs.slice(0, 50).forEach((log) => {
        if (doc.y > 700) {
          doc.addPage();
          doc.fontSize(8).font("Helvetica-Bold");
          doc.text("Date", col1, 50);
          doc.text("User", col2, 50);
          doc.text("Action", col3, 50);
          doc.text("Effect", col4, 50);
          doc.text("Risk", col5, 50);
          doc.moveTo(50, 65).lineTo(550, 65).stroke("#e5e7eb");
          doc.moveDown();
          doc.font("Helvetica");
        }

        const currentY = doc.y;
        doc.text(log.createdAt.toLocaleString("pt-BR"), col1, currentY);
        doc.text(log.userId || "Anonymous", col2, currentY);
        doc.text(`${log.action} ${log.subject}`, col3, currentY);

        // Cor por efeito
        if (log.effect === "ALLOW") {
          doc.fillColor("#059669").text(log.effect, col4, currentY).fillColor("#374151");
        } else {
          doc.fillColor("#dc2626").text(log.effect, col4, currentY).fillColor("#374151");
        }

        // Cor por risco
        if (log.riskScore >= 70) {
          doc
            .fillColor("#dc2626")
            .text(log.riskScore.toString(), col5, currentY)
            .fillColor("#374151");
        } else if (log.riskScore >= 30) {
          doc
            .fillColor("#d97706")
            .text(log.riskScore.toString(), col5, currentY)
            .fillColor("#374151");
        } else {
          doc.text(log.riskScore.toString(), col5, currentY);
        }

        doc.moveDown();
      });

      doc.end();
    });
  }
}

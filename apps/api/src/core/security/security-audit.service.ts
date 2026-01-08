import { getPrisma } from "../../infra/database/prisma.service";
import type { UserHistory } from "../../lib/governance/engine/aubac";

const prisma = getPrisma();

/**
 * Serviço para extrair histórico de segurança e métricas de risco do usuário (AuBAC)
 */
export class SecurityAuditService {
  /**
   * Calcula o histórico de risco resumido de um usuário nas últimas 24 horas
   */
  static async getUserSecurityHistory(userId: string): Promise<UserHistory> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // 1. Contar acessos fora de horário (Audit Log)
    const outsideHoursCount = await prisma.organizationAuditLog.count({
      where: {
        actorId: userId,
        action: "outside_hours_access", // Assumindo esta tag em logs de auditoria
        createdAt: { gte: oneDayAgo },
      },
    });

    // 2. Contar acessos de IP estrangeiro ou rate limit warnings
    const foreignIpCount = await prisma.organizationAuditLog.count({
      where: {
        actorId: userId,
        action: "rate_limit_warning",
        createdAt: { gte: oneDayAgo },
      },
    });

    // 3. Buscar último acesso
    const lastSession = await prisma.session.findFirst({
      where: { userId },
      orderBy: { lastActivity: "desc" },
    });

    return {
      outsideHoursCount,
      foreignIpCount,
      lastAccess: lastSession?.lastActivity,
    };
  }
}

import type { PrismaService } from "@/core/database/prisma.service";

/**
 * Input para criar alerta
 */
export interface CreateAlertInput {
  userId: string;
  alertType: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  country?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * AlertService
 * Gerencia alertas de segurança
 */
@Injectable()
export class AlertService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cria um novo alerta
   */
  async createAlert(input: CreateAlertInput): Promise<SecurityAlert> {
    return this.prisma.securityAlert.create({
      data: {
        userId: input.userId,
        alertType: input.alertType,
        severity: input.severity,
        description: input.description,
        metadata: input.metadata,
        ipAddress: input.ipAddress,
        country: input.country,
        city: input.city,
        latitude: input.latitude,
        longitude: input.longitude,
      },
    });
  }

  /**
   * Reconhece um alerta
   */
  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<void> {
    await this.prisma.securityAlert.update({
      where: { id: alertId },
      data: {
        acknowledged: true,
        acknowledgedAt: new Date(),
        acknowledgedBy,
      },
    });
  }

  /**
   * Resolve um alerta (marca como falso positivo ou resolvido)
   */
  async resolveAlert(alertId: string, userId: string, resolution: string): Promise<void> {
    // Por enquanto, apenas marca como reconhecido
    // TODO: Adicionar campo de resolução no schema
    await this.acknowledgeAlert(alertId, userId);
  }

  /**
   * Obtém alertas ativos de uma organização
   */
  async getActiveAlerts(userId: string): Promise<SecurityAlert[]> {
    return this.prisma.securityAlert.findMany({
      where: {
        userId,
        acknowledged: false,
      },
      orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
    });
  }

  /**
   * Descarta como falso positivo
   */
  async dismissFalsePositive(alertId: string, userId: string): Promise<void> {
    await this.acknowledgeAlert(alertId, userId);
  }

  /**
   * Lista alertas com filtros
   */
  async listAlerts(filters: {
    userId?: string;
    severity?: string;
    acknowledged?: boolean;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<SecurityAlert[]> {
    const where: any = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.severity) {
      where.severity = filters.severity;
    }

    if (filters.acknowledged !== undefined) {
      where.acknowledged = filters.acknowledged;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    return this.prisma.securityAlert.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: filters.limit || 100,
    });
  }

  /**
   * Cria alerta de múltiplas tentativas de login
   */
  async createMultipleFailedLoginsAlert(
    userId: string,
    count: number,
    ipAddress?: string,
  ): Promise<SecurityAlert> {
    return this.createAlert({
      userId,
      alertType: "multiple_failed_logins",
      severity: count >= 10 ? "critical" : count >= 5 ? "high" : "medium",
      description: `${count} tentativas de login falhadas detectadas`,
      metadata: { count, ipAddress },
      ipAddress,
    });
  }

  /**
   * Cria alerta de localização incomum
   */
  async createUnusualLocationAlert(
    userId: string,
    country: string,
    city: string,
    ipAddress: string,
  ): Promise<SecurityAlert> {
    return this.createAlert({
      userId,
      alertType: "unusual_location",
      severity: "high",
      description: `Acesso de localização incomum: ${city}, ${country}`,
      metadata: { country, city },
      ipAddress,
      country,
      city,
    });
  }

  /**
   * Cria alerta de acesso simultâneo
   */
  async createSimultaneousAccessAlert(
    userId: string,
    locations: Array<{ country: string; city: string; ipAddress: string }>,
  ): Promise<SecurityAlert> {
    return this.createAlert({
      userId,
      alertType: "simultaneous_access",
      severity: "critical",
      description: `Acesso simultâneo de ${locations.length} localizações diferentes`,
      metadata: { locations },
    });
  }

  /**
   * Cria alerta de VPN detectada
   */
  async createVpnDetectedAlert(userId: string, ipAddress: string): Promise<SecurityAlert> {
    return this.createAlert({
      userId,
      alertType: "vpn_detected",
      severity: "medium",
      description: "VPN detectada no acesso",
      metadata: { ipAddress },
      ipAddress,
    });
  }

  /**
   * Cria alerta de anomalia comportamental
   */
  async createBehavioralAnomalyAlert(
    userId: string,
    anomalies: Array<{ type: string; severity: string; description: string }>,
  ): Promise<SecurityAlert> {
    const highSeverity = anomalies.some((a) => a.severity === "high");

    return this.createAlert({
      userId,
      alertType: "behavioral_anomaly",
      severity: highSeverity ? "high" : "medium",
      description: `${anomalies.length} anomalias comportamentais detectadas`,
      metadata: { anomalies },
    });
  }
}

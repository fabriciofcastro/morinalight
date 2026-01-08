import { getPrisma } from "../../../infra/database/prisma.service";

const prisma = getPrisma();

export type LoginAnomalyEvent = {
  userId: string;
  email: string;
  ip: string;
  userAgent: string;
  timestamp: Date;
  success: boolean;
  reason?: string;
};

export type AnomalyDetectionResult = {
  isAnomaly: boolean;
  reason?: string;
  severity: "low" | "medium" | "high" | "critical";
  shouldBlock: boolean;
  shouldAlert: boolean;
};

export class LoginAnomalyDetector {
  private readonly MULTIPLE_IPS_THRESHOLD = 3; // IPs diferentes em curto período
  private readonly MULTIPLE_IPS_WINDOW_MS = 60 * 60 * 1000; // 1 hora
  private readonly FAILED_ATTEMPTS_THRESHOLD = 5;
  private readonly FAILED_ATTEMPTS_WINDOW_MS = 15 * 60 * 1000; // 15 minutos
  private readonly UNUSUAL_HOUR_START = 2; // 2 AM
  private readonly UNUSUAL_HOUR_END = 6; // 6 AM

  async detectAnomaly(event: LoginAnomalyEvent): Promise<AnomalyDetectionResult> {
    const anomalies: string[] = [];
    let severity: "low" | "medium" | "high" | "critical" = "low";
    let shouldBlock = false;
    let shouldAlert = false;

    // 1. Detectar múltiplos IPs para mesmo usuário
    const multipleIPs = await this.checkMultipleIPs(event.userId, event.ip);
    if (multipleIPs.isAnomaly) {
      anomalies.push(multipleIPs.reason!);
      severity = "high";
      shouldAlert = true;
    }

    // 2. Detectar múltiplas falhas consecutivas
    if (!event.success) {
      const multipleFails = await this.checkMultipleFailedAttempts(event.userId);
      if (multipleFails.isAnomaly) {
        anomalies.push(multipleFails.reason!);
        if (multipleFails.severity) {
          severity = multipleFails.severity;
        }
        if (multipleFails.shouldBlock !== undefined) {
          shouldBlock = multipleFails.shouldBlock;
        }
        shouldAlert = true;
      }
    }

    // 3. Detectar login em horário incomum
    const unusualHour = this.checkUnusualHour(event.timestamp);
    if (unusualHour.isAnomaly) {
      anomalies.push(unusualHour.reason!);
      if (severity === "low") severity = "medium";
    }

    // 4. Detectar mudança de geolocalização (simplificado - apenas IP diferente)
    const geoChange = await this.checkGeolocationChange(event.userId, event.ip);
    if (geoChange.isAnomaly) {
      anomalies.push(geoChange.reason!);
      if (severity === "low") severity = "medium";
      shouldAlert = true;
    }

    return {
      isAnomaly: anomalies.length > 0,
      reason: anomalies.join("; "),
      severity,
      shouldBlock,
      shouldAlert,
    };
  }

  private async checkMultipleIPs(
    userId: string,
    currentIp: string,
  ): Promise<Partial<AnomalyDetectionResult>> {
    try {
      const recentLogins = await prisma.userSession.findMany({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - this.MULTIPLE_IPS_WINDOW_MS),
          },
        },
        select: {
          ipAddress: true,
        },
        distinct: ["ipAddress"],
      });

      const uniqueIPs = new Set(recentLogins.map((s) => s.ipAddress).filter(Boolean));
      uniqueIPs.add(currentIp);

      if (uniqueIPs.size >= this.MULTIPLE_IPS_THRESHOLD) {
        return {
          isAnomaly: true,
          reason: `Múltiplos IPs detectados (${uniqueIPs.size}) na última hora`,
        };
      }
    } catch (error) {
      console.error("Error checking multiple IPs:", error);
    }

    return { isAnomaly: false };
  }

  private async checkMultipleFailedAttempts(
    userId: string,
  ): Promise<Partial<AnomalyDetectionResult>> {
    try {
      const recentFailures = await prisma.auditEvent.count({
        where: {
          userId,
          action: "LOGIN_FAILED",
          timestamp: {
            gte: new Date(Date.now() - this.FAILED_ATTEMPTS_WINDOW_MS),
          },
        },
      });

      if (recentFailures >= this.FAILED_ATTEMPTS_THRESHOLD) {
        return {
          isAnomaly: true,
          reason: `${recentFailures} tentativas falhadas nos últimos 15 minutos`,
          severity: recentFailures >= 10 ? "critical" : "high",
          shouldBlock: recentFailures >= 10,
        };
      }
    } catch (error) {
      console.error("Error checking failed attempts:", error);
    }

    return { isAnomaly: false };
  }

  private checkUnusualHour(timestamp: Date): Partial<AnomalyDetectionResult> {
    const hour = timestamp.getHours();

    if (hour >= this.UNUSUAL_HOUR_START && hour < this.UNUSUAL_HOUR_END) {
      return {
        isAnomaly: true,
        reason: `Login em horário incomum (${hour}h)`,
      };
    }

    return { isAnomaly: false };
  }

  private async checkGeolocationChange(
    userId: string,
    currentIp: string,
  ): Promise<Partial<AnomalyDetectionResult>> {
    try {
      const lastLogin = await prisma.userSession.findFirst({
        where: {
          userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          ipAddress: true,
          createdAt: true,
        },
      });

      if (lastLogin && lastLogin.ipAddress && lastLogin.ipAddress !== currentIp) {
        const timeSinceLastLogin = Date.now() - lastLogin.createdAt.getTime();
        const oneHour = 60 * 60 * 1000;

        // Se mudou de IP em menos de 1 hora, pode ser suspeito
        if (timeSinceLastLogin < oneHour) {
          return {
            isAnomaly: true,
            reason: `Mudança de IP em menos de 1 hora (${lastLogin.ipAddress} → ${currentIp})`,
          };
        }
      }
    } catch (error) {
      console.error("Error checking geolocation change:", error);
    }

    return { isAnomaly: false };
  }

  async logAnomaly(event: LoginAnomalyEvent, result: AnomalyDetectionResult): Promise<void> {
    try {
      await prisma.securityAlert.create({
        data: {
          type: "LOGIN_ANOMALY",
          severity: result.severity.toUpperCase() as any,
          description: result.reason || "Anomalia detectada no login",
          metadata: {
            userId: event.userId,
            email: event.email,
            ip: event.ip,
            userAgent: event.userAgent,
            success: event.success,
            timestamp: event.timestamp.toISOString(),
          },
          resolved: false,
        },
      });

      console.log(`🚨 [SECURITY] Anomalia detectada: ${result.reason}`, {
        userId: event.userId,
        severity: result.severity,
        shouldBlock: result.shouldBlock,
        shouldAlert: result.shouldAlert,
      });

      // Enviar alertas automáticos se necessário
      if (result.shouldAlert) {
        const { getAlertService } = await import("./alert.service");
        const alertService = getAlertService();
        await alertService.sendAlert(event, result);
      }
    } catch (error) {
      console.error("Error logging anomaly:", error);
    }
  }
}

export const loginAnomalyDetector = new LoginAnomalyDetector();

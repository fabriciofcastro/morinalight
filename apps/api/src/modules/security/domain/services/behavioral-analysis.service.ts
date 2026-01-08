import type { PrismaService } from "@/core/database/prisma.service";
import type { UserBehavioralProfile } from "@prisma/client";

/**
 * Contexto de acesso para análise
 */
export interface AccessContext {
  userId: string;
  ipAddress: string;
  country?: string;
  city?: string;
  deviceId?: string;
  resource?: string;
  timestamp: Date;
}

/**
 * Anomalia detectada
 */
export interface Anomaly {
  type: string;
  severity: "low" | "medium" | "high";
  description: string;
  metadata?: Record<string, any>;
}

/**
 * Resultado da análise
 */
export interface AnalysisResult {
  riskScore: number;
  anomalies: Anomaly[];
  isNormal: boolean;
}

/**
 * BehavioralAnalysisService
 * Analisa comportamento do usuário e detecta anomalias
 */
export class BehavioralAnalysisService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Analisa um acesso e retorna resultado completo
   */
  async analyzeAccess(userId: string, context: AccessContext): Promise<AnalysisResult> {
    const profile = await this.getOrCreateProfile(userId);
    const anomalies = await this.detectAnomalies(userId, context);
    const riskScore = await this.calculateRiskScore(userId, context);

    // Atualiza perfil em background
    this.updateBehavioralProfile(userId, context).catch((err) => {
      console.error("Erro ao atualizar perfil comportamental:", err);
    });

    return {
      riskScore,
      anomalies,
      isNormal: anomalies.length === 0 && riskScore < 30,
    };
  }

  /**
   * Detecta anomalias no acesso
   */
  async detectAnomalies(userId: string, context: AccessContext): Promise<Anomaly[]> {
    const profile = await this.getOrCreateProfile(userId);
    const anomalies: Anomaly[] = [];

    // 1. Horário incomum
    const currentHour = context.timestamp.getHours();
    if (!profile.usualAccessHours.includes(currentHour)) {
      anomalies.push({
        type: "unusual_time",
        severity: "medium",
        description: `Acesso em horário incomum: ${currentHour}h`,
        metadata: { hour: currentHour, usual: profile.usualAccessHours },
      });
    }

    // 2. Dia da semana incomum
    const currentDay = context.timestamp.getDay();
    if (!profile.usualAccessDays.includes(currentDay)) {
      anomalies.push({
        type: "unusual_day",
        severity: "low",
        description: `Acesso em dia incomum: ${this.getDayName(currentDay)}`,
        metadata: { day: currentDay, usual: profile.usualAccessDays },
      });
    }

    // 3. Localização incomum (país)
    if (context.country && !profile.usualCountries.includes(context.country)) {
      anomalies.push({
        type: "unusual_location",
        severity: "high",
        description: `Acesso de país incomum: ${context.country}`,
        metadata: { country: context.country, usual: profile.usualCountries },
      });
    }

    // 4. Cidade incomum
    if (context.city && !profile.usualCities.includes(context.city)) {
      anomalies.push({
        type: "unusual_city",
        severity: "medium",
        description: `Acesso de cidade incomum: ${context.city}`,
        metadata: { city: context.city, usual: profile.usualCities },
      });
    }

    // 5. Dispositivo desconhecido
    if (context.deviceId && !profile.knownDeviceIds.includes(context.deviceId)) {
      anomalies.push({
        type: "unknown_device",
        severity: "high",
        description: "Acesso de dispositivo desconhecido",
        metadata: { deviceId: context.deviceId },
      });
    }

    // 6. Acesso simultâneo de múltiplos locais
    const recentAccesses = await this.getRecentAccesses(userId, 5); // últimos 5 minutos
    if (recentAccesses.length > 0) {
      const differentCountries = new Set(recentAccesses.map((a) => a.country).filter(Boolean));
      if (
        context.country &&
        differentCountries.size > 0 &&
        !differentCountries.has(context.country)
      ) {
        anomalies.push({
          type: "simultaneous_access",
          severity: "high",
          description: "Acesso simultâneo de múltiplos países",
          metadata: {
            current: context.country,
            recent: Array.from(differentCountries),
          },
        });
      }
    }

    return anomalies;
  }

  /**
   * Calcula score de risco (0-100)
   */
  async calculateRiskScore(userId: string, context: AccessContext): Promise<number> {
    const anomalies = await this.detectAnomalies(userId, context);

    let score = 0;

    // Pontuação por tipo de anomalia
    for (const anomaly of anomalies) {
      switch (anomaly.severity) {
        case "low":
          score += 10;
          break;
        case "medium":
          score += 25;
          break;
        case "high":
          score += 40;
          break;
      }
    }

    // Limita a 100
    return Math.min(score, 100);
  }

  /**
   * Atualiza perfil comportamental do usuário
   */
  async updateBehavioralProfile(userId: string, context: AccessContext): Promise<void> {
    const profile = await this.getOrCreateProfile(userId);

    const currentHour = context.timestamp.getHours();
    const currentDay = context.timestamp.getDay();

    // Atualiza horários habituais (adiciona se não existir)
    const updatedHours = [...new Set([...profile.usualAccessHours, currentHour])];

    // Atualiza dias habituais
    const updatedDays = [...new Set([...profile.usualAccessDays, currentDay])];

    // Atualiza países habituais
    const updatedCountries = context.country
      ? [...new Set([...profile.usualCountries, context.country])]
      : profile.usualCountries;

    // Atualiza cidades habituais
    const updatedCities = context.city
      ? [...new Set([...profile.usualCities, context.city])]
      : profile.usualCities;

    // Atualiza dispositivos conhecidos
    const updatedDevices = context.deviceId
      ? [...new Set([...profile.knownDeviceIds, context.deviceId])]
      : profile.knownDeviceIds;

    // Atualiza recursos acessados
    const updatedResources = context.resource
      ? [...new Set([...profile.usualResources, context.resource])]
      : profile.usualResources;

    // Limita tamanho dos arrays (mantém apenas os 20 mais recentes)
    const limitArray = (arr: any[], limit: number = 20) => arr.slice(-limit);

    await this.prisma.userBehavioralProfile.update({
      where: { userId },
      data: {
        usualAccessHours: limitArray(updatedHours, 24),
        usualAccessDays: limitArray(updatedDays, 7),
        usualCountries: limitArray(updatedCountries, 5),
        usualCities: limitArray(updatedCities, 10),
        knownDeviceIds: limitArray(updatedDevices, 10),
        usualResources: limitArray(updatedResources, 50),
        currentRiskScore: await this.calculateRiskScore(userId, context),
      },
    });
  }

  /**
   * Verifica se o padrão de acesso é normal
   */
  async isAccessPatternNormal(userId: string, context: AccessContext): Promise<boolean> {
    const anomalies = await this.detectAnomalies(userId, context);
    const riskScore = await this.calculateRiskScore(userId, context);

    // Considera normal se não há anomalias de alta severidade e score < 50
    const hasHighSeverity = anomalies.some((a) => a.severity === "high");
    return !hasHighSeverity && riskScore < 50;
  }

  /**
   * Obtém ou cria perfil comportamental
   */
  private async getOrCreateProfile(userId: string): Promise<UserBehavioralProfile> {
    let profile = await this.prisma.userBehavioralProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      // Cria perfil inicial
      profile = await this.prisma.userBehavioralProfile.create({
        data: {
          userId,
          usualAccessHours: [],
          usualAccessDays: [],
          usualCountries: [],
          usualCities: [],
          usualIpRanges: [],
          knownDeviceIds: [],
          usualResources: [],
          averageSessionTime: 30, // 30 minutos default
          baselineRiskScore: 0,
          currentRiskScore: 0,
        },
      });
    }

    return profile;
  }

  /**
   * Obtém acessos recentes do usuário
   */
  private async getRecentAccesses(userId: string, minutesAgo: number): Promise<any[]> {
    const since = new Date(Date.now() - minutesAgo * 60000);

    return this.prisma.accessDecisionLog.findMany({
      where: {
        userId,
        createdAt: { gte: since },
      },
      select: {
        country: true,
        city: true,
        ipAddress: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Helper para nome do dia
   */
  private getDayName(day: number): string {
    const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    return days[day];
  }

  /**
   * Obtém perfil de um usuário
   */
  async getUserProfile(userId: string): Promise<UserBehavioralProfile | null> {
    return this.prisma.userBehavioralProfile.findUnique({
      where: { userId },
    });
  }

  /**
   * Lista anomalias recentes
   */
  async getRecentAnomalies(orgId: string, limit: number = 50): Promise<any[]> {
    // Busca logs com anomalias
    return this.prisma.accessDecisionLog.findMany({
      where: {
        orgId,
        anomalies: { isEmpty: false },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        organization: {
          select: {
            name: true,
          },
        },
      },
    });
  }
}

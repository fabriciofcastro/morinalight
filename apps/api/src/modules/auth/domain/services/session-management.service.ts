import type { UserSession } from "@prisma/client";
import type { PrismaService } from "../../../../infra/database/prisma.service";

/**
 * Contexto da sessão
 */
export interface SessionContext {
  ipAddress: string;
  userAgent: string;
  country?: string;
  city?: string;
  deviceId?: string;
  fingerprint?: string;
}

/**
 * SessionManagementService
 * Gerencia sessões ativas de usuários
 */
export class SessionManagementService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cria uma nova sessão
   */
  async createSession(
    userId: string,
    token: string,
    refreshToken: string | null,
    context: SessionContext,
    expiresInMinutes: number = 60,
  ): Promise<UserSession> {
    // Enforce session limit (max 5)
    const activeSessions = await this.getActiveSessions(userId);
    if (activeSessions.length >= 5) {
      // Revoke oldest session
      const oldest = activeSessions[activeSessions.length - 1];
      if (oldest) {
        await this.revokeSession(oldest.id, "session_limit_exceeded");
      }
    }

    const expiresAt = new Date(Date.now() + expiresInMinutes * 60000);

    return this.prisma.userSession.create({
      data: {
        userId,
        token,
        refreshToken,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        country: context.country,
        city: context.city,
        deviceId: context.deviceId,
        fingerprint: context.fingerprint,
        expiresAt,
      },
    });
  }

  /**
   * Valida uma sessão pelo token
   */
  async validateSession(token: string): Promise<UserSession | null> {
    const session = await this.prisma.userSession.findUnique({
      where: { token },
    });

    if (!session) {
      return null;
    }

    // Verifica se está ativa
    if (!session.isActive) {
      return null;
    }

    // Verifica se expirou
    if (session.expiresAt < new Date()) {
      // Marca como inativa
      await this.prisma.userSession.update({
        where: { id: session.id },
        data: { isActive: false },
      });
      return null;
    }

    // Atualiza última atividade
    await this.updateSessionActivity(session.id);

    return session;
  }

  /**
   * Revoga uma sessão específica
   */
  async revokeSession(sessionId: string, revokedBy: string): Promise<void> {
    await this.prisma.userSession.update({
      where: { id: sessionId },
      data: {
        isActive: false,
        revokedAt: new Date(),
        revokedBy,
      },
    });
  }

  /**
   * Revoga todas as sessões de um usuário
   */
  async revokeAllUserSessions(userId: string, revokedBy: string): Promise<void> {
    await this.prisma.userSession.updateMany({
      where: {
        userId,
        isActive: true,
      },
      data: {
        isActive: false,
        revokedAt: new Date(),
        revokedBy,
      },
    });
  }

  /**
   * Obtém sessões ativas de um usuário
   */
  async getActiveSessions(userId: string): Promise<UserSession[]> {
    return this.prisma.userSession.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastActivity: "desc" },
    });
  }

  /**
   * Atualiza última atividade da sessão
   */
  async updateSessionActivity(sessionId: string): Promise<void> {
    await this.prisma.userSession.update({
      where: { id: sessionId },
      data: { lastActivity: new Date() },
    });
  }

  /**
   * Limpa sessões expiradas
   */
  async cleanupExpiredSessions(): Promise<number> {
    const result = await this.prisma.userSession.updateMany({
      where: {
        isActive: true,
        expiresAt: { lt: new Date() },
      },
      data: { isActive: false },
    });

    return result.count;
  }

  /**
   * Obtém todas as sessões ativas (para monitoramento)
   */
  async getAllActiveSessions(limit: number = 100): Promise<UserSession[]> {
    return this.prisma.userSession.findMany({
      where: {
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastActivity: "desc" },
      take: limit,
    });
  }

  /**
   * Conta sessões ativas
   */
  async countActiveSessions(): Promise<number> {
    return this.prisma.userSession.count({
      where: {
        isActive: true,
        expiresAt: { gt: new Date() },
      },
    });
  }

  /**
   * Obtém sessões por IP
   */
  async getSessionsByIp(ipAddress: string): Promise<UserSession[]> {
    return this.prisma.userSession.findMany({
      where: {
        ipAddress,
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Detecta sessões simultâneas de locais diferentes
   */
  async detectSimultaneousSessions(userId: string): Promise<{
    hasSuspiciousActivity: boolean;
    sessions: UserSession[];
  }> {
    const sessions = await this.getActiveSessions(userId);

    if (sessions.length < 2) {
      return { hasSuspiciousActivity: false, sessions: [] };
    }

    // Verifica se há sessões de países diferentes
    const countries = new Set(sessions.map((s) => s.country).filter(Boolean));
    const cities = new Set(sessions.map((s) => s.city).filter(Boolean));

    const hasSuspiciousActivity = countries.size > 1 || cities.size > 2;

    return {
      hasSuspiciousActivity,
      sessions: hasSuspiciousActivity ? sessions : [],
    };
  }

  /**
   * Renova sessão (atualiza expiração)
   */
  async renewSession(sessionId: string, expiresInMinutes: number = 60): Promise<UserSession> {
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60000);

    return this.prisma.userSession.update({
      where: { id: sessionId },
      data: {
        expiresAt,
        lastActivity: new Date(),
      },
    });
  }
}

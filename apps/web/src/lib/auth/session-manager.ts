/**
 * Session Management
 * 
 * Gerenciamento robusto de sessões de usuário
 */

import crypto from "crypto";
import { auditService } from "@/lib/audit/audit-service";

export interface UserSession {
    id: string;
    userId: string;
    deviceId: string;
    deviceName: string;
    ipAddress: string;
    userAgent: string;
    createdAt: Date;
    lastActivityAt: Date;
    expiresAt: Date;
    active: boolean;
}

export class SessionManager {
    private readonly MAX_SESSIONS_PER_USER = 5;
    private readonly SESSION_TIMEOUT_MINUTES = 30;
    private readonly SESSION_ABSOLUTE_TIMEOUT_DAYS = 7;

    /**
     * Cria nova sessão
     */
    async createSession(
        userId: string,
        deviceInfo: {
            deviceId?: string;
            deviceName: string;
            ipAddress: string;
            userAgent: string;
        },
    ): Promise<UserSession> {
        // Gerar device ID se não fornecido
        const deviceId = deviceInfo.deviceId || crypto.randomUUID();

        // Verificar limite de sessões
        await this.enforceSessionLimit(userId);

        const session: UserSession = {
            id: crypto.randomUUID(),
            userId,
            deviceId,
            deviceName: deviceInfo.deviceName,
            ipAddress: deviceInfo.ipAddress,
            userAgent: deviceInfo.userAgent,
            createdAt: new Date(),
            lastActivityAt: new Date(),
            expiresAt: new Date(
                Date.now() + this.SESSION_ABSOLUTE_TIMEOUT_DAYS * 24 * 60 * 60 * 1000,
            ),
            active: true,
        };

        // Salvar sessão
        // await prisma.session.create({ data: session });

        // Audit log
        await auditService.log({
            action: "session_created",
            userId,
            resource: "session",
            resourceId: session.id,
            ipAddress: deviceInfo.ipAddress,
            userAgent: deviceInfo.userAgent,
            success: true,
        });

        return session;
    }

    /**
     * Valida sessão
     */
    async validateSession(sessionId: string): Promise<UserSession | null> {
        // const session = await prisma.session.findUnique({
        //   where: { id: sessionId },
        // });

        const session: UserSession | null = null; // TODO: buscar real

        if (!session || !session.active) {
            return null;
        }

        // Verificar se expirou (timeout de inatividade)
        const inactiveMinutes =
            (Date.now() - session.lastActivityAt.getTime()) / (1000 * 60);

        if (inactiveMinutes > this.SESSION_TIMEOUT_MINUTES) {
            await this.terminateSession(sessionId, "timeout");
            return null;
        }

        // Verificar se expirou (timeout absoluto)
        if (session.expiresAt < new Date()) {
            await this.terminateSession(sessionId, "expired");
            return null;
        }

        // Atualizar última atividade
        await this.updateActivity(sessionId);

        return session;
    }

    /**
     * Atualiza atividade da sessão
     */
    private async updateActivity(sessionId: string): Promise<void> {
        // await prisma.session.update({
        //   where: { id: sessionId },
        //   data: { lastActivityAt: new Date() },
        // });
    }

    /**
     * Termina sessão
     */
    async terminateSession(
        sessionId: string,
        reason: string = "user_logout",
    ): Promise<void> {
        // const session = await prisma.session.findUnique({
        //   where: { id: sessionId },
        // });

        // await prisma.session.update({
        //   where: { id: sessionId },
        //   data: { active: false },
        // });

        const mockUserId = "user-123"; // TODO: session?.userId

        await auditService.log({
            action: "session_terminated",
            userId: mockUserId,
            resource: "session",
            resourceId: sessionId,
            metadata: { reason },
            success: true,
        });
    }

    /**
     * Termina todas as sessões do usuário
     */
    async terminateAllUserSessions(
        userId: string,
        exceptSessionId?: string,
    ): Promise<void> {
        // await prisma.session.updateMany({
        //   where: {
        //     userId,
        //     active: true,
        //     id: exceptSessionId ? { not: exceptSessionId } : undefined,
        //   },
        //   data: { active: false },
        // });

        await auditService.log({
            action: "all_sessions_terminated",
            userId,
            resource: "session",
            metadata: { exceptSessionId },
            success: true,
        });
    }

    /**
     * Lista sessões ativas do usuário
     */
    async getUserSessions(userId: string): Promise<UserSession[]> {
        // return prisma.session.findMany({
        //   where: {
        //     userId,
        //     active: true,
        //   },
        //   orderBy: { lastActivityAt: 'desc' },
        // });

        return [];
    }

    /**
     * Limita número de sessões por usuário
     */
    private async enforceSessionLimit(userId: string): Promise<void> {
        const sessions = await this.getUserSessions(userId);

        if (sessions.length >= this.MAX_SESSIONS_PER_USER) {
            // Terminar sessão mais antiga
            const oldestSession = sessions[sessions.length - 1];
            await this.terminateSession(oldestSession.id, "session_limit");
        }
    }

    /**
     * Detecta sessão suspeita
     */
    async detectSuspiciousSession(
        userId: string,
        newSession: {
            ipAddress: string;
            deviceName: string;
        },
    ): Promise<boolean> {
        const recentSessions = await this.getUserSessions(userId);

        // Verificar se IP mudou drasticamente
        const recentIPs = recentSessions.map((s) => s.ipAddress);
        const uniqueIPs = new Set(recentIPs);

        if (uniqueIPs.size > 0 && !uniqueIPs.has(newSession.ipAddress)) {
            // IP novo - pode ser suspeito
            await auditService.log({
                action: "suspicious_session_detected",
                userId,
                resource: "session",
                metadata: {
                    newIP: newSession.ipAddress,
                    recentIPs: Array.from(uniqueIPs),
                },
                success: true,
            });

            return true;
        }

        return false;
    }

    /**
     * Limpa sessões expiradas (cron job)
     */
    async cleanupExpiredSessions(): Promise<number> {
        // const result = await prisma.session.updateMany({
        //   where: {
        //     OR: [
        //       { expiresAt: { lt: new Date() } },
        //       {
        //         lastActivityAt: {
        //           lt: new Date(Date.now() - this.SESSION_TIMEOUT_MINUTES * 60 * 1000),
        //         },
        //       },
        //     ],
        //     active: true,
        //   },
        //   data: { active: false },
        // });

        // return result.count;
        return 0;
    }
}

export const sessionManager = new SessionManager();

/**
 * EXEMPLO DE USO:
 * 
 * // Login - criar sessão
 * const session = await sessionManager.createSession(userId, {
 *   deviceName: 'Chrome on Windows',
 *   ipAddress: req.ip,
 *   userAgent: req.headers.get('user-agent'),
 * });
 * 
 * // Armazenar session ID em cookie
 * response.cookies.set('session-id', session.id, {
 *   httpOnly: true,
 *   secure: true,
 *   sameSite: 'strict',
 * });
 * 
 * // Validar sessão em cada request
 * const sessionId = request.cookies.get('session-id')?.value;
 * const session = await sessionManager.validateSession(sessionId);
 * 
 * if (!session) {
 *   return NextResponse.redirect('/login');
 * }
 * 
 * // Logout
 * await sessionManager.terminateSession(sessionId);
 * 
 * // Logout de todos os dispositivos
 * await sessionManager.terminateAllUserSessions(userId);
 * 
 * // Listar sessões ativas (para página de segurança)
 * const sessions = await sessionManager.getUserSessions(userId);
 * 
 * // Cron job para limpar sessões expiradas (rodar a cada hora)
 * setInterval(async () => {
 *   const cleaned = await sessionManager.cleanupExpiredSessions();
 *   console.log(`Cleaned ${cleaned} expired sessions`);
 * }, 60 * 60 * 1000);
 */

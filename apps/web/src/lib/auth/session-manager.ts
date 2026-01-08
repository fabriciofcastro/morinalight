/**
 * Session Management
 * 
 * Gerenciamento robusto de sessões de usuário com integração real Prisma
 */

import { auditService } from "@/lib/audit/audit-service";
import prisma from "@/lib/prisma";

export interface UserSession {
    id: string;
    userId: string;
    deviceId: string | null;
    ipAddress: string;
    userAgent: string;
    country: string | null;
    city: string | null;
    createdAt: Date;
    lastActivity: Date;
    expiresAt: Date;
    isActive: boolean;
}

export class SessionManager {
    /**
     * Limite máximo de sessões simultâneas por usuário
     * Recomendado: 5
     */
    private readonly MAX_SESSIONS_PER_USER = 5;
    
    /**
     * Timeout de inatividade (sessão é revogada se não houver atividade)
     * Recomendado: 30 minutos
     */
    private readonly SESSION_TIMEOUT_MINUTES = 30;
    
    /**
     * Validade absoluta do token de sessão
     * Recomendado: 7 dias
     */
    private readonly SESSION_ABSOLUTE_TIMEOUT_DAYS = 7;

    /**
     * Cria nova sessão e persiste no banco de dados
     */
    async createSession(
        userId: string,
        deviceInfo: {
            deviceId?: string;
            ipAddress: string;
            userAgent: string;
            country?: string;
            city?: string;
            token: string;
        },
    ): Promise<UserSession> {
        // 1. Verificar limite de sessões e revogar a mais antiga se necessário
        await this.enforceSessionLimit(userId);

        // 2. Criar a sessão no banco
        const expiresAt = new Date(
            Date.now() + this.SESSION_ABSOLUTE_TIMEOUT_DAYS * 24 * 60 * 60 * 1000,
        );

        const session = await prisma.userSession.create({
            data: {
                userId,
                token: deviceInfo.token,
                deviceId: deviceInfo.deviceId || null,
                ipAddress: deviceInfo.ipAddress,
                userAgent: deviceInfo.userAgent,
                country: deviceInfo.country || null,
                city: deviceInfo.city || null,
                expiresAt,
                isActive: true,
            },
        });

        // 3. Registrar auditoria
        await auditService.log({
            action: "session_created",
            userId,
            resource: "session",
            resourceId: session.id,
            ipAddress: deviceInfo.ipAddress,
            userAgent: deviceInfo.userAgent,
            metadata: { 
                city: deviceInfo.city,
                country: deviceInfo.country 
            },
            success: true,
        });

        return session;
    }

    /**
     * Valida sessão verificando status, expiração e timeout de inatividade
     */
    async validateSession(token: string): Promise<UserSession | null> {
        const session = await prisma.userSession.findUnique({
            where: { token },
        });

        if (!session || !session.isActive) {
            return null;
        }

        // 1. Verificar timeout absoluto
        if (session.expiresAt < new Date()) {
            await this.terminateSession(session.id, "expired");
            return null;
        }

        // 2. Verificar timeout de inatividade
        const inactiveMinutes =
            (Date.now() - session.lastActivity.getTime()) / (1000 * 60);

        if (inactiveMinutes > this.SESSION_TIMEOUT_MINUTES) {
            await this.terminateSession(session.id, "inactivity_timeout");
            return null;
        }

        // 3. Atualizar última atividade
        await this.updateActivity(session.id);

        return session;
    }

    /**
     * Atualiza o timestamp de última atividade da sessão
     */
    private async updateActivity(sessionId: string): Promise<void> {
        await prisma.userSession.update({
            where: { id: sessionId },
            data: { lastActivity: new Date() },
        });
    }

    /**
     * Revoga uma sessão específica
     */
    async terminateSession(
        sessionId: string,
        reason: string = "user_logout",
    ): Promise<void> {
        const session = await prisma.userSession.update({
            where: { id: sessionId },
            data: { 
                isActive: false,
                revokedAt: new Date(),
                revokedBy: reason
            },
        });

        await auditService.log({
            action: "session_terminated",
            userId: session.userId,
            resource: "session",
            resourceId: sessionId,
            metadata: { reason },
            success: true,
        });
    }

    /**
     * Revoga todas as sessões ativas do usuário
     */
    async terminateAllUserSessions(
        userId: string,
        exceptSessionId?: string,
    ): Promise<void> {
        await prisma.userSession.updateMany({
            where: {
                userId,
                isActive: true,
                id: exceptSessionId ? { not: exceptSessionId } : undefined,
            },
            data: { 
                isActive: false,
                revokedAt: new Date(),
                revokedBy: "all_sessions_revocation"
            },
        });

        await auditService.log({
            action: "all_sessions_terminated",
            userId,
            resource: "session",
            metadata: { exceptSessionId },
            success: true,
        });
    }

    /**
     * Retorna todas as sessões ativas de um usuário (para a tela de segurança)
     */
    async getUserSessions(userId: string): Promise<UserSession[]> {
        return prisma.userSession.findMany({
            where: {
                userId,
                isActive: true,
            },
            orderBy: { lastActivity: 'desc' },
        });
    }

    /**
     * Garante que o usuário não ultrapasse o limite de sessões ativas
     */
    private async enforceSessionLimit(userId: string): Promise<void> {
        const activeSessions = await this.getUserSessions(userId);

        if (activeSessions.length >= this.MAX_SESSIONS_PER_USER) {
            // Ordenar por atividade e pegar as excedentes (as mais antigas)
            const sessionsToRevoke = activeSessions.slice(this.MAX_SESSIONS_PER_USER - 1);
            
            for (const sess of sessionsToRevoke) {
                await this.terminateSession(sess.id, "session_limit_exceeded");
            }
        }
    }

    /**
     * Compara a sessão atual com atividades anteriores para detectar comportamentos anômalos
     */
    async detectSuspiciousSession(
        session: UserSession,
        newContext: { ipAddress: string; country?: string; city?: string }
    ): Promise<boolean> {
        // 1. Mudança brusca de localização (Impossible Travel)
        if (session.country && newContext.country && session.country !== newContext.country) {
            await auditService.log({
                action: "suspicious_location_change",
                userId: session.userId,
                resource: "session",
                resourceId: session.id,
                metadata: {
                    oldCountry: session.country,
                    newCountry: newContext.country,
                    ip: newContext.ipAddress
                },
                severity: "high"
            });
            return true;
        }

        return false;
    }

    /**
     * Job de limpeza para o sistema (pode ser chamado via cron)
     */
    async cleanupExpiredSessions(): Promise<number> {
        const result = await prisma.userSession.updateMany({
            where: {
                isActive: true,
                OR: [
                    { expiresAt: { lt: new Date() } },
                    {
                        lastActivity: {
                            lt: new Date(Date.now() - this.SESSION_TIMEOUT_MINUTES * 60 * 1000),
                        },
                    },
                ],
            },
            data: { 
                isActive: false,
                revokedAt: new Date(),
                revokedBy: "automated_cleanup"
            },
        });

        return result.count;
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

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AlertService } from '../domain/services/alert.service';
import { SessionManagementService } from '../../auth/domain/services/session-management.service';
import {
    createAlertSchema,
    listAlertsSchema,
    CreateAlertDto,
    ListAlertsDto,
} from '../schemas/monitoring.schemas';

/**
 * Rotas de Monitoramento em Tempo Real
 */
export async function monitoringRoutes(fastify: FastifyInstance) {
    const alertService = new AlertService(fastify.prisma);
    const sessionService = new SessionManagementService(fastify.prisma);

    /**
     * GET /api/monitoring/active-sessions
     * Lista sessões ativas
     */
    fastify.get('/monitoring/active-sessions', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const sessions = await sessionService.getAllActiveSessions(100);
            const count = await sessionService.countActiveSessions();

            return reply.send({
                data: sessions,
                total: count,
            });
        } catch (error) {
            return reply.status(500).send({ error: 'Erro ao buscar sessões ativas' });
        }
    });

    /**
     * GET /api/monitoring/live-activity
     * Atividade em tempo real (placeholder para WebSocket)
     */
    fastify.get('/monitoring/live-activity', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            // TODO: Implementar WebSocket para tempo real
            // Por enquanto, retorna últimas atividades
            const orgId = request.user.orgId;

            const recentLogs = await fastify.prisma.accessDecisionLog.findMany({
                where: { orgId },
                orderBy: { createdAt: 'desc' },
                take: 50,
            });

            return reply.send({ data: recentLogs });
        } catch (error) {
            return reply.status(500).send({ error: 'Erro ao buscar atividade' });
        }
    });

    /**
     * POST /api/monitoring/kill-session/:sessionId
     * Encerra uma sessão específica
     */
    fastify.post<{ Params: { sessionId: string } }>(
        '/monitoring/kill-session/:sessionId',
        async (request, reply) => {
            try {
                const { sessionId } = request.params;
                const revokedBy = request.user.id;

                await sessionService.revokeSession(sessionId, revokedBy);

                return reply.send({ message: 'Sessão encerrada com sucesso' });
            } catch (error) {
                return reply.status(500).send({ error: 'Erro ao encerrar sessão' });
            }
        }
    );

    /**
     * POST /api/monitoring/kill-user-sessions/:userId
     * Encerra todas as sessões de um usuário
     */
    fastify.post<{ Params: { userId: string } }>(
        '/monitoring/kill-user-sessions/:userId',
        async (request, reply) => {
            try {
                const { userId } = request.params;
                const revokedBy = request.user.id;

                await sessionService.revokeAllUserSessions(userId, revokedBy);

                return reply.send({ message: 'Todas as sessões do usuário foram encerradas' });
            } catch (error) {
                return reply.status(500).send({ error: 'Erro ao encerrar sessões' });
            }
        }
    );

    /**
     * GET /api/monitoring/alerts
     * Lista alertas de segurança
     */
    fastify.get<{ Querystring: ListAlertsDto }>(
        '/monitoring/alerts',
        {
            schema: {
                querystring: listAlertsSchema,
            },
        },
        async (request, reply) => {
            try {
                const alerts = await alertService.listAlerts(request.query);
                return reply.send({ data: alerts });
            } catch (error) {
                return reply.status(500).send({ error: 'Erro ao buscar alertas' });
            }
        }
    );

    /**
     * POST /api/monitoring/alerts/:id/acknowledge
     * Reconhece um alerta
     */
    fastify.post<{ Params: { id: string } }>(
        '/monitoring/alerts/:id/acknowledge',
        async (request, reply) => {
            try {
                const { id } = request.params;
                const acknowledgedBy = request.user.id;

                await alertService.acknowledgeAlert(id, acknowledgedBy);

                return reply.send({ message: 'Alerta reconhecido' });
            } catch (error) {
                return reply.status(500).send({ error: 'Erro ao reconhecer alerta' });
            }
        }
    );

    /**
     * POST /api/monitoring/alerts/:id/dismiss
     * Descarta alerta como falso positivo
     */
    fastify.post<{ Params: { id: string } }>(
        '/monitoring/alerts/:id/dismiss',
        async (request, reply) => {
            try {
                const { id } = request.params;
                const userId = request.user.id;

                await alertService.dismissFalsePositive(id, userId);

                return reply.send({ message: 'Alerta descartado como falso positivo' });
            } catch (error) {
                return reply.status(500).send({ error: 'Erro ao descartar alerta' });
            }
        }
    );

    /**
     * GET /api/monitoring/stats
     * Estatísticas de monitoramento
     */
    fastify.get('/monitoring/stats', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const orgId = request.user.orgId;

            // Sessões ativas
            const activeSessions = await sessionService.countActiveSessions();

            // Alertas não reconhecidos
            const activeAlerts = await alertService.getActiveAlerts(request.user.id);

            // Acessos nas últimas 24h
            const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const recentAccesses = await fastify.prisma.accessDecisionLog.count({
                where: {
                    orgId,
                    createdAt: { gte: last24h },
                },
            });

            // Acessos negados nas últimas 24h
            const deniedAccesses = await fastify.prisma.accessDecisionLog.count({
                where: {
                    orgId,
                    effect: 'DENY',
                    createdAt: { gte: last24h },
                },
            });

            // Anomalias nas últimas 24h
            const anomalies = await fastify.prisma.accessDecisionLog.count({
                where: {
                    orgId,
                    anomalies: { isEmpty: false },
                    createdAt: { gte: last24h },
                },
            });

            return reply.send({
                data: {
                    activeSessions,
                    activeAlerts: activeAlerts.length,
                    recentAccesses,
                    deniedAccesses,
                    anomalies,
                },
            });
        } catch (error) {
            return reply.status(500).send({ error: 'Erro ao buscar estatísticas' });
        }
    });

    /**
     * GET /api/monitoring/user-sessions/:userId
     * Lista sessões de um usuário específico
     */
    fastify.get<{ Params: { userId: string } }>(
        '/monitoring/user-sessions/:userId',
        async (request, reply) => {
            try {
                const { userId } = request.params;
                const sessions = await sessionService.getActiveSessions(userId);

                // Detecta sessões simultâneas suspeitas
                const suspiciousCheck = await sessionService.detectSimultaneousSessions(userId);

                return reply.send({
                    data: sessions,
                    suspicious: suspiciousCheck,
                });
            } catch (error) {
                return reply.status(500).send({ error: 'Erro ao buscar sessões do usuário' });
            }
        }
    );
}

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { TbacService } from '../domain/services/tbac.service';
import {
    createTimeWindowSchema,
    updateTimeWindowSchema,
    assignTimeWindowSchema,
    validateTimeWindowSchema,
    createEmergencyAccessSchema,
    CreateTimeWindowDto,
    UpdateTimeWindowDto,
    AssignTimeWindowDto,
    ValidateTimeWindowDto,
    CreateEmergencyAccessDto,
} from '../schemas/tbac.schemas';

/**
 * Rotas de TBAC (Time-Based Access Control)
 */
export async function tbacRoutes(fastify: FastifyInstance) {
    const tbacService = new TbacService(fastify.prisma);

    /**
     * GET /api/time-windows
     * Lista janelas de tempo da organização
     */
    fastify.get('/time-windows', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const orgId = request.user.orgId;
            const windows = await tbacService.listByOrganization(orgId);
            return reply.send({ data: windows });
        } catch (error) {
            return reply.status(500).send({ error: 'Erro ao listar janelas de tempo' });
        }
    });

    /**
     * POST /api/time-windows
     * Cria uma nova janela de tempo
     */
    fastify.post<{ Body: CreateTimeWindowDto }>(
        '/time-windows',
        {
            schema: {
                body: createTimeWindowSchema,
            },
        },
        async (request, reply) => {
            try {
                const orgId = request.user.orgId;
                const window = await tbacService.createTimeWindow({
                    orgId,
                    ...request.body,
                });
                return reply.status(201).send({ data: window });
            } catch (error) {
                return reply.status(500).send({ error: 'Erro ao criar janela de tempo' });
            }
        }
    );

    /**
     * PATCH /api/time-windows/:id
     * Atualiza uma janela de tempo
     */
    fastify.patch<{ Params: { id: string }; Body: UpdateTimeWindowDto }>(
        '/time-windows/:id',
        {
            schema: {
                body: updateTimeWindowSchema,
            },
        },
        async (request, reply) => {
            try {
                const { id } = request.params;
                const window = await tbacService.updateTimeWindow(id, request.body);
                return reply.send({ data: window });
            } catch (error) {
                return reply.status(500).send({ error: 'Erro ao atualizar janela de tempo' });
            }
        }
    );

    /**
     * DELETE /api/time-windows/:id
     * Deleta uma janela de tempo
     */
    fastify.delete<{ Params: { id: string } }>(
        '/time-windows/:id',
        async (request, reply) => {
            try {
                const { id } = request.params;
                await tbacService.deleteTimeWindow(id);
                return reply.status(204).send();
            } catch (error) {
                return reply.status(500).send({ error: 'Erro ao deletar janela de tempo' });
            }
        }
    );

    /**
     * POST /api/time-windows/:id/assign
     * Atribui janela de tempo a usuário ou role
     */
    fastify.post<{ Params: { id: string }; Body: AssignTimeWindowDto }>(
        '/time-windows/:id/assign',
        {
            schema: {
                body: assignTimeWindowSchema,
            },
        },
        async (request, reply) => {
            try {
                const { id } = request.params;
                const { targetType, targetId } = request.body;

                if (targetType === 'user') {
                    await tbacService.assignToUser(id, targetId);
                } else {
                    await tbacService.assignToRole(id, targetId);
                }

                return reply.status(201).send({ message: 'Janela de tempo atribuída com sucesso' });
            } catch (error) {
                return reply.status(500).send({ error: 'Erro ao atribuir janela de tempo' });
            }
        }
    );

    /**
     * GET /api/time-windows/active
     * Retorna janelas de tempo ativas para o usuário atual
     */
    fastify.get('/time-windows/active', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = request.user.id;
            const windows = await tbacService.getActiveTimeWindows(userId);
            return reply.send({ data: windows });
        } catch (error) {
            return reply.status(500).send({ error: 'Erro ao buscar janelas ativas' });
        }
    });

    /**
     * POST /api/time-windows/validate
     * Valida se usuário pode acessar no momento
     */
    fastify.post<{ Body: ValidateTimeWindowDto }>(
        '/time-windows/validate',
        {
            schema: {
                body: validateTimeWindowSchema,
            },
        },
        async (request, reply) => {
            try {
                const { userId } = request.body;
                const allowed = await tbacService.isAccessAllowedNow(userId);
                return reply.send({ allowed });
            } catch (error) {
                return reply.status(500).send({ error: 'Erro ao validar acesso' });
            }
        }
    );

    /**
     * POST /api/time-windows/emergency-access
     * Cria acesso emergencial temporário
     */
    fastify.post<{ Body: CreateEmergencyAccessDto }>(
        '/time-windows/emergency-access',
        {
            schema: {
                body: createEmergencyAccessSchema,
            },
        },
        async (request, reply) => {
            try {
                const orgId = request.user.orgId;
                const { userId, durationMinutes } = request.body;

                const window = await tbacService.createEmergencyAccess(
                    userId,
                    durationMinutes,
                    orgId
                );

                return reply.status(201).send({
                    data: window,
                    message: `Acesso emergencial criado por ${durationMinutes} minutos`
                });
            } catch (error) {
                return reply.status(500).send({ error: 'Erro ao criar acesso emergencial' });
            }
        }
    );
}

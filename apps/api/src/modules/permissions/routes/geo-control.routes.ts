import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { GeoControlService } from '../domain/services/geo-control.service';
import {
    createGeoRestrictionSchema,
    updateGeoRestrictionSchema,
    assignGeoRestrictionSchema,
    validateGeoAccessSchema,
    CreateGeoRestrictionDto,
    UpdateGeoRestrictionDto,
    AssignGeoRestrictionDto,
    ValidateGeoAccessDto,
} from '../schemas/geo-control.schemas';

/**
 * Rotas de Controle Geográfico
 */
export async function geoControlRoutes(fastify: FastifyInstance) {
    const geoService = new GeoControlService(fastify.prisma);

    /**
     * GET /api/geo-restrictions
     * Lista restrições geográficas da organização
     */
    fastify.get('/geo-restrictions', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const orgId = request.user.orgId;
            const restrictions = await geoService.listByOrganization(orgId);
            return reply.send({ data: restrictions });
        } catch (error) {
            return reply.status(500).send({ error: 'Erro ao listar restrições geográficas' });
        }
    });

    /**
     * POST /api/geo-restrictions
     * Cria uma nova restrição geográfica
     */
    fastify.post<{ Body: CreateGeoRestrictionDto }>(
        '/geo-restrictions',
        {
            schema: {
                body: createGeoRestrictionSchema,
            },
        },
        async (request, reply) => {
            try {
                const orgId = request.user.orgId;
                const restriction = await geoService.createGeoRestriction({
                    orgId,
                    ...request.body,
                });
                return reply.status(201).send({ data: restriction });
            } catch (error) {
                return reply.status(500).send({ error: 'Erro ao criar restrição geográfica' });
            }
        }
    );

    /**
     * PATCH /api/geo-restrictions/:id
     * Atualiza uma restrição geográfica
     */
    fastify.patch<{ Params: { id: string }; Body: UpdateGeoRestrictionDto }>(
        '/geo-restrictions/:id',
        {
            schema: {
                body: updateGeoRestrictionSchema,
            },
        },
        async (request, reply) => {
            try {
                const { id } = request.params;
                const restriction = await geoService.updateGeoRestriction(id, request.body);
                return reply.send({ data: restriction });
            } catch (error) {
                return reply.status(500).send({ error: 'Erro ao atualizar restrição geográfica' });
            }
        }
    );

    /**
     * DELETE /api/geo-restrictions/:id
     * Deleta uma restrição geográfica
     */
    fastify.delete<{ Params: { id: string } }>(
        '/geo-restrictions/:id',
        async (request, reply) => {
            try {
                const { id } = request.params;
                await geoService.deleteGeoRestriction(id);
                return reply.status(204).send();
            } catch (error) {
                return reply.status(500).send({ error: 'Erro ao deletar restrição geográfica' });
            }
        }
    );

    /**
     * POST /api/geo-restrictions/:id/assign
     * Atribui restrição a usuário ou role
     */
    fastify.post<{ Params: { id: string }; Body: AssignGeoRestrictionDto }>(
        '/geo-restrictions/:id/assign',
        {
            schema: {
                body: assignGeoRestrictionSchema,
            },
        },
        async (request, reply) => {
            try {
                const { id } = request.params;
                const { targetType, targetId } = request.body;

                if (targetType === 'user') {
                    await geoService.assignToUser(id, targetId);
                } else {
                    await geoService.assignToRole(id, targetId);
                }

                return reply.status(201).send({ message: 'Restrição geográfica atribuída com sucesso' });
            } catch (error) {
                return reply.status(500).send({ error: 'Erro ao atribuir restrição geográfica' });
            }
        }
    );

    /**
     * POST /api/geo-restrictions/validate
     * Valida se acesso é permitido para IP/usuário
     */
    fastify.post<{ Body: ValidateGeoAccessDto }>(
        '/geo-restrictions/validate',
        {
            schema: {
                body: validateGeoAccessSchema,
            },
        },
        async (request, reply) => {
            try {
                const { userId, ipAddress } = request.body;
                const result = await geoService.validateAccess(userId, ipAddress);
                return reply.send(result);
            } catch (error) {
                return reply.status(500).send({ error: 'Erro ao validar acesso geográfico' });
            }
        }
    );

    /**
     * GET /api/geo-restrictions/blocked-attempts
     * Retorna tentativas de acesso bloqueadas por geo
     */
    fastify.get('/geo-restrictions/blocked-attempts', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const orgId = request.user.orgId;

            // Busca logs de acesso negados por restrição geográfica
            const blockedAttempts = await fastify.prisma.accessDecisionLog.findMany({
                where: {
                    orgId,
                    effect: 'DENY',
                    reason: {
                        contains: 'geográfico',
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: 100,
            });

            return reply.send({ data: blockedAttempts });
        } catch (error) {
            return reply.status(500).send({ error: 'Erro ao buscar tentativas bloqueadas' });
        }
    });

    /**
     * GET /api/geo-restrictions/geolocate/:ip
     * Obtém geolocalização de um IP
     */
    fastify.get<{ Params: { ip: string } }>(
        '/geo-restrictions/geolocate/:ip',
        async (request, reply) => {
            try {
                const { ip } = request.params;
                const location = await geoService.getGeolocation(ip);
                return reply.send({ data: location });
            } catch (error) {
                return reply.status(500).send({ error: 'Erro ao obter geolocalização' });
            }
        }
    );
}

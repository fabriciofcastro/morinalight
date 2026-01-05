import { FastifyRequest, FastifyReply } from 'fastify';
import { GeoControlService } from '../domain/services/geo-control.service';

/**
 * GeoFencingMiddleware - Middleware de Controle Geográfico
 * Valida se o acesso é permitido baseado em IP/localização
 */
export class GeoFencingMiddleware {
    constructor(private readonly geoService: GeoControlService) { }

    /**
     * Extrai IP real do request (considerando proxies)
     */
    private getClientIp(request: FastifyRequest): string {
        // Verifica headers de proxy
        const forwarded = request.headers['x-forwarded-for'];
        if (forwarded) {
            const ips = (forwarded as string).split(',');
            return ips[0].trim();
        }

        const realIp = request.headers['x-real-ip'];
        if (realIp) {
            return realIp as string;
        }

        // Fallback para IP direto
        return request.ip;
    }

    /**
     * Middleware para validar acesso geográfico
     */
    async validate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            const userId = request.user?.id;

            if (!userId) {
                // Se não há usuário autenticado, deixa passar
                return;
            }

            const ip = this.getClientIp(request);

            // Valida acesso geográfico
            const result = await this.geoService.validateAccess(userId, ip);

            if (!result.allowed) {
                // Registra tentativa bloqueada
                await request.server.prisma.accessDecisionLog.create({
                    data: {
                        orgId: request.user.orgId,
                        userId,
                        action: request.method,
                        subject: request.url,
                        effect: 'DENY',
                        reason: `Acesso bloqueado por restrição geográfica: ${result.reason}`,
                        ipAddress: ip,
                        context: {
                            url: request.url,
                            method: request.method,
                            headers: request.headers,
                        },
                    },
                });

                return reply.status(403).send({
                    error: 'GEO_DENIED',
                    message: result.reason || 'Acesso negado por restrição geográfica',
                    code: 'GEOGRAPHIC_RESTRICTION',
                });
            }

            // Acesso permitido, continua
        } catch (error) {
            console.error('Erro no GeoFencingMiddleware:', error);
            // Fail-open em caso de erro
        }
    }

    /**
     * Factory para criar middleware Fastify
     */
    static create(geoService: GeoControlService) {
        const middleware = new GeoFencingMiddleware(geoService);
        return async (request: FastifyRequest, reply: FastifyReply) => {
            await middleware.validate(request, reply);
        };
    }
}

/**
 * Decorator para rotas que requerem validação geográfica
 */
export function RequireGeoValidation() {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const [request, reply] = args;

            // Valida Geo
            const geoService = new GeoControlService(request.server.prisma);
            const middleware = new GeoFencingMiddleware(geoService);

            await middleware.validate(request, reply);

            // Se não houve reply (acesso permitido), executa método original
            if (!reply.sent) {
                return originalMethod.apply(this, args);
            }
        };

        return descriptor;
    };
}

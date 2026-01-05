import { FastifyRequest, FastifyReply } from 'fastify';
import { BehavioralAnalysisService, AccessContext } from '../domain/services/behavioral-analysis.service';
import { AlertService } from './alert.service';

/**
 * BehavioralAnalysisMiddleware - Middleware de Análise Comportamental
 * Analisa padrões de acesso e detecta anomalias
 */
export class BehavioralAnalysisMiddleware {
    constructor(
        private readonly behavioralService: BehavioralAnalysisService,
        private readonly alertService: AlertService
    ) { }

    /**
     * Extrai IP do request
     */
    private getClientIp(request: FastifyRequest): string {
        const forwarded = request.headers['x-forwarded-for'];
        if (forwarded) {
            return (forwarded as string).split(',')[0].trim();
        }
        return request.headers['x-real-ip'] as string || request.ip;
    }

    /**
     * Extrai device ID (fingerprint) do request
     */
    private getDeviceId(request: FastifyRequest): string | undefined {
        return request.headers['x-device-id'] as string;
    }

    /**
     * Middleware para análise comportamental
     */
    async analyze(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            const userId = request.user?.id;

            if (!userId) {
                return;
            }

            const ip = this.getClientIp(request);
            const deviceId = this.getDeviceId(request);

            // Monta contexto de acesso
            const context: AccessContext = {
                userId,
                ipAddress: ip,
                deviceId,
                resource: request.url,
                timestamp: new Date(),
            };

            // Analisa acesso (não bloqueia, apenas registra)
            const analysis = await this.behavioralService.analyzeAccess(userId, context);

            // Se há anomalias de alta severidade, cria alerta
            const highSeverityAnomalies = analysis.anomalies.filter(a => a.severity === 'high');

            if (highSeverityAnomalies.length > 0) {
                await this.alertService.createBehavioralAnomalyAlert(
                    userId,
                    analysis.anomalies
                );
            }

            // Adiciona informações de análise ao request para uso posterior
            (request as any).behavioralAnalysis = {
                riskScore: analysis.riskScore,
                anomalies: analysis.anomalies,
                isNormal: analysis.isNormal,
            };

            // Não bloqueia acesso, apenas monitora
            // TODO: Considerar bloqueio para risk score muito alto (>90)

        } catch (error) {
            console.error('Erro no BehavioralAnalysisMiddleware:', error);
        }
    }

    /**
     * Factory para criar middleware Fastify
     */
    static create(
        behavioralService: BehavioralAnalysisService,
        alertService: AlertService
    ) {
        const middleware = new BehavioralAnalysisMiddleware(behavioralService, alertService);
        return async (request: FastifyRequest, reply: FastifyReply) => {
            await middleware.analyze(request, reply);
        };
    }
}


import { FastifyInstance } from 'fastify';

export async function analyticsRoutes(app: FastifyInstance) {

    // Get dashboard metrics
    app.get('/analytics/metrics', async (request, reply) => {
        const { analyticsService } = await import('./analytics.service');
        const orgId = request.headers['x-org-id'] as string;
        if (!orgId) return reply.status(400).send({ error: 'Missing Organization ID' });

        const metricType = request.query as { type?: string };

        try {
            const metrics = await analyticsService.getMetrics(orgId, metricType.type);
            return metrics;
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to get metrics' });
        }
    });

    // Get benchmark comparison
    app.get('/analytics/benchmark/:metricType', async (request, reply) => {
        const { analyticsService } = await import('./analytics.service');
        const orgId = request.headers['x-org-id'] as string;
        if (!orgId) return reply.status(400).send({ error: 'Missing Organization ID' });

        const { metricType } = request.params as { metricType: string };

        try {
            const comparison = await analyticsService.getBenchmarkComparison(orgId, metricType);
            return comparison;
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to get benchmark' });
        }
    });

    // Log usage event
    app.post('/analytics/log', async (request, reply) => {
        const { analyticsService } = await import('./analytics.service');
        const orgId = request.headers['x-org-id'] as string;
        const userId = request.headers['x-user-id'] as string | null;

        if (!orgId) return reply.status(400).send({ error: 'Missing Organization ID' });

        const body = request.body as { action: string; resource: string; metadata?: any };

        try {
            await analyticsService.logUsage(orgId, userId, body.action, body.resource, body.metadata);
            return { success: true };
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to log usage' });
        }
    });

    // Calculate metrics (admin endpoint)
    app.post('/analytics/calculate', async (request, reply) => {
        const { analyticsService } = await import('./analytics.service');
        const orgId = request.headers['x-org-id'] as string;
        if (!orgId) return reply.status(400).send({ error: 'Missing Organization ID' });

        const body = request.body as { period: 'daily' | 'weekly' | 'monthly'; periodDate: string };

        try {
            await analyticsService.calculateMetrics(orgId, body.period, new Date(body.periodDate));
            return { success: true };
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to calculate metrics' });
        }
    });
}

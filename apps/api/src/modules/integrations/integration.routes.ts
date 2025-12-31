
import { FastifyInstance } from 'fastify';
import { apiKeyService } from './api-key.service';
import { z } from 'zod';

export async function integrationRoutes(app: FastifyInstance) {
    // Schema for creating a key
    const createKeySchema = z.object({
        name: z.string().min(1).max(50),
        scopes: z.array(z.string()).optional()
    });

    // LIST Keys
    app.get('/integrations/keys', async (request, reply) => {
        const orgId = request.headers['x-org-id'] as string;
        if (!orgId) return reply.status(400).send({ error: 'Missing Organization ID' });

        try {
            const keys = await apiKeyService.listKeys(orgId);
            return keys;
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to list API keys' });
        }
    });

    // CREATE Key
    app.post('/integrations/keys', async (request, reply) => {
        const orgId = request.headers['x-org-id'] as string;
        if (!orgId) return reply.status(400).send({ error: 'Missing Organization ID' });

        const body = createKeySchema.safeParse(request.body);
        if (!body.success) {
            return reply.status(400).send({ error: 'Invalid request body' });
        }

        try {
            const result = await apiKeyService.createApiKey(orgId, body.data.name, body.data.scopes);
            return result; // Returns rawKey only once
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to create API key' });
        }
    });

    // REVOKE Key
    app.delete('/integrations/keys/:id', async (request, reply) => {
        const orgId = request.headers['x-org-id'] as string;
        if (!orgId) return reply.status(400).send({ error: 'Missing Organization ID' });
        const { id } = request.params as { id: string };

        try {
            await apiKeyService.revokeKey(orgId, id);
            return reply.status(204).send();
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to revoke API key' });
        }
    });

    // ========================================================================
    // WEBHOOK ENDPOINTS
    // ========================================================================

    const { webhookService } = await import('./webhook.service');

    const createWebhookSchema = z.object({
        url: z.string().url(),
        events: z.array(z.string()).min(1)
    });

    // LIST Webhooks
    app.get('/integrations/webhooks', async (request, reply) => {
        const orgId = request.headers['x-org-id'] as string;
        if (!orgId) return reply.status(400).send({ error: 'Missing Organization ID' });

        try {
            const webhooks = await webhookService.listWebhooks(orgId);
            return webhooks;
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to list webhooks' });
        }
    });

    // CREATE Webhook
    app.post('/integrations/webhooks', async (request, reply) => {
        const orgId = request.headers['x-org-id'] as string;
        if (!orgId) return reply.status(400).send({ error: 'Missing Organization ID' });

        const body = createWebhookSchema.safeParse(request.body);
        if (!body.success) {
            return reply.status(400).send({ error: 'Invalid request body' });
        }

        try {
            const webhook = await webhookService.registerWebhook(
                orgId,
                body.data.url,
                body.data.events
            );
            return webhook;
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to create webhook' });
        }
    });

    // DELETE Webhook
    app.delete('/integrations/webhooks/:id', async (request, reply) => {
        const orgId = request.headers['x-org-id'] as string;
        if (!orgId) return reply.status(400).send({ error: 'Missing Organization ID' });
        const { id } = request.params as { id: string };

        try {
            await webhookService.deleteWebhook(orgId, id);
            return reply.status(204).send();
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to delete webhook' });
        }
    });

    // GET Webhook Deliveries
    app.get('/integrations/webhooks/:id/deliveries', async (request, reply) => {
        const orgId = request.headers['x-org-id'] as string;
        if (!orgId) return reply.status(400).send({ error: 'Missing Organization ID' });
        const { id } = request.params as { id: string };

        try {
            const deliveries = await webhookService.getDeliveries(orgId, id);
            return deliveries;
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to get deliveries' });
        }
    });

    // ========================================================================
    // CONNECTORS (Phase 4.2)
    // ========================================================================

    // List available connector types
    app.get('/integrations/connectors/available', async (request, reply) => {
        const { connectorManager } = await import('./connector-manager.service');
        return connectorManager.getAvailableConnectors();
    });

    // List active connections
    app.get('/integrations/connectors/connections', async (request, reply) => {
        const { prisma } = await import('../../lib/prisma');
        const orgId = request.headers['x-org-id'] as string;
        if (!orgId) return reply.status(400).send({ error: 'Missing Organization ID' });

        const connections = await prisma.integrationConnection.findMany({
            where: { orgId },
            include: {
                syncLogs: {
                    take: 5,
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        return connections;
    });

    // Create new connection
    app.post('/integrations/connectors/connections', async (request, reply) => {
        const { prisma } = await import('../../lib/prisma');
        const orgId = request.headers['x-org-id'] as string;
        if (!orgId) return reply.status(400).send({ error: 'Missing Organization ID' });

        const body = request.body as { connectorType: string; name: string; credentials: any; config?: any };

        try {
            const connection = await prisma.integrationConnection.create({
                data: {
                    orgId,
                    connectorType: body.connectorType,
                    name: body.name,
                    credentials: body.credentials,
                    config: body.config || {}
                }
            });

            return connection;
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to create connection' });
        }
    });

    // Test connection
    app.post('/integrations/connectors/connections/:id/test', async (request, reply) => {
        const { connectorManager } = await import('./connector-manager.service');
        const { id } = request.params as { id: string };

        try {
            const result = await connectorManager.testConnection(id);
            return { success: result };
        } catch (error: any) {
            request.log.error(error);
            return reply.status(500).send({ error: error.message });
        }
    });

    // Execute sync
    app.post('/integrations/connectors/connections/:id/sync', async (request, reply) => {
        const { connectorManager } = await import('./connector-manager.service');
        const { id } = request.params as { id: string };
        const body = request.body as { syncType: 'products' | 'orders' | 'customers' };

        try {
            const result = await connectorManager.executeSync(id, body.syncType);
            return result;
        } catch (error: any) {
            request.log.error(error);
            return reply.status(500).send({ error: error.message });
        }
    });

    // Delete connection
    app.delete('/integrations/connectors/connections/:id', async (request, reply) => {
        const { prisma } = await import('../../lib/prisma');
        const { id } = request.params as { id: string };

        try {
            await prisma.integrationConnection.delete({ where: { id } });
            return reply.status(204).send();
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to delete connection' });
        }
    });
}

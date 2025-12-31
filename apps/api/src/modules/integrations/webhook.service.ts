
import { createHmac } from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface WebhookEvent {
    type: string;
    data: any;
    timestamp: string;
}

export class WebhookService {
    /**
     * Register a new webhook endpoint for an organization
     */
    async registerWebhook(orgId: string, url: string, events: string[]) {
        // Generate a secret for HMAC signing
        const secret = this.generateSecret();

        return prisma.webhookEndpoint.create({
            data: {
                orgId,
                url,
                events,
                secret,
                isActive: true,
            },
        });
    }

    /**
     * List all webhooks for an organization
     */
    async listWebhooks(orgId: string) {
        return prisma.webhookEndpoint.findMany({
            where: { orgId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                url: true,
                events: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                // Don't expose the secret
            },
        });
    }

    /**
     * Delete/deactivate a webhook
     */
    async deleteWebhook(orgId: string, webhookId: string) {
        const webhook = await prisma.webhookEndpoint.findFirst({
            where: { id: webhookId, orgId },
        });

        if (!webhook) {
            throw new Error('Webhook not found or access denied');
        }

        return prisma.webhookEndpoint.update({
            where: { id: webhookId },
            data: { isActive: false },
        });
    }

    /**
     * Dispatch an event to all registered webhooks for an organization
     * This is async/fire-and-forget in production (use queue)
     */
    async dispatchEvent(orgId: string, eventType: string, payload: any) {
        const webhooks = await prisma.webhookEndpoint.findMany({
            where: {
                orgId,
                isActive: true,
            },
        });

        // Filter webhooks that are subscribed to this event type
        const relevantWebhooks = webhooks.filter((wh) => {
            const events = wh.events as string[];
            return events.includes(eventType) || events.includes('*');
        });

        // Dispatch to each webhook (in production, use a queue like Bull/BullMQ)
        const promises = relevantWebhooks.map((webhook) =>
            this.sendWebhook(webhook.id, webhook.url, webhook.secret, eventType, payload)
        );

        await Promise.allSettled(promises);
    }

    /**
     * Send a single webhook request
     */
    private async sendWebhook(
        webhookId: string,
        url: string,
        secret: string,
        eventType: string,
        payload: any
    ) {
        const eventId = crypto.randomUUID();
        const event: WebhookEvent = {
            type: eventType,
            data: payload,
            timestamp: new Date().toISOString(),
        };

        const body = JSON.stringify(event);
        const signature = this.signPayload(body, secret);

        const startTime = Date.now();
        let statusCode = 0;
        let success = false;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Webhook-Signature': signature,
                    'X-Event-Type': eventType,
                    'X-Event-Id': eventId,
                },
                body,
            });

            statusCode = response.status;
            success = response.ok;
        } catch (error) {
            console.error(`Webhook delivery failed for ${url}:`, error);
            statusCode = 0;
            success = false;
        }

        const duration = Date.now() - startTime;

        // Log the delivery
        await prisma.webhookDelivery.create({
            data: {
                webhookId,
                eventId,
                eventType,
                payload: event,
                statusCode,
                success,
                durationMs: duration,
            },
        });
    }

    /**
     * Sign payload with HMAC-SHA256
     */
    private signPayload(payload: string, secret: string): string {
        return createHmac('sha256', secret).update(payload).digest('hex');
    }

    /**
     * Generate a random secret for webhook signing
     */
    private generateSecret(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Get delivery history for a webhook
     */
    async getDeliveries(orgId: string, webhookId: string, limit = 50) {
        // Verify webhook belongs to org
        const webhook = await prisma.webhookEndpoint.findFirst({
            where: { id: webhookId, orgId },
        });

        if (!webhook) {
            throw new Error('Webhook not found or access denied');
        }

        return prisma.webhookDelivery.findMany({
            where: { webhookId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
}

export const webhookService = new WebhookService();

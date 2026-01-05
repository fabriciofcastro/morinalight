import { Injectable } from '@nestjs/common';

export interface WebhookConfig {
    id: string;
    url: string;
    secret?: string;
    events: string[];
    active: boolean;
    retryConfig?: {
        maxRetries: number;
        initialDelay: number;
        maxDelay: number;
        backoffMultiplier: number;
    };
}

export interface WebhookEvent {
    id: string;
    type: string;
    timestamp: Date;
    data: any;
    orgId: string;
}

export interface WebhookDelivery {
    id: string;
    webhookId: string;
    eventId: string;
    status: 'pending' | 'success' | 'failed' | 'retrying';
    attempts: number;
    lastAttempt?: Date;
    nextRetry?: Date;
    response?: {
        statusCode: number;
        body: string;
        headers: Record<string, string>;
    };
    error?: string;
}

/**
 * Serviço de webhooks configuráveis
 * Permite notificar sistemas externos sobre eventos de auditoria
 */
@Injectable()
export class WebhookService {
    private webhooks: Map<string, WebhookConfig> = new Map();
    private deliveryQueue: WebhookDelivery[] = [];

    /**
     * Registra um novo webhook
     */
    async registerWebhook(config: Omit<WebhookConfig, 'id'>): Promise<WebhookConfig> {
        const webhook: WebhookConfig = {
            id: this.generateId(),
            ...config,
            retryConfig: config.retryConfig || {
                maxRetries: 3,
                initialDelay: 1000,
                maxDelay: 60000,
                backoffMultiplier: 2,
            },
        };

        this.webhooks.set(webhook.id, webhook);

        // Persistir no banco
        await this.saveWebhook(webhook);

        return webhook;
    }

    /**
     * Atualiza configuração de webhook
     */
    async updateWebhook(id: string, updates: Partial<WebhookConfig>): Promise<WebhookConfig> {
        const webhook = this.webhooks.get(id);

        if (!webhook) {
            throw new Error('Webhook not found');
        }

        const updated = { ...webhook, ...updates };
        this.webhooks.set(id, updated);

        await this.saveWebhook(updated);

        return updated;
    }

    /**
     * Remove webhook
     */
    async deleteWebhook(id: string): Promise<void> {
        this.webhooks.delete(id);
        await this.removeWebhook(id);
    }

    /**
     * Envia evento para webhooks
     */
    async sendEvent(event: WebhookEvent): Promise<void> {
        const webhooks = Array.from(this.webhooks.values())
            .filter(w => w.active && w.events.includes(event.type));

        for (const webhook of webhooks) {
            await this.deliverEvent(webhook, event);
        }
    }

    /**
     * Entrega evento para webhook específico
     */
    private async deliverEvent(webhook: WebhookConfig, event: WebhookEvent): Promise<void> {
        const delivery: WebhookDelivery = {
            id: this.generateId(),
            webhookId: webhook.id,
            eventId: event.id,
            status: 'pending',
            attempts: 0,
        };

        this.deliveryQueue.push(delivery);
        await this.processDelivery(webhook, event, delivery);
    }

    /**
     * Processa entrega com retry
     */
    private async processDelivery(
        webhook: WebhookConfig,
        event: WebhookEvent,
        delivery: WebhookDelivery,
    ): Promise<void> {
        const maxRetries = webhook.retryConfig!.maxRetries;

        while (delivery.attempts < maxRetries) {
            try {
                delivery.attempts++;
                delivery.lastAttempt = new Date();

                const response = await this.sendHttpRequest(webhook, event);

                delivery.status = 'success';
                delivery.response = {
                    statusCode: response.status,
                    body: await response.text(),
                    headers: Object.fromEntries(response.headers.entries()),
                };

                await this.saveDelivery(delivery);
                return;
            } catch (error: any) {
                delivery.error = error.message;

                if (delivery.attempts >= maxRetries) {
                    delivery.status = 'failed';
                    await this.saveDelivery(delivery);
                    await this.notifyDeliveryFailure(webhook, event, delivery);
                    return;
                }

                // Calcular próximo retry com exponential backoff
                const delay = this.calculateBackoff(
                    delivery.attempts,
                    webhook.retryConfig!,
                );

                delivery.status = 'retrying';
                delivery.nextRetry = new Date(Date.now() + delay);
                await this.saveDelivery(delivery);

                // Aguardar antes de tentar novamente
                await this.sleep(delay);
            }
        }
    }

    /**
     * Envia requisição HTTP
     */
    private async sendHttpRequest(
        webhook: WebhookConfig,
        event: WebhookEvent,
    ): Promise<Response> {
        const payload = {
            id: event.id,
            type: event.type,
            timestamp: event.timestamp.toISOString(),
            data: event.data,
        };

        const signature = webhook.secret
            ? this.generateSignature(payload, webhook.secret)
            : undefined;

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'User-Agent': 'Morina-Audit-Webhook/1.0',
            'X-Webhook-ID': webhook.id,
            'X-Event-ID': event.id,
            'X-Event-Type': event.type,
        };

        if (signature) {
            headers['X-Webhook-Signature'] = signature;
        }

        const response = await fetch(webhook.url, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(30000), // 30s timeout
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
    }

    /**
     * Gera assinatura HMAC para verificação
     */
    private generateSignature(payload: any, secret: string): string {
        const crypto = require('crypto');
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(JSON.stringify(payload));
        return `sha256=${hmac.digest('hex')}`;
    }

    /**
     * Verifica assinatura de webhook
     */
    verifySignature(payload: string, signature: string, secret: string): boolean {
        const crypto = require('crypto');
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(payload);
        const expected = `sha256=${hmac.digest('hex')}`;

        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expected),
        );
    }

    /**
     * Calcula delay de backoff exponencial
     */
    private calculateBackoff(attempt: number, config: NonNullable<WebhookConfig['retryConfig']>): number {
        const delay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1);
        return Math.min(delay, config.maxDelay);
    }

    /**
     * Lista webhooks
     */
    async listWebhooks(orgId?: string): Promise<WebhookConfig[]> {
        const webhooks = Array.from(this.webhooks.values());

        if (orgId) {
            // Filtrar por organização se necessário
            return webhooks;
        }

        return webhooks;
    }

    /**
     * Obtém histórico de entregas
     */
    async getDeliveryHistory(webhookId: string, limit = 100): Promise<WebhookDelivery[]> {
        return this.deliveryQueue
            .filter(d => d.webhookId === webhookId)
            .slice(0, limit);
    }

    /**
     * Testa webhook
     */
    async testWebhook(id: string): Promise<{ success: boolean; message: string }> {
        const webhook = this.webhooks.get(id);

        if (!webhook) {
            throw new Error('Webhook not found');
        }

        const testEvent: WebhookEvent = {
            id: this.generateId(),
            type: 'test',
            timestamp: new Date(),
            data: { message: 'This is a test event' },
            orgId: 'test',
        };

        try {
            const response = await this.sendHttpRequest(webhook, testEvent);
            return {
                success: true,
                message: `Webhook responded with status ${response.status}`,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message,
            };
        }
    }

    // Helper methods
    private generateId(): string {
        return `wh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private async saveWebhook(webhook: WebhookConfig): Promise<void> {
        // Implementar persistência no banco
    }

    private async removeWebhook(id: string): Promise<void> {
        // Implementar remoção do banco
    }

    private async saveDelivery(delivery: WebhookDelivery): Promise<void> {
        // Implementar persistência no banco
    }

    private async notifyDeliveryFailure(
        webhook: WebhookConfig,
        event: WebhookEvent,
        delivery: WebhookDelivery,
    ): Promise<void> {
        // Implementar notificação de falha
        console.error(`Webhook delivery failed after ${delivery.attempts} attempts:`, {
            webhookId: webhook.id,
            eventId: event.id,
            error: delivery.error,
        });
    }
}

/**
 * SIEM Event Exporter
 * 
 * Export security events to external SIEM systems
 */

import { logger } from '@/lib/observability';
import type { SecurityAlert } from '@/lib/security/intrusion-detection';

export interface SIEMEvent {
    timestamp: Date;
    eventType: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    action: string;
    resource?: string;
    status: 'success' | 'failure';
    message: string;
    metadata?: Record<string, any>;
    correlationId?: string;
}

export interface SIEMConnector {
    name: string;
    export(events: SIEMEvent[]): Promise<void>;
    isHealthy(): Promise<boolean>;
}

/**
 * SIEM Event Exporter with batching and retry logic
 */
export class SIEMExporter {
    private connector: SIEMConnector | null = null;
    private eventBuffer: SIEMEvent[] = [];
    private batchSize: number;
    private flushInterval: number;
    private flushTimer: NodeJS.Timeout | null = null;
    private isEnabled: boolean;

    constructor() {
        this.isEnabled = process.env.SIEM_ENABLED === 'true';
        this.batchSize = parseInt(process.env.SIEM_BATCH_SIZE || '100', 10);
        this.flushInterval = parseInt(process.env.SIEM_FLUSH_INTERVAL || '30000', 10);

        if (this.isEnabled) {
            this.initializeConnector();
            this.startFlushTimer();
        }
    }

    private async initializeConnector() {
        const provider = process.env.SIEM_PROVIDER || 'splunk';

        try {
            switch (provider) {
                case 'splunk':
                    const { SplunkConnector } = await import('./connectors/splunk-connector');
                    this.connector = new SplunkConnector();
                    break;
                case 'elk':
                    const { ELKConnector } = await import('./connectors/elk-connector');
                    this.connector = new ELKConnector();
                    break;
                case 'azure-sentinel':
                    const { AzureSentinelConnector } = await import('./connectors/azure-sentinel-connector');
                    this.connector = new AzureSentinelConnector();
                    break;
                case 'datadog':
                    const { DatadogConnector } = await import('./connectors/datadog-connector');
                    this.connector = new DatadogConnector();
                    break;
                default:
                    logger.warn(`Unknown SIEM provider: ${provider}`);
            }

            if (this.connector) {
                logger.info(`SIEM connector initialized: ${this.connector.name}`);
            }
        } catch (error) {
            logger.error('Failed to initialize SIEM connector', error as Error);
        }
    }

    /**
     * Export a single event
     */
    async exportEvent(event: SIEMEvent): Promise<void> {
        if (!this.isEnabled || !this.connector) {
            return;
        }

        this.eventBuffer.push(event);

        // Flush if buffer is full
        if (this.eventBuffer.length >= this.batchSize) {
            await this.flush();
        }
    }

    /**
     * Export multiple events
     */
    async exportEvents(events: SIEMEvent[]): Promise<void> {
        if (!this.isEnabled || !this.connector) {
            return;
        }

        this.eventBuffer.push(...events);

        // Flush if buffer is full
        if (this.eventBuffer.length >= this.batchSize) {
            await this.flush();
        }
    }

    /**
     * Export security alert
     */
    async exportSecurityAlert(alert: SecurityAlert): Promise<void> {
        const event: SIEMEvent = {
            timestamp: alert.timestamp,
            eventType: 'security_alert',
            severity: alert.severity,
            userId: alert.userId,
            ipAddress: alert.ipAddress,
            action: alert.alertType,
            status: 'failure',
            message: alert.description,
            metadata: {
                ...alert.metadata,
                country: alert.country,
                city: alert.city,
                latitude: alert.latitude,
                longitude: alert.longitude,
            },
        };

        await this.exportEvent(event);
    }

    /**
     * Flush buffered events to SIEM
     */
    async flush(): Promise<void> {
        if (this.eventBuffer.length === 0 || !this.connector) {
            return;
        }

        const eventsToExport = [...this.eventBuffer];
        this.eventBuffer = [];

        try {
            await this.connector.export(eventsToExport);
            logger.info(`Exported ${eventsToExport.length} events to SIEM`);
        } catch (error) {
            logger.error('Failed to export events to SIEM', error as Error);

            // Re-buffer events for retry (with limit to prevent memory issues)
            if (this.eventBuffer.length < this.batchSize * 10) {
                this.eventBuffer.unshift(...eventsToExport);
            }
        }
    }

    /**
     * Start automatic flush timer
     */
    private startFlushTimer() {
        this.flushTimer = setInterval(() => {
            this.flush().catch(error => {
                logger.error('Flush timer error', error as Error);
            });
        }, this.flushInterval);
    }

    /**
     * Stop exporter and flush remaining events
     */
    async stop(): Promise<void> {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }
        await this.flush();
    }

    /**
     * Check SIEM health
     */
    async isHealthy(): Promise<boolean> {
        if (!this.connector) {
            return false;
        }
        return this.connector.isHealthy();
    }
}

export const siemExporter = new SIEMExporter();

// Graceful shutdown (Only in Node.js environment)
if (typeof process !== 'undefined' && typeof process.on === 'function') {
    process.on('SIGTERM', async () => {
        await siemExporter.stop();
    });

    process.on('SIGINT', async () => {
        await siemExporter.stop();
    });
}

/**
 * USAGE:
 * 
 * import { siemExporter } from '@/lib/siem/siem-exporter';
 * 
 * // Export security alert
 * await siemExporter.exportSecurityAlert(alert);
 * 
 * // Export custom event
 * await siemExporter.exportEvent({
 *   timestamp: new Date(),
 *   eventType: 'authentication',
 *   severity: 'medium',
 *   userId: 'user-123',
 *   action: 'login',
 *   status: 'success',
 *   message: 'User logged in successfully',
 * });
 */

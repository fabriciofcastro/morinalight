/**
 * Splunk HEC Connector
 * 
 * Export events to Splunk via HTTP Event Collector
 */

import axios from 'axios';
import type { SIEMConnector, SIEMEvent } from '../siem-exporter';
import { logger } from '@/lib/observability';

export class SplunkConnector implements SIEMConnector {
    name = 'Splunk HEC';
    private endpoint: string;
    private token: string;
    private client: ReturnType<typeof axios.create>;

    constructor() {
        this.endpoint = process.env.SIEM_ENDPOINT || '';
        this.token = process.env.SIEM_TOKEN || '';

        if (!this.endpoint || !this.token) {
            throw new Error('Splunk HEC endpoint and token are required');
        }

        this.client = axios.create({
            baseURL: this.endpoint,
            headers: {
                'Authorization': `Splunk ${this.token}`,
                'Content-Type': 'application/json',
            },
            timeout: 10000,
        });
    }

    async export(events: SIEMEvent[]): Promise<void> {
        try {
            // Splunk HEC format
            const splunkEvents = events.map(event => ({
                time: Math.floor(event.timestamp.getTime() / 1000),
                source: 'morinalight',
                sourcetype: 'security:event',
                event: {
                    event_type: event.eventType,
                    severity: event.severity,
                    user_id: event.userId,
                    ip_address: event.ipAddress,
                    user_agent: event.userAgent,
                    action: event.action,
                    resource: event.resource,
                    status: event.status,
                    message: event.message,
                    correlation_id: event.correlationId,
                    ...event.metadata,
                },
            }));

            // Send to Splunk HEC
            await this.client.post('/services/collector/event',
                splunkEvents.map(e => JSON.stringify(e)).join('\n'),
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            logger.debug(`Exported ${events.length} events to Splunk`);
        } catch (error) {
            logger.error('Failed to export to Splunk', error as Error);
            throw error;
        }
    }

    async isHealthy(): Promise<boolean> {
        try {
            const response = await this.client.get('/services/collector/health');
            return response.status === 200;
        } catch (error) {
            return false;
        }
    }
}

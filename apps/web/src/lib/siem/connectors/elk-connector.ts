/**
 * ELK (Elasticsearch) Connector
 * 
 * Export events to Elasticsearch via Bulk API
 */

import axios from 'axios';
import type { SIEMConnector, SIEMEvent } from '../siem-exporter';
import { logger } from '@/lib/observability';

export class ELKConnector implements SIEMConnector {
    name = 'Elasticsearch';
    private endpoint: string;
    private indexPrefix: string;
    private client: ReturnType<typeof axios.create>;

    constructor() {
        this.endpoint = process.env.SIEM_ENDPOINT || '';
        this.indexPrefix = process.env.SIEM_INDEX_PREFIX || 'morinalight-security';

        if (!this.endpoint) {
            throw new Error('Elasticsearch endpoint is required');
        }

        this.client = axios.create({
            baseURL: this.endpoint,
            headers: {
                'Content-Type': 'application/x-ndjson',
            },
            timeout: 10000,
        });

        // Add basic auth if provided
        const username = process.env.SIEM_USERNAME;
        const password = process.env.SIEM_PASSWORD;
        if (username && password) {
            this.client.defaults.auth = { username, password };
        }
    }

    async export(events: SIEMEvent[]): Promise<void> {
        try {
            // Get current date for index name
            const date = new Date().toISOString().split('T')[0];
            const indexName = `${this.indexPrefix}-${date}`;

            // Build bulk request body (NDJSON format)
            const bulkBody = events.flatMap(event => [
                { index: { _index: indexName } },
                {
                    '@timestamp': event.timestamp.toISOString(),
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
            ]);

            // Convert to NDJSON
            const ndjson = bulkBody.map(line => JSON.stringify(line)).join('\n') + '\n';

            // Send to Elasticsearch
            await this.client.post('/_bulk', ndjson);

            logger.debug(`Exported ${events.length} events to Elasticsearch`);
        } catch (error) {
            logger.error('Failed to export to Elasticsearch', error as Error);
            throw error;
        }
    }

    async isHealthy(): Promise<boolean> {
        try {
            const response = await this.client.get('/_cluster/health');
            return response.status === 200;
        } catch (error) {
            return false;
        }
    }
}

import type { AuditEvent, SIEMAdapter } from "./siem-adapter.interface";

export class ElasticsearchAdapter implements SIEMAdapter {
  name = "Elasticsearch";
  private esUrl: string;
  private apiKey: string;
  private indexName: string;

  constructor(esUrl?: string, apiKey?: string, indexName?: string) {
    this.esUrl = esUrl || process.env.ELASTICSEARCH_URL || "";
    this.apiKey = apiKey || process.env.ELASTICSEARCH_API_KEY || "";
    this.indexName = indexName || process.env.ELASTICSEARCH_INDEX || "morina-audit";
  }

  async sendEvent(event: AuditEvent): Promise<void> {
    try {
      const formattedEvent = this.formatEvent(event);
      const indexUrl = `${this.esUrl}/${this.indexName}/_doc`;

      const response = await fetch(indexUrl, {
        method: "POST",
        headers: {
          Authorization: `ApiKey ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedEvent),
      });

      if (!response.ok) {
        throw new Error(`Elasticsearch error: ${response.statusText}`);
      }

      console.log(`✅ [SIEM] Event indexed in Elasticsearch: ${event.eventType}`);
    } catch (error) {
      console.error("❌ [SIEM] Failed to index event in Elasticsearch:", error);
      throw error;
    }
  }

  async sendBatch(events: AuditEvent[]): Promise<void> {
    try {
      // Bulk API format: { "index": {} }\n{ document }\n
      const bulkBody =
        events
          .map((event) => {
            const indexAction = JSON.stringify({ index: { _index: this.indexName } });
            const document = JSON.stringify(this.formatEvent(event));
            return `${indexAction}\n${document}`;
          })
          .join("\n") + "\n";

      const bulkUrl = `${this.esUrl}/_bulk`;

      const response = await fetch(bulkUrl, {
        method: "POST",
        headers: {
          Authorization: `ApiKey ${this.apiKey}`,
          "Content-Type": "application/x-ndjson",
        },
        body: bulkBody,
      });

      if (!response.ok) {
        throw new Error(`Elasticsearch bulk error: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.errors) {
        console.warn(`⚠️ [SIEM] Some events failed to index in Elasticsearch`);
      } else {
        console.log(`✅ [SIEM] ${events.length} events indexed in Elasticsearch`);
      }
    } catch (error) {
      console.error("❌ [SIEM] Failed to bulk index in Elasticsearch:", error);
      throw error;
    }
  }

  formatEvent(event: AuditEvent): any {
    return {
      "@timestamp": event.timestamp.toISOString(),
      event_type: event.eventType,
      org_id: event.orgId,
      user_id: event.userId,
      severity: event.severity,
      details: event.details,
      metadata: event.metadata || {},
      source: "morina-permission-audit",
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      const healthUrl = `${this.esUrl}/_cluster/health`;

      const response = await fetch(healthUrl, {
        method: "GET",
        headers: {
          Authorization: `ApiKey ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        return false;
      }

      const health = await response.json();
      console.log(`✅ [SIEM] Elasticsearch cluster status: ${health.status}`);
      return true;
    } catch (error) {
      console.error("Elasticsearch connection test failed:", error);
      return false;
    }
  }
}

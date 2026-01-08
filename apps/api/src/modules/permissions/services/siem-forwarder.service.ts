import { getPrisma } from "../../../infra/database/prisma.service";
import { ElasticsearchAdapter } from "../integrations/siem/elasticsearch-adapter";
import type { AuditEvent, SIEMAdapter } from "../integrations/siem/siem-adapter.interface";
import { SplunkAdapter } from "../integrations/siem/splunk-adapter";

const prisma = getPrisma();

export class SIEMForwarderService {
  private adapters: Map<string, SIEMAdapter> = new Map();
  private queue: AuditEvent[] = [];
  private batchSize = 10;
  private flushInterval = 30000; // 30 seconds
  private flushTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeAdapters();
    this.startFlushTimer();
  }

  private initializeAdapters(): void {
    // Splunk
    if (process.env.SPLUNK_HEC_URL && process.env.SPLUNK_HEC_TOKEN) {
      const splunk = new SplunkAdapter();
      this.adapters.set("splunk", splunk);
      console.log("✅ [SIEM] Splunk adapter initialized");
    }

    // Elasticsearch
    if (process.env.ELASTICSEARCH_URL && process.env.ELASTICSEARCH_API_KEY) {
      const elasticsearch = new ElasticsearchAdapter();
      this.adapters.set("elasticsearch", elasticsearch);
      console.log("✅ [SIEM] Elasticsearch adapter initialized");
    }

    if (this.adapters.size === 0) {
      console.warn("⚠️ [SIEM] No SIEM adapters configured");
    }
  }

  async sendEvent(event: AuditEvent): Promise<void> {
    if (this.adapters.size === 0) {
      return; // Silently skip if no adapters configured
    }

    try {
      // Adicionar à queue
      this.queue.push(event);

      // Salvar no banco para retry
      await this.saveToDatabase(event);

      // Flush se atingiu batch size
      if (this.queue.length >= this.batchSize) {
        await this.flush();
      }
    } catch (error) {
      console.error("Error sending event to SIEM:", error);
    }
  }

  async sendBatch(events: AuditEvent[]): Promise<void> {
    for (const event of events) {
      await this.sendEvent(event);
    }
  }

  private async flush(): Promise<void> {
    if (this.queue.length === 0) {
      return;
    }

    const eventsToSend = [...this.queue];
    this.queue = [];

    const promises: Promise<void>[] = [];

    for (const [name, adapter] of this.adapters.entries()) {
      promises.push(
        adapter.sendBatch(eventsToSend).catch((error) => {
          console.error(`Failed to send batch to ${name}:`, error);
          // Re-adicionar à queue em caso de falha
          this.queue.push(...eventsToSend);
        }),
      );
    }

    await Promise.allSettled(promises);

    // Marcar eventos como enviados no banco
    await this.markAsSent(eventsToSend);
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush().catch(console.error);
    }, this.flushInterval);
  }

  private async saveToDatabase(event: AuditEvent): Promise<void> {
    try {
      await prisma.sIEMEvent.create({
        data: {
          eventType: event.eventType,
          payload: event as any,
          status: "pending",
          retries: 0,
        },
      });
    } catch (error) {
      console.error("Error saving SIEM event to database:", error);
    }
  }

  private async markAsSent(events: AuditEvent[]): Promise<void> {
    try {
      // Buscar eventos no banco e marcar como enviados
      const eventTypes = events.map((e) => e.eventType);
      const timestamps = events.map((e) => e.timestamp);

      await prisma.sIEMEvent.updateMany({
        where: {
          eventType: { in: eventTypes },
          createdAt: {
            gte: new Date(Math.min(...timestamps.map((t) => t.getTime()))),
            lte: new Date(Math.max(...timestamps.map((t) => t.getTime()))),
          },
          status: "pending",
        },
        data: {
          status: "sent",
          sentAt: new Date(),
        },
      });
    } catch (error) {
      console.error("Error marking events as sent:", error);
    }
  }

  async retryFailed(): Promise<void> {
    try {
      const failedEvents = await prisma.sIEMEvent.findMany({
        where: {
          status: "failed",
          retries: { lt: 3 },
        },
        take: 100,
      });

      for (const dbEvent of failedEvents) {
        const event = dbEvent.payload as AuditEvent;
        await this.sendEvent(event);

        await prisma.sIEMEvent.update({
          where: { id: dbEvent.id },
          data: {
            retries: { increment: 1 },
          },
        });
      }

      console.log(`🔄 [SIEM] Retried ${failedEvents.length} failed events`);
    } catch (error) {
      console.error("Error retrying failed events:", error);
    }
  }

  async testConnections(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    for (const [name, adapter] of this.adapters.entries()) {
      try {
        results[name] = await adapter.testConnection();
      } catch (error) {
        results[name] = false;
      }
    }

    return results;
  }

  stop(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }
}

// Singleton instance
let siemForwarderInstance: SIEMForwarderService | null = null;

export function getSIEMForwarder(): SIEMForwarderService {
  if (!siemForwarderInstance) {
    siemForwarderInstance = new SIEMForwarderService();
  }
  return siemForwarderInstance;
}

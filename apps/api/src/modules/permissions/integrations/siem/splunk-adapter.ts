import type { AuditEvent, SIEMAdapter } from "./siem-adapter.interface";

export class SplunkAdapter implements SIEMAdapter {
    name = "Splunk";
    private hecUrl: string;
    private hecToken: string;

    constructor(hecUrl?: string, hecToken?: string) {
        this.hecUrl = hecUrl || process.env.SPLUNK_HEC_URL || "";
        this.hecToken = hecToken || process.env.SPLUNK_HEC_TOKEN || "";
    }

    async sendEvent(event: AuditEvent): Promise<void> {
        try {
            const formattedEvent = this.formatEvent(event);

            const response = await fetch(this.hecUrl, {
                method: "POST",
                headers: {
                    "Authorization": `Splunk ${this.hecToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formattedEvent),
            });

            if (!response.ok) {
                throw new Error(`Splunk HEC error: ${response.statusText}`);
            }

            console.log(`✅ [SIEM] Event sent to Splunk: ${event.eventType}`);
        } catch (error) {
            console.error("❌ [SIEM] Failed to send event to Splunk:", error);
            throw error;
        }
    }

    async sendBatch(events: AuditEvent[]): Promise<void> {
        try {
            const formattedEvents = events.map((e) => this.formatEvent(e));
            const payload = formattedEvents.map((e) => JSON.stringify(e)).join("\n");

            const response = await fetch(this.hecUrl, {
                method: "POST",
                headers: {
                    "Authorization": `Splunk ${this.hecToken}`,
                    "Content-Type": "application/json",
                },
                body: payload,
            });

            if (!response.ok) {
                throw new Error(`Splunk HEC batch error: ${response.statusText}`);
            }

            console.log(`✅ [SIEM] ${events.length} events sent to Splunk`);
        } catch (error) {
            console.error("❌ [SIEM] Failed to send batch to Splunk:", error);
            throw error;
        }
    }

    formatEvent(event: AuditEvent): any {
        return {
            time: Math.floor(event.timestamp.getTime() / 1000),
            host: "morina-api",
            source: "permission-audit",
            sourcetype: "morina:audit",
            event: {
                event_type: event.eventType,
                org_id: event.orgId,
                user_id: event.userId,
                severity: event.severity,
                ...event.details,
                metadata: event.metadata,
            },
        };
    }

    async testConnection(): Promise<boolean> {
        try {
            const testEvent: AuditEvent = {
                eventType: "audit_run",
                timestamp: new Date(),
                orgId: "test",
                severity: "low",
                details: { test: true },
            };

            await this.sendEvent(testEvent);
            return true;
        } catch (error) {
            console.error("Splunk connection test failed:", error);
            return false;
        }
    }
}

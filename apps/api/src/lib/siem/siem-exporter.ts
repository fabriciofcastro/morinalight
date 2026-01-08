import { randomUUID } from "node:crypto";

export interface SiemLogEntry {
  timestamp: string;
  source: string;
  action: string;
  severity: "low" | "medium" | "high" | "critical";
  actorId?: string;
  ipAddress?: string;
  orgId?: string;
  payload: any;
}

export class SiemExporter {
  private queue: SiemLogEntry[] = [];
  private batchSize = 10;
  private flushInterval = 5000; // 5 segundos
  private endpoint = process.env.SIEM_ENDPOINT;
  private token = process.env.SIEM_TOKEN;
  private isProcessing = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    if (this.endpoint) {
      this.intervalId = setInterval(() => this.flush(), this.flushInterval);
      console.log(`[SIEM] Exporter inicializado para ${this.endpoint}`);
    } else {
      console.warn(
        "[SIEM] Endpoint não configurado. Logs serão descartados ou apenas logados localmente.",
      );
    }
  }

  /**
   * Adiciona um log à fila de exportação
   */
  public log(entry: SiemLogEntry): void {
    const enrichedEntry = {
      ...entry,
      env: process.env.NODE_ENV || "development",
      service: "morina-api",
    };

    if (!this.endpoint) {
      if (process.env.NODE_ENV === "development") {
        // console.log("[SIEM-DEBUG]", enrichedEntry);
      }
      return;
    }

    this.queue.push(enrichedEntry);

    if (this.queue.length >= this.batchSize) {
      void this.flush();
    }
  }

  /**
   * Envia os logs acumulados para o provedor SIEM
   */
  private async flush(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0 || !this.endpoint) return;

    this.isProcessing = true;
    const batch = [...this.queue];
    this.queue = [];

    let retries = 3;
    let success = false;

    while (retries > 0 && !success) {
      try {
        const response = await fetch(this.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.token}`,
            "X-Siem-Agent": "morina-security-exporer/1.0",
          },
          body: JSON.stringify({
            requestId: randomUUID(),
            logs: batch,
            sentAt: new Date().toISOString(),
            batchSize: batch.length,
          }),
        });

        if (response.ok) {
          success = true;
        } else {
          throw new Error(`SIEM HTTP Error: ${response.status}`);
        }
      } catch (error) {
        retries--;
        console.error(`[SIEM] Falha ao enviar logs (${retries} tentativas restantes):`, error);
        if (retries > 0) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * (4 - retries)));
        }
      }
    }

    if (!success) {
      console.error(
        "[SIEM] Falha crítica ao exportar batch de logs. Re-encolando para próxima rodada.",
      );
      this.queue.push(...batch); // Coloca de volta no fim da fila
    }

    this.isProcessing = false;
  }

  /**
   * Para o exporter e limpa o intervalo. Útil para testes.
   */
  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const siemExporter = new SiemExporter();

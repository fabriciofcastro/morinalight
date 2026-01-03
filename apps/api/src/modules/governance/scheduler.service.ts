import { RiskMonitorService } from "./risk-monitor.service";

export class GovernanceScheduler {
    private static intervalId: NodeJS.Timeout | null = null;

    static start() {
        if (this.intervalId) return;

        console.log("[GovernanceScheduler] Starting Risk Monitor (every 5m)...");

        // Run immediately
        this.runJob();

        // Schedule
        this.intervalId = setInterval(() => {
            this.runJob();
        }, 5 * 60 * 1000);
    }

    static stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    private static async runJob() {
        try {
            await RiskMonitorService.scanForAnomalies();
        } catch (e) {
            console.error("[GovernanceScheduler] Job Failed:", e);
        }
    }
}

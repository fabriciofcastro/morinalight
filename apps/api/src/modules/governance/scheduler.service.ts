import { RiskMonitorService } from "./risk-monitor.service";

export class GovernanceScheduler {
  private static intervalId: NodeJS.Timeout | null = null;

  static start() {
    if (GovernanceScheduler.intervalId) return;

    console.log("[GovernanceScheduler] Starting Risk Monitor (every 5m)...");

    // Run immediately
    GovernanceScheduler.runJob();

    // Schedule
    GovernanceScheduler.intervalId = setInterval(
      () => {
        GovernanceScheduler.runJob();
      },
      5 * 60 * 1000,
    );
  }

  static stop() {
    if (GovernanceScheduler.intervalId) {
      clearInterval(GovernanceScheduler.intervalId);
      GovernanceScheduler.intervalId = null;
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

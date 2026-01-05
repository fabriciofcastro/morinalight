import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SiemExporter, SiemLogEntry } from "../siem-exporter";

describe("SiemExporter", () => {
    let exporter: SiemExporter;
    const mockEndpoint = "http://siem.test/logs";
    const mockToken = "test-token";

    beforeEach(() => {
        vi.useFakeTimers();
        process.env.SIEM_ENDPOINT = mockEndpoint;
        process.env.SIEM_TOKEN = mockToken;
        exporter = new SiemExporter();
    });

    afterEach(() => {
        exporter.stop();
        vi.restoreAllMocks();
    });

    it("should batch logs and send them when batch size is reached", async () => {
        const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({ ok: true } as any);

        // Add 9 logs (batch size is 10)
        for (let i = 0; i < 9; i++) {
            exporter.log({ action: `test-${i}`, severity: "low", source: "test", payload: {} } as any);
        }

        expect(fetchSpy).not.toHaveBeenCalled();

        // Add 10th log
        exporter.log({ action: "test-9", severity: "low", source: "test", payload: {} } as any);

        expect(fetchSpy).toHaveBeenCalledTimes(1);
        const body = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string);
        expect(body.logs).toHaveLength(10);
        expect(body.requestId).toBeDefined();
    });

    it("should retry on failure and re-queue logs if still failing", async () => {
        const fetchSpy = vi.spyOn(global, "fetch").mockRejectedValue(new Error("Network Error"));
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => { });

        // Stop the interval to prevent interference
        exporter.stop();

        // Add 10 logs to trigger flush
        for (let i = 0; i < 10; i++) {
            exporter.log({ action: `test-${i}`, severity: "low", source: "test", payload: {} } as any);
        }

        // Wait for retries (3 retries)
        // Note: we advance time manually to avoid infinite loops with runAllTimers
        for (let i = 0; i < 3; i++) {
            await vi.advanceTimersByTimeAsync(5000);
        }

        expect(fetchSpy).toHaveBeenCalledTimes(3);
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("[SIEM] Falha crítica ao exportar batch de logs. Re-encolando para próxima rodada."));

        // After failure, logs should be back in the queue (10 logs)
        fetchSpy.mockResolvedValue({ ok: true } as any);

        // Add 10 more logs.
        // Log 1: triggers flush of 11 items (10 re-queued + 1 new)
        // Logs 2-10: stay in queue (9 items)
        for (let i = 0; i < 10; i++) {
            exporter.log({ action: `new-${i}`, severity: "low", source: "test", payload: {} } as any);
        }

        // Wait for the first re-queued batch to finish (triggered by log 1)
        await vi.advanceTimersByTimeAsync(100);

        // Manually trigger another flush to pick up the remaining 9 logs
        // (Using [] access to call private method for testing)
        await (exporter as any).flush();

        // We expect: 
        // - 3 original failed attempts
        // - 1 successful batch with 11 logs (triggered automatically)
        // - 1 successful batch with 9 logs (triggered manually)
        expect(fetchSpy).toHaveBeenCalledTimes(5);

        const calls = fetchSpy.mock.calls;
        const allSentLogs = calls.slice(3).flatMap(call => JSON.parse(call[1]?.body as string).logs);

        expect(allSentLogs).toHaveLength(20);
        expect(allSentLogs.some(l => l.action === "test-0")).toBe(true);
        expect(allSentLogs.some(l => l.action === "new-9")).toBe(true);
    });

    it("should flush logs on interval", async () => {
        const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({ ok: true } as any);

        exporter.log({ action: "interval-test", severity: "low", source: "test", payload: {} } as any);

        expect(fetchSpy).not.toHaveBeenCalled();

        // Advance 5 seconds
        await vi.advanceTimersByTimeAsync(5000);

        expect(fetchSpy).toHaveBeenCalledTimes(1);
        const body = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string);
        expect(body.logs).toHaveLength(1);
    });
});

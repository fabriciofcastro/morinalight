/**
 * Advanced Health Check Service
 * Provides comprehensive health checks for all system components
 */

import { getPrisma } from "../../infra/database/prisma.service";
import type { RedisEventBus } from "../../infra/events/redis-event-bus";
import { getRedisClient } from "../../infra/cache/redis.service";
import { statfs } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

export type HealthStatus = "healthy" | "degraded" | "unhealthy";

export interface HealthCheckResult {
  status: HealthStatus;
  message: string;
  timestamp: string;
  checks: Record<string, ComponentHealth>;
}

export interface ComponentHealth {
  status: HealthStatus;
  message?: string;
  latency?: number;
  details?: Record<string, unknown>;
}

export class HealthCheckService {
  constructor(private readonly eventBus?: RedisEventBus) {}

  /**
   * Perform comprehensive health check
   */
  async checkHealth(): Promise<HealthCheckResult> {
    const checks: Record<string, ComponentHealth> = {};
    const startTime = Date.now();

    // Run all checks in parallel
    const [
      databaseCheck,
      redisCheck,
      diskSpaceCheck,
      memoryCheck,
    ] = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkDiskSpace(),
      this.checkMemory(),
    ]);

    checks.database = this.settleResult(databaseCheck);
    checks.redis = this.settleResult(redisCheck);
    checks.diskSpace = this.settleResult(diskSpaceCheck);
    checks.memory = this.settleResult(memoryCheck);

    // Determine overall status
    // Consider only critical components (database) as unhealthy
    // Redis, disk, and memory are optional/degraded
    const criticalChecks = { database: checks.database };
    const criticalStatuses = Object.values(criticalChecks).map((check) => check.status);
    const overallStatus: HealthStatus =
      criticalStatuses.every((s) => s === "healthy")
        ? "healthy"
        : criticalStatuses.some((s) => s === "unhealthy")
          ? "unhealthy"
          : "degraded";

    return {
      status: overallStatus,
      message: this.getStatusMessage(overallStatus),
      timestamp: new Date().toISOString(),
      checks,
    };
  }

  /**
   * Check database connectivity and performance
   */
  private async checkDatabase(): Promise<ComponentHealth> {
    const startTime = Date.now();

    try {
      const prisma = getPrisma();

      // Simple query to check connectivity
      await prisma.$queryRaw`SELECT 1`;

      // Check connection pool
      const poolInfo = await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT count(*) as count FROM pg_stat_activity WHERE datname = current_database()
      `;

      const activeConnections = Number(poolInfo[0]?.count || 0);

      const latency = Date.now() - startTime;

      // Database is healthy if latency < 3s, degraded if < 5s, unhealthy if >= 5s
      return {
        status: latency < 3000 ? "healthy" : latency < 5000 ? "degraded" : "unhealthy",
        message: `Database is ${latency < 3000 ? "healthy" : latency < 5000 ? "slow" : "very slow"}`,
        latency,
        details: {
          activeConnections,
          latencyMs: latency,
        },
      };
    } catch (error) {
      return {
        status: "unhealthy",
        message: error instanceof Error ? error.message : "Database check failed",
        latency: Date.now() - startTime,
      };
    }
  }

  /**
   * Check Redis connectivity with real ping
   */
  private async checkRedis(): Promise<ComponentHealth> {
    const startTime = Date.now();

    try {
      // Try to get Redis client
      const redis = getRedisClient();

      // Check if Redis is configured
      if (!redis || redis.status === "end") {
        return {
          status: "healthy",
          message: "Redis not configured (optional service)",
          latency: 0,
        };
      }

      // Ensure Redis is connected
      if (redis.status !== "ready" && redis.status !== "connect") {
        if (redis.status === "wait") {
          // Try to connect with timeout
          await Promise.race([
            redis.connect(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Redis connection timeout")), 2000),
            ),
          ]);
        }
      }

      // Perform actual PING command
      const pingResult = await Promise.race([
        redis.ping(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Redis ping timeout")), 2000),
        ),
      ]);

      const latency = Date.now() - startTime;

      // Check if ping was successful
      if (pingResult === "PONG") {
        // Get Redis info for additional details
        let info: Record<string, string> = {};
        try {
          const redisInfo = await redis.info("server");
          // Parse basic info
          const connectedClients = redisInfo.match(/connected_clients:(\d+)/)?.[1];
          const usedMemory = redisInfo.match(/used_memory:(\d+)/)?.[1];
          if (connectedClients) info.connectedClients = connectedClients;
          if (usedMemory) info.usedMemoryMB = `${Math.round(Number(usedMemory) / 1024 / 1024)}`;
        } catch {
          // Ignore info errors
        }

        return {
          status: latency < 500 ? "healthy" : latency < 1000 ? "degraded" : "degraded",
          message: "Redis is connected",
          latency,
          details: {
            ...info,
            status: redis.status,
          },
        };
      }

      return {
        status: "degraded",
        message: "Redis ping failed",
        latency,
      };
    } catch (error) {
      // Redis is optional, so degraded not unhealthy
      return {
        status: "degraded",
        message: error instanceof Error ? error.message : "Redis check failed",
        latency: Date.now() - startTime,
        details: {
          error: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  /**
   * Check disk space using filesystem stats
   */
  private async checkDiskSpace(): Promise<ComponentHealth> {
    try {
      // Determine path to check (use current working directory or root)
      const pathsToCheck = [
        process.cwd(), // Current working directory
        "/", // Root (Unix-like)
        "C:\\", // Root (Windows)
      ];

      let pathToCheck: string | null = null;
      for (const path of pathsToCheck) {
        if (existsSync(path)) {
          pathToCheck = path;
          break;
        }
      }

      if (!pathToCheck) {
        // Fallback: can't determine path, return healthy with warning
        return {
          status: "healthy",
          message: "Disk space check skipped (path not available)",
          details: {
            note: "Unable to determine filesystem path for disk space check",
          },
        };
      }

      // Get filesystem stats
      const stats = await statfs(pathToCheck);

      // Calculate available space
      const totalBytes = Number(stats.blocks) * Number(stats.bsize);
      const availableBytes = Number(stats.bavail) * Number(stats.bsize);
      const usedBytes = totalBytes - availableBytes;
      const usedPercent = (usedBytes / totalBytes) * 100;
      const availablePercent = (availableBytes / totalBytes) * 100;

      // Convert to human-readable format
      const totalGB = totalBytes / 1024 / 1024 / 1024;
      const availableGB = availableBytes / 1024 / 1024 / 1024;
      const usedGB = usedBytes / 1024 / 1024 / 1024;

      // Determine status based on available space
      // Healthy: > 20% available
      // Degraded: 10-20% available
      // Unhealthy: < 10% available
      const status: HealthStatus =
        availablePercent > 20
          ? "healthy"
          : availablePercent > 10
            ? "degraded"
            : "unhealthy";

      return {
        status,
        message:
          availablePercent > 20
            ? `Disk space healthy (${availablePercent.toFixed(1)}% available)`
            : availablePercent > 10
              ? `Disk space low (${availablePercent.toFixed(1)}% available)`
              : `Disk space critical (${availablePercent.toFixed(1)}% available)`,
        details: {
          path: pathToCheck,
          totalGB: totalGB.toFixed(2),
          usedGB: usedGB.toFixed(2),
          availableGB: availableGB.toFixed(2),
          usedPercent: usedPercent.toFixed(1),
          availablePercent: availablePercent.toFixed(1),
        },
      };
    } catch (error) {
      // If statfs is not available (e.g., Windows without proper support), return degraded
      const isWindows = process.platform === "win32";
      if (isWindows) {
        // On Windows, statfs might not be available, return healthy with note
        return {
          status: "healthy",
          message: "Disk space check skipped (Windows platform)",
          details: {
            note: "Disk space check requires additional setup on Windows",
            platform: process.platform,
          },
        };
      }

      return {
        status: "degraded",
        message: error instanceof Error ? error.message : "Disk space check failed",
        details: {
          error: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  /**
   * Check memory usage with configurable thresholds
   */
  private async checkMemory(): Promise<ComponentHealth> {
    try {
      const usage = process.memoryUsage();
      const heapUsedMB = usage.heapUsed / 1024 / 1024;
      const heapTotalMB = usage.heapTotal / 1024 / 1024;
      const heapUsagePercent = (usage.heapUsed / usage.heapTotal) * 100;
      const rssMB = usage.rss / 1024 / 1024;
      const externalMB = usage.external / 1024 / 1024;
      const arrayBuffersMB = usage.arrayBuffers / 1024 / 1024;

      // Configurable thresholds (can be made configurable via env vars)
      const HEALTHY_THRESHOLD = 80; // < 80% = healthy
      const DEGRADED_THRESHOLD = 90; // 80-90% = degraded, >= 90% = unhealthy

      const status: HealthStatus =
        heapUsagePercent < HEALTHY_THRESHOLD
          ? "healthy"
          : heapUsagePercent < DEGRADED_THRESHOLD
            ? "degraded"
            : "unhealthy";

      // Calculate memory pressure (RSS vs heap)
      const memoryPressure = (usage.rss / usage.heapTotal) * 100;

      return {
        status,
        message:
          heapUsagePercent < HEALTHY_THRESHOLD
            ? `Memory healthy (${heapUsagePercent.toFixed(1)}% heap used)`
            : heapUsagePercent < DEGRADED_THRESHOLD
              ? `Memory usage high (${heapUsagePercent.toFixed(1)}% heap used)`
              : `Memory usage critical (${heapUsagePercent.toFixed(1)}% heap used)`,
        details: {
          heapUsedMB: Math.round(heapUsedMB),
          heapTotalMB: Math.round(heapTotalMB),
          heapUsagePercent: Math.round(heapUsagePercent * 10) / 10,
          rssMB: Math.round(rssMB),
          externalMB: Math.round(externalMB),
          arrayBuffersMB: Math.round(arrayBuffersMB),
          memoryPressure: Math.round(memoryPressure * 10) / 10,
          thresholds: {
            healthy: HEALTHY_THRESHOLD,
            degraded: DEGRADED_THRESHOLD,
          },
        },
      };
    } catch (error) {
      return {
        status: "degraded",
        message: error instanceof Error ? error.message : "Memory check failed",
        details: {
          error: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  /**
   * Settle promise result into ComponentHealth
   */
  private settleResult(result: PromiseSettledResult<ComponentHealth>): ComponentHealth {
    if (result.status === "fulfilled") {
      return result.value;
    }

    return {
      status: "unhealthy",
      message: result.reason instanceof Error ? result.reason.message : String(result.reason),
    };
  }

  /**
   * Get status message
   */
  private getStatusMessage(status: HealthStatus): string {
    switch (status) {
      case "healthy":
        return "All systems operational";
      case "degraded":
        return "Some systems are experiencing issues";
      case "unhealthy":
        return "Critical systems are unavailable";
    }
  }
}












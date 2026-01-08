/**
 * Health Check Route
 * Provides comprehensive health status for monitoring systems
 */

import type { FastifyInstance } from "fastify";
import { HealthCheckService } from "../../core/health/health-check.service";
import type { RedisEventBus } from "../../infra/events/redis-event-bus";

type HealthRouteDeps = {
  eventBus?: RedisEventBus | { publish?: (event: unknown) => Promise<void> } | unknown;
};

export async function registerHealthRoute(app: FastifyInstance, deps: HealthRouteDeps = {}) {
  const healthService = new HealthCheckService(deps.eventBus);

  // Comprehensive health check
  app.get("/health", async (request, reply) => {
    const health = await healthService.checkHealth();

    const statusCode = health.status === "healthy" ? 200 : health.status === "degraded" ? 200 : 503;

    reply.status(statusCode).send(health);
  });

  // Lightweight readiness check (for Kubernetes)
  app.get("/health/ready", async (request, reply) => {
    const health = await healthService.checkHealth();
    const isReady = health.status !== "unhealthy";

    reply.status(isReady ? 200 : 503).send({
      ready: isReady,
      status: health.status,
    });
  });

  // Lightweight liveness check (for Kubernetes)
  app.get("/health/live", async (_request, reply) => {
    reply.status(200).send({
      alive: true,
      timestamp: new Date().toISOString(),
    });
  });
}

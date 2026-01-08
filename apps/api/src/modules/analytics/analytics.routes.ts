import type { FastifyInstance } from "fastify";

export async function analyticsRoutes(app: FastifyInstance) {
  // Get dashboard metrics
  app.get("/analytics/metrics", async (request, reply) => {
    const { analyticsService } = await import("./analytics.service");
    const orgId = request.headers["x-org-id"] as string;
    if (!orgId) return reply.status(400).send({ error: "Missing Organization ID" });

    const metricType = request.query as { type?: string };

    try {
      const metrics = await analyticsService.getMetrics(orgId, metricType.type);
      return metrics;
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: "Failed to get metrics" });
    }
  });

  // Get benchmark comparison
  app.get("/analytics/benchmark/:metricType", async (request, reply) => {
    const { analyticsService } = await import("./analytics.service");
    const orgId = request.headers["x-org-id"] as string;
    if (!orgId) return reply.status(400).send({ error: "Missing Organization ID" });

    const { metricType } = request.params as { metricType: string };

    try {
      const comparison = await analyticsService.getBenchmarkComparison(orgId, metricType);
      return comparison;
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: "Failed to get benchmark" });
    }
  });

  // Log usage event
  app.post("/analytics/log", async (request, reply) => {
    const { analyticsService } = await import("./analytics.service");
    const orgId = request.headers["x-org-id"] as string;
    const userId = request.headers["x-user-id"] as string | null;

    if (!orgId) return reply.status(400).send({ error: "Missing Organization ID" });

    const body = request.body as { action: string; resource: string; metadata?: any };

    try {
      await analyticsService.logUsage(orgId, userId, body.action, body.resource, body.metadata);
      return { success: true };
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: "Failed to log usage" });
    }
  });

  // Calculate metrics (admin endpoint)
  app.post("/analytics/calculate", async (request, reply) => {
    const { analyticsService } = await import("./analytics.service");
    const orgId = request.headers["x-org-id"] as string;
    if (!orgId) return reply.status(400).send({ error: "Missing Organization ID" });

    const body = request.body as { period: "daily" | "weekly" | "monthly"; periodDate: string };

    try {
      await analyticsService.calculateMetrics(orgId, body.period, new Date(body.periodDate));
      return { success: true };
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: "Failed to calculate metrics" });
    }
  });

  // ============================================================================
  // BUSINESS ANALYTICS ROUTES
  // ============================================================================

  // Get dashboard KPIs
  app.get("/analytics/dashboard/kpis", async (request, reply) => {
    const { analyticsService } = await import("./analytics.service");
    const orgId = request.headers["x-org-id"] as string;
    if (!orgId) return reply.status(400).send({ error: "Missing Organization ID" });

    try {
      const kpis = await analyticsService.getDashboardKPIs(orgId);
      return kpis;
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: "Failed to get dashboard KPIs" });
    }
  });

  // Get sales chart data
  app.get("/analytics/sales", async (request, reply) => {
    const { analyticsService } = await import("./analytics.service");
    const orgId = request.headers["x-org-id"] as string;
    if (!orgId) return reply.status(400).send({ error: "Missing Organization ID" });

    const { period } = request.query as { period?: "7d" | "30d" | "90d" | "12m" };

    try {
      const sales = await analyticsService.getSalesChart(orgId, period || "30d");
      return sales;
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: "Failed to get sales data" });
    }
  });

  // Get top products
  app.get("/analytics/top-products", async (request, reply) => {
    const { analyticsService } = await import("./analytics.service");
    const orgId = request.headers["x-org-id"] as string;
    if (!orgId) return reply.status(400).send({ error: "Missing Organization ID" });

    const { limit } = request.query as { limit?: string };

    try {
      const products = await analyticsService.getTopProducts(orgId, limit ? parseInt(limit) : 5);
      return products;
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: "Failed to get top products" });
    }
  });

  // Get recent activity
  app.get("/analytics/activity", async (request, reply) => {
    const { analyticsService } = await import("./analytics.service");
    const orgId = request.headers["x-org-id"] as string;
    if (!orgId) return reply.status(400).send({ error: "Missing Organization ID" });

    const { limit } = request.query as { limit?: string };

    try {
      const activity = await analyticsService.getRecentActivity(
        orgId,
        limit ? parseInt(limit) : 10,
      );
      return activity;
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: "Failed to get recent activity" });
    }
  });

  // Get supplier performance
  app.get("/analytics/suppliers/performance", async (request, reply) => {
    const { analyticsService } = await import("./analytics.service");
    const orgId = request.headers["x-org-id"] as string;
    if (!orgId) return reply.status(400).send({ error: "Missing Organization ID" });

    try {
      const suppliers = await analyticsService.getSupplierPerformance(orgId);
      return suppliers;
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: "Failed to get supplier performance" });
    }
  });

  // Get inventory insights
  app.get("/analytics/inventory/insights", async (request, reply) => {
    const { analyticsService } = await import("./analytics.service");
    const orgId = request.headers["x-org-id"] as string;
    if (!orgId) return reply.status(400).send({ error: "Missing Organization ID" });

    try {
      const inventory = await analyticsService.getInventoryInsights(orgId);
      return inventory;
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: "Failed to get inventory insights" });
    }
  });

  // Get customer segments
  app.get("/analytics/customers/segments", async (request, reply) => {
    const { analyticsService } = await import("./analytics.service");
    const orgId = request.headers["x-org-id"] as string;
    if (!orgId) return reply.status(400).send({ error: "Missing Organization ID" });

    try {
      const segments = await analyticsService.getCustomerSegments(orgId);
      return segments;
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: "Failed to get customer segments" });
    }
  });
}

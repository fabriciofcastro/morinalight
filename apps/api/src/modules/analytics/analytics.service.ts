import { getPrisma } from "../../infra/database/prisma.service";

const prisma = getPrisma();


export class AnalyticsService {
  /**
   * Record a usage event
   */
  async logUsage(
    orgId: string,
    userId: string | null,
    action: string,
    resource: string,
    metadata?: any,
  ) {
    return prisma.usageLog.create({
      data: {
        orgId,
        userId,
        action,
        resource,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  }

  /**
   * Calculate and store system metrics
   */
  async calculateMetrics(orgId: string, period: "daily" | "weekly" | "monthly", periodDate: Date) {
    const startDate = new Date(periodDate);
    const endDate = new Date(periodDate);

    // Adjust date range based on period
    if (period === "daily") {
      endDate.setDate(endDate.getDate() + 1);
    } else if (period === "weekly") {
      endDate.setDate(endDate.getDate() + 7);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Active users
    const activeUsers = await prisma.usageLog.groupBy({
      by: ["userId"],
      where: {
        orgId,
        createdAt: { gte: startDate, lt: endDate },
        userId: { not: null },
      },
    });

    await prisma.systemMetric.create({
      data: {
        orgId,
        metricType: "active_users",
        metricKey: "total",
        value: activeUsers.length,
        period,
        periodDate: startDate,
      },
    });

    // Feature usage
    const featureUsage = await prisma.usageLog.groupBy({
      by: ["resource"],
      where: {
        orgId,
        action: "feature_used",
        createdAt: { gte: startDate, lt: endDate },
      },
      _count: true,
    });

    for (const usage of featureUsage) {
      await prisma.systemMetric.create({
        data: {
          orgId,
          metricType: "feature_usage",
          metricKey: usage.resource,
          value: usage._count,
          period,
          periodDate: startDate,
        },
      });
    }

    // Approval time (if governance is being used)
    const approvals = await prisma.approvalRequest.findMany({
      where: {
        orgId,
        status: "APPROVED",
        createdAt: { gte: startDate, lt: endDate },
      },
    });

    if (approvals.length > 0) {
      const avgTime =
        approvals.reduce((sum, req) => {
          const time = req.updatedAt.getTime() - req.createdAt.getTime();
          return sum + time;
        }, 0) / approvals.length;

      await prisma.systemMetric.create({
        data: {
          orgId,
          metricType: "approval_time",
          metricKey: "average_ms",
          value: avgTime,
          period,
          periodDate: startDate,
        },
      });
    }
  }

  /**
   * Get metrics for dashboard
   */
  async getMetrics(orgId: string, metricType?: string, limit = 30) {
    return prisma.systemMetric.findMany({
      where: {
        orgId,
        ...(metricType && { metricType }),
      },
      orderBy: { periodDate: "desc" },
      take: limit,
    });
  }

  /**
   * Get benchmark comparison
   */
  async getBenchmarkComparison(orgId: string, metricType: string) {
    // Get company info
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      include: { settings: true },
    });

    if (!org) return null;

    const companySize = org.settings?.companySize || "all";
    const industry = "all"; // Could be extracted from settings if available

    // Get latest company metric
    const companyMetric = await prisma.systemMetric.findFirst({
      where: { orgId, metricType },
      orderBy: { periodDate: "desc" },
    });

    if (!companyMetric) return null;

    // Get benchmark data
    const benchmarks = await prisma.benchmarkMetric.findMany({
      where: {
        metricType,
        OR: [
          { industry, companySize },
          { industry: "all", companySize },
          { industry, companySize: "all" },
          { industry: "all", companySize: "all" },
        ],
      },
      orderBy: { percentile: "asc" },
    });

    return {
      companyValue: companyMetric.value,
      benchmarks: benchmarks.map((b) => ({
        percentile: b.percentile,
        value: b.value,
      })),
      percentileRank: this.calculatePercentile(companyMetric.value, benchmarks),
    };
  }

  private calculatePercentile(value: number, benchmarks: any[]): number {
    if (benchmarks.length === 0) return 50;

    for (let i = 0; i < benchmarks.length; i++) {
      if (value < benchmarks[i].value) {
        return i === 0 ? benchmarks[i].percentile / 2 : benchmarks[i - 1].percentile;
      }
    }

    return benchmarks[benchmarks.length - 1].percentile;
  }

  // ============================================================================
  // BUSINESS ANALYTICS METHODS
  // ============================================================================

  /**
   * Get dashboard KPIs
   */
  async getDashboardKPIs(orgId: string) {
    // Get latest sales data for revenue
    const latestSales = await prisma.salesMetric.findMany({
      where: { orgId, period: "monthly" },
      orderBy: { date: "desc" },
      take: 2,
    });

    const currentMonth = latestSales[0];
    const previousMonth = latestSales[1];

    // Calculate revenue growth
    const totalRevenue = currentMonth?.revenue || 0;
    const revenueGrowth = previousMonth
      ? ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100
      : 0;

    // Get total orders
    const totalOrders = currentMonth?.orders || 0;
    const ordersGrowth = previousMonth
      ? ((currentMonth.orders - previousMonth.orders) / previousMonth.orders) * 100
      : 0;

    // Get customer metrics
    const customerMetrics = await prisma.customerMetric.findMany({
      where: { orgId },
    });
    const activeCustomers = customerMetrics.reduce((sum, m) => sum + m.count, 0);

    // Get inventory alerts
    const inventoryMetrics = await prisma.inventoryMetric.findMany({
      where: { orgId },
    });
    const lowStockItems = inventoryMetrics.reduce((sum, m) => sum + m.lowStockItems, 0);

    return {
      totalRevenue,
      revenueGrowth,
      totalOrders,
      ordersGrowth,
      activeCustomers,
      customersGrowth: 5.2, // Could be calculated from historical data
      lowStockItems,
      stockAlertGrowth: -15.3, // Could be calculated from historical data
    };
  }

  /**
   * Get sales chart data
   */
  async getSalesChart(orgId: string, period: "7d" | "30d" | "90d" | "12m") {
    const periodMap = {
      "7d": "daily",
      "30d": "daily",
      "90d": "weekly",
      "12m": "monthly",
    };

    const daysMap = {
      "7d": 7,
      "30d": 30,
      "90d": 90,
      "12m": 365,
    };

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysMap[period]);

    const sales = await prisma.salesMetric.findMany({
      where: {
        orgId,
        period: periodMap[period],
        date: { gte: startDate },
      },
      orderBy: { date: "asc" },
    });

    return sales.map((s) => ({
      month:
        period === "12m"
          ? s.date.toLocaleDateString("pt-BR", { month: "short" })
          : s.date.toLocaleDateString("pt-BR", { day: "numeric", month: "short" }),
      revenue: s.revenue,
      orders: s.orders,
      target: s.target,
      online: s.onlineRevenue,
      retail: s.retailRevenue,
      b2b: s.b2bRevenue,
      profit: s.profit,
    }));
  }

  /**
   * Get top products
   */
  async getTopProducts(orgId: string, limit: number = 5) {
    const products = await prisma.productMetric.findMany({
      where: { orgId, period: "30d" },
      orderBy: { revenue: "desc" },
      take: limit,
    });

    return products.map((p) => ({
      id: p.productId || p.id,
      name: p.name,
      category: p.category,
      unitsSold: p.unitsSold,
      revenue: p.revenue,
    }));
  }

  /**
   * Get recent activity
   */
  async getRecentActivity(orgId: string, limit: number = 10) {
    const activities = await prisma.activityLog.findMany({
      where: { orgId },
      orderBy: { timestamp: "desc" },
      take: limit,
    });

    return activities.map((a) => ({
      id: a.id,
      type: a.type as "order" | "stock" | "customer" | "notification",
      title: a.title,
      description: a.description,
      timestamp: a.timestamp.toISOString(),
      metadata: a.metadata,
    }));
  }

  /**
   * Get supplier performance
   */
  async getSupplierPerformance(orgId: string) {
    const suppliers = await prisma.supplierMetric.findMany({
      where: { orgId },
      orderBy: { lastUpdated: "desc" },
    });

    return suppliers.map((s) => ({
      id: s.supplierId || s.id,
      name: s.name,
      onTimeDelivery: s.onTimeDelivery,
      quality: s.quality,
      totalOrders: s.totalOrders,
    }));
  }

  /**
   * Get inventory insights
   */
  async getInventoryInsights(orgId: string) {
    const inventory = await prisma.inventoryMetric.findMany({
      where: { orgId },
      orderBy: { lastUpdated: "desc" },
    });

    return inventory.map((i) => ({
      category: i.category,
      totalValue: i.totalValue,
      itemCount: i.itemCount,
      turnoverRate: i.turnoverRate,
      lowStockItems: i.lowStockItems,
    }));
  }

  /**
   * Get customer segments
   */
  async getCustomerSegments(orgId: string) {
    const segments = await prisma.customerMetric.findMany({
      where: { orgId },
      orderBy: { lastUpdated: "desc" },
    });

    return segments.map((s) => ({
      segment: s.segment,
      count: s.count,
      totalRevenue: s.totalRevenue,
      avgOrderValue: s.avgOrderValue,
      color: s.color,
    }));
  }
}

export const analyticsService = new AnalyticsService();

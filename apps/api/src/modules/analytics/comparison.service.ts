import { getPrisma } from "../../infra/database/prisma.service";

const prisma = getPrisma();


export interface PeriodComparison {
  current: {
    period: string;
    value: number;
  };
  previous: {
    period: string;
    value: number;
  };
  change: {
    absolute: number;
    percentage: number;
  };
  trend: "up" | "down" | "stable";
}

export interface SalesComparison {
  revenue: PeriodComparison;
  orders: PeriodComparison;
  avgOrderValue: PeriodComparison;
}

/**
 * Compare sales between two periods
 */
export async function compareSalesPeriods(
  orgId: string,
  currentStart: Date,
  currentEnd: Date,
  previousStart: Date,
  previousEnd: Date,
): Promise<SalesComparison> {
  // Get current period data
  const currentSales = await prisma.salesMetric.findMany({
    where: {
      orgId,
      date: {
        gte: currentStart,
        lte: currentEnd,
      },
    },
  });

  // Get previous period data
  const previousSales = await prisma.salesMetric.findMany({
    where: {
      orgId,
      date: {
        gte: previousStart,
        lte: previousEnd,
      },
    },
  });

  // Calculate totals
  const currentRevenue = currentSales.reduce((sum, s) => sum + s.revenue, 0);
  const previousRevenue = previousSales.reduce((sum, s) => sum + s.revenue, 0);

  const currentOrders = currentSales.reduce((sum, s) => sum + s.orders, 0);
  const previousOrders = previousSales.reduce((sum, s) => sum + s.orders, 0);

  const currentAvgOrderValue = currentOrders > 0 ? currentRevenue / currentOrders : 0;
  const previousAvgOrderValue = previousOrders > 0 ? previousRevenue / previousOrders : 0;

  // Helper to create comparison
  const createComparison = (
    current: number,
    previous: number,
    currentLabel: string,
    previousLabel: string,
  ): PeriodComparison => {
    const change = current - previous;
    const percentage = previous > 0 ? (change / previous) * 100 : 0;

    let trend: "up" | "down" | "stable" = "stable";
    if (Math.abs(percentage) > 1) {
      trend = change > 0 ? "up" : "down";
    }

    return {
      current: { period: currentLabel, value: current },
      previous: { period: previousLabel, value: previous },
      change: { absolute: change, percentage },
      trend,
    };
  };

  return {
    revenue: createComparison(
      currentRevenue,
      previousRevenue,
      formatPeriod(currentStart, currentEnd),
      formatPeriod(previousStart, previousEnd),
    ),
    orders: createComparison(
      currentOrders,
      previousOrders,
      formatPeriod(currentStart, currentEnd),
      formatPeriod(previousStart, previousEnd),
    ),
    avgOrderValue: createComparison(
      currentAvgOrderValue,
      previousAvgOrderValue,
      formatPeriod(currentStart, currentEnd),
      formatPeriod(previousStart, previousEnd),
    ),
  };
}

/**
 * Compare current month with previous month
 */
export async function compareMonths(orgId: string): Promise<SalesComparison> {
  const now = new Date();

  // Current month
  const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Previous month
  const previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  return compareSalesPeriods(orgId, currentStart, currentEnd, previousStart, previousEnd);
}

/**
 * Compare current week with previous week
 */
export async function compareWeeks(orgId: string): Promise<SalesComparison> {
  const now = new Date();
  const dayOfWeek = now.getDay();

  // Current week (Sunday to Saturday)
  const currentStart = new Date(now);
  currentStart.setDate(now.getDate() - dayOfWeek);
  currentStart.setHours(0, 0, 0, 0);

  const currentEnd = new Date(currentStart);
  currentEnd.setDate(currentStart.getDate() + 6);
  currentEnd.setHours(23, 59, 59, 999);

  // Previous week
  const previousStart = new Date(currentStart);
  previousStart.setDate(currentStart.getDate() - 7);

  const previousEnd = new Date(currentEnd);
  previousEnd.setDate(currentEnd.getDate() - 7);

  return compareSalesPeriods(orgId, currentStart, currentEnd, previousStart, previousEnd);
}

/**
 * Compare current year with previous year
 */
export async function compareYears(orgId: string): Promise<SalesComparison> {
  const now = new Date();

  // Current year
  const currentStart = new Date(now.getFullYear(), 0, 1);
  const currentEnd = new Date(now.getFullYear(), 11, 31);

  // Previous year
  const previousStart = new Date(now.getFullYear() - 1, 0, 1);
  const previousEnd = new Date(now.getFullYear() - 1, 11, 31);

  return compareSalesPeriods(orgId, currentStart, currentEnd, previousStart, previousEnd);
}

/**
 * Format period for display
 */
function formatPeriod(start: Date, end: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: start.getFullYear() !== end.getFullYear() ? "numeric" : undefined,
  };

  const startStr = start.toLocaleDateString("pt-BR", options);
  const endStr = end.toLocaleDateString("pt-BR", options);

  return `${startStr} - ${endStr}`;
}

/**
 * Get growth indicators for dashboard
 */
export async function getGrowthIndicators(orgId: string) {
  const monthComparison = await compareMonths(orgId);
  const weekComparison = await compareWeeks(orgId);

  return {
    monthly: {
      revenue: monthComparison.revenue.change.percentage,
      orders: monthComparison.orders.change.percentage,
      avgOrderValue: monthComparison.avgOrderValue.change.percentage,
    },
    weekly: {
      revenue: weekComparison.revenue.change.percentage,
      orders: weekComparison.orders.change.percentage,
      avgOrderValue: weekComparison.avgOrderValue.change.percentage,
    },
  };
}

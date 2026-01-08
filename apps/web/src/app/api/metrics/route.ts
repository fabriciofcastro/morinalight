import { MetricsAggregator } from '@/shared/kernel/utils/metrics-aggregator';
import { NextResponse } from 'next/server';

/**
 * GET /api/metrics
 * 
 * Returns performance metrics for all use cases
 */
export async function GET() {
  try {
    const aggregator = MetricsAggregator.getInstance();
    const stats = aggregator.getAllStats();
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      metrics: stats
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

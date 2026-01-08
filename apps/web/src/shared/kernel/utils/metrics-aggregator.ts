/**
 * Metrics Aggregator
 * 
 * Collects and aggregates performance metrics from use cases
 */
export class MetricsAggregator {
  private static instance: MetricsAggregator;
  private metrics: Map<string, number[]> = new Map();

  private constructor() {}

  static getInstance(): MetricsAggregator {
    if (!MetricsAggregator.instance) {
      MetricsAggregator.instance = new MetricsAggregator();
    }
    return MetricsAggregator.instance;
  }

  /**
   * Record a metric
   */
  record(useCaseName: string, duration: number): void {
    if (!this.metrics.has(useCaseName)) {
      this.metrics.set(useCaseName, []);
    }
    this.metrics.get(useCaseName)!.push(duration);
    
    // Keep only last 1000 measurements to prevent memory leak
    const measurements = this.metrics.get(useCaseName)!;
    if (measurements.length > 1000) {
      measurements.shift();
    }
  }

  /**
   * Get statistics for a use case
   */
  getStats(useCaseName: string) {
    const durations = this.metrics.get(useCaseName) || [];
    
    if (durations.length === 0) {
      return null;
    }

    const sorted = [...durations].sort((a, b) => a - b);
    const sum = durations.reduce((a, b) => a + b, 0);

    return {
      count: durations.length,
      avg: sum / durations.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
      p50: this.percentile(sorted, 50),
      p95: this.percentile(sorted, 95),
      p99: this.percentile(sorted, 99)
    };
  }

  /**
   * Get all metrics
   */
  getAllStats() {
    const result: Record<string, any> = {};
    
    for (const [name, _] of this.metrics) {
      const stats = this.getStats(name);
      if (stats) {
        result[name] = stats;
      }
    }
    
    return result;
  }

  /**
   * Calculate percentile
   */
  private percentile(sorted: number[], p: number): number {
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }
}

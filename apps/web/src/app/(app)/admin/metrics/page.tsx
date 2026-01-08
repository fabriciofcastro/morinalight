'use client';

import { Card } from '@morina/ui';
import { useQuery } from '@tanstack/react-query';

interface MetricStats {
  count: number;
  avg: number;
  min: number;
  max: number;
  p50: number;
  p95: number;
  p99: number;
}

interface MetricsResponse {
  timestamp: string;
  metrics: Record<string, MetricStats>;
}

export default function MetricsPage() {
  const { data, isLoading } = useQuery<MetricsResponse>({
    queryKey: ['metrics'],
    queryFn: () => fetch('/api/metrics').then(r => r.json()),
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  if (isLoading) {
    return <div className="p-8">Loading metrics...</div>;
  }

  if (!data || Object.keys(data.metrics).length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Performance Metrics</h1>
        <p className="text-muted-foreground">No metrics available yet. Metrics will appear after use cases are executed.</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Performance Metrics</h1>
        <p className="text-muted-foreground mt-2">
          Real-time performance monitoring for use cases
        </p>
        <p className="text-sm text-muted-foreground">
          Last updated: {new Date(data.timestamp).toLocaleString()}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(data.metrics).map(([name, stats]) => (
          <Card key={name} className="p-6">
            <h3 className="font-semibold text-lg mb-4">{name}</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Executions:</span>
                <span className="font-mono">{stats.count}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Average:</span>
                <span className="font-mono">{stats.avg.toFixed(2)}ms</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Min:</span>
                <span className="font-mono text-green-600">{stats.min.toFixed(2)}ms</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max:</span>
                <span className="font-mono text-red-600">{stats.max.toFixed(2)}ms</span>
              </div>
              
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">P50:</span>
                  <span className="font-mono">{stats.p50.toFixed(2)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">P95:</span>
                  <span className="font-mono">{stats.p95.toFixed(2)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">P99:</span>
                  <span className="font-mono">{stats.p99.toFixed(2)}ms</span>
                </div>
              </div>
            </div>
            
            {stats.avg > 1000 && (
              <div className="mt-4 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-600">
                ⚠️ Slow performance detected
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

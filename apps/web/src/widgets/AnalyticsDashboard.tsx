'use client';

import { exportToExcel } from '@/shared/kernel/utils/excel-export';
import { SafeSuspense } from '@/shared/ui/SafeSuspense';
import { Button } from '@/shared/ui/base/button';
import { Card } from '@/shared/ui/base/card';
import { Download, TrendingUp } from 'lucide-react';
import dynamic from 'next/dynamic';

// Lazy load the charts component
const LazyCharts = dynamic(() => import('./AnalyticsCharts'), {
  loading: () => <div className="h-[400px] flex items-center justify-center bg-muted/20 animate-pulse rounded-lg">Carregando Gráficos...</div>,
  ssr: false // Recharts doesn't support SSR well
});

export function AnalyticsDashboard() {
  const handleExport = async () => {
    const data = [
      { Data: '2024-01-01', Vendas: 100, Clientes: 10 },
      { Data: '2024-01-02', Vendas: 150, Clientes: 12 },
    ];
    await exportToExcel(data, 'relatorio-vendas');
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Performance de Vendas
          </h2>
          <p className="text-sm text-muted-foreground">Insights em tempo real da sua operação.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
          <Download className="w-4 h-4" />
          Exportar Planilha
        </Button>
      </div>

      <SafeSuspense>
        <LazyCharts />
      </SafeSuspense>
    </Card>
  );
}

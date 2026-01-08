'use client';

import { ReportingWidget } from '@/shared/ui/ReportingWidget';
import { StatusBadge } from '@/shared/ui/base/StatusBadge';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React from 'react';

interface Order {
  id: string;
  customerName: string;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

const mockData: Order[] = [
  { id: '1', customerName: 'João Silva', total: 1500.50, status: 'completed', createdAt: '2024-01-07T10:00:00Z' },
  { id: '2', customerName: 'Maria Oliveira', total: 2300.00, status: 'pending', createdAt: '2024-01-07T11:30:00Z' },
  { id: '3', customerName: 'Pedro Santos', total: 850.75, status: 'cancelled', createdAt: '2024-01-06T15:45:00Z' },
  { id: '4', customerName: 'Ana Souza', total: 4200.00, status: 'completed', createdAt: '2024-01-05T09:20:00Z' },
];

export function OrdersReport() {
  const columns = React.useMemo<ColumnDef<Order>[]>(() => [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: (info) => <span className="font-mono text-xs">#{info.getValue() as string}</span>,
    },
    {
      accessorKey: 'customerName',
      header: 'Cliente',
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: (info) => {
        const amount = info.getValue() as number;
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (info) => {
        const status = info.getValue() as Order['status'];
        const statusMap = {
          pending: 'incomplete',
          completed: 'complete',
          cancelled: 'error',
        } as const;
        return <StatusBadge status={statusMap[status]} label={status.toUpperCase()} />;
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Data',
      cell: (info) => {
        const date = new Date(info.getValue() as string);
        return format(date, "dd 'de' MMMM, HH:mm", { locale: ptBR });
      },
    },
  ], []);

  const handleExport = () => {
    alert('Funcionalidade de exportação iniciada (Excel/PDF)...');
  };

  return (
    <ReportingWidget
      title="Relatório de Pedidos"
      description="Listagem detalhada de todos os pedidos recentes no sistema."
      data={mockData}
      columns={columns}
      onExport={handleExport}
    />
  );
}

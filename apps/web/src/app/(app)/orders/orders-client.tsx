"use client";

import { EmptyState, ErrorState, LoadingState } from "@/shared/ui/base";
import { useCancelOrder } from "@/presentation/hooks/use-cancel-order";
import { useOrders } from "@/presentation/hooks/use-orders";
import { Badge, Button, GlassCard, Input, Popover, PopoverContent, PopoverTrigger } from "@morina/ui";
import {
    Calendar,
    Download,
    Filter,
    MoreVertical,
    Plus,
    Search,
    ShoppingCart
} from "lucide-react";
import { useState } from "react";
import { CreateOrderDialog } from "./create-order-dialog";

export function OrdersClient() {
  const { data: orders = [], isLoading, error } = useOrders();
  const [search, setSearch] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const cancelOrder = useCancelOrder();

  const filteredOrders = orders.filter((order) => {
    const searchLower = search.toLowerCase();
    return (
      order.orderNumber.toLowerCase().includes(searchLower) ||
      order.customerName.toLowerCase().includes(searchLower) || 
      order.customerEmail.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) return <LoadingState message="Carregando pedidos..." />;
  if (error) return <ErrorState title="Erro ao carregar pedidos" message={error.message} />;

  // Status badge helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge variant="success">Concluído</Badge>;
      case 'processing': return <Badge variant="warning">Em Processamento</Badge>;
      case 'cancelled': return <Badge variant="danger">Cancelado</Badge>;
      case 'pending': return <Badge variant="default">Pendente</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex h-full w-full flex-col gap-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por número, cliente ou email..."
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
            <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filtros
            </Button>
            <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar
            </Button>
            <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Pedido
            </Button>
        </div>
      </div>

      {/* Content */}
      {orders.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Nenhum pedido encontrado"
          description="Comece criando seu primeiro pedido de venda."
          action={{
            label: "Novo Pedido",
            onClick: () => setShowCreateDialog(true),
          }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredOrders.map((order) => (
             <GlassCard key={order.id} className="p-4 flex flex-col gap-3 group hover:border-[hsl(var(--primary)/0.5)] transition-colors">
                <div className="flex justify-between items-start">
                    <div>
                        <span className="text-xs text-white/60 font-mono">#{order.orderNumber}</span>
                        <h3 className="font-bold text-white truncate">{order.customerName}</h3>
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                             <button className="text-white/40 hover:text-white transition-colors">
                                <MoreVertical className="h-4 w-4" />
                             </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-32 p-1" align="end">
                            <button 
                                className="w-full text-left px-2 py-1.5 text-sm text-red-400 hover:bg-white/5 rounded"
                                onClick={() => {
                                    if(confirm('Tem certeza que deseja cancelar este pedido?')) {
                                        cancelOrder.mutate({ orderId: order.id, reason: "Cancelado via interface administrativa" });
                                    }
                                }}
                            >
                                Cancelar
                            </button>
                        </PopoverContent>
                    </Popover>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-white/70">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="mt-auto pt-3 border-t border-white/10 flex justify-between items-center">
                    {getStatusBadge(order.status)}
                    <span className="font-bold text-[hsl(var(--primary))]">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)}
                    </span>
                </div>
             </GlassCard>
          ))}
        </div>
      )}

      {showCreateDialog && (
        <CreateOrderDialog 
            open={showCreateDialog} 
            onOpenChange={setShowCreateDialog} 
        />
      )}
    </div>
  );
}

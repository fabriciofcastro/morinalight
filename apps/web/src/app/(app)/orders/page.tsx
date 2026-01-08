import { OrdersClient } from "./orders-client";

export default function OrdersPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Vendas
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Gerencie seus pedidos de venda e acompanhe o status da produção.
          </p>
        </div>
      </div>

      <OrdersClient />
    </div>
  );
}

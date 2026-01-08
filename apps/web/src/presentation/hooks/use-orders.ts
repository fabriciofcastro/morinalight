'use client';

import { useInjection } from '@/app/providers';
import type { OrderDTO } from '@/application/dto';
import { ListOrdersQuery } from '@/application/queries';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook para listar pedidos
 * 
 * Consome ListOrdersQuery via DI.
 */

export function useOrders() {
  const listOrdersQuery = useInjection<ListOrdersQuery>('ListOrdersQuery');

  return useQuery<OrderDTO[], Error>({
    queryKey: ['orders'],
    queryFn: async () => {
      return await listOrdersQuery.execute();
    },
  });
}

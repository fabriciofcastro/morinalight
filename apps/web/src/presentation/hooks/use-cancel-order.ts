'use client';

import { useInjection } from '@/app/providers';
import type { CancelOrderDTO } from '@/application/dto';
import { CancelOrderUseCase } from '@/application/use-cases';
import { isOk } from '@/shared/kernel/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Hook to cancel an order
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();
  const cancelOrderUseCase = useInjection<CancelOrderUseCase>('CancelOrderUseCase');

  return useMutation<void, Error, CancelOrderDTO>({
    mutationFn: async (dto: CancelOrderDTO) => {
      const result = await cancelOrderUseCase.execute(dto);

      if (!isOk(result)) {
        throw result.error;
      }

      return result.value;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
    },
  });
}

import { useInjection } from '@/app/providers';
import type { CreateOrderDTO } from '@/application/dto';
import type { CreateOrderUseCase } from '@/application/use-cases/create-order.use-case';
import { isOk } from '@/shared/kernel/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * useCreateOrder
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();
  const createOrderUseCase = useInjection<CreateOrderUseCase>('CreateOrderUseCase');

  return useMutation({
    mutationFn: async (dto: CreateOrderDTO) => {
      const result = await createOrderUseCase.execute(dto);
      
      if (!isOk(result)) {
        throw result.error;
      }
      
      return result.value;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

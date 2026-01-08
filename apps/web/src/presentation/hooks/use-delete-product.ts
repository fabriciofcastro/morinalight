'use client';

import { useInjection } from '@/app/providers';
import { DeleteProductUseCase } from '@/application/use-cases';
import { isOk } from '@/shared/kernel/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * useDeleteProduct Hook
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const deleteProductUseCase = useInjection<DeleteProductUseCase>('DeleteProductUseCase');

  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      const result = await deleteProductUseCase.execute(id);

      if (!isOk(result)) {
        throw result.error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

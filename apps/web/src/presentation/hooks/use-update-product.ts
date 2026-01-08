'use client';

import { useInjection } from '@/app/providers';
import type { ProductResponseDTO, UpdateProductDTO } from '@/application/dto';
import { UpdateProductUseCase } from '@/application/use-cases';
import { isOk } from '@/shared/kernel/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Hook to update existing products
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const updateProductUseCase = useInjection<UpdateProductUseCase>('UpdateProductUseCase');

  return useMutation<ProductResponseDTO, Error, UpdateProductDTO>({
    mutationFn: async (dto: UpdateProductDTO) => {
      const result = await updateProductUseCase.execute(dto);

      if (!isOk(result)) {
        throw result.error;
      }

      return result.value;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', data.id] });
    },
  });
}

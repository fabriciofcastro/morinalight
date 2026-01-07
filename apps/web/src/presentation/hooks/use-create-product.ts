import { useInjection } from '@/app/providers';
import type { CreateProductDTO } from '@/application/dto';
import type { CreateProductUseCase } from '@/application/use-cases';
import { isOk } from '@/shared/kernel/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * useCreateProduct
 * 
 * Hook para criar produto usando Clean Architecture.
 * Consome CreateProductUseCase via Dependency Injection.
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();
  const createProductUseCase = useInjection<CreateProductUseCase>('CreateProductUseCase');

  return useMutation({
    mutationFn: async (dto: CreateProductDTO) => {
      const result = await createProductUseCase.execute(dto);
      
      if (!isOk(result)) {
        throw result.error;
      }
      
      return result.value;
    },
    onSuccess: () => {
      // Invalidar cache de produtos
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

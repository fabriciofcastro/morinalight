'use client';

import { useInjection } from '@/app/providers';
import type { CreateUserDTO, UserResponseDTO } from '@/application/dto';
import { CreateUserUseCase } from '@/application/use-cases';
import { isOk } from '@/shared/kernel/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Hook para criar usuário
 * 
 * Consome CreateUserUseCase via DI.
 * Apresentação não conhece detalhes de implementação.
 */

export function useCreateUser() {
  const queryClient = useQueryClient();
  const createUserUseCase = useInjection<CreateUserUseCase>('CreateUserUseCase');

  return useMutation<UserResponseDTO, Error, CreateUserDTO>({
    mutationFn: async (dto: CreateUserDTO) => {
      const result = await createUserUseCase.execute(dto);

      if (!isOk(result)) {
        throw result.error;
      }

      return result.value;
    },
    onSuccess: () => {
      // Invalidar cache de lista de usuários
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

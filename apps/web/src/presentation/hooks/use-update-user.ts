'use client';

import { useInjection } from '@/app/providers';
import { UpdateUserDTO } from '@/application/dto';
import { UpdateUserUseCase } from '@/application/use-cases';
import { isOk } from '@/shared/kernel/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const updateUserUseCase = useInjection<UpdateUserUseCase>('UpdateUserUseCase');

  return useMutation<void, Error, UpdateUserDTO>({
    mutationFn: async (dto: UpdateUserDTO) => {
      const result = await updateUserUseCase.execute(dto);

      if (!isOk(result)) {
        throw result.error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

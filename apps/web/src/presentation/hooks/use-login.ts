'use client';

import { useInjection } from '@/app/providers';
import type { LoginDTO } from '@/application/dto';
import { AuthUser } from '@/application/ports/auth-service.port';
import { LoginUseCase } from '@/application/use-cases';
import { isOk } from '@/shared/kernel/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

/**
 * useLogin Hook
 */
export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const loginUseCase = useInjection<LoginUseCase>('LoginUseCase');

  return useMutation<AuthUser, Error, LoginDTO>({
    mutationFn: async (dto: LoginDTO) => {
      const result = await loginUseCase.execute(dto);

      if (!isOk(result)) {
        throw result.error;
      }

      return result.value;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
    },
  });
}

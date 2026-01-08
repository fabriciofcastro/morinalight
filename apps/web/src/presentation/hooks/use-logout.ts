'use client';

import { useInjection } from '@/app/providers';
import { LogoutUseCase } from '@/application/use-cases';
import { isOk } from '@/shared/kernel/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

/**
 * useLogout Hook
 */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logoutUseCase = useInjection<LogoutUseCase>('LogoutUseCase');

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      const result = await logoutUseCase.execute();

      if (!isOk(result)) {
        throw result.error;
      }
    },
    onSuccess: () => {
      queryClient.clear(); // Clear all cache
      router.push('/login');
    },
  });
}

'use client';

import { useInjection } from '@/app/providers';
import type { UserResponseDTO } from '@/application/dto';
import { GetUserByIdQuery } from '@/application/queries';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook para buscar usuário por ID
 * 
 * Consome GetUserByIdQuery via DI.
 */

export function useUser(userId: string) {
  const getUserQuery = useInjection<GetUserByIdQuery>('GetUserByIdQuery');

  return useQuery<UserResponseDTO | null, Error>({
    queryKey: ['user', userId],
    queryFn: async () => {
      return await getUserQuery.execute(userId);
    },
    enabled: !!userId,
  });
}

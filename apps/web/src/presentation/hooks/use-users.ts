'use client';

import { useInjection } from '@/app/providers';
import type { UserResponseDTO } from '@/application/dto';
import { ListUsersQuery } from '@/application/queries';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook para listar usuários
 * 
 * Consome ListUsersQuery via DI.
 */

export function useUsers() {
  const listUsersQuery = useInjection<ListUsersQuery>('ListUsersQuery');

  return useQuery<UserResponseDTO[], Error>({
    queryKey: ['users'],
    queryFn: async () => {
      return await listUsersQuery.execute();
    },
  });
}

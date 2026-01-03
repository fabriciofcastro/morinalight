/**
 * User Security Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface TrustedDevice {
    id: string;
    userId: string;
    deviceId: string;
    name: string;
    browser: string | null;
    os: string | null;
    ip: string | null;
    location: string | null;
    lastUsed: string;
    createdAt: string;
}

/**
 * Hook para listar dispositivos confiáveis de um usuário
 */
export function useUserTrustedDevices(userId: string) {
    return useQuery({
        queryKey: ['user-trusted-devices', userId],
        queryFn: async () => {
            const response = await fetch(`/api/users/${userId}/trusted-devices`);
            if (!response.ok) throw new Error("Failed to fetch trusted devices");
            return response.json() as Promise<TrustedDevice[]>;
        },
        enabled: !!userId,
    });
}

/**
 * Hook para remover um dispositivo confiável
 */
export function useRevokeTrustedDevice() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userId, deviceId }: { userId: string; deviceId: string }) => {
            const response = await fetch(`/api/users/${userId}/trusted-devices/${deviceId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error("Failed to revoke trusted device");
            return response.json().catch(() => ({ success: true }));
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['user-trusted-devices', variables.userId] });
        },
    });
}

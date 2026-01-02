'use client';

import React, { useEffect, useState } from 'react';
import { AbilityProvider } from '@/lib/auth/CaslContext';
import { buildAbilityForUserWithConditions, type UserEffectivePermissions } from '@/lib/auth/ability';
import { fetchUserPermissions } from '@/hooks/use-permissions';
import { getAuthUser } from '@/lib/auth-client';
import { AppAbility } from '@morina/shared-kernel';

export function CaslProvider({ children }: { children: React.ReactNode }) {
    const [ability, setAbility] = useState<AppAbility>(new AppAbility());
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const loadPermissions = async () => {
            const user = getAuthUser();
            if (!user) {
                setAbility(new AppAbility()); // Guest ability (empty)
                return;
            }

            try {
                const { effective, denied, role, context } = await fetchUserPermissions(user.userId);

                // Construir UserContext para ABAC
                const userContext = {
                    userId: user.userId,
                    role: role || undefined,
                    departmentId: context?.departmentId,
                    sectorId: context?.sectorId,
                    positionId: context?.positionId,
                    attributes: context?.attributes || {},
                    mfaVerified: false // TODO: Obter do estado de mfa
                };

                const newAbility = buildAbilityForUserWithConditions(
                    { effective, denied, role } as UserEffectivePermissions,
                    userContext
                );
                setAbility(newAbility);
            } catch (error) {
                console.error('Failed to load permissions for CASL:', error);
            }
        };

        loadPermissions().finally(() => setReady(true));

        // Listen for realtime updates
        const handleRefresh = () => {
            console.log('🔄 CASL Provider: Refreshing permissions due to realtime event');
            loadPermissions();
        };

        window.addEventListener('realtime-permissions-refreshed', handleRefresh);
        return () => window.removeEventListener('realtime-permissions-refreshed', handleRefresh);
    }, []);

    // Opcional: Mostrar loading enquanto carrega permissões iniciais?
    // Para agora, vamos renderizar children mesmo que vazio, para não bloquear a UI,
    // mas componentes protegidos por <Can> vão esconder o conteúdo até carregar.

    return (
        <AbilityProvider ability={ability}>
            {children}
        </AbilityProvider>
    );
}

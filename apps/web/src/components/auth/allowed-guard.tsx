"use client";

import React from "react";
import { useAbility } from "@/lib/auth/CaslContext";
import { AppAbility, AppActions, AppSubjects } from "@morina/shared-kernel";
import { useRouter } from "next/navigation";

interface AllowedGuardProps {
    I: AppActions;
    a: AppSubjects;
    children: React.ReactNode;
    fallback?: React.ReactNode;
    redirectTo?: string;
}

/**
 * Componente para proteger rotas ou seções inteiras.
 * Se o usuário não tiver permissão, exibe fallback ou redireciona.
 */
export function AllowedGuard({ I, a, children, fallback, redirectTo }: AllowedGuardProps) {
    const ability = useAbility();
    const router = useRouter();
    const [canAccess, setCanAccess] = React.useState(false);
    const [checked, setChecked] = React.useState(false);

    React.useEffect(() => {
        const result = ability.can(I, a);
        setCanAccess(result);
        setChecked(true);

        if (!result && redirectTo) {
            router.push(redirectTo);
        }
    }, [ability, I, a, redirectTo, router]);

    if (!checked) {
        return null; // ou um esqueleto de loading
    }

    if (canAccess) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    // Se redirecionou, retorna null enquanto navega
    if (redirectTo) {
        return null;
    }

    // Default fallback: mensagem simples ou null
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-red-500/10 border border-red-500/20 rounded-lg">
            <h3 className="text-lg font-semibold text-red-400">Acesso Negado</h3>
            <p className="text-sm text-white/60">Você não tem permissão para acessar este recurso.</p>
        </div>
    );
}

"use client";

import { useSession } from "next-auth/react";
import { useAbility } from "@/lib/auth/CaslContext";
import { parsePermissionKey } from "@/lib/auth/ability";
import { redirect } from "next/navigation";
import { useEffect, type ReactNode } from "react";

interface SecurePageProps {
    children: ReactNode;
    requiredPermission: string;
    requireMFA?: boolean;
}

/**
 * Secure Page Wrapper
 * 
 * Automatically handles:
 * 1. Authentication check
 * 2. Permission verification
 * 3. MFA requirement
 * 4. Access denied UI
 * 
 * Usage:
 * <SecurePage requiredPermission="users:view">
 *   <YourContent />
 * </SecurePage>
 */
export function SecurePage({
    children,
    requiredPermission,
    requireMFA = false,
}: SecurePageProps) {
    const { data: session, status } = useSession();
    const ability = useAbility();

    // 1. Authentication check
    useEffect(() => {
        if (status === "unauthenticated") {
            redirect("/login");
        }
    }, [status]);

    // 2. MFA check
    if (requireMFA && session && !(session.user as any).mfaVerified) {
        redirect("/auth/mfa");
    }

    // 3. Permission check
    const { action, subject } = parsePermissionKey(requiredPermission);

    if (status === "authenticated" && !ability.can(action, subject)) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
                    <p className="mt-2 text-gray-600">
                        Você não tem permissão para acessar esta página.
                    </p>
                    <p className="mt-4 text-sm text-gray-500">
                        Permissão necessária: <code className="bg-gray-100 px-2 py-1 rounded">{requiredPermission}</code>
                    </p>
                </div>
            </div>
        );
    }

    // 4. Loading state
    if (status === "loading") {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return <>{children}</>;
}

/**
 * Auth Hook - Updated for httpOnly Cookies
 */
"use client";

import { authApi, type LoginRequest, type RegisterRequest } from "@/lib/api/auth";
import { queryKeys } from "@/lib/query/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

/**
 * Hook para login com httpOnly cookies
 */
export function useLogin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: LoginRequest) => authApi.login(data),
        onSuccess: (data) => {
            // Atualizar cache com dados do usuário
            queryClient.setQueryData(queryKeys.auth.session(), data.user);

            // Salvar apenas dados não-sensíveis no localStorage
            if (typeof window !== "undefined") {
                localStorage.setItem("user", JSON.stringify(data.user));
            }
        },
    });
}

/**
 * Hook para logout
 */
export function useLogout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => authApi.logout(),
        onSuccess: () => {
            // Limpar todo o cache
            queryClient.clear();

            // Redirecionar para login
            if (typeof window !== "undefined") {
                window.location.href = "/login";
            }
        },
    });
}

/**
 * Hook para registro
 */
export function useRegister() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: RegisterRequest) => authApi.register(data),
        onSuccess: (data) => {
            queryClient.setQueryData(queryKeys.auth.session(), data.user);

            if (typeof window !== "undefined") {
                localStorage.setItem("user", JSON.stringify(data.user));
            }
        },
    });
}

/**
 * Hook para obter usuário atual
 * Usa token do httpOnly cookie automaticamente
 */
export function useCurrentUser() {
    return useQuery({
        queryKey: queryKeys.auth.session(),
        queryFn: () => authApi.getCurrentUser(),
        staleTime: 5 * 60 * 1000, // 5 minutos
        retry: false,
    });
}

/**
 * Hook para verificar autenticação
 */
export function useIsAuthenticated() {
    const { data: user, isLoading } = useCurrentUser();

    return {
        isAuthenticated: !!user,
        isLoading,
        user,
    };
}

/**
 * Hook para refresh token automático
 */
export function useAutoRefreshToken() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ["auth", "refresh"],
        queryFn: () => authApi.refreshToken(),
        staleTime: 14 * 60 * 1000, // 14 minutos (refresh antes de expirar)
        refetchInterval: 14 * 60 * 1000, // Refresh a cada 14 minutos
        refetchIntervalInBackground: true,
        enabled: typeof window !== "undefined", // Apenas no cliente
    });

    useEffect(() => {
        if (query.data) {
            queryClient.setQueryData(queryKeys.auth.session(), query.data.user);
        }
    }, [query.data, queryClient]);

    return query;
}

/**
 * EXEMPLO DE USO:
 * 
 * ```typescript
 * function LoginPage() {
 *   const login = useLogin();
 *   
 *   const handleSubmit = async (data) => {
 *     try {
 *       await login.mutateAsync(data);
 *       // Token já está no cookie httpOnly!
 *       router.push('/dashboard');
 *     } catch (error) {
 *       toast.error('Login failed');
 *     }
 *   };
 * }
 * 
 * function ProtectedPage() {
 *   const { isAuthenticated, isLoading, user } = useIsAuthenticated();
 *   
 *   if (isLoading) return <Loading />;
 *   if (!isAuthenticated) return <Redirect to="/login" />;
 *   
 *   return <div>Welcome {user.displayName}</div>;
 * }
 * 
 * function App() {
 *   // Auto-refresh token em background
 *   useAutoRefreshToken();
 *   
 *   return <YourApp />;
 * }
 * ```
 */

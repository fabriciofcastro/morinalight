import { cookies } from "next/headers";
import { verifyAccessToken, type TokenPayload } from "./jwt";

export type AuthUser = {
    userId: string;
    email: string;
    displayName: string | null;
};

export type AuthSession = {
    token: string;
    user: AuthUser;
    organizations: Array<{ organizationId: string; name: string; role: string }>;
};

const AUTH_TOKEN_KEY = "auth_token";
// Mantido por compatibilidade histórica (migração parcial do storage do usuário)
const _AUTH_USER_KEY = "auth_user";
void _AUTH_USER_KEY;

/**
 * Obtém o token de autenticação do cookie (server-side apenas)
 * Para client-side, use auth-client.ts
 */
export async function getAuthToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(AUTH_TOKEN_KEY)?.value ?? null;
}

/**
 * Verifica se o usuário está autenticado (server-side apenas)
 */
export async function isAuthenticated(): Promise<boolean> {
    return (await getAuthToken()) !== null;
}

/**
 * Obtém headers de autenticação para requisições (server-side apenas)
 */
export async function getAuthHeaders(): Promise<HeadersInit> {
    const token = await getAuthToken();
    if (!token) {
        return {};
    }
    return {
        Authorization: `Bearer ${token}`,
    };
}

/**
 * Obtém o usuário autenticado decodificando o token (server-side apenas)
 */
export async function getAuthUser(): Promise<AuthUser | null> {
    try {
        const token = await getAuthToken();
        if (!token) return null;

        const payload = verifyAccessToken(token);

        return {
            userId: payload.userId,
            email: payload.email,
            displayName: null, // JWT payload doesn't have displayName, would need DB query
        };
    } catch (error) {
        return null;
    }
}

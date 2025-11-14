import { cookies } from "next/headers";

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
const AUTH_USER_KEY = "auth_user";

/**
 * Obtém o token de autenticação do cookie (server-side apenas)
 * Para client-side, use auth-client.ts
 */
export function getAuthToken(): string | null {
  const cookieStore = cookies();
  return cookieStore.get(AUTH_TOKEN_KEY)?.value ?? null;
}

/**
 * Verifica se o usuário está autenticado (server-side apenas)
 */
export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

/**
 * Obtém headers de autenticação para requisições (server-side apenas)
 */
export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  if (!token) {
    return {};
  }
  return {
    Authorization: `Bearer ${token}`,
  };
}



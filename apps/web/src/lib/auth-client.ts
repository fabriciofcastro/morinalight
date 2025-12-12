"use client";

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

const AUTH_USER_KEY = "auth_user";

/**
 * Obtém o token de autenticação do localStorage (client-side apenas)
 */
export function getAuthToken(): string | null {
  return null;
}

/**
 * Salva o token de autenticação no localStorage e cookie
 */
export function setAuthToken(_token: string): void {
  // Token é mantido apenas em cookie httpOnly (setado via rota /api/auth/login)
}

/**
 * Remove o token de autenticação
 */
export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_USER_KEY);
}

/**
 * Obtém os dados do usuário autenticado
 */
export function getAuthUser(): AuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }
  const userStr = localStorage.getItem(AUTH_USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as AuthUser;
  } catch {
    return null;
  }
}

/**
 * Salva os dados do usuário autenticado
 */
export function setAuthUser(user: AuthUser): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

/**
 * Salva a sessão completa (token + user + organizations)
 */
export function setAuthSession(session: AuthSession): void {
  // Token permanece apenas em cookie httpOnly
  setAuthUser(session.user);

  // Salvar organizações também
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_organizations", JSON.stringify(session.organizations));
  }
}

/**
 * Verifica se o usuário está autenticado
 */
export function isAuthenticated(): boolean {
  return !!getAuthUser();
}

/**
 * Obtém headers de autenticação para requisições
 * @deprecated Use getAuthHeadersWithTenant() para incluir headers de tenant automaticamente
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

/**
 * Obtém headers de autenticação com tenant (x-org-id e x-user-id)
 * Esta função combina Authorization Bearer token com headers de tenant
 */
export function getAuthHeadersWithTenant(): HeadersInit {
  const token = getAuthToken();
  const user = getAuthUser();

  if (!token || !user) {
    return {};
  }

  // Decodificar JWT para obter defaultOrgId
  function decodeJwt(token: string): {
    sub?: string;
    email?: string;
    defaultOrgId?: string | null;
  } | null {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        return null;
      }
      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  // Obter orgId atual (do localStorage ou JWT)
  function getCurrentOrgId(): string | null {
    if (typeof window === "undefined") {
      return null;
    }

    // Tentar obter do localStorage primeiro (seletor de organização)
    const selectedOrgId = localStorage.getItem("selected_org_id");
    if (selectedOrgId) {
      return selectedOrgId;
    }

    // Tentar obter do JWT
    const payload = decodeJwt(token);
    if (payload?.defaultOrgId) {
      return payload.defaultOrgId;
    }

    // Tentar obter da primeira organização da lista
    const orgsStr = localStorage.getItem("auth_organizations");
    if (orgsStr) {
      try {
        const orgs = JSON.parse(orgsStr) as Array<{ organizationId: string }>;
        if (orgs.length > 0) {
          return orgs[0].organizationId;
        }
      } catch {
        // Ignorar erro de parsing
      }
    }

    return null;
  }

  const orgId = getCurrentOrgId();
  const userId = user.userId;

  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
  };

  if (orgId) {
    headers["x-org-id"] = orgId;
  }

  if (userId) {
    headers["x-user-id"] = userId;
  }

  return headers;
}

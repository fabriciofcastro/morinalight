/**
 * Auth API - Migrated with httpOnly Cookies Support
 */

import { apiClient } from "./base";
import type { AxiosRequestConfig } from "axios";

export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    displayName: string;
    role: string;
    mustChangePassword?: boolean;
  };
  organizations?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  // Token NÃO é mais retornado - agora é httpOnly cookie
  requiresTwoFactor?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ConfirmResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface TwoFactorVerifyRequest {
  code: string;
}

export interface RefreshTokenResponse {
  user: {
    id: string;
    email: string;
    displayName: string;
    role: string;
  };
}

/**
 * Auth API com suporte a httpOnly cookies
 * 
 * IMPORTANTE: Tokens agora são armazenados em httpOnly cookies pelo backend.
 * O frontend NÃO tem acesso direto aos tokens (mais seguro contra XSS).
 */
export const authApi = {
  /**
   * Login - Token é setado como httpOnly cookie pelo backend
   */
  login: async (data: LoginRequest, config?: AxiosRequestConfig): Promise<LoginResponse> => {
    console.log("🔶 [AUTH_API] login() called, about to call apiClient.post");
    console.log("🔶 [AUTH_API] Data:", { email: data.email, hasPassword: !!data.password });
    const response = await apiClient.post<LoginResponse>("/auth/login", data, config);
    console.log("🔶 [AUTH_API] Got response:", response);

    // Token é setado automaticamente como cookie pelo backend
    // Não precisamos fazer nada aqui!

    return response;
  },

  /**
   * Register - Cria conta e faz login automático
   */
  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>("/auth/register", data);
  },

  /**
   * Logout - Remove httpOnly cookie
   */
  logout: async (): Promise<void> => {
    await apiClient.post<void>("/auth/logout", {});

    // Limpar qualquer estado local
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("selected_org_id");
    }
  },

  /**
   * Refresh Token - Renova token automaticamente
   */
  refreshToken: async (): Promise<RefreshTokenResponse> => {
    return apiClient.post<RefreshTokenResponse>("/auth/refresh", {});
  },

  /**
   * Get Current User - Usa token do cookie
   */
  getCurrentUser: async (): Promise<LoginResponse["user"]> => {
    return apiClient.get<LoginResponse["user"]>("/auth/me");
  },

  /**
   * Verify Two Factor
   */
  verifyTwoFactor: async (data: TwoFactorVerifyRequest): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>("/auth/2fa/verify", data);
  },

  /**
   * Request Password Reset
   */
  requestPasswordReset: async (data: ResetPasswordRequest): Promise<void> => {
    return apiClient.post<void>("/auth/password/reset-request", data);
  },

  /**
   * Confirm Password Reset
   */
  confirmPasswordReset: async (data: ConfirmResetPasswordRequest): Promise<void> => {
    return apiClient.post<void>("/auth/password/reset-confirm", data);
  },

  /**
   * Change Password (authenticated)
   */
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    return apiClient.post<void>("/auth/password/change", data);
  },

  /**
   * Check if authenticated (verifica se cookie é válido)
   */
  checkAuth: async (): Promise<boolean> => {
    try {
      await apiClient.get("/auth/check");
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Set Current Organization - Atualiza localStorage e Cookie
   */
  setCurrentOrganization: (orgId: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selected_org_id", orgId);
      // Setar cookie para SSR e Middleware
      document.cookie = `selected_org_id=${orgId}; path=/; max-age=31536000; SameSite=Lax`;
    }
  },
};

/**
 * MIGRAÇÃO DE localStorage PARA httpOnly Cookies
 * 
 * ANTES (INSEGURO):
 * ```typescript
 * const token = localStorage.getItem('token');
 * axios.get('/api/users', {
 *   headers: { Authorization: `Bearer ${token}` }
 * });
 * ```
 * 
 * DEPOIS (SEGURO):
 * ```typescript
 * // Token é enviado automaticamente como cookie
 * await apiClient.get('/users');
 * // Não precisa fazer nada! O cookie é incluído automaticamente
 * ```
 * 
 * BENEFÍCIOS:
 * 1. Proteção contra XSS - JavaScript não pode acessar o token
 * 2. Proteção contra CSRF - Token CSRF separado protege
 * 3. Renovação automática - Refresh token também em httpOnly
 * 4. Logout seguro - Cookie é removido pelo servidor
 * 
 * BACKEND REQUIREMENTS:
 * O backend deve:
 * 1. Setar cookie com flags: httpOnly, secure, sameSite
 * 2. Implementar endpoint /auth/refresh para renovar token
 * 3. Validar token do cookie em todas as requisições autenticadas
 * 4. Remover cookie no /auth/logout
 * 
 * Exemplo de resposta do backend (Set-Cookie header):
 * Set-Cookie: auth-token=<token>; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/
 */

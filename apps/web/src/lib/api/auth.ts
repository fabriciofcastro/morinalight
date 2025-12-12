import { apiClient } from "./base";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    userId: string;
    email: string;
    displayName: string;
  };
  organizations: Array<{
    organizationId: string;
    name: string;
    slug: string;
  }>;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface RegisterResponse {
  token: string;
  user: {
    userId: string;
    email: string;
    displayName: string;
  };
  organizations: Array<{
    organizationId: string;
    name: string;
    slug: string;
  }>;
}

export class AuthApi {
  private setSelectedOrgCookie(organizationId: string): void {
    // Cookie NÃO sensível (apenas contexto de tenant). Mantemos fora de httpOnly de propósito,
    // pois é setado no client e lido nos handlers server-side.
    if (typeof window === "undefined") return;
    // biome-ignore lint/suspicious/noDocumentCookie: necessário para persistir contexto de tenant em cookie.
    document.cookie = `selected_org_id=${encodeURIComponent(organizationId)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>("/auth/login", credentials);

    // Store only user/org info client-side (token permanece em cookie httpOnly)
    if (typeof window !== "undefined") {
      localStorage.setItem("user_data", JSON.stringify(response.user));
      localStorage.setItem("auth_organizations", JSON.stringify(response.organizations));

      if (response.organizations.length === 1) {
        const orgId = response.organizations[0].organizationId;
        localStorage.setItem("current_organization_id", orgId);
        localStorage.setItem("selected_org_id", orgId);
        this.setSelectedOrgCookie(orgId);
      }
    }
    return response;
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>("/auth/register", data);

    // Store token and user data
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", response.token);
      localStorage.setItem("user_data", JSON.stringify(response.user));

      // If user has only one organization, set it as current
      if (response.organizations.length === 1) {
        localStorage.setItem("current_organization_id", response.organizations[0].organizationId);
      }
    }

    return response;
  }

  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("current_organization_id");
      localStorage.removeItem("selected_org_id");
      localStorage.removeItem("user_data");
      localStorage.removeItem("auth_organizations");

      // Limpar cookie de tenant (não httpOnly)
      // biome-ignore lint/suspicious/noDocumentCookie: necessário para limpar contexto de tenant no client.
      document.cookie = "selected_org_id=; path=/; max-age=0; SameSite=Lax";

      // Tentar limpar cookie httpOnly no server
      fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
      window.location.href = "/login";
    }
  }

  setCurrentOrganization(organizationId: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("current_organization_id", organizationId);
      localStorage.setItem("selected_org_id", organizationId);
      this.setSelectedOrgCookie(organizationId);
    }
  }

  getCurrentUser(): LoginResponse["user"] | null {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user_data");
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  isAuthenticated(): boolean {
    if (typeof window !== "undefined") {
      // Token fica em cookie httpOnly; no client usamos presença de user_data como indicador
      return !!localStorage.getItem("user_data");
    }
    return false;
  }
}

export const authApi = new AuthApi();

import { apiClient } from './base';

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
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        console.log('🔑 [AUTH_API] Iniciando login...');

        const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
        console.log('✅ [AUTH_API] Resposta da API recebida');
        console.log('🎫 [AUTH_API] Token recebido:', response.token.substring(0, 20) + '...');

        // Store token and user data
        if (typeof window !== 'undefined') {
            console.log('💾 [AUTH_API] Salvando dados no localStorage...');
            // Save to localStorage
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('user_data', JSON.stringify(response.user));
            console.log('✅ [AUTH_API] Dados salvos no localStorage');

            // CRITICAL: Also save to cookie for middleware authentication
            const secure = window.location.protocol === 'https:' ? '; Secure' : '';
            const cookieString = `auth_token=${response.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax${secure}`;
            document.cookie = cookieString;
            console.log('🍪 [AUTH_API] Cookie criado:', {
                hasSecure: !!secure,
                maxAge: 7 * 24 * 60 * 60,
                sameSite: 'Lax'
            });

            // If user has only one organization, set it as current
            if (response.organizations.length === 1) {
                localStorage.setItem('current_organization_id', response.organizations[0].organizationId);
                console.log('🏢 [AUTH_API] Organização padrão definida:', response.organizations[0].organizationId);
            }

            // Verify cookie was set
            const cookies = document.cookie.split(';').map(c => c.trim());
            const authCookie = cookies.find(c => c.startsWith('auth_token='));
            console.log('🔍 [AUTH_API] Verificação de cookie:', {
                cookieExists: !!authCookie,
                cookiePreview: authCookie ? authCookie.substring(0, 30) + '...' : 'não encontrado'
            });
        }

        console.log('✅ [AUTH_API] Login concluído com sucesso');
        return response;
    }

    async register(data: RegisterRequest): Promise<RegisterResponse> {
        const response = await apiClient.post<RegisterResponse>('/auth/register', data);

        // Store token and user data
        if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('user_data', JSON.stringify(response.user));

            // If user has only one organization, set it as current
            if (response.organizations.length === 1) {
                localStorage.setItem('current_organization_id', response.organizations[0].organizationId);
            }
        }

        return response;
    }

    logout(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('current_organization_id');
            localStorage.removeItem('user_data');
            window.location.href = '/login';
        }
    }

    setCurrentOrganization(organizationId: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem('current_organization_id', organizationId);
        }
    }

    getCurrentUser(): LoginResponse['user'] | null {
        if (typeof window !== 'undefined') {
            const userData = localStorage.getItem('user_data');
            return userData ? JSON.parse(userData) : null;
        }
        return null;
    }

    isAuthenticated(): boolean {
        if (typeof window !== 'undefined') {
            return !!localStorage.getItem('auth_token');
        }
        return false;
    }
}

export const authApi = new AuthApi();

/**
 * Test Utilities
 * 
 * Helpers e wrappers para testes
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import { ThemeProvider } from "next-themes";

/**
 * Criar query client para testes
 */
export function createTestQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: 0,
                staleTime: 0,
            },
            mutations: {
                retry: false,
            },
        },
    });
}

/**
 * Wrapper com providers para testes
 */
export function AllTheProviders({ children }: { children: React.ReactNode }) {
    const queryClient = createTestQueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider attribute="data-theme" defaultTheme="dark">
                {children}
            </ThemeProvider>
        </QueryClientProvider>
    );
}

/**
 * Render customizado com providers
 */
export function renderWithProviders(
    ui: React.ReactElement,
    options?: Omit<RenderOptions, "wrapper">,
) {
    return render(ui, { wrapper: AllTheProviders, ...options });
}

/**
 * Mock de usuário autenticado
 */
export const mockAuthUser = {
    id: "user-1",
    name: "Test User",
    email: "test@example.com",
    role: "admin",
};

/**
 * Mock de organização
 */
export const mockOrganization = {
    id: "org-1",
    name: "Test Organization",
    slug: "test-org",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

/**
 * Mock de produto
 */
export const mockProduct = {
    id: "product-1",
    name: "Test Product",
    description: "A test product",
    sku: "TEST-001",
    price: 99.99,
    status: "active" as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

/**
 * Mock de usuário
 */
export const mockUser = {
    id: "user-1",
    name: "John Doe",
    email: "john@example.com",
    role: "user",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

/**
 * Wait for async updates
 */
export const waitFor = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

// Re-export everything from testing-library
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";


/**
 * Login E2E Test
 * 
 * Teste end-to-end do fluxo de login
 */

import { test, expect } from "@playwright/test";

test.describe("Login Flow", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/login");
    });

    test("should display login form", async ({ page }) => {
        await expect(page.getByRole("heading", { name: /login/i })).toBeVisible();
        await expect(page.getByLabel(/email/i)).toBeVisible();
        await expect(page.getByLabel(/senha/i)).toBeVisible();
        await expect(page.getByRole("button", { name: /entrar/i })).toBeVisible();
    });

    test("should show validation errors for empty fields", async ({ page }) => {
        await page.getByRole("button", { name: /entrar/i }).click();

        // Aguardar mensagens de erro
        await expect(page.getByText(/email.*obrigatório/i)).toBeVisible();
        await expect(page.getByText(/senha.*obrigatório/i)).toBeVisible();
    });

    test("should show error for invalid credentials", async ({ page }) => {
        await page.getByLabel(/email/i).fill("invalid@example.com");
        await page.getByLabel(/senha/i).fill("wrongpassword");
        await page.getByRole("button", { name: /entrar/i }).click();

        // Aguardar mensagem de erro
        await expect(
            page.getByText(/credenciais inválidas|email ou senha incorretos/i)
        ).toBeVisible({ timeout: 5000 });
    });

    test("should login successfully with valid credentials", async ({ page }) => {
        // Usar credenciais de teste
        await page.getByLabel(/email/i).fill("test@example.com");
        await page.getByLabel(/senha/i).fill("password123");
        await page.getByRole("button", { name: /entrar/i }).click();

        // Aguardar redirecionamento para dashboard
        await expect(page).toHaveURL(/\/dashboard|\/app/, { timeout: 10000 });
    });

    test("should toggle password visibility", async ({ page }) => {
        const passwordInput = page.getByLabel(/senha/i);
        const toggleButton = page.getByRole("button", { name: /mostrar|ocultar/i });

        // Senha deve estar oculta inicialmente
        await expect(passwordInput).toHaveAttribute("type", "password");

        // Clicar para mostrar
        await toggleButton.click();
        await expect(passwordInput).toHaveAttribute("type", "text");

        // Clicar para ocultar novamente
        await toggleButton.click();
        await expect(passwordInput).toHaveAttribute("type", "password");
    });

    test("should navigate to forgot password", async ({ page }) => {
        await page.getByRole("link", { name: /esqueci.*senha/i }).click();
        await expect(page).toHaveURL(/\/forgot-password|\/recuperar-senha/);
    });

    test("should navigate to register", async ({ page }) => {
        await page.getByRole("link", { name: /criar.*conta|cadastr/i }).click();
        await expect(page).toHaveURL(/\/register|\/cadastro/);
    });
});

test.describe("Authenticated User", () => {
    test.use({
        storageState: "e2e/.auth/user.json", // Estado de autenticação salvo
    });

    test("should access dashboard when authenticated", async ({ page }) => {
        await page.goto("/dashboard");
        await expect(page).toHaveURL(/\/dashboard/);
        await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
    });

    test("should logout successfully", async ({ page }) => {
        await page.goto("/dashboard");
        await page.getByRole("button", { name: /sair|logout/i }).click();

        // Aguardar redirecionamento para login
        await expect(page).toHaveURL(/\/login/);
    });
});

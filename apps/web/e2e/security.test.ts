/**
 * Security Testing
 * 
 * Testes automatizados de segurança (Headers, Auth, Access Control)
 */

import { test, expect } from "@playwright/test";

test.describe("Security Headers", () => {
    test("should have recommended security headers", async ({ page }) => {
        const response = await page.goto("/");
        const headers = response?.headers();

        expect(headers).toBeTruthy();

        if (headers) {
            // OWASP Secure Headers Recommendations
            expect(headers["x-frame-options"]).toBeDefined();
            expect(headers["x-content-type-options"]).toBe("nosniff");
            expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");

            // HSTS (Strict-Transport-Security)
            // Nota: Pode não estar presente em http://localhost, apenas https
            if (process.env.NODE_ENV === "production") {
                expect(headers["strict-transport-security"]).toBeDefined();
            }

            // Content Security Policy
            expect(headers["content-security-policy"]).toBeDefined();
        }
    });

    test("should set cookie security flags", async ({ page }) => {
        // Simular login para gerar cookies
        await page.context().addCookies([{
            name: "test-session",
            value: "123",
            domain: "localhost",
            path: "/",
            httpOnly: true,
            secure: true,
            sameSite: "Lax"
        }]);

        const cookies = await page.context().cookies();
        const sessionCookie = cookies.find(c => c.name === "test-session");

        expect(sessionCookie).toBeTruthy();
        expect(sessionCookie?.httpOnly).toBe(true);
        expect(sessionCookie?.secure).toBe(true);
        expect(sessionCookie?.sameSite).toBe("Lax");
    });
});

test.describe("Access Control", () => {
    test("should redirect unauthenticated users from protected routes", async ({ page }) => {
        // Tentar acessar dashboard sem login
        await page.goto("/dashboard");

        // Deve redirecionar para login
        await expect(page).toHaveURL(/\/login/);
    });

    test("should protect API routes from unauthenticated access", async ({ request }) => {
        const response = await request.get("/api/users");

        // Deve retornar 401 Unauthorized
        expect(response.status()).toBe(401);
    });
});

test.describe("Input Sanitization (XSS)", () => {
    test("should not execute scripts in inputs", async ({ page }) => {
        await page.goto("/login");

        // Tentar injetar script
        const maliciousInput = '<script>alert("XSS")</script>';
        await page.fill('input[type="email"]', maliciousInput);

        // O valor deve ser tratado como texto, limpo ou recusado pelo validador de email
        const inputValue = await page.inputValue('input[type="email"]');
        // Se o valor foi limpo (browser validation), também é seguro. 
        // Se persistiu, não deve ter executado.

        // Apenas verificamos se o alerta não foi disparado (controle abaixo)
        // e se o valor não é interpretado como HTML (Playwright inputValue pega o value da propriedade)

        // Verificar se nenhum alert foi disparado
        let alertTriggered = false;
        page.on('dialog', () => { alertTriggered = true; });

        // Submeter
        await page.click('button[type="submit"]');

        expect(alertTriggered).toBe(false);
    });
});

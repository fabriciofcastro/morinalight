/**
 * Accessibility Testing
 * 
 * Testes automatizados de acessibilidade WCAG 2.1 AA
 */

import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Teste de acessibilidade para página de login
 */
test.describe("Accessibility - Login Page", () => {
    test("should not have any automatically detectable accessibility issues", async ({
        page,
    }) => {
        await page.goto("/login");

        const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test("should be navigable by keyboard", async ({ page }) => {
        await page.goto("/login");

        // Tab para email
        await page.keyboard.press("Tab");
        await expect(page.locator('input[type="email"]')).toBeFocused();

        // Tab para password
        await page.keyboard.press("Tab");
        await expect(page.locator('input[type="password"]')).toBeFocused();

        // Tab para botão
        await page.keyboard.press("Tab");
        await expect(page.locator('button[type="submit"]')).toBeFocused();

        // Enter para submeter
        await page.keyboard.press("Enter");
    });

    test("should have proper ARIA labels", async ({ page }) => {
        await page.goto("/login");

        // Verificar labels
        const emailInput = page.locator('input[type="email"]');
        await expect(emailInput).toHaveAttribute("aria-label");

        const passwordInput = page.locator('input[type="password"]');
        await expect(passwordInput).toHaveAttribute("aria-label");

        const submitButton = page.locator('button[type="submit"]');
        await expect(submitButton).toHaveAttribute("aria-label");
    });

    test("should have sufficient color contrast", async ({ page }) => {
        await page.goto("/login");

        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(["wcag2aa", "wcag21aa"])
            .analyze();

        const contrastViolations = accessibilityScanResults.violations.filter(
            (v) => v.id === "color-contrast",
        );

        expect(contrastViolations).toEqual([]);
    });
});

/**
 * Teste de acessibilidade para dashboard
 */
test.describe("Accessibility - Dashboard", () => {
    test.beforeEach(async ({ page }) => {
        // Login primeiro
        await page.goto("/login");
        await page.fill('input[type="email"]', "admin@example.com");
        await page.fill('input[type="password"]', "password123");
        await page.click('button[type="submit"]');
        await page.waitForURL("/dashboard");
    });

    test("should not have any accessibility violations", async ({ page }) => {
        const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test("should have proper heading hierarchy", async ({ page }) => {
        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(["wcag2a"])
            .analyze();

        const headingViolations = accessibilityScanResults.violations.filter(
            (v) => v.id === "heading-order",
        );

        expect(headingViolations).toEqual([]);
    });

    test("should have alt text for images", async ({ page }) => {
        const images = await page.locator("img").all();

        for (const img of images) {
            const alt = await img.getAttribute("alt");
            expect(alt).toBeTruthy();
        }
    });
});

/**
 * Teste de acessibilidade para formulários
 */
test.describe("Accessibility - Forms", () => {
    test("should have proper form labels", async ({ page }) => {
        await page.goto("/admin/users/new");

        const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(["wcag2a"])
            .analyze();

        const labelViolations = accessibilityScanResults.violations.filter(
            (v) => v.id === "label",
        );

        expect(labelViolations).toEqual([]);
    });

    test("should show error messages accessibly", async ({ page }) => {
        await page.goto("/admin/users/new");

        // Submeter formulário vazio
        await page.click('button[type="submit"]');

        // Verificar se erros têm role="alert"
        const errors = page.locator('[role="alert"]');
        await expect(errors).toHaveCount(1, { timeout: 5000 });
    });
});

/**
 * Teste de acessibilidade para navegação
 */
test.describe("Accessibility - Navigation", () => {
    test("should have skip to main content link", async ({ page }) => {
        await page.goto("/");

        const skipLink = page.locator('a[href="#main-content"]');
        await expect(skipLink).toBeVisible();

        // Testar funcionalidade
        await skipLink.click();
        const mainContent = page.locator("#main-content");
        await expect(mainContent).toBeFocused();
    });

    test("should have proper landmark regions", async ({ page }) => {
        await page.goto("/");

        // Verificar landmarks
        await expect(page.locator("header")).toBeVisible();
        await expect(page.locator("nav")).toBeVisible();
        await expect(page.locator("main")).toBeVisible();
        await expect(page.locator("footer")).toBeVisible();
    });
});

/**
 * CONFIGURAÇÃO:
 * 
 * package.json:
 * {
 *   "devDependencies": {
 *     "@axe-core/playwright": "^4.8.0"
 *   }
 * }
 * 
 * playwright.config.ts:
 * {
 *   use: {
 *     // Configurações de acessibilidade
 *     colorScheme: 'light',
 *     reducedMotion: 'reduce',
 *   }
 * }
 */

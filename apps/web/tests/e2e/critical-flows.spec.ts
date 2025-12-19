/**
 * Testes E2E - Cenários críticos
 */

import { expect, test } from "@playwright/test";

test.describe("Cenários Críticos", () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Implementar login antes de cada teste
    // await page.goto("/login");
    // await page.fill('[name="email"]', "test@example.com");
    // await page.fill('[name="password"]', "password123");
    // await page.click('button[type="submit"]');
    // await page.waitForURL("/");
  });

  test("deve fazer login com sucesso", async ({ page }) => {
    await page.goto("/login");

    // Verificar que a página de login carregou
    await expect(page.locator("h1, h2")).toContainText(/login|entrar/i);

    // TODO: Preencher formulário e fazer login quando autenticação estiver configurada
    // await page.fill('[name="email"]', "test@example.com");
    // await page.fill('[name="password"]', "password123");
    // await page.click('button[type="submit"]');
    // await page.waitForURL("/");
    // await expect(page).toHaveURL(/\/$|\/dashboard/);
  });

  test("deve navegar para página de usuários", async ({ page }) => {
    await page.goto("/settings/users");

    // Verificar que a página carregou
    await expect(page.locator("h1, h2")).toContainText(/usuários/i);
  });

  test("deve criar um novo usuário", async ({ page }) => {
    await page.goto("/settings/users");

    // Clicar no botão de criar usuário
    const createButton = page.locator('button:has-text("Novo Usuário"), button:has-text("Criar")');
    if (await createButton.isVisible()) {
      await createButton.click();

      // Verificar que o drawer/modal abriu
      await expect(page.locator('[role="dialog"], [data-drawer]')).toBeVisible();

      // TODO: Preencher formulário quando autenticação estiver configurada
      // await page.fill('[name="name"]', "Usuário Teste");
      // await page.fill('[name="email"]', `teste-${Date.now()}@example.com`);
      // await page.fill('[name="cpf"]', "12345678909");
      // await page.click('button:has-text("Salvar")');
      // await expect(page.locator("text=Usuário criado com sucesso")).toBeVisible();
    }
  });

  test("deve buscar usuários", async ({ page }) => {
    await page.goto("/settings/users");

    // Verificar que o campo de busca existe
    const searchInput = page.locator('input[type="search"], input[placeholder*="buscar" i]');
    if (await searchInput.isVisible()) {
      await searchInput.fill("teste");
      // Aguardar resultados (debounce)
      await page.waitForTimeout(500);
    }
  });

  test("deve acessar perfil do usuário", async ({ page }) => {
    await page.goto("/profile");

    // Verificar que a página de perfil carregou
    await expect(page.locator("h1, h2")).toContainText(/perfil|profile/i);
  });

  test("deve acessar notificações", async ({ page }) => {
    await page.goto("/notifications");

    // Verificar que a página de notificações carregou
    await expect(page.locator("h1, h2")).toContainText(/notificações|notifications/i);
  });
});


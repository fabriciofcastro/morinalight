import { expect, test } from "@playwright/test";

test.describe("Portal de login", () => {
  test("valida credenciais e exibe feedback", async ({ page }) => {
    await page.goto("/login");

    await page.getByPlaceholder("nome.sobrenome@morina.ai").fill("email-invalido");
    await page.getByLabel("Senha").fill("123");
    await page.getByRole("button", { name: /entrar/i }).click();

    await expect(page.getByText(/formato de e-mail/i)).toBeVisible();
    await expect(page.getByText(/pelo menos 8 caracteres/i)).toBeVisible();

    await page.getByPlaceholder("nome.sobrenome@morina.ai").fill("lider@morina.ai");
    await page.getByLabel("Senha").fill("SenhaSegura9");
    await page.getByPlaceholder("123 456").fill("123456");
    await page.getByRole("button", { name: /entrar/i }).click();

    await expect(page.getByText(/acesso autorizado/i)).toBeVisible();
  });
});

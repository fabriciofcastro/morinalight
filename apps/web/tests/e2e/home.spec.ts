import { expect, test } from "@playwright/test";

test.describe("Home futurista", () => {
  test("exibe headline e CTAs funcionando", async ({ page }) => {
    await page.goto("/");

    await page.getByText(/sincronizando tema da empresa/i).waitFor({ state: "detached" });

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      /futuro operacional sem o peso do erp monolítico/i,
    );

    const blueprintCta = page.getByRole("link", { name: /conferir blueprint/i });
    await expect(blueprintCta).toBeVisible();
    await blueprintCta.click();

    await expect(page.locator("#blueprint")).toBeInViewport();
  });
});

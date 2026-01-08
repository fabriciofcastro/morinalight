import { expect, test } from '@playwright/test';

test.describe('Create Product Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@morinalight.com');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard|home/i, { timeout: 10000 });
  });

  test('should create a new product successfully', async ({ page }) => {
    // Navigate to products page
    await page.goto('/products');
    
    // Wait for page to load
    await expect(page.locator('h1, h2').filter({ hasText: /produtos|products/i }).first()).toBeVisible();
    
    // Click create product button
    const createButton = page.locator('button').filter({ hasText: /novo produto|new product|criar/i }).first();
    await createButton.click();
    
    // Wait for form/dialog to appear
    await page.waitForSelector('input[name="name"], input[placeholder*="nome"]', { timeout: 5000 });
    
    // Fill in product details
    const timestamp = Date.now();
    await page.fill('input[name="name"]', `Test Product ${timestamp}`);
    await page.fill('input[name="sku"]', `SKU-${timestamp}`);
    await page.fill('input[name="price"]', '99.99');
    await page.fill('input[name="cost"]', '50.00');
    
    // Fill description if available
    const descriptionField = page.locator('textarea[name="description"], input[name="description"]').first();
    if (await descriptionField.isVisible()) {
      await descriptionField.fill('Test product description');
    }
    
    // Submit form
    const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /criar|save|salvar/i }).first();
    await submitButton.click();
    
    // Wait for success
    await expect(
      page.locator(`text=Test Product ${timestamp}`).or(
        page.locator('text=/sucesso|success|criado/i')
      ).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/products');
    
    const createButton = page.locator('button').filter({ hasText: /novo produto|new product|criar/i }).first();
    await createButton.click();
    
    await page.waitForSelector('input[name="name"]', { timeout: 5000 });
    
    // Try to submit without required fields
    const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /criar|save/i }).first();
    await submitButton.click();
    
    // Check for validation errors
    const errorMessage = page.locator('text=/obrigatório|required|preencha/i');
    await expect(errorMessage.first()).toBeVisible({ timeout: 3000 });
  });

  test('should validate price is positive', async ({ page }) => {
    await page.goto('/products');
    
    const createButton = page.locator('button').filter({ hasText: /novo produto|new product|criar/i }).first();
    await createButton.click();
    
    await page.waitForSelector('input[name="price"]', { timeout: 5000 });
    
    // Enter negative price
    await page.fill('input[name="name"]', 'Invalid Price Product');
    await page.fill('input[name="sku"]', 'INVALID-SKU');
    await page.fill('input[name="price"]', '-10');
    await page.fill('input[name="cost"]', '5');
    
    const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /criar|save/i }).first();
    await submitButton.click();
    
    // Check for validation error
    const errorMessage = page.locator('text=/preço.*positivo|price.*positive|inválido/i');
    await expect(errorMessage.first()).toBeVisible({ timeout: 3000 });
  });
});

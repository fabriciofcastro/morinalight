import { expect, test } from '@playwright/test';

test.describe('Create Order Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@morinalight.com');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard|home/i, { timeout: 10000 });
  });

  test('should create a new order successfully', async ({ page }) => {
    // Navigate to orders page
    await page.goto('/orders');
    
    // Wait for page to load
    await expect(page.locator('h1, h2').filter({ hasText: /pedidos|orders/i }).first()).toBeVisible();
    
    // Click create order button
    const createButton = page.locator('button').filter({ hasText: /novo pedido|new order|criar/i }).first();
    await createButton.click();
    
    // Wait for form/dialog to appear
    await page.waitForSelector('input[name="customerName"], input[placeholder*="cliente"]', { timeout: 5000 });
    
    // Fill in order details
    const timestamp = Date.now();
    await page.fill('input[name="customerName"]', `Test Customer ${timestamp}`);
    await page.fill('input[name="customerEmail"]', `customer${timestamp}@example.com`);
    
    // Fill phone if available
    const phoneField = page.locator('input[name="customerPhone"], input[name="phone"]').first();
    if (await phoneField.isVisible()) {
      await phoneField.fill('11999999999');
    }
    
    // Submit form
    const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /criar|save|salvar/i }).first();
    await submitButton.click();
    
    // Wait for success
    await expect(
      page.locator(`text=Test Customer ${timestamp}`).or(
        page.locator('text=/sucesso|success|criado/i')
      ).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should validate customer email', async ({ page }) => {
    await page.goto('/orders');
    
    const createButton = page.locator('button').filter({ hasText: /novo pedido|new order|criar/i }).first();
    await createButton.click();
    
    await page.waitForSelector('input[name="customerEmail"]', { timeout: 5000 });
    
    // Enter invalid email
    await page.fill('input[name="customerName"]', 'Test Customer');
    await page.fill('input[name="customerEmail"]', 'invalid-email');
    
    const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /criar|save/i }).first();
    await submitButton.click();
    
    // Check for validation error
    const errorMessage = page.locator('text=/email inválido|invalid email|formato/i');
    await expect(errorMessage.first()).toBeVisible({ timeout: 3000 });
  });

  test('should validate required customer information', async ({ page }) => {
    await page.goto('/orders');
    
    const createButton = page.locator('button').filter({ hasText: /novo pedido|new order|criar/i }).first();
    await createButton.click();
    
    await page.waitForSelector('input[name="customerName"]', { timeout: 5000 });
    
    // Try to submit without required fields
    const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /criar|save/i }).first();
    await submitButton.click();
    
    // Check for validation errors
    const errorMessage = page.locator('text=/obrigatório|required|preencha/i');
    await expect(errorMessage.first()).toBeVisible({ timeout: 3000 });
  });

  test('should display order in list after creation', async ({ page }) => {
    await page.goto('/orders');
    
    const createButton = page.locator('button').filter({ hasText: /novo pedido|new order|criar/i }).first();
    await createButton.click();
    
    await page.waitForSelector('input[name="customerName"]', { timeout: 5000 });
    
    const timestamp = Date.now();
    const customerName = `E2E Test ${timestamp}`;
    
    await page.fill('input[name="customerName"]', customerName);
    await page.fill('input[name="customerEmail"]', `e2e${timestamp}@test.com`);
    
    const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /criar|save/i }).first();
    await submitButton.click();
    
    // Wait for dialog to close
    await page.waitForTimeout(1000);
    
    // Verify order appears in list
    await expect(page.locator(`text=${customerName}`)).toBeVisible({ timeout: 5000 });
  });
});

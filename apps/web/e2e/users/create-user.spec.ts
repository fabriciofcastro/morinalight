import { expect, test } from '@playwright/test';

test.describe('Create User Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@morinalight.com');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard|home/i, { timeout: 10000 });
  });

  test('should create a new user successfully', async ({ page }) => {
    // Navigate to users page
    await page.goto('/settings/users');
    
    // Wait for page to load
    await expect(page.locator('h1, h2').filter({ hasText: /usuários|users/i }).first()).toBeVisible();
    
    // Click create user button
    const createButton = page.locator('button').filter({ hasText: /novo usuário|new user|criar/i }).first();
    await createButton.click();
    
    // Wait for form/dialog to appear
    await page.waitForSelector('input[name="name"], input[placeholder*="nome"]', { timeout: 5000 });
    
    // Fill in user details
    const timestamp = Date.now();
    await page.fill('input[name="name"], input[placeholder*="nome"]', `Test User ${timestamp}`);
    await page.fill('input[name="email"], input[type="email"]', `testuser${timestamp}@example.com`);
    await page.fill('input[name="password"], input[type="password"]', 'TestPass123!');
    
    // Select role if available
    const roleSelect = page.locator('select[name="role"], [role="combobox"]').first();
    if (await roleSelect.isVisible()) {
      await roleSelect.selectOption('user');
    }
    
    // Submit form
    const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /criar|save|salvar/i }).first();
    await submitButton.click();
    
    // Wait for success message or user to appear in list
    await expect(
      page.locator(`text=Test User ${timestamp}`).or(
        page.locator('text=/sucesso|success|criado/i')
      ).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/settings/users');
    
    const createButton = page.locator('button').filter({ hasText: /novo usuário|new user|criar/i }).first();
    await createButton.click();
    
    await page.waitForSelector('input[name="email"]', { timeout: 5000 });
    
    // Enter invalid email
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'TestPass123!');
    
    // Try to submit
    const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /criar|save/i }).first();
    await submitButton.click();
    
    // Check for validation error
    const errorMessage = page.locator('text=/email inválido|invalid email|formato/i');
    await expect(errorMessage.first()).toBeVisible({ timeout: 3000 });
  });

  test('should prevent duplicate email', async ({ page }) => {
    await page.goto('/settings/users');
    
    const createButton = page.locator('button').filter({ hasText: /novo usuário|new user|criar/i }).first();
    await createButton.click();
    
    await page.waitForSelector('input[name="email"]', { timeout: 5000 });
    
    // Try to create user with existing email
    await page.fill('input[name="name"]', 'Duplicate User');
    await page.fill('input[name="email"]', 'admin@morinalight.com'); // Existing email
    await page.fill('input[name="password"]', 'TestPass123!');
    
    const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /criar|save/i }).first();
    await submitButton.click();
    
    // Check for duplicate error
    const errorMessage = page.locator('text=/já existe|already exists|duplicado/i');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
  });
});

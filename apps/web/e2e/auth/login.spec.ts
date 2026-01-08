import { expect, test } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Wait for page to load
    await expect(page).toHaveTitle(/Login|Entrar/i);
    
    // Fill in credentials
    await page.fill('input[name="email"], input[type="email"]', 'admin@morinalight.com');
    await page.fill('input[name="password"], input[type="password"]', 'Admin123!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForURL(/dashboard|home/i, { timeout: 10000 });
    
    // Verify successful login
    await expect(page).toHaveURL(/dashboard|home/i);
    
    // Verify user is logged in (check for user menu or profile)
    const userMenu = page.locator('[data-testid="user-menu"], [aria-label*="user"], [aria-label*="perfil"]');
    await expect(userMenu.first()).toBeVisible({ timeout: 5000 });
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in invalid credentials
    await page.fill('input[name="email"], input[type="email"]', 'invalid@example.com');
    await page.fill('input[name="password"], input[type="password"]', 'wrongpassword');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for error message
    const errorMessage = page.locator('text=/credenciais inválidas|invalid credentials|erro/i');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
    
    // Verify still on login page
    await expect(page).toHaveURL(/login/i);
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit without filling fields
    await page.click('button[type="submit"]');
    
    // Check for validation messages
    const validationMessage = page.locator('text=/obrigatório|required|preencha/i');
    await expect(validationMessage.first()).toBeVisible({ timeout: 3000 });
  });

  test('should toggle password visibility', async ({ page }) => {
    await page.goto('/login');
    
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    const toggleButton = page.locator('button[aria-label*="show"], button[aria-label*="mostrar"]').first();
    
    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click toggle button
    await toggleButton.click();
    
    // Password should now be visible
    await expect(passwordInput).toHaveAttribute('type', 'text');
  });
});

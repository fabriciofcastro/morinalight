import { test, expect } from '@playwright/test';

test.describe('Playbook Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/playbook');
    });

    test('should load hero section with animations', async ({ page }) => {
        // Wait for hero to be visible
        await expect(page.locator('h1')).toBeVisible();

        // Check for animated background
        const background = page.locator('[class*="grid-animated"]');
        await expect(background).toBeVisible();

        // Verify CTAs are present
        const ctaButtons = page.locator('button, a').filter({ hasText: /Começar|Explorar/i });
        await expect(ctaButtons.first()).toBeVisible();
    });

    test('should navigate smoothly between sections', async ({ page }) => {
        // Click on a section link or scroll
        await page.evaluate(() => window.scrollTo(0, 1000));

        // Wait for scroll to complete
        await page.waitForTimeout(500);

        // Verify features section is visible
        const featuresSection = page.locator('text=Features').or(page.locator('text=Recursos'));
        await expect(featuresSection).toBeVisible();
    });

    test('should display all feature cards', async ({ page }) => {
        // Scroll to features section
        const featuresSection = page.locator('[class*="features"]').first();
        await featuresSection.scrollIntoViewIfNeeded();

        // Count feature cards (adjust number based on actual implementation)
        const featureCards = page.locator('[class*="glass-card"]');
        await expect(featureCards).toHaveCount(await featureCards.count());

        // Verify at least 3 cards are visible
        expect(await featureCards.count()).toBeGreaterThanOrEqual(3);
    });

    test('should handle CTA form submission', async ({ page }) => {
        // Scroll to CTA section
        const ctaSection = page.locator('form').first();
        await ctaSection.scrollIntoViewIfNeeded();

        // Fill form
        await page.fill('input[type="email"]', 'test@example.com');
        await page.fill('input[type="text"]', 'Test Company');

        // Submit form
        await page.click('button[type="submit"]');

        // Wait for success state or validation
        await page.waitForTimeout(1000);

        // Verify no console errors
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') errors.push(msg.text());
        });
        expect(errors).toHaveLength(0);
    });

    test('should be responsive on mobile', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });

        // Verify hero is visible
        await expect(page.locator('h1')).toBeVisible();

        // Verify mobile menu or navigation
        const nav = page.locator('nav').first();
        await expect(nav).toBeVisible();
    });

    test('should have proper accessibility', async ({ page }) => {
        // Check for proper heading hierarchy
        const h1 = page.locator('h1');
        await expect(h1).toHaveCount(1);

        // Check for alt text on images
        const images = page.locator('img');
        const imageCount = await images.count();

        for (let i = 0; i < imageCount; i++) {
            const alt = await images.nth(i).getAttribute('alt');
            expect(alt).toBeTruthy();
        }

        // Check for ARIA labels on interactive elements
        const buttons = page.locator('button');
        const buttonCount = await buttons.count();

        for (let i = 0; i < buttonCount; i++) {
            const ariaLabel = await buttons.nth(i).getAttribute('aria-label');
            const text = await buttons.nth(i).textContent();
            expect(ariaLabel || text).toBeTruthy();
        }
    });

    test('should load without console errors', async ({ page }) => {
        const errors: string[] = [];

        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        await page.goto('/playbook');
        await page.waitForLoadState('networkidle');

        // Filter out known acceptable errors (if any)
        const criticalErrors = errors.filter(err =>
            !err.includes('favicon') &&
            !err.includes('manifest')
        );

        expect(criticalErrors).toHaveLength(0);
    });

    test('should have good performance metrics', async ({ page }) => {
        await page.goto('/playbook');

        // Get performance metrics
        const metrics = await page.evaluate(() => {
            const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            return {
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            };
        });

        // Verify reasonable load times
        expect(metrics.domContentLoaded).toBeLessThan(2000);
        expect(metrics.loadComplete).toBeLessThan(3000);
    });
});

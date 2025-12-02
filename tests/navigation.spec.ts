import { test, expect } from '@playwright/test';

test('navigation from home to shop', async ({ page }) => {
    // 1. Go to Home page
    await page.goto('/');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // 2. Click on the "쇼핑" (Shop) link in the navbar
    // Using text selector which is often more robust for simple links
    await page.click('text=쇼핑');

    // 3. Verify URL changes to /shop
    await expect(page).toHaveURL(/.*\/shop/);

    // 4. Verify that the shop page content loads
    await expect(page.getByRole('heading', { name: 'Collection' })).toBeVisible();
});

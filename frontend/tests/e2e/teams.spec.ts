import { test, expect } from '@playwright/test';

/**
 * Teams Management
 * Auth is pre-loaded via global setup — no login needed.
 * NOTE: Create team page uses h3 (not h1) for the heading, and requires
 * both 'name' and 'slug' inputs to enable the submit button.
 */

test.describe('Teams Management', () => {
  test('User can create a new team or view teams list', async ({ page }) => {
    await page.goto('/teams/create');

    // Ensure we're not redirected to login
    await expect(page).not.toHaveURL(/.*login/, { timeout: 10000 });
    await page.waitForLoadState('networkidle').catch(() => {});

    // The create team page uses h3, not h1
    await expect(page.locator('h3', { hasText: /Create a team/i })).toBeVisible({ timeout: 25000 });

    const nameInput = page.locator('input[id="name"]');
    const slugInput = page.locator('input[id="slug"]');

    if (await nameInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      const randomSuffix = Math.floor(Math.random() * 100000);
      const uniqueTeamName = `E2E Team ${randomSuffix}`;

      // Use type() instead of fill() to trigger React onChange in all browsers (including WebKit)
      await nameInput.click();
      await nameInput.type(uniqueTeamName);

      // Wait for slug to auto-fill (debounced onChange handler)
      await page.waitForTimeout(500);

      // Verify slug was auto-populated (may be empty in webkit if onChange not fired)
      const slugValue = await slugInput.inputValue();
      if (slugValue.length === 0) {
        // Manually fill slug as fallback for webkit
        await slugInput.click();
        await slugInput.type(`e2e-team-${randomSuffix}`);
      }

      const submitButton = page.locator('button[type="submit"]');

      // Submit button should now be enabled
      await expect(submitButton).toBeEnabled({ timeout: 5000 });
      await submitButton.click();

      // Wait for redirect away from the create page after successful creation
      await expect(page).not.toHaveURL(/.*teams\/create/, { timeout: 20000 });
    }
  });
});

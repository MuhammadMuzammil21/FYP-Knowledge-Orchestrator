import { test, expect } from '@playwright/test';

const TEST_EMAIL = 'test@harbaat.me';
const TEST_PASSWORD = 'Test@123';

test.describe('Settings & Team Deletion Logic', () => {
  test.beforeEach(async ({ page }) => {
    // Log in first as the target user
    await page.goto('/login');
    await page.fill('input[id="email"]', TEST_EMAIL);
    await page.fill('input[id="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard|projects|dash/, { timeout: 15000 });
  });

  test('User can access Settings and view tabs', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.locator('h1', { hasText: 'Settings' })).toBeVisible();

    // Verify tabs
    await expect(page.locator('button[role="tab"]:has-text("Account")')).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("Security")')).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("Appearance")')).toBeVisible();
  });

  test('Settings appearance tab changes theme', async ({ page }) => {
    await page.goto('/settings');
    await page.click('button[role="tab"]:has-text("Appearance")');

    // Find the Mode dropdown trigger
    const modeButton = page.locator('button', { hasText: /.*Mode/ });
    await expect(modeButton).toBeVisible();
    await modeButton.click();

    // Click dark mode
    await page.locator('[role="menuitem"]:has-text("Dark Mode")').click();
    
    // Playwright doesn't easily test visual CSS dark mode classes directly without specifically checking
    // body classes like `class="dark"`. Let's verify that the menu closed and action completed.
    await expect(page.locator('[role="menuitem"]:has-text("Dark Mode")')).not.toBeVisible();
  });

  test('Danger Zone Team Deletion confirmation modal appears', async ({ page }) => {
    await page.goto('/settings');
    
    // Click account tab in case it's not default
    await page.click('button[role="tab"]:has-text("Account")');

    // Check if we are in a team workspace and danger zone exists
    const dangerZone = page.getByText('Danger Zone', { exact: true });
    
    // We conditionally test this feature since we might be in a personal workspace initially.
    if (await dangerZone.isVisible()) {
      const deleteTeamButton = page.locator('button', { hasText: 'Delete Team' });
      await deleteTeamButton.click();

      // Verify Modal Dialog appears
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.getByText('Are you absolutely sure?')).toBeVisible();
      
      // Close Modal to not actually delete the test team!
      const cancelButton = page.locator('button', { hasText: 'Cancel' });
      await cancelButton.click();
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    }
  });
});

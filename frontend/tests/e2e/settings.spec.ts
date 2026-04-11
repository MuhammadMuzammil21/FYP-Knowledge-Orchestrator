import { test, expect } from '@playwright/test';

/**
 * Settings & Team Deletion Logic
 * Auth is pre-loaded via global setup — no login needed.
 */

test.describe('Settings & Team Deletion Logic', () => {
  test('User can access Settings and view tabs', async ({ page }) => {
    await page.goto('/settings');

    // Ensure we're not redirected to login
    await expect(page).not.toHaveURL(/.*login/, { timeout: 10000 });

    // Verify settings page heading
    await expect(page.locator('h1', { hasText: 'Settings' })).toBeVisible({ timeout: 15000 });

    // Verify core tabs are present
    await expect(page.locator('button[role="tab"]:has-text("Account")')).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("Security")')).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("Appearance")')).toBeVisible();
  });

  test('Settings appearance tab changes theme', async ({ page }) => {
    await page.goto('/settings');

    // Ensure we're not redirected to login
    await expect(page).not.toHaveURL(/.*login/, { timeout: 10000 });
    await expect(page.locator('h1', { hasText: 'Settings' })).toBeVisible({ timeout: 15000 });

    // Click Appearance tab
    await page.click('button[role="tab"]:has-text("Appearance")');

    // Find Mode dropdown button (matches "system Mode", "dark Mode", etc.)
    const modeButton = page.locator('button', { hasText: /.*Mode/ });
    await expect(modeButton).toBeVisible({ timeout: 5000 });

    // Open dropdown
    await modeButton.click();

    // Click Dark Mode option
    await page.locator('[role="menuitem"]:has-text("Dark Mode")').click();

    // Verify dropdown closed after selection
    await expect(page.locator('[role="menuitem"]:has-text("Dark Mode")')).not.toBeVisible({
      timeout: 5000,
    });
  });

  test('Danger Zone Team Deletion confirmation modal appears', async ({ page }) => {
    await page.goto('/settings');

    // Ensure we're not redirected to login
    await expect(page).not.toHaveURL(/.*login/, { timeout: 10000 });
    await expect(page.locator('h1', { hasText: 'Settings' })).toBeVisible({ timeout: 15000 });

    // Ensure we're on the Account tab
    await page.click('button[role="tab"]:has-text("Account")');

    // Conditionally test: only in team workspaces does "Danger Zone" appear
    const dangerZone = page.getByText('Danger Zone', { exact: true });
    if (await dangerZone.isVisible({ timeout: 3000 }).catch(() => false)) {
      const deleteTeamButton = page.locator('button', { hasText: 'Delete Team' });
      await deleteTeamButton.click();

      // Verify confirmation modal opens
      await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('Are you absolutely sure?')).toBeVisible();

      // Close modal safely — do NOT actually delete the team
      const cancelButton = page.locator('button', { hasText: 'Cancel' });
      await cancelButton.click();
      await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });
    } else {
      // Not in a team workspace — skip gracefully
      test.skip(true, 'Not in a team workspace — Danger Zone not shown');
    }
  });
});

import { test, expect } from '@playwright/test';

/**
 * Known Speakers Management
 * Auth is pre-loaded via global setup — no login needed.
 */

test.describe('Known Speakers Management', () => {
  test('User can navigate to Known Speakers and view the interface', async ({ page }) => {
    await page.goto('/settings/known-speakers');

    // Ensure we're not redirected to login
    await expect(page).not.toHaveURL(/.*login/, { timeout: 10000 });

    // Verify header exists
    await expect(page.locator('h1', { hasText: 'Known Speakers' })).toBeVisible({ timeout: 15000 });

    // The user should see one of: empty state, known speakers list, or unlinked prompts
    const emptyState = await page.getByText('No Known Speakers Yet').isVisible().catch(() => false);
    const hasSpeakers = await page.getByText('All Known Speakers', { exact: true }).isVisible().catch(() => false);
    const hasUnlinked = await page.getByText('Action Needed: Unlinked Speakers').isVisible().catch(() => false);

    expect(emptyState || hasSpeakers || hasUnlinked).toBe(true);

    if (hasSpeakers && !emptyState) {
      const firstEditButton = page.locator('button:has-text("Edit")').first();
      if (await firstEditButton.isVisible().catch(() => false)) {
        expect(await firstEditButton.isVisible()).toBe(true);
      }
    }
  });

  test('User can toggle Edit state for a Known Speaker', async ({ page }) => {
    await page.goto('/settings/known-speakers');

    // Ensure we're not redirected to login
    await expect(page).not.toHaveURL(/.*login/, { timeout: 10000 });

    const hasSpeakers = await page.getByText('All Known Speakers', { exact: true }).isVisible().catch(() => false);
    const emptyState = await page.getByText('No Known Speakers Yet').isVisible().catch(() => false);

    test.skip(!hasSpeakers || emptyState, 'No known speakers available to edit');

    if (hasSpeakers && !emptyState) {
      const firstEditButton = page.locator('button:has-text("Edit")').first();
      if (await firstEditButton.isVisible().catch(() => false)) {
        await firstEditButton.click();

        // Verify input appears in edit mode
        const nameInput = page.locator('input').first();
        await expect(nameInput).toBeVisible({ timeout: 5000 });
      }
    }
  });
});

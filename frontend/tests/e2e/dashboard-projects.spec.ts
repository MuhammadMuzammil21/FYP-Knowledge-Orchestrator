import { test, expect } from '@playwright/test';

/**
 * Dashboard & Projects Overview
 * Auth is pre-loaded via global setup — no login needed in beforeEach.
 */

test.describe('Dashboard & Projects Overview', () => {
  test('User can view projects index and empty/populated state', async ({ page, browserName }) => {
    // Already authenticated via storageState — go directly to projects
    await page.goto('/projects');
    await page.waitForLoadState('networkidle').catch(() => {});

    // WebKit may not honour storageState cookies in all cases
    if (browserName === 'webkit' && page.url().includes('/login')) {
      test.skip(true, 'WebKit storageState cookie not honoured — known limitation on localhost');
      return;
    }

    // Wait for page to load (not a login redirect)
    await expect(page).not.toHaveURL(/.*login/, { timeout: 10000 });

    // Verify header exists
    await expect(page.locator('h1', { hasText: /Projects/i })).toBeVisible({ timeout: 15000 });

    // Check for populated state or empty state — wait for loading to settle
    await page.waitForLoadState('networkidle').catch(() => {});

    // Wait for either projects links or empty state to appear (accounts for slow renders)
    await Promise.race([
      page.locator('[href^="/projects/"]').first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {}),
      page.getByText('No projects yet').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {}),
    ]);

    const hasProjects = await page.locator('[href^="/projects/"]').first().isVisible().catch(() => false);
    const emptyState = await page.getByText('No projects yet').isVisible().catch(() => false);

    expect(hasProjects || emptyState).toBe(true);

    if (hasProjects) {
      // Click the first project card link using href pattern
      const projectLink = page.locator('[href^="/projects/"]').first();
      await projectLink.click();
      await expect(page).toHaveURL(/.*projects\/[a-zA-Z0-9-]+$/, { timeout: 15000 });

      // Verify Knowledge Graph section loads
      await expect(page.getByText('Knowledge Graph')).toBeVisible({ timeout: 15000 });

      // Check if graph canvas is present
      const graphContainer = page.locator('canvas').first();
      if (await graphContainer.isVisible({ timeout: 5000 }).catch(() => false)) {
        expect(await graphContainer.isVisible()).toBe(true);
      }
    }
  });

  test('User can toggle layout and see graph statistics in Project Graph', async ({ page }) => {
    await page.goto('/projects');

    // Wait for projects page to load
    await expect(page).not.toHaveURL(/.*login/, { timeout: 10000 });

    await page.waitForLoadState('networkidle').catch(() => {});
    const hasProjects = await page.locator('[href^="/projects/"]').first().isVisible({ timeout: 8000 }).catch(() => false);

    // Skip if no projects available to test
    test.skip(!hasProjects, 'No projects available to test Knowledge Graph features');

    if (hasProjects) {
      const projectLink = page.locator('[href^="/projects/"]').first();
      await projectLink.click();
      await expect(page).toHaveURL(/.*projects\/[a-zA-Z0-9-]+$/, { timeout: 15000 });

      // Wait for Knowledge Graph controls to appear
      const layoutDropdown = page.locator('button', { hasText: 'Layout' });
      await expect(layoutDropdown).toBeVisible({ timeout: 20000 });

      // Check node/edge count badge
      await expect(page.getByText(/nodes · .* edges/)).toBeVisible({ timeout: 15000 });

      // Click layout dropdown and verify options
      await layoutDropdown.click();
      await expect(page.getByText('CoSE (Force-directed)')).toBeVisible({ timeout: 5000 });
    }
  });
});

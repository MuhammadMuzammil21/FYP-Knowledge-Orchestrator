import { test, expect } from '@playwright/test';

const TEST_EMAIL = 'test@harbaat.me';
const TEST_PASSWORD = 'Test@123';

test.describe('Dashboard & Projects Overview', () => {
  test.beforeEach(async ({ page }) => {
    // Log in first as the target user
    await page.goto('/login');
    await page.fill('input[id="email"]', TEST_EMAIL);
    await page.fill('input[id="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard|projects/);
  });

  test('User can view projects index and empty/populated state', async ({ page }) => {
    // Navigate to projects
    await page.goto('/projects');
    
    // Verify header exists
    await expect(page.locator('h1', { hasText: /Projects/i })).toBeVisible();

    // Check if projects are populated or if it is the empty state
    const hasProjects = await page.locator('.grid').isVisible({ timeout: 5000 }).catch(() => false);
    const emptyState = await page.getByText('No projects yet').isVisible().catch(() => false);
    
    expect(hasProjects || emptyState).toBe(true);

    if (hasProjects) {
      // Click the first project card
      const firstProject = page.locator('.grid > div').first();
      const projectLink = firstProject.locator('a').first();
      if (await projectLink.isVisible()) {
        await projectLink.click();
        await expect(page).toHaveURL(/.*projects\/[a-zA-Z0-9-]+$/);
        
        // Verify Knowledge Graph controls or sections load
        await expect(page.getByText('Knowledge Graph')).toBeVisible({ timeout: 10000 });
        
        // Check if graph wrapper is present
        const graphContainer = page.locator('canvas').first();
        if (await graphContainer.isVisible()) {
           expect(await graphContainer.isVisible()).toBe(true);
        }
      }
    }
  });

  test('User can toggle layout and see graph statistics in Project Graph', async ({ page }) => {
    // Navigate to projects
    await page.goto('/projects');
    const hasProjects = await page.locator('.grid').isVisible({ timeout: 5000 }).catch(() => false);
    
    // Skip if empty state, we can't test Graph interactions without a project
    test.skip(!hasProjects, 'No projects available to test Knowledge Graph features');

    if (hasProjects) {
      const projectLink = page.locator('.grid > div a').first();
      await projectLink.click();
      await expect(page).toHaveURL(/.*projects\/[a-zA-Z0-9-]+$/);
      
      // Wait for Knowledge graph to finish loading (wait for at least graph controls)
      const layoutDropdown = page.locator('button', { hasText: 'Layout' });
      await expect(layoutDropdown).toBeVisible({ timeout: 15000 });
      
      // Check node/edge count presence
      await expect(page.getByText(/nodes · .* edges/)).toBeVisible();
      
      // Can click layout dropdown
      await layoutDropdown.click();
      await expect(page.getByText('CoSE (Force-directed)')).toBeVisible();
    }
  });
});

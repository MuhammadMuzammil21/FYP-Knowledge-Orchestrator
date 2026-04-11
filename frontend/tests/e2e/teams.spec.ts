import { test, expect } from '@playwright/test';

const TEST_EMAIL = 'test@harbaat.me';
const TEST_PASSWORD = 'Test@123';

test.describe('Teams Management', () => {
  test.beforeEach(async ({ page }) => {
    // Log in first as the target user
    await page.goto('/login');
    await page.fill('input[id="email"]', TEST_EMAIL);
    await page.fill('input[id="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard|projects|dash/, { timeout: 15000 });
  });

  test('User can create a new team or view teams list', async ({ page }) => {
    // Assuming there's a way to go to teams index or create team
    // We will navigate to the create team directly to verify the page loads
    await page.goto('/teams/create');
    
    // Check if the create team form is present
    await expect(page.locator('h1', { hasText: /Create/i })).toBeVisible({ timeout: 10000 });
    
    const nameInput = page.locator('input[id="name"], input[name="name"]');
    if (await nameInput.isVisible()) {
        const uniqueTeamName = `E2E Team ${Math.floor(Math.random() * 10000)}`;
        await nameInput.fill(uniqueTeamName);
        
        const submitButton = page.locator('button[type="submit"]');
        await submitButton.click();
        
        // Wait for potential redirection after creation, such as to /dash or /teams
        await expect(page).not.toHaveURL(/.*teams\/create/);
    }
  });
});

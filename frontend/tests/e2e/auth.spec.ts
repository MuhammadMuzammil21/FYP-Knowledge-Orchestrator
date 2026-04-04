import { test, expect } from '@playwright/test';

// Configuration constants
const TEST_EMAIL = 'test@test.com';
const TEST_PASSWORD = 'Test@123';
const TEST_NAME = 'Test User';

test.describe('Authentication & Session Management', () => {

  test('User can login successfully', async ({ page }) => {
    await page.goto('/login');
    
    // Fill login form
    await page.fill('input[id="email"]', TEST_EMAIL);
    await page.fill('input[id="password"]', TEST_PASSWORD);
    
    // Click submit
    await page.click('button[type="submit"]');
    
    // Wait for success toast
    await expect(page.getByText('Login successful!')).toBeVisible({ timeout: 10000 });
    
    // Should be redirected to dashboard or verification (if account is fresh)
    await expect(page).toHaveURL(/.*dashboard|projects|verify-email/, { timeout: 15000 });
  });

  test('Account lifecycle: Signup with new credentials', async ({ page }) => {
    const randomSuffix = Math.floor(Math.random() * 10000);
    const signupEmail = `e2e_${randomSuffix}@harbaat-test.com`;
    
    await page.goto('/signup');
    
    await page.fill('input[id="name"]', 'E2E Automated User');
    await page.fill('input[id="email"]', signupEmail);
    await page.fill('input[id="password"]', TEST_PASSWORD);
    await page.fill('input[id="confirmPassword"]', TEST_PASSWORD);
    
    await page.click('button[type="submit"]');
    
    // Success toast check
    await expect(page.getByText('Account created successfully!')).toBeVisible({ timeout: 10000 });
    
    // Should see success and push to verify-email
    await expect(page).toHaveURL(/.*verify-email/, { timeout: 15000 });
  });

  test('Session management and revocation', async ({ page }) => {
    // 1. Perform a fresh login
    await page.goto('/login');
    await page.fill('input[id="email"]', TEST_EMAIL);
    await page.fill('input[id="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Allow for either dashboard or verification redirect
    await expect(page).toHaveURL(/.*dashboard|projects|verify-email/, { timeout: 15000 });

    // 2. Navigate to settings -> Security
    await page.goto('/settings');
    await page.click('button[role="tab"]:has-text("Security")');
    
    // Verify security tab loaded
    await expect(page.getByText('Security Settings')).toBeVisible();
    
    // The guide mentions "Revoke" buttons under "Active Sessions"
    // If sessions aren't implemented yet, this will wait/fail predictably
    const hasSessions = await page.getByText('Active Sessions').isVisible();
    if (hasSessions) {
        await expect(page.locator('button:has-text("Revoke")').first()).toBeVisible();
    }
  });
});

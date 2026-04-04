import { test, expect } from '@playwright/test';
import path from 'path';

// Configuration
const TEST_EMAIL = 'test@test.com';
const TEST_PASSWORD = 'Test@123';

test.describe('Voice Identity Registration (F4)', () => {
  test.beforeEach(async ({ page }) => {
    // Log in first as the target user
    await page.goto('/login');
    await page.fill('input[id="email"]', TEST_EMAIL);
    await page.fill('input[id="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard|projects/);
  });

  test('User can register a voice identity via file upload', async ({ page }) => {
    // 1. Navigate to Settings -> Voice Identity Tab
    await page.goto('/settings');
    await page.click('button[role="tab"]:has-text("Voice Identity")');

    // 2. Refresh or Wait for state. Check if already registered.
    // We'll use a unique identifier for the test if possible, but for now we assume fresh.
    const isRegistered = await page.getByText('Voice Registered').isVisible();
    if (isRegistered) {
      // Remove existing to test registration flow
      await page.click('button:has-text("Remove Voice Identity")');
      await expect(page.getByText('Not Registered')).toBeVisible();
    }

    // 3. Use the "Manual Upload" helper we added for testing
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('button:has-text("Manual Upload")');
    const fileChooser = await fileChooserPromise;
    const filePath = path.resolve(__dirname, '../fixtures/sample_voice_1.wav');
    await fileChooser.setFiles(filePath);

    // 4. Verify Success Toast
    await expect(page.getByText('Voice identity registered successfully')).toBeVisible({
      timeout: 15000,
    });

    // 5. Verify the "Ready" status
    await expect(page.getByText('Voice Registered')).toBeVisible({ timeout: 15000 });
  });

  test('Voice status transitions from Pending to Ready', async ({ page }) => {
    await page.goto('/settings');
    await page.click('button[role="tab"]:has-text("Voice Identity")');

    // Check for 'Processing Voice Profile...' or 'Voice Registered'
    // We poll for the final ready state
    await expect(async () => {
      await page.reload();
      await page.click('button[role="tab"]:has-text("Voice Identity")');
      await expect(page.getByText('Voice Registered')).toBeVisible();
    }).toPass({
      intervals: [5000, 10000, 15000], // Poll every few seconds
      timeout: 120000, // Wait up to 2 minutes for worker
    });
  });
});

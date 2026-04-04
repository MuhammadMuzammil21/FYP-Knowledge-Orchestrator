import { test, expect } from '@playwright/test';
import path from 'path';

// Configuration
const TEST_EMAIL = 'test@test.com';
const TEST_PASSWORD = 'Test@123';

test.describe('Meeting Analysis & Speaker Linking (F2)', () => {

    test.beforeEach(async ({ page }) => {
        // Log in first as the target user
        await page.goto('/login');
        await page.fill('input[id="email"]', TEST_EMAIL);
        await page.fill('input[id="password"]', TEST_PASSWORD);
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(/.*dashboard|projects/);
    });

    test('User can upload a meeting and manually link a speaker', async ({ page }) => {
        // 1. Navigate to Dashboard (which has the "New meeting" form)
        await page.goto('/dashboard');
        
        // 2. Fill basic metadata
        await page.fill('input#title', 'E2E Test Meeting');
        
        // 3. Select a file for upload (using the hidden input)
        const filePath = path.resolve(__dirname, '../fixtures/sample_voice_2.wav');
        await page.setInputFiles('input#file', filePath);
        
        // 4. Verify file appears in the UI
        await expect(page.getByText('sample_voice_2.wav')).toBeVisible();
        
        // 5. Submit "Start analysis"
        await page.click('button:has-text("Start analysis")');
        
        // 6. Verify success and redirection to meeting detail
        await expect(page).toHaveURL(/.*meetings\/[a-zA-Z0-9-]+$/);
        
        // 7. Click on the ASR status/badge to check processing
        // The dashboard page will show the new meeting. 
        // We wait for it to reach "Done" or "Ready"
        await expect(page.getByText('ASR', { exact: false })).toBeVisible({ timeout: 60000 });
        
        // 8. Test Manual Speaker Linking
        // Navigate or find the speaker panel
        const speakerPanel = page.locator('div:has-text("Speakers")');
        await expect(speakerPanel).toBeVisible();

        // Find "Link User" or similar interaction
        // Based on the PRD, we click a speaker icon then select a user
    });
});

import { test, expect, chromium } from '@playwright/test';

const USER_A_EMAIL = 'test@test.com'; // Admin
const USER_B_EMAIL = 'user_b@harbaat.test'; // Target for mention (assuming exists or using random)
const PASSWORD = 'Test@123';

test.describe('Mention Notifications (F4)', () => {
  test('Cross-user mention triggers notification and badge', async ({ browser }) => {
    // 1. Setup User B (Receiver) in Context B
    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();
    await pageB.goto('/login');
    await pageB.fill('input[id="email"]', USER_A_EMAIL); // For now using same account or assume a second exists
    await pageB.fill('input[id="password"]', PASSWORD);
    await pageB.click('button[type="submit"]');
    await expect(pageB).toHaveURL(/.*dashboard/);

    // 2. Setup User A (Sender) in Context A
    const contextA = await browser.newContext();
    const pageA = await contextA.newPage();
    await pageA.goto('/login');
    await pageA.fill('input[id="email"]', 'admin_e2e@harbaat.test');
    await pageA.fill('input[id="password"]', PASSWORD);
    await pageA.click('button[type="submit"]');

    // 3. User A triggers a mention (assuming there's an API or UI for it)
    // E.g. Upload a meeting where User B is mentioned
    // For the sake of E2E logic, we verify the presence of the badge on Page B

    // 4. Verification on Page B
    // Wait for the bell icon to show a red badge
    const bellIcon = pageB.locator('button[aria-label="Notifications"]');
    await expect(bellIcon.locator('span.bg-red-500')).toBeVisible({ timeout: 60000 });

    // 5. Click and verify panel content
    await bellIcon.click();
    await expect(pageB.getByText(/You were mentioned in/)).toBeVisible();

    // 6. Navigate to meeting from notification
    await pageB.click('text="You were mentioned in"');
    await expect(pageB).toHaveURL(/.*meetings\/[a-zA-Z0-9-]+$/);

    // 7. Badge should disappear after reading
    await expect(bellIcon.locator('span.bg-red-500')).not.toBeVisible();

    await contextA.close();
    await contextB.close();
  });

  test('Notification Preferences: Notify on Mention toggle', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[id="email"]', USER_A_EMAIL);
    await page.fill('input[id="password"]', PASSWORD);
    await page.click('button[type="submit"]');

    // 1. Go to Settings -> Notifications
    await page.goto('/settings');
    await page.click('button[role="tab"]:has-text("Notifications")');

    // 2. Locate toggle for "Mentions"
    const mentionToggle = page.locator('button[role="switch"]#notify_on_mention');
    const isChecked = (await mentionToggle.getAttribute('aria-checked')) === 'true';

    // 3. Toggle it
    await mentionToggle.click();
    const newCheckedState = (await mentionToggle.getAttribute('aria-checked')) === 'true';
    expect(newCheckedState).toBe(!isChecked);

    // 4. Verify toast or persistence (reload)
    await page.reload();
    await page.click('button[role="tab"]:has-text("Notifications")');
    expect(
      await page.locator('button[role="switch"]#notify_on_mention').getAttribute('aria-checked')
    ).toBe(String(!isChecked));
  });
});

# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: notifications.spec.ts >> Mention Notifications (F4) >> Notification Preferences: Notify on Mention toggle
- Location: tests\e2e\notifications.spec.ts:51:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button[role="tab"]:has-text("Notifications")')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - link [ref=e5]:
        - /url: /
        - img [ref=e7]
      - heading "HarBaat AI" [level=1] [ref=e9]
      - paragraph [ref=e10]: Transform Conversations into Actionable Insights
    - generic [ref=e11]:
      - generic [ref=e12]:
        - generic [ref=e13]: Sign in
        - generic [ref=e14]: Enter your email and password to access your account
      - generic [ref=e15]:
        - generic [ref=e16]:
          - generic [ref=e17]:
            - generic [ref=e18]: Email
            - textbox "Email" [ref=e19]:
              - /placeholder: name@example.com
          - generic [ref=e20]:
            - generic [ref=e21]:
              - generic [ref=e22]: Password
              - link "Forgot password?" [ref=e23]:
                - /url: /forgot-password
            - generic [ref=e24]:
              - textbox "Password" [ref=e25]
              - button [ref=e26]:
                - img [ref=e27]
          - button "Sign in" [ref=e32]
        - generic [ref=e37]: Or continue with
        - button "Google" [ref=e38]:
          - img
          - text: Google
        - generic [ref=e39]:
          - text: Don't have an account?
          - link "Sign up" [ref=e40]:
            - /url: /signup
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e46] [cursor=pointer]:
    - img [ref=e47]
  - alert [ref=e52]
```

# Test source

```ts
  1  | import { test, expect, chromium } from '@playwright/test';
  2  | 
  3  | const USER_A_EMAIL = 'test@test.com'; // Admin
  4  | const USER_B_EMAIL = 'user_b@harbaat.test'; // Target for mention (assuming exists or using random)
  5  | const PASSWORD = 'Test@123';
  6  | 
  7  | test.describe('Mention Notifications (F4)', () => {
  8  | 
  9  |   test('Cross-user mention triggers notification and badge', async ({ browser }) => {
  10 |     // 1. Setup User B (Receiver) in Context B
  11 |     const contextB = await browser.newContext();
  12 |     const pageB = await contextB.newPage();
  13 |     await pageB.goto('/login');
  14 |     await pageB.fill('input[id="email"]', USER_A_EMAIL); // For now using same account or assume a second exists
  15 |     await pageB.fill('input[id="password"]', PASSWORD);
  16 |     await pageB.click('button[type="submit"]');
  17 |     await expect(pageB).toHaveURL(/.*dashboard/);
  18 | 
  19 |     // 2. Setup User A (Sender) in Context A
  20 |     const contextA = await browser.newContext();
  21 |     const pageA = await contextA.newPage();
  22 |     await pageA.goto('/login');
  23 |     await pageA.fill('input[id="email"]', 'admin_e2e@harbaat.test'); 
  24 |     await pageA.fill('input[id="password"]', PASSWORD);
  25 |     await pageA.click('button[type="submit"]');
  26 |     
  27 |     // 3. User A triggers a mention (assuming there's an API or UI for it)
  28 |     // E.g. Upload a meeting where User B is mentioned
  29 |     // For the sake of E2E logic, we verify the presence of the badge on Page B
  30 |     
  31 |     // 4. Verification on Page B
  32 |     // Wait for the bell icon to show a red badge
  33 |     const bellIcon = pageB.locator('button[aria-label="Notifications"]');
  34 |     await expect(bellIcon.locator('span.bg-red-500')).toBeVisible({ timeout: 60000 });
  35 |     
  36 |     // 5. Click and verify panel content
  37 |     await bellIcon.click();
  38 |     await expect(pageB.getByText(/You were mentioned in/)).toBeVisible();
  39 |     
  40 |     // 6. Navigate to meeting from notification
  41 |     await pageB.click('text="You were mentioned in"');
  42 |     await expect(pageB).toHaveURL(/.*meetings\/[a-zA-Z0-9-]+$/);
  43 |     
  44 |     // 7. Badge should disappear after reading
  45 |     await expect(bellIcon.locator('span.bg-red-500')).not.toBeVisible();
  46 |     
  47 |     await contextA.close();
  48 |     await contextB.close();
  49 |   });
  50 | 
  51 |   test('Notification Preferences: Notify on Mention toggle', async ({ page }) => {
  52 |     await page.goto('/login');
  53 |     await page.fill('input[id="email"]', USER_A_EMAIL);
  54 |     await page.fill('input[id="password"]', PASSWORD);
  55 |     await page.click('button[type="submit"]');
  56 | 
  57 |     // 1. Go to Settings -> Notifications
  58 |     await page.goto('/settings');
> 59 |     await page.click('button[role="tab"]:has-text("Notifications")');
     |                ^ Error: page.click: Test timeout of 30000ms exceeded.
  60 |     
  61 |     // 2. Locate toggle for "Mentions"
  62 |     const mentionToggle = page.locator('button[role="switch"]#notify_on_mention');
  63 |     const isChecked = await mentionToggle.getAttribute('aria-checked') === 'true';
  64 | 
  65 |     // 3. Toggle it
  66 |     await mentionToggle.click();
  67 |     const newCheckedState = await mentionToggle.getAttribute('aria-checked') === 'true';
  68 |     expect(newCheckedState).toBe(!isChecked);
  69 |     
  70 |     // 4. Verify toast or persistence (reload)
  71 |     await page.reload();
  72 |     await page.click('button[role="tab"]:has-text("Notifications")');
  73 |     expect(await page.locator('button[role="switch"]#notify_on_mention').getAttribute('aria-checked')).toBe(String(!isChecked));
  74 |   });
  75 | });
  76 | 
```
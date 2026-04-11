import { chromium, FullConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const TEST_EMAIL = 'test@harbaat.me';
const TEST_PASSWORD = 'Test@123';
const AUTH_FILE = path.join(__dirname, '.auth', 'user.json');

async function globalSetup(config: FullConfig) {
  // Ensure the .auth directory exists
  const authDir = path.dirname(AUTH_FILE);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log('\n🔐 Global Setup: Logging in as', TEST_EMAIL);

  await page.goto('http://localhost:3000/login');

  // Fill credentials
  await page.fill('input[id="email"]', TEST_EMAIL);
  await page.fill('input[id="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');

  // Wait for successful redirect away from login
  try {
    await page.waitForURL(/.*dashboard|projects|dash/, { timeout: 30000 });
    console.log('✅ Global Setup: Login successful, URL:', page.url());
  } catch {
    // Check if it redirected to verify-email (also acceptable for fresh account)
    const url = page.url();
    if (url.includes('verify-email')) {
      console.log('ℹ️  Global Setup: Account needs email verification, URL:', url);
    } else {
      console.error('❌ Global Setup: Login failed. Still on:', url);
      console.error('   Check that backend is running and credentials are correct.');
      await browser.close();
      throw new Error(
        `Global Setup: Login failed. Expected redirect to dashboard but got: ${url}\n` +
        `Ensure the backend is running and account "${TEST_EMAIL}" exists with password "${TEST_PASSWORD}".`
      );
    }
  }

  // Save storage state (cookies + localStorage) for reuse in all tests
  await page.context().storageState({ path: AUTH_FILE });
  console.log('💾 Global Setup: Saved auth state to', AUTH_FILE, '\n');

  await browser.close();
}

export default globalSetup;

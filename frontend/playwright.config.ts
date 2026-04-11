import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import os from 'os';

const AUTH_FILE = path.join(__dirname, 'tests', '.auth', 'user.json');

// WebKit is not supported on Windows — only include it on macOS/Linux
const isWindows = os.platform() === 'win32';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',

  /* Global setup: logs in once and saves auth state */
  globalSetup: './tests/global-setup.ts',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',

  /* Default timeout for each test */
  timeout: 60000,

  /* Default expect timeout */
  expect: {
    timeout: 10000,
  },

  /* Shared settings for all the projects below. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Reuse saved authentication state for all tests */
    storageState: AUTH_FILE,

    /* Collect trace when retrying the failed test. */
    trace: 'on-first-retry',

    /* Take screenshots on failure */
    screenshot: 'only-on-failure',

    /* Take videos on failure */
    video: 'retain-on-failure',

    /* Navigation timeout */
    navigationTimeout: 30000,

    /* Action timeout */
    actionTimeout: 15000,
  },

  /* Configure projects for major browsers */
  projects: [
    /* Setup project — runs global-setup before anything else */
    {
      name: 'setup',
      testMatch: '**/*.setup.ts',
    },

    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: AUTH_FILE,
      },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: AUTH_FILE,
      },
    },

    // WebKit (Safari) is only supported on macOS and Linux — skip on Windows
    ...(!isWindows ? [{
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: AUTH_FILE,
        // WebKit needs explicit context options for localhost cookies
        contextOptions: {
          ignoreHTTPSErrors: true,
        },
      },
    }] : []),
  ],
});

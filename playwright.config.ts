import { defineConfig, devices } from '@playwright/test';
import { testConfig } from './config/testConfig';

export default defineConfig({
  testDir: './tests',
  timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  globalTeardown: require.resolve('./utils/allureTeardown'),
  reporter: [
    ['list'],
    ['allure-playwright', { resultsDirectory: 'allure-results', detail: true, suiteTitle: false }],
  ],
  use: {
    baseURL: testConfig.baseUrl,
    headless: testConfig.headless,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});

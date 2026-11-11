import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: 0,
  reporter: [['html', { outputFolder: 'playwright-report' }]],
  timeout: 50 * 1000,
  use: {
   
    headless: false,
    screenshot: 'only-on-failure',
    trace: 'on',
   
   
   
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

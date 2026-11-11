import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: 1,
  reporter: [['html', { outputFolder: 'playwright-report' }]],
  timeout: 50 * 1000,
  use: {

    headless: false,
    screenshot: 'only-on-failure',
    trace: 'on',



  },
  projects: [
    {
      name: 'chrome',
      use: {

        browserName: 'chromium',
        headless: false,
        ignoreHTTPSErrors:true,
        permissions:['geolocation'],
        video:'retain-on-failure',

        screenshot: 'on',
        trace: 'on',//off,on
      },
    },
    {
      name: 'webkitprofile',
      use: {

        browserName: 'webkit',
        headless: false,
        screenshot: 'on',
        viewport: { width: 720, height: 720 },
        trace: 'on',//off,on
        ...devices['iPhone 11']
      },
    }
  ],
});

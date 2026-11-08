const path = require('node:path');
const { defineConfig, devices } = require('@playwright/test');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '.env.qaqc') });

const baseURL = process.env.QAQC_BASE_URL || 'http://localhost:3000';
const browserPath = process.env.QAQC_BROWSER_PATH || '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';
const headless = String(process.env.QAQC_HEADLESS).toLowerCase() === 'true';

module.exports = defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [
    ['list'],
    [path.resolve(__dirname, 'reporters/console-table.js')],
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
  ],
  use: {
    baseURL,
    headless,
    viewport: { width: 1440, height: 1000 },
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'off'
  },
  projects: [
    {
      name: headless ? 'brave-headless' : 'brave-headed',
      use: { ...devices['Desktop Chrome'], launchOptions: { executablePath: browserPath }, headless }
    }
  ],
  webServer: process.env.QAQC_START_CMS === 'true'
    ? {
        command: 'npm start',
        cwd: path.resolve(__dirname, '..'),
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000
      }
    : undefined
});

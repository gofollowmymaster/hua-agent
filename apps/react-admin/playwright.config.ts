import { defineConfig, devices } from '@playwright/test';

const port = process.env.PLAYWRIGHT_PORT || '5175';
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  use: {
    baseURL,
    channel: 'chrome',
    trace: 'retain-on-failure',
  },
  webServer: {
    command:
      port === '5175'
        ? 'pnpm dev'
        : `pnpm exec dotenv -e .env.development -- cross-env PORT=${port} HOST=127.0.0.1 max dev`,
    url: `${baseURL}/`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'narrow', use: { viewport: { width: 768, height: 900 } } },
  ],
});

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Start servers before tests
  // NOTE: If tests fail with "Test endpoints not available", stop any existing
  // backend/frontend processes and let Playwright start fresh ones with JIRALOCAL_ENV=test
  webServer: [
    {
      command: 'uv run uvicorn app.main:app --host 127.0.0.1 --port 8000',
      url: 'http://127.0.0.1:8000/health',
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
      stderr: 'pipe',
      stdout: 'pipe',
      cwd: '../../backend',
      env: {
        ...process.env,
        JIRALOCAL_ENV: 'test',
      },
    },
    {
      command: 'npm run dev',
      url: 'http://127.0.0.1:5173/',
      stderr: 'pipe',
      stdout: 'pipe',
      timeout: 60 * 1000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});

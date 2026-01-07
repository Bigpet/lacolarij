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
  webServer: [
    {
      command: 'uv run uvicorn app.main:app --host 127.0.0.1 --port 8000',
      url: 'http://localhost:8000/health',
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
      stderr: "pipe",
      // stdout: "pipe",
      // port: 8000,
      cwd: '../../backend',
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:5173/',
      stderr: "pipe",
      // stdout: "pipe",
      // port: 5173,
      timeout: 60 * 1000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});

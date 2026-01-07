import { test, expect } from '../../fixtures/auth';
import { IndexedDBHelper } from '../../fixtures/indexedDB';

test.describe('Smoke Tests', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/');

    // Check that the page loads without errors
    await expect(page).toHaveTitle(/JiraLocal/);
  });

  test('should have empty IndexedDB on first load', async ({ page }) => {
    const indexedDb = new IndexedDBHelper(page);
    await page.goto('/');

    const issues = await indexedDb.getIssues();
    expect(issues.length).toBe(0);
  });

  test('should be able to go offline', async ({ page }) => {
    const indexedDb = new IndexedDBHelper(page);
    await page.goto('/');

    await indexedDb.setOfflineMode();

    // Verify offline mode is set
    const isOffline = await page.context().offline();
    expect(isOffline).toBe(true);

    // Clean up - go back online
    await indexedDb.setOnlineMode();
  });
});

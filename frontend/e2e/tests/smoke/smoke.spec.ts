import { test } from '../../fixtures/auth';
import { expect } from '@playwright/test';
import { IndexedDBHelper } from '../../fixtures/indexedDB';

test.describe('Smoke Tests', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/');

    // Check that the page loads without errors
    await expect(page).toHaveTitle(/LaColaRij/);
  });

  test('should be able to go offline', async ({ page }) => {
    const indexedDb = new IndexedDBHelper(page);
    await page.goto('/');

    await indexedDb.setOfflineMode();

    // Verify offline mode is set
    const isOffline = await indexedDb.isOffline();
    expect(isOffline).toBe(true);

    // Clean up - go back online
    await indexedDb.setOnlineMode();
  });
});

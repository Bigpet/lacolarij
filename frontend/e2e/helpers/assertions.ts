import { expect, Page } from '@playwright/test';

export class SyncAssertions {
  static async assertIssueSynced(page: Page, issueKey: string) {
    const status = await page.locator(`[data-issue-key="${issueKey}"]`)
      .getAttribute('data-sync-status');
    expect(status).toBe('synced');
  }

  static async assertIssuePending(page: Page, issueKey: string) {
    const status = await page.locator(`[data-issue-key="${issueKey}"]`)
      .getAttribute('data-sync-status');
    expect(status).toBe('pending');
  }

  static async assertConflictDetected(page: Page) {
    await expect(page.locator('[data-testid="conflict-banner"]')).toBeVisible();
  }

  static async assertOfflineBannerVisible(page: Page) {
    await expect(page.locator('[data-testid="offline-banner"]')).toBeVisible();
  }

  static async assertSyncStatus(page: Page, status: 'idle' | 'syncing' | 'error') {
    const className = await page.locator('[data-testid="sync-status"]')
      .getAttribute('class');
    expect(className).toContain(`status-${status}`);
  }
}

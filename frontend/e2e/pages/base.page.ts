import { Page, Locator } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly syncStatusBar: Locator;
  readonly offlineBanner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.syncStatusBar = page.locator('[data-testid="sync-status"]');
    this.offlineBanner = page.locator('[data-testid="offline-banner"]');
  }

  /**
   * Wait for sync to complete (status becomes idle)
   */
  async waitForSyncIdle() {
    // Wait for the sync status bar to show 'idle' status
    await this.page.waitForSelector(
      '[data-testid="sync-status"][data-sync-status="idle"]',
      { timeout: 15000 }
    );
  }

  /**
   * Wait for sync to complete with additional delay for UI update
   */
  async waitForSyncIdleWithUiUpdate() {
    await this.waitForSyncIdle();
    // Additional wait for the UI to re-render after sync
    await this.page.waitForTimeout(500);
  }

  async goto(url: string) {
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
  }
}

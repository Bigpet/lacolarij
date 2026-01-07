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

  async waitForSyncIdle() {
    await this.page.waitForFunction(
      () => document.querySelector('[data-sync-status="idle"]') !== null,
      { timeout: 10000 }
    );
  }

  async goto(url: string) {
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
  }
}

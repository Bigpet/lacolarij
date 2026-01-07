import { Page } from '@playwright/test';

export class IndexedDBHelper {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async getIssues(): Promise<any[]> {
    return this.page.evaluate(async () => {
      const db = (await import('../src/lib/db')).default;
      return await db.issues.toArray();
    });
  }

  async getPendingOperations(): Promise<any[]> {
    return this.page.evaluate(async () => {
      const db = (await import('../src/lib/db')).default;
      return await db.pendingOperations.toArray();
    });
  }

  async getSyncStatus(): Promise<string> {
    return this.page.evaluate(async () => {
      const db = (await import('../src/lib/db')).default;
      const meta = await db.syncMeta.get('last_sync');
      return meta?._syncStatus || 'unknown';
    });
  }

  async setOfflineMode() {
    await this.page.context().setOffline(true);
  }

  async setOnlineMode() {
    await this.page.context().setOffline(false);
  }

  async clearStorage() {
    await this.page.evaluate(() => {
      indexedDB.deleteDatabase('jiralocal');
      localStorage.clear();
      sessionStorage.clear();
    });
  }

    async isOffline(): Promise<boolean> {
    // Check offline status by trying to navigate to a non-existent resource
    // or checking the browser's navigator.onLine
    return this.page.evaluate(() => navigator.onLine === false);
  }

}

import { Page } from '@playwright/test';

/**
 * Helper for accessing IndexedDB directly during E2E tests.
 * Uses raw IndexedDB API instead of Dexie to avoid module import issues.
 */
export class IndexedDBHelper {
  private page: Page;
  private readonly DB_NAME = 'jiralocal';

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Get all issues from IndexedDB
   */
  async getIssues(): Promise<any[]> {
    return this.page.evaluate(async (dbName) => {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(['issues'], 'readonly');
          const store = transaction.objectStore('issues');
          const getAll = store.getAll();

          getAll.onsuccess = () => resolve(getAll.result);
          getAll.onerror = () => reject(getAll.error);

          transaction.oncomplete = () => db.close();
        };
      });
    }, this.DB_NAME);
  }

  /**
   * Get pending operations from IndexedDB
   */
  async getPendingOperations(): Promise<any[]> {
    return this.page.evaluate(async (dbName) => {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(['pendingOperations'], 'readonly');
          const store = transaction.objectStore('pendingOperations');
          const getAll = store.getAll();

          getAll.onsuccess = () => resolve(getAll.result);
          getAll.onerror = () => reject(getAll.error);

          transaction.oncomplete = () => db.close();
        };
      });
    }, this.DB_NAME);
  }

  /**
   * Get sync status from IndexedDB
   */
  async getSyncStatus(): Promise<string> {
    return this.page.evaluate(async (dbName) => {
      return new Promise<string>((resolve, reject) => {
        const request = indexedDB.open(dbName);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(['syncMeta'], 'readonly');
          const store = transaction.objectStore('syncMeta');
          const getRequest = store.get('last_sync');

          getRequest.onsuccess = () => {
            const meta = getRequest.result;
            resolve(meta?._syncStatus || 'unknown');
          };
          getRequest.onerror = () => reject(getRequest.error);

          transaction.oncomplete = () => db.close();
        };
      });
    }, this.DB_NAME);
  }

  /**
   * Set browser to offline mode
   */
  async setOfflineMode() {
    await this.page.context().setOffline(true);
  }

  /**
   * Set browser to online mode
   */
  async setOnlineMode() {
    await this.page.context().setOffline(false);
  }

  /**
   * Clear all storage (IndexedDB, localStorage, sessionStorage)
   */
  async clearStorage() {
    await this.page.evaluate((dbName) => {
      indexedDB.deleteDatabase(dbName);
      localStorage.clear();
      sessionStorage.clear();
    }, this.DB_NAME);
  }

  /**
   * Check if browser is offline
   */
  async isOffline(): Promise<boolean> {
    return this.page.evaluate(() => navigator.onLine === false);
  }

  /**
   * Wait for IndexedDB to be initialized and accessible
   */
  async waitForDbReady(): Promise<void> {
    await this.page.evaluate(async (dbName) => {
      return new Promise<void>((resolve, reject) => {
        const request = indexedDB.open(dbName);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          request.result.close();
          resolve();
        };
      });
    }, this.DB_NAME);
  }

  /**
   * Get issue by key from IndexedDB
   */
  async getIssueByKey(issueKey: string): Promise<any | undefined> {
    return this.page.evaluate(async (dbName: string, key: string) => {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(['issues'], 'readonly');
          const store = transaction.objectStore('issues');
          const index = store.index('key');
          const getRequest = index.get(key);

          getRequest.onsuccess = () => resolve(getRequest.result);
          getRequest.onerror = () => reject(getRequest.error);

          transaction.oncomplete = () => db.close();
        };
      });
    }, this.DB_NAME, issueKey);
  }

  /**
   * Wait for an issue to reach a specific sync status
   */
  async waitForIssueSyncStatus(issueKey: string, status: 'synced' | 'pending' | 'conflict', timeout = 10000): Promise<void> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const issue = await this.getIssueByKey(issueKey);
      if (issue && issue._syncStatus === status) {
        return;
      }
      await this.page.waitForTimeout(100);
    }
    throw new Error(`Issue ${issueKey} did not reach status ${status} within ${timeout}ms`);
  }
}

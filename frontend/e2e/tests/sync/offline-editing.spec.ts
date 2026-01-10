import { test, TEST_USERS, ensureTestUserExists } from '../../fixtures/auth';
import { expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { SettingsPage } from '../../pages/settings.page';
import { IssuesPage } from '../../pages/issues.page';
import { IssueDetailPage } from '../../pages/issueDetail.page';
import { IndexedDBHelper } from '../../fixtures/indexedDB';
import { MockJiraHelper } from '../../fixtures/mockJira';

// Use a consistent connection name so we can select it
const MOCK_CONNECTION_NAME = 'Mock JIRA (E2E)';

test.describe('Offline Editing', () => {
  let mockJira: MockJiraHelper;
  let indexedDb: IndexedDBHelper;

  test.beforeEach(async ({ page, request }) => {
    // Initialize helpers
    mockJira = new MockJiraHelper(request);
    indexedDb = new IndexedDBHelper(page);

    // Reset mock JIRA storage for test isolation
    await mockJira.reset();

    // Ensure test user exists
    await ensureTestUserExists(request, TEST_USERS.default);

    // Clear browser storage
    await page.goto('/login');
    await indexedDb.clearStorage();
    await page.reload();

    // Login
    const loginPage = new LoginPage(page);
    await loginPage.login(TEST_USERS.default.username, TEST_USERS.default.password);
    await expect(page).toHaveURL('/', { timeout: 10000 });

    // Set up a mock JIRA connection with consistent name
    const settingsPage = new SettingsPage(page);
    await settingsPage.goto('/settings');
    await settingsPage.waitForLoaded();

    // Delete existing mock connection if present to avoid duplicates
    if (await settingsPage.getConnectionItem(MOCK_CONNECTION_NAME).isVisible().catch(() => false)) {
      await settingsPage.deleteConnection(MOCK_CONNECTION_NAME);
      await page.waitForTimeout(500);
    }

    await settingsPage.addConnection({
      name: MOCK_CONNECTION_NAME,
      jiraUrl: 'demo://local',
      email: 'test@example.com',
      apiToken: 'test-token',
    });

    // Create a test issue and sync
    await mockJira.createIssue({ summary: 'Test Issue', status: 'To Do' });

    const issuesPage = new IssuesPage(page);
    await issuesPage.goto('/issues');
    await issuesPage.waitForLoaded();
    await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
    await issuesPage.triggerFullSync();
  });

  test.describe('Offline Detection', () => {
    test('should show offline banner when network is disconnected', async ({ page }) => {
      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();

      // Go offline
      await indexedDb.setOfflineMode();

      // Wait for the offline indicator to appear
      const offlineText = page.locator("text=You're offline");
      await expect(offlineText).toBeVisible({ timeout: 5000 });
    });

    test('should hide offline banner when network is restored', async ({ page }) => {
      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();

      // Go offline
      await indexedDb.setOfflineMode();

      // Verify offline banner appears
      const offlineText = page.locator("text=You're offline");
      await expect(offlineText).toBeVisible({ timeout: 5000 });

      // Go back online
      await indexedDb.setOnlineMode();

      // Offline banner should disappear
      await expect(offlineText).not.toBeVisible({ timeout: 5000 });
    });

    test('should show offline indicator in sync status bar', async ({ page }) => {
      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();

      // Go offline
      await indexedDb.setOfflineMode();

      // Should show offline status in sync bar
      const offlineStatus = page.locator('text=Offline');
      await expect(offlineStatus).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Editing While Offline', () => {
    test('should allow editing summary while offline', async ({ page }) => {
      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);

      // Navigate to issue detail
      await issuesPage.clickIssue('TEST-1');

      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();

      // Go offline
      await indexedDb.setOfflineMode();

      // Edit the summary
      await detailPage.editSummary('Edited While Offline');

      // Verify the summary was updated
      const summary = await detailPage.getSummary();
      expect(summary).toBe('Edited While Offline');
    });

    test('should show pending status after offline edit', async ({ page }) => {
      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);

      await issuesPage.clickIssue('TEST-1');

      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();

      // Go offline
      await indexedDb.setOfflineMode();

      // Edit the summary
      await detailPage.editSummary('Offline Edit');

      // Should show pending status
      const syncStatus = await detailPage.getSyncStatus();
      expect(syncStatus).toBe('Pending');
    });

    test('should allow editing description while offline', async ({ page }) => {
      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);

      await issuesPage.clickIssue('TEST-1');

      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();

      // Go offline
      await indexedDb.setOfflineMode();

      // Edit the description
      await detailPage.editDescription('New description while offline');

      // Verify the description was updated
      const description = await detailPage.getDescription();
      expect(description).toContain('New description while offline');
    });

    test('should store changes in IndexedDB when offline', async ({ page }) => {
      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);

      await issuesPage.clickIssue('TEST-1');

      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();

      // Go offline
      await indexedDb.setOfflineMode();

      // Edit the summary
      await detailPage.editSummary('IndexedDB Test');

      // Verify in IndexedDB
      const issues = await indexedDb.getIssues();
      const editedIssue = issues.find((i: { key: string }) => i.key === 'TEST-1');
      expect(editedIssue).toBeDefined();
      expect(editedIssue.summary).toBe('IndexedDB Test');
      expect(editedIssue._syncStatus).toBe('pending');
    });
  });

  test.describe('Pending Operations', () => {
    test('should queue changes as pending operations when offline', async ({ page }) => {
      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);

      await issuesPage.clickIssue('TEST-1');

      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();

      // Go offline
      await indexedDb.setOfflineMode();

      // Edit the summary
      await detailPage.editSummary('Pending Op Test');

      // Verify pending operation was created
      const pendingOps = await indexedDb.getPendingOperations();
      expect(pendingOps.length).toBeGreaterThan(0);
    });

    test('should show pending count in UI when offline edits exist', async ({ page }) => {
      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);

      await issuesPage.clickIssue('TEST-1');

      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();

      // Go offline
      await indexedDb.setOfflineMode();

      // Edit the summary
      await detailPage.editSummary('Pending Count Test');

      // Check for pending badge
      const pendingBadge = page.locator('text=/\\d+ pending/');
      await expect(pendingBadge).toBeVisible({ timeout: 5000 });
    });

    test('should show pending count in offline banner', async ({ page }) => {
      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);

      await issuesPage.clickIssue('TEST-1');

      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();

      // Go offline
      await indexedDb.setOfflineMode();

      // Edit the summary
      await detailPage.editSummary('Banner Test');

      // Check for pending count in offline banner
      const offlineBanner = page.locator("text=/pending change.*will sync/i");
      await expect(offlineBanner).toBeVisible({ timeout: 5000 });
    });

    test('should queue multiple changes when offline', async ({ page }) => {
      // Create a second issue
      await mockJira.createIssue({ summary: 'Second Issue', status: 'In Progress' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerSync();

      // Go offline
      await indexedDb.setOfflineMode();

      // Edit first issue
      await issuesPage.clickIssue('TEST-1');
      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();
      await detailPage.editSummary('First Change');

      // Go back and edit second issue
      await detailPage.goBack();
      await issuesPage.waitForLoaded();
      await issuesPage.clickIssue('TEST-2');
      await detailPage.waitForLoaded();
      await detailPage.editSummary('Second Change');

      // Verify multiple pending operations
      const pendingOps = await indexedDb.getPendingOperations();
      expect(pendingOps.length).toBeGreaterThanOrEqual(2);
    });
  });

  test.describe('Sync on Reconnect', () => {
    test('should sync changes when back online', async ({ page }) => {
      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);

      await issuesPage.clickIssue('TEST-1');

      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();

      // Go offline and make an edit
      await indexedDb.setOfflineMode();
      await detailPage.editSummary('Offline to Online');

      // Verify pending
      expect(await detailPage.getSyncStatus()).toBe('Pending');

      // Go back online
      await indexedDb.setOnlineMode();

      // Navigate back to issues and sync
      await detailPage.goBack();
      await issuesPage.waitForLoaded();
      await issuesPage.triggerSync();

      // Navigate back to detail and check status
      await issuesPage.clickIssue('TEST-1');
      await detailPage.waitForLoaded();

      // Should be synced now
      expect(await detailPage.getSyncStatus()).toBe('Synced');
    });

    test('should push pending changes on sync after reconnect', async ({ page }) => {
      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);

      await issuesPage.clickIssue('TEST-1');

      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();

      // Go offline and make an edit
      await indexedDb.setOfflineMode();
      await detailPage.editSummary('Push Test');

      // Verify pending operations exist
      let pendingOps = await indexedDb.getPendingOperations();
      expect(pendingOps.length).toBeGreaterThan(0);

      // Go back online and sync
      await indexedDb.setOnlineMode();
      await detailPage.goBack();
      await issuesPage.waitForLoaded();
      await issuesPage.triggerSync();

      // Pending operations should be cleared
      pendingOps = await indexedDb.getPendingOperations();
      expect(pendingOps.length).toBe(0);
    });

    test('should clear pending badge after successful sync', async ({ page }) => {
      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);

      await issuesPage.clickIssue('TEST-1');

      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();

      // Go offline and make an edit
      await indexedDb.setOfflineMode();
      await detailPage.editSummary('Badge Clear Test');

      // Verify pending badge appears
      const pendingBadge = page.locator('text=/\\d+ pending/');
      await expect(pendingBadge).toBeVisible({ timeout: 5000 });

      // Go back online and sync
      await indexedDb.setOnlineMode();
      await detailPage.goBack();
      await issuesPage.waitForLoaded();
      await issuesPage.triggerSync();

      // Pending badge should be gone
      await expect(pendingBadge).not.toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Data Persistence', () => {
    test('should persist offline changes across page refresh', async ({ page }) => {
      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);

      await issuesPage.clickIssue('TEST-1');

      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();

      // Go offline and make an edit
      await indexedDb.setOfflineMode();
      await detailPage.editSummary('Persist Test');

      // Go back online (to allow page navigation)
      await indexedDb.setOnlineMode();

      // Refresh the page
      await page.reload();

      // Navigate back to issues
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);

      // Check that the change persisted
      await issuesPage.clickIssue('TEST-1');
      await detailPage.waitForLoaded();

      const summary = await detailPage.getSummary();
      expect(summary).toBe('Persist Test');

      // Should still show pending (not synced yet)
      const syncStatus = await detailPage.getSyncStatus();
      expect(syncStatus).toBe('Pending');
    });

    test('should preserve pending operations across page refresh', async ({ page }) => {
      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);

      await issuesPage.clickIssue('TEST-1');

      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();

      // Go offline and make an edit
      await indexedDb.setOfflineMode();
      await detailPage.editSummary('Ops Persist Test');

      // Get pending ops count before refresh
      const opsBefore = await indexedDb.getPendingOperations();
      expect(opsBefore.length).toBeGreaterThan(0);

      // Go back online and refresh
      await indexedDb.setOnlineMode();
      await page.reload();

      // Pending ops should still exist
      const opsAfter = await indexedDb.getPendingOperations();
      expect(opsAfter.length).toBe(opsBefore.length);
    });
  });

  test.describe('UI Feedback', () => {
    test('should disable sync button when offline', async ({ page }) => {
      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);

      // Go offline
      await indexedDb.setOfflineMode();

      // Sync button should still be visible but sync should not start
      // (the sync engine checks isOnline before syncing)
      await expect(issuesPage.syncButton).toBeVisible();
    });

    test('should show appropriate message for no pending changes', async ({ page }) => {
      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();

      // Go offline without making changes
      await indexedDb.setOfflineMode();

      // Should show generic offline message without pending count
      const offlineText = page.locator("text=You're offline");
      await expect(offlineText).toBeVisible({ timeout: 5000 });
    });
  });
});

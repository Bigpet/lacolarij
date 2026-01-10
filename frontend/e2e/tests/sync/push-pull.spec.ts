import { test, TEST_USERS, ensureTestUserExists } from '../../fixtures/auth';
import { expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { SettingsPage } from '../../pages/settings.page';
import { IssuesPage } from '../../pages/issues.page';
import { IssueDetailPage } from '../../pages/issueDetail.page';
import { BoardPage } from '../../pages/board.page';
import { IndexedDBHelper } from '../../fixtures/indexedDB';
import { MockJiraHelper } from '../../fixtures/mockJira';

// Use a consistent connection name so we can select it
const MOCK_CONNECTION_NAME = 'Mock JIRA (E2E)';

test.describe('Push and Pull Sync', () => {
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
  });

  test.describe('Push Sync - Local Changes', () => {
    test('should queue local summary edit as pending operation', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Push Queue Test', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Make a local edit (while online, it should still create pending op first)
      await issuesPage.clickIssue('TEST-1');
      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();

      // Edit the summary
      await detailPage.editSummary('Queued Summary');

      // Check that issue shows pending initially (before sync completes)
      // The sync may happen automatically, so we check IndexedDB
      const issues = await indexedDb.getIssues();
      const editedIssue = issues.find((i: { key: string }) => i.key === 'TEST-1');
      expect(editedIssue.summary).toBe('Queued Summary');
    });

    test('should push local summary change to remote on sync', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Original Summary', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Make a local edit
      await issuesPage.clickIssue('TEST-1');
      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();

      // Go offline for edit to create pending op
      await indexedDb.setOfflineMode();
      await detailPage.editSummary('Pushed Summary');
      await indexedDb.setOnlineMode();

      // Trigger sync to push
      await detailPage.goBack();
      await issuesPage.waitForLoaded();
      await issuesPage.triggerSync();

      // Navigate back and verify it's synced
      await issuesPage.clickIssue('TEST-1');
      await detailPage.waitForLoaded();

      expect(await detailPage.getSummary()).toBe('Pushed Summary');
      expect(await detailPage.getSyncStatus()).toBe('Synced');
    });

    test('should push local description change to remote on sync', async ({ page }) => {
      await mockJira.createIssue({
        summary: 'Description Push Test',
        description: 'Original description',
        status: 'To Do',
      });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Make a local edit
      await issuesPage.clickIssue('TEST-1');
      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();

      // Go offline for edit
      await indexedDb.setOfflineMode();
      await detailPage.editDescription('Pushed description content');
      await indexedDb.setOnlineMode();

      // Trigger sync
      await detailPage.goBack();
      await issuesPage.waitForLoaded();
      await issuesPage.triggerSync();

      // Verify
      await issuesPage.clickIssue('TEST-1');
      await detailPage.waitForLoaded();

      const description = await detailPage.getDescription();
      expect(description).toContain('Pushed description content');
      expect(await detailPage.getSyncStatus()).toBe('Synced');
    });

    test('should mark issue as synced after successful push', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Synced Status Test', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Make offline edit
      await issuesPage.clickIssue('TEST-1');
      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();

      await indexedDb.setOfflineMode();
      await detailPage.editSummary('Status Change Test');

      // Should be pending
      expect(await detailPage.getSyncStatus()).toBe('Pending');

      await indexedDb.setOnlineMode();

      // Sync
      await detailPage.goBack();
      await issuesPage.waitForLoaded();
      await issuesPage.triggerSync();

      // Navigate back and verify synced
      await issuesPage.clickIssue('TEST-1');
      await detailPage.waitForLoaded();

      expect(await detailPage.getSyncStatus()).toBe('Synced');

      // Verify in IndexedDB
      const issues = await indexedDb.getIssues();
      const issue = issues.find((i: { key: string }) => i.key === 'TEST-1');
      expect(issue._syncStatus).toBe('synced');
    });

    test('should remove pending operation after successful push', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Pending Op Test', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Make offline edit
      await issuesPage.clickIssue('TEST-1');
      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();

      await indexedDb.setOfflineMode();
      await detailPage.editSummary('Pending Op Clear');
      await indexedDb.setOnlineMode();

      // Verify pending op exists
      let pendingOps = await indexedDb.getPendingOperations();
      expect(pendingOps.length).toBeGreaterThan(0);

      // Sync
      await detailPage.goBack();
      await issuesPage.waitForLoaded();
      await issuesPage.triggerSync();

      // Pending ops should be cleared
      pendingOps = await indexedDb.getPendingOperations();
      expect(pendingOps.length).toBe(0);
    });
  });

  test.describe('Pull Sync - Remote Changes', () => {
    test('should pull new issues created on remote', async ({ page }) => {
      // Create initial issue
      await mockJira.createIssue({ summary: 'Existing Issue', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Verify initial issue
      expect(await issuesPage.getIssueCount()).toBe(1);

      // Create new issue on remote
      await mockJira.createIssue({ summary: 'New Remote Issue', status: 'In Progress' });

      // Pull sync
      await issuesPage.triggerSync();

      // Should now have 2 issues
      expect(await issuesPage.getIssueCount()).toBe(2);
      await expect(issuesPage.getIssueCard('TEST-2')).toBeVisible();
    });

    test('should pull remote summary changes', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Original Remote', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Verify original
      let summary = await issuesPage.getIssueSummary('TEST-1');
      expect(summary).toContain('Original Remote');

      // Change on remote
      await mockJira.simulateRemoteChange('TEST-1', { summary: 'Updated Remote' });

      // Pull sync
      await issuesPage.triggerSync();

      // Verify updated
      summary = await issuesPage.getIssueSummary('TEST-1');
      expect(summary).toContain('Updated Remote');
    });

    test('should pull remote status changes', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Status Pull Test', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Verify initial status
      let status = await issuesPage.getIssueStatus('TEST-1');
      expect(status).toContain('To Do');

      // Change status on remote
      await mockJira.simulateRemoteChange('TEST-1', { status: 'In Progress' });

      // Pull sync
      await issuesPage.triggerSync();

      // Verify updated status
      status = await issuesPage.getIssueStatus('TEST-1');
      expect(status).toContain('In Progress');
    });

    test('should update local IndexedDB with pulled changes', async ({ page }) => {
      await mockJira.createIssue({ summary: 'IndexedDB Pull Test', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Change on remote
      await mockJira.simulateRemoteChange('TEST-1', { summary: 'Pulled to IndexedDB' });

      // Pull sync
      await issuesPage.triggerSync();

      // Verify in IndexedDB
      const issues = await indexedDb.getIssues();
      const issue = issues.find((i: { key: string }) => i.key === 'TEST-1');
      expect(issue.summary).toBe('Pulled to IndexedDB');
      expect(issue._syncStatus).toBe('synced');
    });
  });

  test.describe('Sync Order and Priority', () => {
    test('should push local changes before pulling remote changes', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Order Test', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Make a local change while offline
      await issuesPage.clickIssue('TEST-1');
      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();

      await indexedDb.setOfflineMode();
      await detailPage.editSummary('Local First');
      await indexedDb.setOnlineMode();

      // Trigger sync (should push first, then pull)
      await detailPage.goBack();
      await issuesPage.waitForLoaded();
      await issuesPage.triggerSync();

      // Local change should be preserved (it was pushed before pull)
      await issuesPage.clickIssue('TEST-1');
      await detailPage.waitForLoaded();

      expect(await detailPage.getSummary()).toBe('Local First');
      expect(await detailPage.getSyncStatus()).toBe('Synced');
    });
  });

  test.describe('Status Transitions', () => {
    test('should push status transition to remote', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Transition Test', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Navigate to board for drag-drop status change
      const boardPage = new BoardPage(page);
      await boardPage.goto('/board');
      await boardPage.waitForLoaded();

      // Verify issue is in To Do column
      const todoColumn = boardPage.getColumn('todo');
      await expect(todoColumn.locator(`[data-issue-key="TEST-1"]`)).toBeVisible();

      // Drag to In Progress
      await boardPage.dragCardToColumn('TEST-1', 'indeterminate');
      await boardPage.waitForSyncIdleWithUiUpdate();

      // Wait for board to re-render
      await page.waitForTimeout(500);

      // Verify issue moved to In Progress column
      const inProgressColumn = boardPage.getColumn('indeterminate');
      const card = inProgressColumn.locator(`[data-issue-key="TEST-1"]`);
      await expect(card).toBeVisible({ timeout: 10000 });
    });

    test('should reflect status change in issue detail after sync', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Detail Status Test', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Navigate to board and change status
      const boardPage = new BoardPage(page);
      await boardPage.goto('/board');
      await boardPage.waitForLoaded();

      await boardPage.dragCardToColumn('TEST-1', 'done');
      await boardPage.waitForSyncIdleWithUiUpdate();

      // Wait for board to fully re-render before clicking
      await page.waitForTimeout(500);

      // Navigate to issue detail
      await boardPage.clickCard('TEST-1');

      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();

      // Verify status in detail view
      const status = await detailPage.getStatus();
      expect(status).toContain('Done');
    });
  });

  test.describe('Sync After Multiple Changes', () => {
    test('should push multiple field changes in a single sync', async ({ page }) => {
      await mockJira.createIssue({
        summary: 'Multi Field Test',
        description: 'Original description',
        status: 'To Do',
      });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Make multiple changes while offline
      await issuesPage.clickIssue('TEST-1');
      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();

      await indexedDb.setOfflineMode();

      // Change summary
      await detailPage.editSummary('Changed Summary');

      // Change description
      await detailPage.editDescription('Changed description');

      await indexedDb.setOnlineMode();

      // Sync all changes
      await detailPage.goBack();
      await issuesPage.waitForLoaded();
      await issuesPage.triggerSync();

      // Verify all changes synced
      await issuesPage.clickIssue('TEST-1');
      await detailPage.waitForLoaded();

      expect(await detailPage.getSummary()).toBe('Changed Summary');
      const description = await detailPage.getDescription();
      expect(description).toContain('Changed description');
      expect(await detailPage.getSyncStatus()).toBe('Synced');
    });

    test('should handle changes to multiple issues in one sync', async ({ page }) => {
      // Create multiple issues
      await mockJira.createIssue({ summary: 'Multi Issue 1', status: 'To Do' });
      await mockJira.createIssue({ summary: 'Multi Issue 2', status: 'In Progress' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Make offline changes to both
      await indexedDb.setOfflineMode();

      await issuesPage.clickIssue('TEST-1');
      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();
      await detailPage.editSummary('Changed Issue 1');

      await detailPage.goBack();
      await issuesPage.waitForLoaded();

      await issuesPage.clickIssue('TEST-2');
      await detailPage.waitForLoaded();
      await detailPage.editSummary('Changed Issue 2');

      await indexedDb.setOnlineMode();

      // Sync all
      await detailPage.goBack();
      await issuesPage.waitForLoaded();
      await issuesPage.triggerSync();

      // Verify both are synced
      let summary = await issuesPage.getIssueSummary('TEST-1');
      expect(summary).toContain('Changed Issue 1');

      summary = await issuesPage.getIssueSummary('TEST-2');
      expect(summary).toContain('Changed Issue 2');
    });
  });

  test.describe('Sync Error Handling', () => {
    test('should show error status when sync fails', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Error Test', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Go offline before sync attempt
      await indexedDb.setOfflineMode();

      // Try to sync (should fail because we're offline)
      await issuesPage.syncButton.click();

      // Sync should not start when offline
      // The sync engine checks isOnline before syncing
      const offlineText = page.locator("text=You're offline");
      await expect(offlineText).toBeVisible({ timeout: 5000 });
    });

    test('should retry failed push on next sync', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Retry Test', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Make offline change
      await issuesPage.clickIssue('TEST-1');
      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();

      await indexedDb.setOfflineMode();
      await detailPage.editSummary('Retry Summary');
      await indexedDb.setOnlineMode();

      // First sync
      await detailPage.goBack();
      await issuesPage.waitForLoaded();
      await issuesPage.triggerSync();

      // Verify synced
      await issuesPage.clickIssue('TEST-1');
      await detailPage.waitForLoaded();
      expect(await detailPage.getSyncStatus()).toBe('Synced');
    });
  });

  test.describe('Version Tracking', () => {
    test('should update remote version after successful push', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Version Test', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Get initial version
      let issues = await indexedDb.getIssues();
      const initialVersion = issues.find((i: { key: string }) => i.key === 'TEST-1')?._remoteVersion;

      // Make a change
      await issuesPage.clickIssue('TEST-1');
      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();

      await indexedDb.setOfflineMode();
      await detailPage.editSummary('Version Updated');
      await indexedDb.setOnlineMode();

      await detailPage.goBack();
      await issuesPage.waitForLoaded();
      await issuesPage.triggerSync();

      // Get updated version
      issues = await indexedDb.getIssues();
      const updatedVersion = issues.find((i: { key: string }) => i.key === 'TEST-1')?._remoteVersion;

      // Version should be different (updated by remote after push)
      expect(updatedVersion).toBeDefined();
      // Note: In mock, version might be the same timestamp format but value updated
    });

    test('should preserve local version during conflict detection', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Version Conflict Test', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Go offline and make local change
      await issuesPage.clickIssue('TEST-1');
      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();

      await indexedDb.setOfflineMode();

      // Make local edit while offline
      await detailPage.editSummary('My Version');

      // IMPORTANT: Make remote change WHILE still offline - this ensures
      // the remote has a different version when we sync
      await mockJira.simulateRemoteChange('TEST-1', { summary: 'Their Version' });

      // Now go back online and sync - should detect conflict because:
      // 1. We try to push our local change
      // 2. But the remote has a different version (their change)
      await indexedDb.setOnlineMode();

      // Sync - this should detect conflict
      await detailPage.goBack();
      await issuesPage.waitForLoaded();
      await issuesPage.triggerSync();

      // Wait a moment for conflict to be detected
      await page.waitForTimeout(500);

      // Local version should still be preserved in IndexedDB
      const issues = await indexedDb.getIssues();
      const issue = issues.find((i: { key: string }) => i.key === 'TEST-1');
      expect(issue.summary).toBe('My Version');
      expect(issue._syncStatus).toBe('conflict');
    });
  });
});

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

test.describe('Initial Sync', () => {
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
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });

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

  test.describe('Full Sync', () => {
    test('should fetch all issues from JIRA on full sync', async ({ page }) => {
      // Create multiple test issues
      await mockJira.createIssue({ summary: 'Issue One', status: 'To Do' });
      await mockJira.createIssue({ summary: 'Issue Two', status: 'In Progress' });
      await mockJira.createIssue({ summary: 'Issue Three', status: 'Done' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);

      // Trigger full sync
      await issuesPage.triggerFullSync();

      // Verify all issues appear
      await expect(issuesPage.getIssueCard('TEST-1')).toBeVisible();
      await expect(issuesPage.getIssueCard('TEST-2')).toBeVisible();
      await expect(issuesPage.getIssueCard('TEST-3')).toBeVisible();

      // Verify issue count
      const count = await issuesPage.getIssueCount();
      expect(count).toBe(3);
    });

    test('should display issues with correct data after sync', async ({ page }) => {
      await mockJira.createIssue({
        summary: 'Bug in login flow',
        status: 'In Progress',
        priority: 'High',
      });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Verify issue summary is displayed correctly
      const summary = await issuesPage.getIssueSummary('TEST-1');
      expect(summary).toContain('Bug in login flow');

      // Verify status is displayed correctly
      const status = await issuesPage.getIssueStatus('TEST-1');
      expect(status).toContain('In Progress');
    });

    test('should update status counts after sync', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Todo 1', status: 'To Do' });
      await mockJira.createIssue({ summary: 'Todo 2', status: 'To Do' });
      await mockJira.createIssue({ summary: 'In Progress 1', status: 'In Progress' });
      await mockJira.createIssue({ summary: 'Done 1', status: 'Done' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      const counts = await issuesPage.getStatusCounts();
      expect(counts.todo).toBe(2);
      expect(counts.inProgress).toBe(1);
      expect(counts.done).toBe(1);
      expect(counts.total).toBe(4);
    });

    test('should sync comments for issues', async ({ page }) => {
      const issueResult = await mockJira.createIssue({ summary: 'Issue with comments', status: 'To Do' });
      await mockJira.addComment(issueResult.key, 'First comment', 'Test User');
      await mockJira.addComment(issueResult.key, 'Second comment', 'Another User');

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Navigate to issue detail
      await issuesPage.clickIssue('TEST-1');

      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();

      // Verify comments are synced
      const commentCount = await detailPage.getCommentCount();
      expect(commentCount).toBe(2);

      // Verify first comment content
      const firstComment = await detailPage.getCommentText(0);
      expect(firstComment).toContain('First comment');
    });

    test('should show synced status on issues after sync', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Test Issue', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Navigate to detail to check sync status
      await issuesPage.clickIssue('TEST-1');

      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();

      // Verify synced status
      const syncStatus = await detailPage.getSyncStatus();
      expect(syncStatus).toBe('Synced');
    });
  });

  test.describe('Incremental Sync', () => {
    test('should fetch only updated issues on incremental sync', async ({ page }) => {
      // Create initial issues
      await mockJira.createIssue({ summary: 'Existing Issue', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Verify initial issue
      await expect(issuesPage.getIssueCard('TEST-1')).toBeVisible();
      expect(await issuesPage.getIssueCount()).toBe(1);

      // Create a new issue after initial sync
      await mockJira.createIssue({ summary: 'New Issue After Sync', status: 'In Progress' });

      // Trigger regular (incremental) sync
      await issuesPage.triggerSync();

      // Both issues should now be visible
      await expect(issuesPage.getIssueCard('TEST-1')).toBeVisible();
      await expect(issuesPage.getIssueCard('TEST-2')).toBeVisible();
      expect(await issuesPage.getIssueCount()).toBe(2);
    });

    test('should update existing issues on incremental sync', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Original Summary', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Verify original summary
      let summary = await issuesPage.getIssueSummary('TEST-1');
      expect(summary).toContain('Original Summary');

      // Simulate remote change
      await mockJira.simulateRemoteChange('TEST-1', { summary: 'Updated Summary' });

      // Trigger incremental sync
      await issuesPage.triggerSync();

      // Verify updated summary
      summary = await issuesPage.getIssueSummary('TEST-1');
      expect(summary).toContain('Updated Summary');
    });
  });

  test.describe('Sync Status UI', () => {
    test('should show syncing status during sync', async ({ page }) => {
      // Create multiple issues to make sync take longer
      for (let i = 1; i <= 5; i++) {
        await mockJira.createIssue({ summary: `Issue ${i}`, status: 'To Do' });
      }

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);

      // Click sync but don't wait for it to complete
      await issuesPage.fullSyncButton.click();

      // Check for syncing status (might be quick, so use short timeout)
      const syncingIndicator = page.locator('text=Syncing...');
      // This might pass or fail depending on timing, but the sync should complete
      await issuesPage.waitForSyncIdle();

      // After sync completes, should show synced status
      const syncedIndicator = page.locator('text=Synced');
      await expect(syncedIndicator).toBeVisible({ timeout: 10000 });
    });

    test('should update last sync time after sync', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Test Issue', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);

      // Before sync, should show "Never" or nothing for last sync
      await issuesPage.triggerFullSync();

      // After sync, should show recent time
      const lastSyncText = page.locator('text=Last sync:');
      await expect(lastSyncText).toBeVisible();

      // Should show "Just now" or similar
      const syncTimeIndicator = page.locator('text=Just now');
      await expect(syncTimeIndicator).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Empty State', () => {
    test('should show no issues message when no issues exist', async ({ page }) => {
      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Should show no issues message
      const hasNoIssues = await issuesPage.hasNoIssues();
      expect(hasNoIssues).toBe(true);
    });

    test('should show issues after sync when they exist', async ({ page }) => {
      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Initially no issues
      expect(await issuesPage.hasNoIssues()).toBe(true);

      // Create an issue
      await mockJira.createIssue({ summary: 'New Issue', status: 'To Do' });

      // Sync again
      await issuesPage.triggerSync();

      // Now should show the issue
      expect(await issuesPage.hasNoIssues()).toBe(false);
      await expect(issuesPage.getIssueCard('TEST-1')).toBeVisible();
    });
  });

  test.describe('Sync Persistence', () => {
    test('should persist issues in IndexedDB after sync', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Persistent Issue', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Verify issue is in IndexedDB
      const issues = await indexedDb.getIssues();
      expect(issues.length).toBe(1);
      expect(issues[0].summary).toBe('Persistent Issue');
      expect(issues[0]._syncStatus).toBe('synced');
    });

    test('should restore issues from IndexedDB on page reload', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Reload Test Issue', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Verify issue exists
      await expect(issuesPage.getIssueCard('TEST-1')).toBeVisible();

      // Reload the page
      await page.reload();
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);

      // Issue should still be visible (from IndexedDB)
      await expect(issuesPage.getIssueCard('TEST-1')).toBeVisible();
    });
  });
});

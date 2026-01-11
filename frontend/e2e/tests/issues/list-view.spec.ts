import { test, TEST_USERS, ensureTestUserExists } from '../../fixtures/auth';
import { expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { SettingsPage } from '../../pages/settings.page';
import { IssuesPage } from '../../pages/issues.page';
import { IndexedDBHelper } from '../../fixtures/indexedDB';
import { MockJiraHelper } from '../../fixtures/mockJira';

// Use a consistent connection name so we can select it
const MOCK_CONNECTION_NAME = 'Mock JIRA (E2E)';

test.describe('Issue List View', () => {
  let mockJira: MockJiraHelper;

  test.beforeEach(async ({ page, request }) => {
    // Initialize MockJira helper
    mockJira = new MockJiraHelper(request);

    // Reset mock JIRA storage for test isolation
    await mockJira.reset();

    // Ensure test user exists
    await ensureTestUserExists(request, TEST_USERS.default);

    // Clear browser storage
    await page.goto('/login');
    const indexedDb = new IndexedDBHelper(page);
    await indexedDb.clearStorage();
    await page.reload();

    // Login
    const loginPage = new LoginPage(page);
    await loginPage.login(TEST_USERS.default.username, TEST_USERS.default.password);
    await expect(page).toHaveURL('/', { timeout: 10000 });
  });

  test.describe('With Mock JIRA Connection', () => {
    test.beforeEach(async ({ page }) => {
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

    test('should display issues after sync', async ({ page }) => {
      // Create test issues in mock JIRA
      await mockJira.createIssue({ summary: 'Test Issue One', status: 'To Do' });
      await mockJira.createIssue({ summary: 'Test Issue Two', status: 'In Progress' });

      // Navigate to issues page
      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();

      // Select the mock connection and trigger sync
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Verify issues are displayed
      await expect(issuesPage.getIssueCard('TEST-1')).toBeVisible();
      await expect(issuesPage.getIssueCard('TEST-2')).toBeVisible();
      expect(await issuesPage.getIssueCount()).toBe(2);
    });

    test('should filter issues by status', async ({ page }) => {
      // Create issues with different statuses
      await mockJira.createIssue({ summary: 'Todo Issue', status: 'To Do' });
      await mockJira.createIssue({ summary: 'Progress Issue', status: 'In Progress' });
      await mockJira.createIssue({ summary: 'Done Issue', status: 'Done' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Wait for issues to appear
      await expect(issuesPage.issueCards.first()).toBeVisible();

      // Filter by "To Do"
      await issuesPage.setStatusFilter('To Do');

      // Verify only To Do issues shown
      expect(await issuesPage.getIssueCount()).toBe(1);
      await expect(issuesPage.getIssueCard('TEST-1')).toBeVisible();
      await expect(issuesPage.getIssueCard('TEST-2')).not.toBeVisible();
      await expect(issuesPage.getIssueCard('TEST-3')).not.toBeVisible();

      // Clear filter
      await issuesPage.setStatusFilter('All statuses');
      expect(await issuesPage.getIssueCount()).toBe(3);
    });

    test('should search issues by summary', async ({ page }) => {
      // Create issues with different summaries
      await mockJira.createIssue({ summary: 'Authentication bug fix', status: 'To Do' });
      await mockJira.createIssue({ summary: 'Dashboard performance', status: 'In Progress' });
      await mockJira.createIssue({ summary: 'API endpoint update', status: 'Done' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Wait for issues to appear
      await expect(issuesPage.issueCards.first()).toBeVisible();

      // Search for "authentication"
      await issuesPage.search('authentication');

      // Verify only matching issue shown
      expect(await issuesPage.getIssueCount()).toBe(1);
      await expect(issuesPage.getIssueCard('TEST-1')).toBeVisible();

      // Clear search and verify all issues return
      await issuesPage.clearSearch();
      expect(await issuesPage.getIssueCount()).toBe(3);
    });

    test('should search issues by partial match', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Fix login authentication flow', status: 'To Do' });
      await mockJira.createIssue({ summary: 'Update user profile page', status: 'In Progress' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      await expect(issuesPage.issueCards.first()).toBeVisible();

      // Search for partial word
      await issuesPage.search('auth');

      // Should find the authentication issue
      expect(await issuesPage.getIssueCount()).toBe(1);
    });

    test('should navigate to detail on click', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Click Test Issue', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      await expect(issuesPage.getIssueCard('TEST-1')).toBeVisible();

      // Click on the issue
      await issuesPage.clickIssue('TEST-1');

      // Verify navigation to detail page
      await expect(page).toHaveURL(/\/issues\/.+/);
    });

    test('should show status counts', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Todo 1', status: 'To Do' });
      await mockJira.createIssue({ summary: 'Todo 2', status: 'To Do' });
      await mockJira.createIssue({ summary: 'In Progress 1', status: 'In Progress' });
      await mockJira.createIssue({ summary: 'Done 1', status: 'Done' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      await expect(issuesPage.issueCards.first()).toBeVisible();

      const counts = await issuesPage.getStatusCounts();
      expect(counts.todo).toBe(2);
      expect(counts.inProgress).toBe(1);
      expect(counts.done).toBe(1);
      expect(counts.total).toBe(4);
    });
  });

  test.describe('Without Connection', () => {
    test.beforeEach(async ({ request }) => {
      // Clear all JIRA connections from database to test empty state
      const mockJira = new MockJiraHelper(request);
      await mockJira.resetConnections();
    });

    test('should show no connections message when none configured', async ({ page }) => {
      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();

      // Should show the no connections warning
      await expect(issuesPage.noConnectionsCard).toBeVisible();
    });
  });
});

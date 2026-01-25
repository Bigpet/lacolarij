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

test.describe('Issue Detail View', () => {
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

  test('should display issue details correctly', async ({ page }) => {
    // Create a test issue
    await mockJira.createIssue({
      summary: 'Test Issue for Detail View',
      status: 'In Progress',
      assignee: 'John Doe',
      priority: 'High',
    });

    // Navigate to issues page and sync
    const issuesPage = new IssuesPage(page);
    await issuesPage.goto('/issues');
    await issuesPage.waitForLoaded();
    await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
    await issuesPage.triggerFullSync();

    // Wait for and click on the issue
    await expect(issuesPage.getIssueCard('TEST-1')).toBeVisible();
    await issuesPage.clickIssue('TEST-1');

    // Verify detail page loaded
    const detailPage = new IssueDetailPage(page);
    await detailPage.waitForLoaded();

    // Verify issue key
    expect(await detailPage.getIssueKey()).toBe('TEST-1');

    // Verify summary
    expect(await detailPage.getSummary()).toBe('Test Issue for Detail View');
  });

  test('should show sync status badge', async ({ page }) => {
    await mockJira.createIssue({ summary: 'Sync Status Test', status: 'To Do' });

    const issuesPage = new IssuesPage(page);
    await issuesPage.goto('/issues');
    await issuesPage.waitForLoaded();
    await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
    await issuesPage.triggerFullSync();

    await expect(issuesPage.getIssueCard('TEST-1')).toBeVisible();
    await issuesPage.clickIssue('TEST-1');

    const detailPage = new IssueDetailPage(page);
    await detailPage.waitForLoaded();

    // After sync, should show as synced
    const syncStatus = await detailPage.getSyncStatus();
    expect(syncStatus).toBe('Synced');
  });

  test('should display metadata correctly', async ({ page }) => {
    await mockJira.createIssue({
      summary: 'Metadata Test Issue',
      status: 'In Progress',
      assignee: 'Jane Smith',
      priority: 'Medium',
      issueType: 'Bug',
    });

    const issuesPage = new IssuesPage(page);
    await issuesPage.goto('/issues');
    await issuesPage.waitForLoaded();
    await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
    await issuesPage.triggerFullSync();

    await expect(issuesPage.getIssueCard('TEST-1')).toBeVisible();
    await issuesPage.clickIssue('TEST-1');

    const detailPage = new IssueDetailPage(page);
    await detailPage.waitForLoaded();

    // Verify assignee is displayed
    const assignee = await detailPage.getAssignee();
    expect(assignee).toContain('Jane Smith');

    // Verify reporter is displayed
    const reporter = await detailPage.getReporter();
    expect(reporter).toBeTruthy();
  });

  test('should navigate back to list', async ({ page }) => {
    await mockJira.createIssue({ summary: 'Back Navigation Test', status: 'To Do' });

    const issuesPage = new IssuesPage(page);
    await issuesPage.goto('/issues');
    await issuesPage.waitForLoaded();
    await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
    await issuesPage.triggerFullSync();

    await expect(issuesPage.getIssueCard('TEST-1')).toBeVisible();
    await issuesPage.clickIssue('TEST-1');

    const detailPage = new IssueDetailPage(page);
    await detailPage.waitForLoaded();

    // Click back button
    await detailPage.goBack();

    // Should be back on issues page
    await expect(page).toHaveURL('/issues');
  });

  test('should show description card', async ({ page }) => {
    await mockJira.createIssue({
      summary: 'Description Test Issue',
      description: 'This is the issue description for testing.',
      status: 'To Do',
    });

    const issuesPage = new IssuesPage(page);
    await issuesPage.goto('/issues');
    await issuesPage.waitForLoaded();
    await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
    await issuesPage.triggerFullSync();

    await expect(issuesPage.getIssueCard('TEST-1')).toBeVisible();
    await issuesPage.clickIssue('TEST-1');

    const detailPage = new IssueDetailPage(page);
    await detailPage.waitForLoaded();

    // Verify description card is visible
    await expect(detailPage.descriptionCard).toBeVisible();
  });

  test('should show no description message when empty', async ({ page }) => {
    await mockJira.createIssue({
      summary: 'No Description Issue',
      status: 'To Do',
    });

    const issuesPage = new IssuesPage(page);
    await issuesPage.goto('/issues');
    await issuesPage.waitForLoaded();
    await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
    await issuesPage.triggerFullSync();

    await expect(issuesPage.getIssueCard('TEST-1')).toBeVisible();
    await issuesPage.clickIssue('TEST-1');

    const detailPage = new IssueDetailPage(page);
    await detailPage.waitForLoaded();

    // Should show no description placeholder
    await expect(detailPage.descriptionCard.locator('text=No description provided')).toBeVisible();
  });

  test('should show issue type', async ({ page }) => {
    await mockJira.createIssue({
      summary: 'Bug Issue',
      status: 'To Do',
      issueType: 'Bug',
    });

    const issuesPage = new IssuesPage(page);
    await issuesPage.goto('/issues');
    await issuesPage.waitForLoaded();
    await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
    await issuesPage.triggerFullSync();

    await expect(issuesPage.getIssueCard('TEST-1')).toBeVisible();
    await issuesPage.clickIssue('TEST-1');

    const detailPage = new IssueDetailPage(page);
    await detailPage.waitForLoaded();

    // Verify issue type is displayed
    await expect(detailPage.issueType).toBeVisible();
  });
});

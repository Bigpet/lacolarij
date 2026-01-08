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

test.describe('Issue Comments (Read-Only)', () => {
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

  test('should show no comments message when none exist', async ({ page }) => {
    await mockJira.createIssue({
      summary: 'Issue Without Comments',
      status: 'To Do',
    });

    const issuesPage = new IssuesPage(page);
    await issuesPage.goto('/issues');
    await issuesPage.waitForLoaded();

    // Select the mock JIRA connection
    await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
    await issuesPage.triggerFullSync();

    await expect(issuesPage.getIssueCard('TEST-1')).toBeVisible();
    await issuesPage.clickIssue('TEST-1');

    const detailPage = new IssueDetailPage(page);
    await detailPage.waitForLoaded();

    // Should show no comments message
    await expect(detailPage.noCommentsText).toBeVisible();
    expect(await detailPage.getCommentCount()).toBe(0);
  });

  test('should display existing comments', async ({ page }) => {
    // Create issue
    const { key } = await mockJira.createIssue({
      summary: 'Issue With Comments',
      status: 'To Do',
    });

    // Add comments to the issue
    await mockJira.addComment(key, 'This is the first comment');
    await mockJira.addComment(key, 'This is the second comment');

    const issuesPage = new IssuesPage(page);
    await issuesPage.goto('/issues');
    await issuesPage.waitForLoaded();
    await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
    await issuesPage.triggerFullSync();

    await expect(issuesPage.getIssueCard('TEST-1')).toBeVisible();
    await issuesPage.clickIssue('TEST-1');

    const detailPage = new IssueDetailPage(page);
    await detailPage.waitForLoaded();

    // Should show comments
    expect(await detailPage.hasComments()).toBe(true);
    expect(await detailPage.getCommentCount()).toBe(2);
  });

  test('should show comment author', async ({ page }) => {
    const { key } = await mockJira.createIssue({
      summary: 'Issue With Author Comment',
      status: 'To Do',
    });

    await mockJira.addComment(key, 'Comment by specific author', 'John Developer');

    const issuesPage = new IssuesPage(page);
    await issuesPage.goto('/issues');
    await issuesPage.waitForLoaded();
    await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
    await issuesPage.triggerFullSync();

    await expect(issuesPage.getIssueCard('TEST-1')).toBeVisible();
    await issuesPage.clickIssue('TEST-1');

    const detailPage = new IssueDetailPage(page);
    await detailPage.waitForLoaded();

    // Verify author is displayed
    const author = await detailPage.getCommentAuthor(0);
    expect(author).toBe('John Developer');
  });

  test('should show comment content', async ({ page }) => {
    const { key } = await mockJira.createIssue({
      summary: 'Issue With Content Comment',
      status: 'To Do',
    });

    await mockJira.addComment(key, 'This is a detailed comment explaining the issue resolution steps.');

    const issuesPage = new IssuesPage(page);
    await issuesPage.goto('/issues');
    await issuesPage.waitForLoaded();
    await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
    await issuesPage.triggerFullSync();

    await expect(issuesPage.getIssueCard('TEST-1')).toBeVisible();
    await issuesPage.clickIssue('TEST-1');

    const detailPage = new IssueDetailPage(page);
    await detailPage.waitForLoaded();

    // Verify comment content is displayed
    const content = await detailPage.getCommentText(0);
    expect(content).toContain('detailed comment explaining');
  });

  test('should display multiple comments in order', async ({ page }) => {
    const { key } = await mockJira.createIssue({
      summary: 'Issue With Multiple Comments',
      status: 'In Progress',
    });

    await mockJira.addComment(key, 'First comment content', 'Alice');
    await mockJira.addComment(key, 'Second comment content', 'Bob');
    await mockJira.addComment(key, 'Third comment content', 'Charlie');

    const issuesPage = new IssuesPage(page);
    await issuesPage.goto('/issues');
    await issuesPage.waitForLoaded();
    await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
    await issuesPage.triggerFullSync();

    await expect(issuesPage.getIssueCard('TEST-1')).toBeVisible();
    await issuesPage.clickIssue('TEST-1');

    const detailPage = new IssueDetailPage(page);
    await detailPage.waitForLoaded();

    // Verify all comments are displayed
    expect(await detailPage.getCommentCount()).toBe(3);

    // Verify authors
    expect(await detailPage.getCommentAuthor(0)).toBe('Alice');
    expect(await detailPage.getCommentAuthor(1)).toBe('Bob');
    expect(await detailPage.getCommentAuthor(2)).toBe('Charlie');
  });

  test('should show comments card title with count', async ({ page }) => {
    const { key } = await mockJira.createIssue({
      summary: 'Issue For Count Test',
      status: 'To Do',
    });

    await mockJira.addComment(key, 'Comment 1');
    await mockJira.addComment(key, 'Comment 2');
    await mockJira.addComment(key, 'Comment 3');

    const issuesPage = new IssuesPage(page);
    await issuesPage.goto('/issues');
    await issuesPage.waitForLoaded();
    await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
    await issuesPage.triggerFullSync();

    await expect(issuesPage.getIssueCard('TEST-1')).toBeVisible();
    await issuesPage.clickIssue('TEST-1');

    const detailPage = new IssueDetailPage(page);
    await detailPage.waitForLoaded();

    // The title should show the count like "Comments (3)"
    const titleText = await detailPage.commentsTitle.textContent();
    expect(titleText).toContain('3');
  });
});

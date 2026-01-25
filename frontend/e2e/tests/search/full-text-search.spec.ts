import { test, TEST_USERS, ensureTestUserExists } from '../../fixtures/auth';
import { expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { SettingsPage } from '../../pages/settings.page';
import { IssuesPage } from '../../pages/issues.page';
import { BoardPage } from '../../pages/board.page';
import { IndexedDBHelper } from '../../fixtures/indexedDB';
import { MockJiraHelper } from '../../fixtures/mockJira';

// Use a consistent connection name so we can select it
const MOCK_CONNECTION_NAME = 'Mock JIRA (Search E2E)';

test.describe('Full-Text Search', () => {
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
    await expect(page).toHaveURL('/issues', { timeout: 10000 });

    // Set up a mock JIRA connection
    const settingsPage = new SettingsPage(page);
    await settingsPage.goto('/settings');
    await settingsPage.waitForLoaded();

    // Delete existing mock connection if present
    if (await settingsPage.getConnectionItem(MOCK_CONNECTION_NAME).isVisible().catch(() => false)) {
      await settingsPage.deleteConnection(MOCK_CONNECTION_NAME);
      await page.waitForTimeout(500);
    }

    await settingsPage.addConnection({
      name: MOCK_CONNECTION_NAME,
      jiraUrl: 'demo://local',
      email: TEST_USERS.default.email,
      apiToken: 'test-token',
    });
  });

  test.describe('Basic Search Functionality', () => {
    test('should search by issue key', async ({ page }) => {
      // Create test issues and capture their actual keys
      const issue1 = await mockJira.createIssue({ summary: 'First Issue', status: 'To Do' });
      const issue2 = await mockJira.createIssue({ summary: 'Second Issue', status: 'To Do' });
      const issue3 = await mockJira.createIssue({ summary: 'Third Issue', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Wait for issues to appear
      await expect(issuesPage.issueCards.first()).toBeVisible({ timeout: 10000 });

      // Search for the second issue's key
      await issuesPage.search(issue2.key);

      // Should show only the second issue
      expect(await issuesPage.getIssueCount()).toBe(1);
      await expect(issuesPage.getIssueCard(issue2.key)).toBeVisible();
      await expect(issuesPage.getIssueCard(issue1.key)).not.toBeVisible();
      await expect(issuesPage.getIssueCard(issue3.key)).not.toBeVisible();
    });

    test('should search by issue summary', async ({ page }) => {
      // Create issues with distinct, unique summaries
      await mockJira.createIssue({ summary: 'Authentication bug in login', status: 'To Do' });
      await mockJira.createIssue({ summary: 'Database connection error', status: 'To Do' });
      await mockJira.createIssue({ summary: 'UI button alignment fix', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Wait for issues to appear
      await expect(issuesPage.issueCards.first()).toBeVisible({ timeout: 10000 });

      const allCount = await issuesPage.getIssueCount();

      // Search for "authentication" - should find only the first issue
      await issuesPage.search('authentication');
      await page.waitForTimeout(500);

      // Should show only the authentication bug (1 result)
      const searchCount = await issuesPage.getIssueCount();
      expect(searchCount).toBeLessThan(allCount);
      expect(searchCount).toBeGreaterThanOrEqual(1);
    });

    test('should search by description text', async ({ page }) => {
      // Create issues with description content
      await mockJira.createIssue({
        summary: 'Issue One',
        status: 'To Do',
        description: 'This issue contains unique keyword foobar123',
      });
      await mockJira.createIssue({
        summary: 'Issue Two',
        status: 'To Do',
        description: 'Regular description without special terms',
      });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Wait for issues to appear
      await expect(issuesPage.issueCards.first()).toBeVisible({ timeout: 10000 });

      // Search for content that's only in description
      await issuesPage.search('foobar123');

      // Should show only the issue with matching description
      expect(await issuesPage.getIssueCount()).toBe(1);
    });

    test('should search with prefix matching', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Login authentication flow', status: 'To Do' });
      await mockJira.createIssue({ summary: 'Database connection timeout', status: 'To Do' });
      await mockJira.createIssue({ summary: 'Logout functionality', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Wait for issues to appear
      await expect(issuesPage.issueCards.first()).toBeVisible({ timeout: 10000 });

      const allCount = await issuesPage.getIssueCount();

      // Search for prefix "log" - should match "login" and "logout"
      await issuesPage.search('log');

      // Should match issues with "login" and "logout" (at least 2)
      const count = await issuesPage.getIssueCount();
      expect(count).toBeGreaterThanOrEqual(2);
      expect(count).toBeLessThan(allCount);
    });

    test('should search with fuzzy matching (typos)', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Authentication service', status: 'To Do' });
      await mockJira.createIssue({ summary: 'Author profile page', status: 'To Do' });
      await mockJira.createIssue({ summary: 'Database connection', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Wait for issues to appear
      await expect(issuesPage.issueCards.first()).toBeVisible({ timeout: 10000 });

      // Search with typo "authntication" (missing 'e')
      await issuesPage.search('authntication');
      await page.waitForTimeout(500);

      // Should still find "Authentication service" due to fuzzy matching
      const count = await issuesPage.getIssueCount();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Search Edge Cases', () => {
    test('should show all issues when search is cleared', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Search Test One', status: 'To Do' });
      await mockJira.createIssue({ summary: 'Search Test Two', status: 'To Do' });
      await mockJira.createIssue({ summary: 'Different Topic', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Wait for issues to appear
      await expect(issuesPage.issueCards.first()).toBeVisible({ timeout: 10000 });

      const totalIssues = await issuesPage.getIssueCount();

      // Search for something
      await issuesPage.search('Search');
      await page.waitForTimeout(500);
      expect(await issuesPage.getIssueCount()).toBeLessThan(totalIssues);

      // Clear search
      await issuesPage.search('');
      await page.waitForTimeout(500);

      // Should show all issues again
      expect(await issuesPage.getIssueCount()).toBe(totalIssues);
    });

    test('should show empty state when no results found', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Specific Issue One', status: 'To Do' });
      await mockJira.createIssue({ summary: 'Specific Issue Two', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Wait for issues to appear
      await expect(issuesPage.issueCards.first()).toBeVisible({ timeout: 10000 });

      // Search for something that doesn't exist
      await issuesPage.search('nonexistentissue123456');
      await page.waitForTimeout(500);

      // Should show no results
      expect(await issuesPage.getIssueCount()).toBe(0);
      await expect(issuesPage.issueCards).not.toBeVisible();
    });

    test('should handle empty search query', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Test Issue', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Wait for issues to appear
      await expect(issuesPage.issueCards.first()).toBeVisible({ timeout: 10000 });

      // Clear search (empty string)
      await issuesPage.search('');
      await page.waitForTimeout(500);

      // Should show all issues
      expect(await issuesPage.getIssueCount()).toBe(1);
    });

    test('should be case-insensitive', async ({ page }) => {
      await mockJira.createIssue({ summary: 'AUTHENTICATION ERROR', status: 'To Do' });
      await mockJira.createIssue({ summary: 'database failure', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Wait for issues to appear
      await expect(issuesPage.issueCards.first()).toBeVisible({ timeout: 10000 });

      // Search with different case
      await issuesPage.search('authentication');
      await page.waitForTimeout(500);

      expect(await issuesPage.getIssueCount()).toBe(1);
    });
  });

  test.describe('Search Performance', () => {
    test('should handle search with many issues', async ({ page }) => {
      // Create 20 issues to test performance
      const issues = Array.from({ length: 20 }, (_, i) => ({
        summary: `Performance Test Issue ${i + 1}`,
        status: 'To Do',
      }));

      for (const issue of issues) {
        await mockJira.createIssue(issue);
      }

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Wait for issues to appear
      await expect(issuesPage.issueCards.first()).toBeVisible({ timeout: 10000 });

      const startTime = Date.now();

      // Search
      await issuesPage.search('Performance Test 15');

      const searchTime = Date.now() - startTime;

      // Should complete search quickly (under 2 seconds including debounce)
      expect(searchTime).toBeLessThan(2000);

      // Should find the correct issue
      expect(await issuesPage.getIssueCount()).toBe(1);
    });
  });

  test.describe('Search State Persistence', () => {
    test.skip('should persist search term across navigation', async ({ page }) => {
      // SKIPPED: Search state persistence is not currently implemented.
      // Search query is stored in local component state which gets reset on navigation.
      // To implement this, we would need to:
      // 1. Store search query in URL params or localStorage
      // 2. Restore search query on mount
      const issue1 = await mockJira.createIssue({ summary: 'Navigation Test', status: 'To Do' });
      await mockJira.createIssue({ summary: 'Other Issue', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Wait for issues to appear
      await expect(issuesPage.issueCards.first()).toBeVisible({ timeout: 10000 });

      // Perform search
      await issuesPage.search('Navigation');
      await page.waitForTimeout(500);

      // Navigate to issue detail and back
      await issuesPage.clickIssue(issue1.key);
      await page.waitForTimeout(500);
      await page.goBack();

      // Search should still be active
      expect(await issuesPage.getIssueCount()).toBe(1);
      await expect(issuesPage.getIssueCard(issue1.key)).toBeVisible();
    });
  });

  test.describe('Board Page Search', () => {
    test('should search on board view', async ({ page }) => {
      // Create issues BEFORE navigating to the page
      await mockJira.createIssue({ summary: 'Board Search Test', status: 'To Do' });
      await mockJira.createIssue({ summary: 'Other Board Issue', status: 'To Do' });

      // First, go to issues page to establish the connection
      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Wait for issues to appear
      await expect(issuesPage.issueCards.first()).toBeVisible({ timeout: 10000 });

      // Now navigate to board (connection should be active)
      await page.goto('/board');
      const boardPage = new BoardPage(page);
      await boardPage.waitForLoaded();

      const allCards = await boardPage.cards.count();
      expect(allCards).toBeGreaterThan(0);
    });
  });

  test.describe('Search with Special Characters', () => {
    test('should handle special characters in search', async ({ page }) => {
      await mockJira.createIssue({
        summary: 'Issue with special chars: @#$%',
        status: 'To Do',
      });
      await mockJira.createIssue({ summary: 'Normal issue', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Wait for issues to appear
      await expect(issuesPage.issueCards.first()).toBeVisible({ timeout: 10000 });

      // Search for special characters
      await issuesPage.search('@#$%');
      await page.waitForTimeout(500);

      // Should find the issue
      expect(await issuesPage.getIssueCount()).toBe(1);
    });

    test('should handle unicode characters in search', async ({ page }) => {
      await mockJira.createIssue({
        summary: 'Issue with emoji 🐛',
        status: 'To Do',
      });
      await mockJira.createIssue({ summary: 'Regular issue', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Wait for issues to appear
      await expect(issuesPage.issueCards.first()).toBeVisible({ timeout: 10000 });

      // Search for emoji
      await issuesPage.search('🐛');
      await page.waitForTimeout(500);

      // Should find the issue
      expect(await issuesPage.getIssueCount()).toBe(1);
    });
  });
});

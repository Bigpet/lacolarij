import { test, TEST_USERS, ensureTestUserExists } from '../../fixtures/auth';
import { expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { SettingsPage } from '../../pages/settings.page';
import { BoardPage } from '../../pages/board.page';
import { IndexedDBHelper } from '../../fixtures/indexedDB';
import { MockJiraHelper } from '../../fixtures/mockJira';

const MOCK_CONNECTION_NAME = 'Mock JIRA (E2E)';

test.describe('Board Quick Filters', () => {
  let mockJira: MockJiraHelper;

  test.beforeEach(async ({ page, request }) => {
    mockJira = new MockJiraHelper(request);
    await mockJira.reset();
    await ensureTestUserExists(request, TEST_USERS.default);

    await page.goto('/login');
    const indexedDb = new IndexedDBHelper(page);
    await indexedDb.clearStorage();
    await page.reload();

    const loginPage = new LoginPage(page);
    await loginPage.login(TEST_USERS.default.username, TEST_USERS.default.password);
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
  });

  test.describe('With Mock JIRA Connection', () => {
    test.beforeEach(async ({ page }) => {
      const settingsPage = new SettingsPage(page);
      await settingsPage.goto('/settings');
      await settingsPage.waitForLoaded();

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

    // Helper to set up issues and navigate to board
    async function setupAndSyncIssues(page: any) {
      await page.goto('/issues');
      const connectionSelect = page.locator('select').first();
      await connectionSelect.selectOption({ label: MOCK_CONNECTION_NAME });
      const fullSyncButton = page.locator('button:has-text("Full Sync")');
      await fullSyncButton.click();
      await page.waitForTimeout(2000);
    }

    test('should display quick filters bar', async ({ page }) => {
      const boardPage = new BoardPage(page);
      await boardPage.goto('/board');
      await boardPage.waitForLoaded();

      await expect(boardPage.quickFilters).toBeVisible();
    });

    test('should filter by high priority', async ({ page }) => {
      await mockJira.createIssue({ summary: 'High Priority Bug', status: 'To Do', priority: 'High' });
      await mockJira.createIssue({ summary: 'Low Priority Task', status: 'To Do', priority: 'Low' });
      await mockJira.createIssue({ summary: 'Critical Issue', status: 'In Progress', priority: 'Critical' });
      await mockJira.createIssue({ summary: 'Medium Task', status: 'Done', priority: 'Medium' });

      const boardPage = new BoardPage(page);

      await setupAndSyncIssues(page);

      await boardPage.goto('/board');
      await boardPage.waitForLoaded();

      // Verify all issues visible initially
      let totalCards = await boardPage.getTotalCardCount();
      expect(totalCards).toBe(4);

      // Apply high priority filter
      await boardPage.toggleQuickFilter('high-priority');

      // Verify filter is active
      const isActive = await boardPage.isQuickFilterActive('high-priority');
      expect(isActive).toBe(true);

      // Only high/critical priority issues should be visible
      totalCards = await boardPage.getTotalCardCount();
      expect(totalCards).toBe(2);

      await expect(boardPage.getCard('TEST-1')).toBeVisible(); // High
      await expect(boardPage.getCard('TEST-2')).not.toBeVisible(); // Low
      await expect(boardPage.getCard('TEST-3')).toBeVisible(); // Critical
      await expect(boardPage.getCard('TEST-4')).not.toBeVisible(); // Medium
    });

    test('should filter by my issues', async ({ page }) => {
      // Create issues with different assignees
      // Note: The logged in user is e2e_test_user
      await mockJira.createIssue({ summary: 'My Task', status: 'To Do', assignee: 'e2e_test_user' });
      await mockJira.createIssue({ summary: 'Other Task', status: 'To Do', assignee: 'other_user' });
      await mockJira.createIssue({ summary: 'Unassigned Task', status: 'In Progress' });

      const boardPage = new BoardPage(page);

      await setupAndSyncIssues(page);

      await boardPage.goto('/board');
      await boardPage.waitForLoaded();

      // Verify all issues visible initially
      let totalCards = await boardPage.getTotalCardCount();
      expect(totalCards).toBe(3);

      // Apply "My Issues" filter
      await boardPage.toggleQuickFilter('my-issues');

      // Only issues assigned to current user should be visible
      totalCards = await boardPage.getTotalCardCount();
      expect(totalCards).toBe(1);

      await expect(boardPage.getCard('TEST-1')).toBeVisible();
      await expect(boardPage.getCard('TEST-2')).not.toBeVisible();
      await expect(boardPage.getCard('TEST-3')).not.toBeVisible();
    });

    test('should toggle filter off', async ({ page }) => {
      await mockJira.createIssue({ summary: 'High Priority', status: 'To Do', priority: 'High' });
      await mockJira.createIssue({ summary: 'Low Priority', status: 'To Do', priority: 'Low' });

      const boardPage = new BoardPage(page);

      await setupAndSyncIssues(page);

      await boardPage.goto('/board');
      await boardPage.waitForLoaded();

      // Toggle filter on
      await boardPage.toggleQuickFilter('high-priority');
      let totalCards = await boardPage.getTotalCardCount();
      expect(totalCards).toBe(1);

      // Toggle filter off
      await boardPage.toggleQuickFilter('high-priority');
      totalCards = await boardPage.getTotalCardCount();
      expect(totalCards).toBe(2);

      // Verify filter is no longer active
      const isActive = await boardPage.isQuickFilterActive('high-priority');
      expect(isActive).toBe(false);
    });

    test('should combine multiple filters', async ({ page }) => {
      await mockJira.createIssue({ summary: 'My High Priority', status: 'To Do', priority: 'High', assignee: 'e2e_test_user' });
      await mockJira.createIssue({ summary: 'My Low Priority', status: 'To Do', priority: 'Low', assignee: 'e2e_test_user' });
      await mockJira.createIssue({ summary: 'Other High Priority', status: 'In Progress', priority: 'High', assignee: 'other_user' });
      await mockJira.createIssue({ summary: 'Other Low Priority', status: 'Done', priority: 'Low', assignee: 'other_user' });

      const boardPage = new BoardPage(page);

      await setupAndSyncIssues(page);

      await boardPage.goto('/board');
      await boardPage.waitForLoaded();

      // Verify all issues visible initially
      let totalCards = await boardPage.getTotalCardCount();
      expect(totalCards).toBe(4);

      // Apply high priority filter
      await boardPage.toggleQuickFilter('high-priority');
      totalCards = await boardPage.getTotalCardCount();
      expect(totalCards).toBe(2); // TEST-1 and TEST-3

      // Also apply my issues filter
      await boardPage.toggleQuickFilter('my-issues');
      totalCards = await boardPage.getTotalCardCount();
      expect(totalCards).toBe(1); // Only TEST-1 (my + high)

      await expect(boardPage.getCard('TEST-1')).toBeVisible();
      await expect(boardPage.getCard('TEST-2')).not.toBeVisible();
      await expect(boardPage.getCard('TEST-3')).not.toBeVisible();
      await expect(boardPage.getCard('TEST-4')).not.toBeVisible();
    });

    test('should clear all filters', async ({ page }) => {
      await mockJira.createIssue({ summary: 'High Priority', status: 'To Do', priority: 'High' });
      await mockJira.createIssue({ summary: 'Low Priority', status: 'To Do', priority: 'Low' });

      const boardPage = new BoardPage(page);

      await setupAndSyncIssues(page);

      await boardPage.goto('/board');
      await boardPage.waitForLoaded();

      // Apply filter
      await boardPage.toggleQuickFilter('high-priority');
      let totalCards = await boardPage.getTotalCardCount();
      expect(totalCards).toBe(1);

      // Clear button should be visible when filters are active
      await expect(boardPage.clearFiltersButton).toBeVisible();

      // Clear all filters
      await boardPage.clearQuickFilters();

      // All issues should be visible again
      totalCards = await boardPage.getTotalCardCount();
      expect(totalCards).toBe(2);

      // Clear button should be hidden
      await expect(boardPage.clearFiltersButton).not.toBeVisible();
    });

    test('should maintain filter state after navigation', async ({ page }) => {
      await mockJira.createIssue({ summary: 'High Priority', status: 'To Do', priority: 'High' });
      await mockJira.createIssue({ summary: 'Low Priority', status: 'To Do', priority: 'Low' });

      const boardPage = new BoardPage(page);

      await setupAndSyncIssues(page);

      await boardPage.goto('/board');
      await boardPage.waitForLoaded();

      // Apply filter
      await boardPage.toggleQuickFilter('high-priority');

      // Navigate away and back
      await page.goto('/issues');
      await page.waitForTimeout(500);
      await boardPage.goto('/board');
      await boardPage.waitForLoaded();

      // Filter should still be active (stored in zustand)
      const isActive = await boardPage.isQuickFilterActive('high-priority');
      expect(isActive).toBe(true);

      // Only filtered issues should be visible
      const totalCards = await boardPage.getTotalCardCount();
      expect(totalCards).toBe(1);
    });

    test('should work with search and filters combined', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Authentication High', status: 'To Do', priority: 'High' });
      await mockJira.createIssue({ summary: 'Authentication Low', status: 'To Do', priority: 'Low' });
      await mockJira.createIssue({ summary: 'Dashboard High', status: 'In Progress', priority: 'High' });

      const boardPage = new BoardPage(page);

      await setupAndSyncIssues(page);

      await boardPage.goto('/board');
      await boardPage.waitForLoaded();

      // Apply high priority filter first
      await boardPage.toggleQuickFilter('high-priority');
      let totalCards = await boardPage.getTotalCardCount();
      expect(totalCards).toBe(2); // TEST-1 and TEST-3

      // Then search for "authentication"
      await boardPage.search('authentication');
      totalCards = await boardPage.getTotalCardCount();
      expect(totalCards).toBe(1); // Only TEST-1

      await expect(boardPage.getCard('TEST-1')).toBeVisible();
    });

    test('should show empty state when all issues filtered out', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Low Priority Only', status: 'To Do', priority: 'Low' });

      const boardPage = new BoardPage(page);

      await setupAndSyncIssues(page);

      await boardPage.goto('/board');
      await boardPage.waitForLoaded();

      // Verify issue is visible initially
      let totalCards = await boardPage.getTotalCardCount();
      expect(totalCards).toBe(1);

      // Apply high priority filter
      await boardPage.toggleQuickFilter('high-priority');

      // No issues should match
      totalCards = await boardPage.getTotalCardCount();
      expect(totalCards).toBe(0);

      // Empty state should be shown - check column counts are all zero
      const todoCount = await boardPage.getColumnIssueCount('todo');
      const inProgressCount = await boardPage.getColumnIssueCount('indeterminate');
      const doneCount = await boardPage.getColumnIssueCount('done');

      expect(todoCount).toBe(0);
      expect(inProgressCount).toBe(0);
      expect(doneCount).toBe(0);
    });

    test('should get active filters', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Test Issue', status: 'To Do', priority: 'High' });

      const boardPage = new BoardPage(page);

      await setupAndSyncIssues(page);

      await boardPage.goto('/board');
      await boardPage.waitForLoaded();

      // No filters active initially
      let activeFilters = await boardPage.getActiveFilters();
      expect(activeFilters.length).toBe(0);

      // Apply filters
      await boardPage.toggleQuickFilter('high-priority');
      await boardPage.toggleQuickFilter('my-issues');

      activeFilters = await boardPage.getActiveFilters();
      expect(activeFilters).toContain('high-priority');
      expect(activeFilters).toContain('my-issues');
      expect(activeFilters.length).toBe(2);
    });
  });
});

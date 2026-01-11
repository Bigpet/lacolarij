import { test, TEST_USERS, ensureTestUserExists } from '../../fixtures/auth';
import { expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { SettingsPage } from '../../pages/settings.page';
import { BoardPage } from '../../pages/board.page';
import { IndexedDBHelper } from '../../fixtures/indexedDB';
import { MockJiraHelper } from '../../fixtures/mockJira';

const MOCK_CONNECTION_NAME = 'Mock JIRA (E2E)';

test.describe('Board Rendering', () => {
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
    await expect(page).toHaveURL('/', { timeout: 10000 });
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

    test('should display the board page heading', async ({ page }) => {
      const boardPage = new BoardPage(page);
      await boardPage.goto('/board');
      await boardPage.waitForLoaded();

      await expect(boardPage.heading).toBeVisible();
      await expect(boardPage.heading).toHaveText('Board');
    });

    test('should display default columns', async ({ page }) => {
      const boardPage = new BoardPage(page);
      await boardPage.goto('/board');
      await boardPage.waitForLoaded();

      // Verify default columns are visible
      const columnCount = await boardPage.getColumnCount();
      expect(columnCount).toBe(3); // To Do, In Progress, Done

      const titles = await boardPage.getColumnTitles();
      expect(titles).toContain('To Do');
      expect(titles).toContain('In Progress');
      expect(titles).toContain('Done');
    });

    test('should display issues in correct columns after sync', async ({ page }) => {
      // Create issues with different statuses
      await mockJira.createIssue({ summary: 'Todo Issue', status: 'To Do' });
      await mockJira.createIssue({ summary: 'Progress Issue', status: 'In Progress' });
      await mockJira.createIssue({ summary: 'Done Issue', status: 'Done' });

      const boardPage = new BoardPage(page);
      await boardPage.goto('/board');
      await boardPage.waitForLoaded();

      // Sync issues (need to go to issues page first to trigger sync)
      await page.goto('/issues');
      const connectionSelect = page.locator('select').first();
      await connectionSelect.selectOption({ label: MOCK_CONNECTION_NAME });
      const fullSyncButton = page.locator('button:has-text("Full Sync")');
      await fullSyncButton.click();
      await boardPage.waitForSyncIdle();

      // Navigate back to board
      await boardPage.goto('/board');
      await boardPage.waitForLoaded();

      // Verify cards are in correct columns (with timeout for Dexie live query)
      const todoCards = boardPage.getCardsInColumn('todo');
      const inProgressCards = boardPage.getCardsInColumn('indeterminate');
      const doneCards = boardPage.getCardsInColumn('done');

      await expect(todoCards).toHaveCount(1, { timeout: 10000 });
      await expect(inProgressCards).toHaveCount(1, { timeout: 10000 });
      await expect(doneCards).toHaveCount(1, { timeout: 10000 });
    });

    test('should display issue cards with correct data', async ({ page }) => {
      await mockJira.createIssue({
        summary: 'Test Bug',
        status: 'To Do',
        priority: 'High',
        issueType: 'Bug',
        assignee: 'John Doe',
      });

      const boardPage = new BoardPage(page);
      await boardPage.goto('/board');
      await boardPage.waitForLoaded();

      // Sync issues
      await page.goto('/issues');
      const connectionSelect = page.locator('select').first();
      await connectionSelect.selectOption({ label: MOCK_CONNECTION_NAME });
      const fullSyncButton = page.locator('button:has-text("Full Sync")');
      await fullSyncButton.click();
      await boardPage.waitForSyncIdle();

      await boardPage.goto('/board');
      await boardPage.waitForLoaded();

      // Wait for the card to appear (Dexie live query may take a moment)
      const card = boardPage.getCard('TEST-1');
      await expect(card).toBeVisible({ timeout: 10000 });

      // Verify card content
      await expect(card).toContainText('TEST-1');
      await expect(card).toContainText('Test Bug');
    });

    test('should show column issue counts', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Todo 1', status: 'To Do' });
      await mockJira.createIssue({ summary: 'Todo 2', status: 'To Do' });
      await mockJira.createIssue({ summary: 'Progress 1', status: 'In Progress' });

      const boardPage = new BoardPage(page);
      await boardPage.goto('/board');
      await boardPage.waitForLoaded();

      // Sync issues
      await page.goto('/issues');
      const connectionSelect = page.locator('select').first();
      await connectionSelect.selectOption({ label: MOCK_CONNECTION_NAME });
      const fullSyncButton = page.locator('button:has-text("Full Sync")');
      await fullSyncButton.click();
      await boardPage.waitForSyncIdle();

      await boardPage.goto('/board');
      await boardPage.waitForLoaded();

      // Wait for cards to appear before checking counts
      await expect(boardPage.cards).toHaveCount(3, { timeout: 10000 });

      // Verify column counts
      const todoCount = await boardPage.getColumnIssueCount('todo');
      const inProgressCount = await boardPage.getColumnIssueCount('indeterminate');
      const doneCount = await boardPage.getColumnIssueCount('done');

      expect(todoCount).toBe(2);
      expect(inProgressCount).toBe(1);
      expect(doneCount).toBe(0);
    });

    test('should navigate to issue detail on card click', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Clickable Issue', status: 'To Do' });

      const boardPage = new BoardPage(page);
      await boardPage.goto('/board');
      await boardPage.waitForLoaded();

      // Sync issues
      await page.goto('/issues');
      const connectionSelect = page.locator('select').first();
      await connectionSelect.selectOption({ label: MOCK_CONNECTION_NAME });
      const fullSyncButton = page.locator('button:has-text("Full Sync")');
      await fullSyncButton.click();
      await boardPage.waitForSyncIdle();

      await boardPage.goto('/board');
      await boardPage.waitForLoaded();

      // Wait for the card to appear, then click
      await expect(boardPage.getCard('TEST-1')).toBeVisible({ timeout: 10000 });
      await boardPage.clickCard('TEST-1');

      // Verify navigation to detail page
      await expect(page).toHaveURL(/\/issues\/.+/);
    });

    test('should show empty state when no issues exist', async ({ page }) => {
      const boardPage = new BoardPage(page);
      await boardPage.goto('/board');
      await boardPage.waitForLoaded();

      // Verify empty state is shown
      const hasEmptyState = await boardPage.hasEmptyState();
      expect(hasEmptyState).toBe(true);
    });

    test('should search issues on board', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Authentication bug', status: 'To Do' });
      await mockJira.createIssue({ summary: 'Dashboard feature', status: 'In Progress' });

      const boardPage = new BoardPage(page);
      await boardPage.goto('/board');
      await boardPage.waitForLoaded();

      // Sync issues
      await page.goto('/issues');
      const connectionSelect = page.locator('select').first();
      await connectionSelect.selectOption({ label: MOCK_CONNECTION_NAME });
      const fullSyncButton = page.locator('button:has-text("Full Sync")');
      await fullSyncButton.click();
      await boardPage.waitForSyncIdle();

      await boardPage.goto('/board');
      await boardPage.waitForLoaded();

      // Wait for both cards to be visible initially
      await expect(boardPage.cards).toHaveCount(2, { timeout: 10000 });

      // Search for "authentication"
      await boardPage.search('authentication');

      // Verify only matching card is shown
      await expect(boardPage.cards).toHaveCount(1, { timeout: 5000 });
      await expect(boardPage.getCard('TEST-1')).toBeVisible();
      await expect(boardPage.getCard('TEST-2')).not.toBeVisible();

      // Clear search
      await boardPage.clearSearch();
      await expect(boardPage.cards).toHaveCount(2, { timeout: 5000 });
    });

    test('should toggle column visibility', async ({ page }) => {
      const boardPage = new BoardPage(page);
      await boardPage.goto('/board');
      await boardPage.waitForLoaded();

      // Initially should have 3 columns
      let columnCount = await boardPage.getColumnCount();
      expect(columnCount).toBe(3);

      // Open column settings and hide "Done" column
      await boardPage.toggleColumnVisibility('Done');
      await boardPage.closeColumnSettings();

      // Should now have 2 columns
      columnCount = await boardPage.getColumnCount();
      expect(columnCount).toBe(2);

      const titles = await boardPage.getColumnTitles();
      expect(titles).not.toContain('Done');

      // Re-show the column
      await boardPage.toggleColumnVisibility('Done');
      await boardPage.closeColumnSettings();

      columnCount = await boardPage.getColumnCount();
      expect(columnCount).toBe(3);
    });

    test('should reset column settings', async ({ page }) => {
      const boardPage = new BoardPage(page);
      await boardPage.goto('/board');
      await boardPage.waitForLoaded();

      // Hide a column
      await boardPage.toggleColumnVisibility('Done');
      await boardPage.toggleColumnVisibility('In Progress');
      await boardPage.closeColumnSettings();

      let columnCount = await boardPage.getColumnCount();
      expect(columnCount).toBe(1);

      // Reset columns
      await boardPage.resetColumnSettings();
      await boardPage.closeColumnSettings();

      columnCount = await boardPage.getColumnCount();
      expect(columnCount).toBe(3);
    });
  });
});

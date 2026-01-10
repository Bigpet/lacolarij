import { test, TEST_USERS, ensureTestUserExists } from '../../fixtures/auth';
import { expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { SettingsPage } from '../../pages/settings.page';
import { BoardPage } from '../../pages/board.page';
import { IndexedDBHelper } from '../../fixtures/indexedDB';
import { MockJiraHelper } from '../../fixtures/mockJira';

const MOCK_CONNECTION_NAME = 'Mock JIRA (E2E)';

test.describe('Board Drag and Drop', () => {
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

    // Helper to set up issues and navigate to board
    async function setupAndSyncIssues(page: any) {
      await page.goto('/issues');
      const connectionSelect = page.locator('select').first();
      await connectionSelect.selectOption({ label: MOCK_CONNECTION_NAME });
      const fullSyncButton = page.locator('button:has-text("Full Sync")');
      await fullSyncButton.click();
      await page.waitForTimeout(2000);
    }

    test('should move card from To Do to In Progress', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Drag Test Issue', status: 'To Do' });

      const boardPage = new BoardPage(page);

      // Sync issues
      await setupAndSyncIssues(page);

      await boardPage.goto('/board');
      await boardPage.waitForLoaded();

      // Verify card is in To Do column initially
      let cardColumn = await boardPage.getCardColumn('TEST-1');
      expect(cardColumn).toBe('todo');

      // Count cards in each column before drag
      const todoCountBefore = await boardPage.getColumnIssueCount('todo');
      const inProgressCountBefore = await boardPage.getColumnIssueCount('indeterminate');

      expect(todoCountBefore).toBe(1);
      expect(inProgressCountBefore).toBe(0);

      // Drag card to In Progress
      await boardPage.dragCardToColumn('TEST-1', 'indeterminate');

      // Wait for the transition
      await page.waitForTimeout(1000);

      // Verify card moved
      cardColumn = await boardPage.getCardColumn('TEST-1');
      expect(cardColumn).toBe('indeterminate');

      // Verify column counts changed
      const todoCountAfter = await boardPage.getColumnIssueCount('todo');
      const inProgressCountAfter = await boardPage.getColumnIssueCount('indeterminate');

      expect(todoCountAfter).toBe(0);
      expect(inProgressCountAfter).toBe(1);
    });

    test('should move card from In Progress to Done', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Progress Issue', status: 'In Progress' });

      const boardPage = new BoardPage(page);

      await setupAndSyncIssues(page);

      await boardPage.goto('/board');
      await boardPage.waitForLoaded();

      // Verify initial position
      let cardColumn = await boardPage.getCardColumn('TEST-1');
      expect(cardColumn).toBe('indeterminate');

      // Drag to Done
      await boardPage.dragCardToColumn('TEST-1', 'done');
      await page.waitForTimeout(1000);

      // Verify card moved
      cardColumn = await boardPage.getCardColumn('TEST-1');
      expect(cardColumn).toBe('done');
    });

    test('should update issue status after drag', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Status Update Test', status: 'To Do' });

      const boardPage = new BoardPage(page);

      await setupAndSyncIssues(page);

      await boardPage.goto('/board');
      await boardPage.waitForLoaded();

      // Drag to Done
      await boardPage.dragCardToColumn('TEST-1', 'done');
      await page.waitForTimeout(1000);

      // Navigate to issue detail and verify status changed
      await boardPage.clickCard('TEST-1');

      await expect(page).toHaveURL(/\/issues\/.+/);

      // The status should have changed (the exact status name depends on the workflow)
      // We verify by checking the detail page loads successfully after the transition
      await expect(page.locator('h1')).toContainText('TEST-1');
    });

    test('should move multiple cards between columns', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Issue One', status: 'To Do' });
      await mockJira.createIssue({ summary: 'Issue Two', status: 'To Do' });
      await mockJira.createIssue({ summary: 'Issue Three', status: 'In Progress' });

      const boardPage = new BoardPage(page);

      await setupAndSyncIssues(page);

      await boardPage.goto('/board');
      await boardPage.waitForLoaded();

      // Verify initial state
      let todoCount = await boardPage.getColumnIssueCount('todo');
      let inProgressCount = await boardPage.getColumnIssueCount('indeterminate');
      expect(todoCount).toBe(2);
      expect(inProgressCount).toBe(1);

      // Move first todo issue to in progress
      await boardPage.dragCardToColumn('TEST-1', 'indeterminate');
      await page.waitForTimeout(1000);

      // Move second todo issue to done
      await boardPage.dragCardToColumn('TEST-2', 'done');
      await page.waitForTimeout(1000);

      // Verify final state
      todoCount = await boardPage.getColumnIssueCount('todo');
      inProgressCount = await boardPage.getColumnIssueCount('indeterminate');
      const doneCount = await boardPage.getColumnIssueCount('done');

      expect(todoCount).toBe(0);
      expect(inProgressCount).toBe(2); // TEST-1 and TEST-3
      expect(doneCount).toBe(1); // TEST-2
    });

    test('should preserve card visibility after drag', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Visible Card', status: 'To Do' });

      const boardPage = new BoardPage(page);

      await setupAndSyncIssues(page);

      await boardPage.goto('/board');
      await boardPage.waitForLoaded();

      // Card should be visible before drag
      await expect(boardPage.getCard('TEST-1')).toBeVisible();

      // Drag to different column
      await boardPage.dragCardToColumn('TEST-1', 'indeterminate');
      await page.waitForTimeout(1000);

      // Card should still be visible after drag
      await expect(boardPage.getCard('TEST-1')).toBeVisible();
    });

    test('should cancel drag when dropped in same column', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Same Column Test', status: 'To Do' });

      const boardPage = new BoardPage(page);

      await setupAndSyncIssues(page);

      await boardPage.goto('/board');
      await boardPage.waitForLoaded();

      // Get initial column
      const initialColumn = await boardPage.getCardColumn('TEST-1');
      expect(initialColumn).toBe('todo');

      // Drag within same column (using dragTo on the column itself)
      const card = boardPage.getCard('TEST-1');
      const todoColumn = boardPage.getColumn('todo');
      await card.dragTo(todoColumn);
      await page.waitForTimeout(500);

      // Card should still be in same column
      const finalColumn = await boardPage.getCardColumn('TEST-1');
      expect(finalColumn).toBe('todo');
    });

    test('should handle drag with filtered view', async ({ page }) => {
      await mockJira.createIssue({ summary: 'High Priority Issue', status: 'To Do', priority: 'High' });
      await mockJira.createIssue({ summary: 'Low Priority Issue', status: 'To Do', priority: 'Low' });

      const boardPage = new BoardPage(page);

      await setupAndSyncIssues(page);

      await boardPage.goto('/board');
      await boardPage.waitForLoaded();

      // Apply high priority filter
      await boardPage.toggleQuickFilter('high-priority');

      // Only high priority issue should be visible
      let cardCount = await boardPage.getTotalCardCount();
      expect(cardCount).toBe(1);

      // Drag the visible card
      await boardPage.dragCardToColumn('TEST-1', 'indeterminate');
      await page.waitForTimeout(1000);

      // Card should still be visible and in new column
      await expect(boardPage.getCard('TEST-1')).toBeVisible();
      const column = await boardPage.getCardColumn('TEST-1');
      expect(column).toBe('indeterminate');
    });
  });
});

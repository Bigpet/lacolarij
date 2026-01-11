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

test.describe('Issue Inline Editing', () => {
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

  test.describe('Summary Editing', () => {
    test('should edit summary with Enter key', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Original Summary', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      await expect(issuesPage.getIssueCard('TEST-1')).toBeVisible();
      await issuesPage.clickIssue('TEST-1');

      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();

      // Edit summary
      await detailPage.editSummary('Updated Summary Text');

      // Verify the summary was updated
      expect(await detailPage.getSummary()).toBe('Updated Summary Text');
    });

    test('should cancel summary edit with Escape key', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Keep This Summary', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      await expect(issuesPage.getIssueCard('TEST-1')).toBeVisible();
      await issuesPage.clickIssue('TEST-1');

      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();

      // Start editing
      await detailPage.startEditSummary();
      await detailPage.summaryInput.fill('This should be canceled');

      // Cancel with Escape
      await detailPage.cancelSummaryEditWithEscape();

      // Verify original summary is preserved
      expect(await detailPage.getSummary()).toBe('Keep This Summary');
    });

    test('should edit summary with save button', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Button Save Test', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      await expect(issuesPage.getIssueCard('TEST-1')).toBeVisible();
      await issuesPage.clickIssue('TEST-1');

      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();

      // Edit summary with button
      await detailPage.editSummaryWithButton('Saved With Button');

      // Verify the summary was updated
      expect(await detailPage.getSummary()).toBe('Saved With Button');
    });
  });

  test.describe('Description Editing', () => {
    test('should edit description', async ({ page }) => {
      await mockJira.createIssue({
        summary: 'Description Edit Test',
        description: 'Original description text',
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

      // Edit description
      await detailPage.editDescription('Updated description content');

      // Verify the description was updated
      const description = await detailPage.getDescription();
      expect(description).toContain('Updated description content');
    });

    test('should cancel description edit', async ({ page }) => {
      await mockJira.createIssue({
        summary: 'Cancel Description Test',
        description: 'Keep this description',
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

      // Start editing description
      await detailPage.startEditDescription();
      await detailPage.descriptionTextarea.fill('This should be canceled');

      // Cancel the edit
      await detailPage.cancelDescriptionEdit();

      // Verify original description is preserved
      const description = await detailPage.getDescription();
      expect(description).toContain('Keep this description');
    });

    test('should add description to issue without one', async ({ page }) => {
      await mockJira.createIssue({
        summary: 'No Description Initially',
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

      // Initially should show no description
      await expect(detailPage.descriptionCard.locator('text=No description provided')).toBeVisible();

      // Add a description
      await detailPage.editDescription('New description added');

      // Verify the description was added
      const description = await detailPage.getDescription();
      expect(description).toContain('New description added');
    });
  });

  test.describe('Sync Status After Edits', () => {
    test('should show pending status after offline edit', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Offline Edit Test', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      await expect(issuesPage.getIssueCard('TEST-1')).toBeVisible();
      await issuesPage.clickIssue('TEST-1');

      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();

      // Go offline
      await indexedDb.setOfflineMode();

      // Edit the summary
      await detailPage.editSummary('Edited While Offline');

      // Should show pending status
      const syncStatus = await detailPage.getSyncStatus();
      expect(syncStatus).toBe('Pending');
    });

    test('should sync changes when back online', async ({ page }) => {
      await mockJira.createIssue({ summary: 'Online Sync Test', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      await expect(issuesPage.getIssueCard('TEST-1')).toBeVisible();
      await issuesPage.clickIssue('TEST-1');

      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();

      // Go offline and make an edit
      await indexedDb.setOfflineMode();
      await detailPage.editSummary('Changed Offline');

      // Verify pending
      expect(await detailPage.getSyncStatus()).toBe('Pending');

      // Go back online
      await indexedDb.setOnlineMode();

      // Go back to issues and trigger sync
      await detailPage.goBack();
      await issuesPage.waitForLoaded();
      await issuesPage.triggerSync();

      // Navigate back to detail and check status
      await issuesPage.clickIssue('TEST-1');
      await detailPage.waitForLoaded();

      // Should be synced now
      expect(await detailPage.getSyncStatus()).toBe('Synced');
    });
  });
});

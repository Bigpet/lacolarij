import { test, TEST_USERS, ensureTestUserExists } from '../../fixtures/auth';
import { expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { SettingsPage } from '../../pages/settings.page';
import { IssuesPage } from '../../pages/issues.page';
import { IndexedDBHelper } from '../../fixtures/indexedDB';
import { MockJiraHelper } from '../../fixtures/mockJira';

// Use a consistent connection name so we can select it
const MOCK_CONNECTION_NAME = 'Mock JIRA (E2E)';

test.describe('Issue Creation', () => {
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

  test.describe('Modal Interactions', () => {
    test('should open Create Issue modal from button', async ({ page }) => {
      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();

      // Click create button
      await issuesPage.createIssueButton.click();

      // Modal should be visible (check form fields)
      await expect(issuesPage.createIssueSummary).toBeVisible();
      await expect(issuesPage.createIssueProjectKey).toBeVisible();
      await expect(issuesPage.createIssueType).toBeVisible();
    });

    test('should close modal on Cancel button', async ({ page }) => {
      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();

      // Open modal
      await issuesPage.openCreateIssueModal();
      await expect(issuesPage.createIssueModal).toBeVisible();

      // Click cancel
      await issuesPage.createIssueCancelButton.click();

      // Modal should be closed
      await expect(issuesPage.createIssueModal).not.toBeVisible();
    });

    test('should close modal on backdrop click', async ({ page }) => {
      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();

      // Open modal
      await issuesPage.openCreateIssueModal();
      await expect(issuesPage.createIssueModal).toBeVisible();

      // Click outside the modal (on the backdrop overlay)
      // Click at a position that's definitely outside the centered modal content
      // The viewport is typically 1280x720, modal is max-w-md (~448px) centered
      // So clicking at x=50, y=50 (top-left area) should be outside the modal
      await page.mouse.click(50, 50);

      // Modal should be closed
      await expect(issuesPage.createIssueModal).not.toBeVisible();
    });
  });

  test.describe('Local Issue Creation', () => {
    test('should create issue with LOCAL-xxx key', async ({ page }) => {
      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();

      // Create a local issue
      await issuesPage.createIssue({
        projectKey: 'TEST',
        summary: 'My Local Issue',
        issueType: 'Task',
      });

      // Should navigate to the issue detail page (URL contains /issues/)
      await expect(page).toHaveURL(/\/issues\/.+/, { timeout: 10000 });
    });

    test('should show issue in list after creation', async ({ page }) => {
      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();

      // Create a local issue
      await issuesPage.createIssue({
        projectKey: 'TEST',
        summary: 'Visible In List Issue',
        issueType: 'Bug',
      });

      // Navigate back to issues list
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();

      // Issue should appear in the list with LOCAL-xxx key
      const localIssueCard = issuesPage.issueCards.filter({ hasText: 'Visible In List Issue' });
      await expect(localIssueCard).toBeVisible();

      // Should have a LOCAL- prefix key
      await expect(localIssueCard.filter({ hasText: /LOCAL-/ })).toBeVisible();
    });

    test('should navigate to new issue detail page', async ({ page }) => {
      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();

      // Create a local issue
      await issuesPage.createIssue({
        projectKey: 'PROJ',
        summary: 'Navigate Test Issue',
      });

      // Should be on the detail page
      await expect(page).toHaveURL(/\/issues\/.+/);

      // Should show the issue summary
      await expect(page.locator('text=Navigate Test Issue')).toBeVisible();
    });

    test('should store issue in IndexedDB with pending status', async ({ page }) => {
      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();

      // Create a local issue
      await issuesPage.createIssue({
        projectKey: 'TEST',
        summary: 'IndexedDB Test Issue',
      });

      // Wait a moment for IndexedDB write
      await page.waitForTimeout(500);

      // Check IndexedDB
      const issues = await indexedDb.getIssues();
      const localIssue = issues.find((i: { key: string }) => i.key.startsWith('LOCAL-'));

      expect(localIssue).toBeDefined();
      expect(localIssue.summary).toBe('IndexedDB Test Issue');
      expect(localIssue._syncStatus).toBe('pending');
    });

    test('should create issue with description', async ({ page }) => {
      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();

      // Create a local issue with description
      await issuesPage.createIssue({
        projectKey: 'TEST',
        summary: 'Issue With Description',
        description: 'This is a detailed description of the issue.',
      });

      // Should be on the detail page
      await expect(page).toHaveURL(/\/issues\/.+/);

      // Should show the description
      await expect(page.locator('text=This is a detailed description')).toBeVisible();
    });
  });

  test.describe('Form Validation', () => {
    test('should require summary field', async ({ page }) => {
      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();

      // Open modal and fill only project key
      await issuesPage.openCreateIssueModal();
      await issuesPage.fillCreateIssueForm({
        projectKey: 'TEST',
        summary: '', // Empty summary
      });

      // Try to submit
      await issuesPage.submitCreateIssue();

      // Should show error and modal should stay open
      await expect(issuesPage.createIssueModal).toBeVisible();
      const error = await issuesPage.getCreateIssueError();
      expect(error).toContain('Summary is required');
    });

    test('should require project key field', async ({ page }) => {
      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();

      // Open modal and fill only summary
      await issuesPage.openCreateIssueModal();
      await issuesPage.fillCreateIssueForm({
        projectKey: '', // Empty project key
        summary: 'Test Summary',
      });

      // Try to submit
      await issuesPage.submitCreateIssue();

      // Should show error and modal should stay open
      await expect(issuesPage.createIssueModal).toBeVisible();
      const error = await issuesPage.getCreateIssueError();
      expect(error).toContain('Project key is required');
    });

    test('should accept all issue types (Task, Bug, Story, Epic)', async ({ page }) => {
      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();

      const issueTypes = ['Task', 'Bug', 'Story', 'Epic'];

      for (const issueType of issueTypes) {
        // Create issue with this type
        await issuesPage.createIssue({
          projectKey: 'TEST',
          summary: `${issueType} Test Issue`,
          issueType,
        });

        // Navigate back to issues list for next iteration
        await issuesPage.goto('/issues');
        await issuesPage.waitForLoaded();
      }

      // All issues should be in IndexedDB
      const issues = await indexedDb.getIssues();
      const localIssues = issues.filter((i: { key: string }) => i.key.startsWith('LOCAL-'));
      expect(localIssues.length).toBe(4);
    });
  });

  test.describe('Sync Integration', () => {
    test('should update LOCAL key to real Jira key after sync', async ({ page }) => {
      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);

      // Create a local issue
      await issuesPage.createIssue({
        projectKey: 'TEST',
        summary: 'Sync Key Test Issue',
      });

      // Navigate back to issues and sync
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerSync();

      // After sync, the LOCAL-xxx key should be replaced with TEST-N
      // Wait for the issue to appear with new key
      await expect(issuesPage.issueCards.filter({ hasText: 'Sync Key Test Issue' })).toBeVisible();

      // Check that issue now has a real key in IndexedDB
      const issues = await indexedDb.getIssues();
      const syncedIssue = issues.find((i: { summary: string }) => i.summary === 'Sync Key Test Issue');
      expect(syncedIssue).toBeDefined();
      // After sync, should have TEST- prefix (from mock JIRA) not LOCAL-
      expect(syncedIssue.key).toMatch(/^TEST-\d+$/);
    });

    test('should mark issue as synced after successful push', async ({ page }) => {
      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);

      // Create a local issue
      await issuesPage.createIssue({
        projectKey: 'TEST',
        summary: 'Sync Status Test Issue',
      });

      // Navigate back to issues and sync
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerSync();

      // Wait for sync to complete
      await page.waitForTimeout(1000);

      // Check IndexedDB for synced status
      const issues = await indexedDb.getIssues();
      const syncedIssue = issues.find((i: { summary: string }) => i.summary === 'Sync Status Test Issue');
      expect(syncedIssue).toBeDefined();
      expect(syncedIssue._syncStatus).toBe('synced');
    });
  });

  test.describe('Offline Creation', () => {
    test('should create issue while offline', async ({ page }) => {
      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();

      // Go offline
      await indexedDb.setOfflineMode();

      // Create a local issue
      await issuesPage.createIssue({
        projectKey: 'TEST',
        summary: 'Offline Created Issue',
      });

      // Should still navigate to detail page
      await expect(page).toHaveURL(/\/issues\/.+/);

      // Issue should be in IndexedDB
      const issues = await indexedDb.getIssues();
      const offlineIssue = issues.find((i: { summary: string }) => i.summary === 'Offline Created Issue');
      expect(offlineIssue).toBeDefined();
      expect(offlineIssue._syncStatus).toBe('pending');

      // Go back online
      await indexedDb.setOnlineMode();
    });

    test('should queue pending operation for later sync', async ({ page }) => {
      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();

      // Go offline
      await indexedDb.setOfflineMode();

      // Create a local issue
      await issuesPage.createIssue({
        projectKey: 'TEST',
        summary: 'Pending Op Queue Issue',
      });

      // Wait for the operation to be queued
      await page.waitForTimeout(500);

      // Check for pending operations in IndexedDB
      const pendingOps = await indexedDb.getPendingOperations();
      const createOp = pendingOps.find(
        (op: { operation: string; payload?: { fields?: { summary?: string } } }) =>
          op.operation === 'create' && op.payload?.fields?.summary === 'Pending Op Queue Issue'
      );
      expect(createOp).toBeDefined();

      // Go back online
      await indexedDb.setOnlineMode();
    });

    test('should sync offline-created issue when back online', async ({ page }) => {
      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);

      // Go offline
      await indexedDb.setOfflineMode();

      // Create a local issue
      await issuesPage.createIssue({
        projectKey: 'TEST',
        summary: 'Offline Then Online Issue',
      });

      // Go back online before navigating
      await indexedDb.setOnlineMode();

      // Navigate back to issues
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();

      // Select connection and sync
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerSync();

      // Wait for sync
      await page.waitForTimeout(1000);

      // Issue should now be synced with real key
      const issues = await indexedDb.getIssues();
      const syncedIssue = issues.find((i: { summary: string }) => i.summary === 'Offline Then Online Issue');
      expect(syncedIssue).toBeDefined();
      expect(syncedIssue._syncStatus).toBe('synced');
      expect(syncedIssue.key).toMatch(/^TEST-\d+$/);
    });
  });
});

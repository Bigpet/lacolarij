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

test.describe('Conflict Resolution', () => {
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

  test.describe('Conflict Detection', () => {
    test('should detect conflict when remote changes while local has pending changes', async ({ page }) => {
      // Create and sync an issue
      await mockJira.createIssue({ summary: 'Original Summary', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Navigate to detail and make a local change while offline
      await issuesPage.clickIssue('TEST-1');
      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();

      // Go offline and make local change
      await indexedDb.setOfflineMode();
      await detailPage.editSummary('Local Summary Change');

      // Verify pending status
      expect(await detailPage.getSyncStatus()).toBe('Pending');

      // Simulate remote change BEFORE going online
      // (This prevents race condition with auto-sync on reconnection)
      await page.waitForTimeout(100);
      await mockJira.simulateRemoteChange('TEST-1', { summary: 'Remote Summary Change' });

      // Go back online
      await indexedDb.setOnlineMode();

      // Trigger sync - this should detect the conflict
      await detailPage.goBack();
      await issuesPage.waitForLoaded();
      await issuesPage.triggerSync();

      // Wait for sync to complete and UI to update
      await page.waitForTimeout(500);

      // Should show conflict - navigate to detail to check
      await issuesPage.clickIssue('TEST-1');
      await detailPage.waitForLoaded();

      // Wait for status to update
      await expect(detailPage.syncStatusBadge).toContainText('Conflict', { timeout: 5000 });
    });

    test('should show conflict badge in status bar', async ({ page }) => {
      // Create and sync an issue
      await mockJira.createIssue({ summary: 'Conflict Badge Test', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Make local change while offline
      await issuesPage.clickIssue('TEST-1');
      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();

      await indexedDb.setOfflineMode();
      await detailPage.editSummary('Local Edit');

      // Simulate remote change BEFORE going online (prevents race with auto-sync)
      await page.waitForTimeout(100);
      await mockJira.simulateRemoteChange('TEST-1', { summary: 'Remote Edit' });

      await indexedDb.setOnlineMode();

      // Sync to trigger conflict
      await detailPage.goBack();
      await issuesPage.waitForLoaded();
      await issuesPage.triggerSync();

      // Wait for UI to update
      await page.waitForTimeout(500);

      // Should show conflict badge
      const conflictBadge = page.locator('text=/\\d+ conflict/i');
      await expect(conflictBadge).toBeVisible({ timeout: 10000 });
    });

    test('should show conflict banner when conflicts exist', async ({ page }) => {
      // Create and sync an issue
      await mockJira.createIssue({ summary: 'Banner Test', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Make local change while offline
      await issuesPage.clickIssue('TEST-1');
      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();

      await indexedDb.setOfflineMode();
      await detailPage.editSummary('Banner Local');

      // Simulate remote change BEFORE going online (prevents race with auto-sync)
      await page.waitForTimeout(100);
      await mockJira.simulateRemoteChange('TEST-1', { summary: 'Banner Remote' });

      await indexedDb.setOnlineMode();

      // Sync to trigger conflict
      await detailPage.goBack();
      await issuesPage.waitForLoaded();
      await issuesPage.triggerSync();

      // Wait for UI to update
      await page.waitForTimeout(500);

      // Should show conflict banner
      const conflictBanner = page.locator('text=/issue.*conflict.*resolution/i');
      await expect(conflictBanner).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Conflict Resolver Modal', () => {
    test('should open conflict resolver when Review Now is clicked', async ({ page }) => {
      // Create and sync an issue
      await mockJira.createIssue({ summary: 'Modal Test', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Create conflict
      await issuesPage.clickIssue('TEST-1');
      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();

      await indexedDb.setOfflineMode();
      await detailPage.editSummary('Modal Local');

      // Simulate remote change BEFORE going online (prevents race with auto-sync)
      await page.waitForTimeout(100);
      await mockJira.simulateRemoteChange('TEST-1', { summary: 'Modal Remote' });

      await indexedDb.setOnlineMode();

      await detailPage.goBack();
      await issuesPage.waitForLoaded();
      await issuesPage.triggerSync();

      // Click Review Now
      const reviewButton = page.locator('button:has-text("Review Now")');
      await expect(reviewButton).toBeVisible({ timeout: 10000 });
      await reviewButton.click();

      // Conflict resolver modal should open
      const modal = page.locator('text=Resolve Conflict');
      await expect(modal).toBeVisible({ timeout: 5000 });
    });

    test('should display both local and remote versions', async ({ page }) => {
      // Create and sync an issue
      await mockJira.createIssue({ summary: 'Version Display Test', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Create conflict
      await issuesPage.clickIssue('TEST-1');
      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();

      await indexedDb.setOfflineMode();
      await detailPage.editSummary('My Local Version');

      // Simulate remote change BEFORE going online (prevents race with auto-sync)
      await page.waitForTimeout(100);
      await mockJira.simulateRemoteChange('TEST-1', { summary: 'Server Version' });

      await indexedDb.setOnlineMode();

      await detailPage.goBack();
      await issuesPage.waitForLoaded();
      await issuesPage.triggerSync();

      // Open conflict resolver
      const reviewButton = page.locator('button:has-text("Review Now")');
      await reviewButton.click();

      // Should show both versions
      const yourVersion = page.locator('text=Your Version');
      const serverVersion = page.locator('text=Server Version');
      await expect(yourVersion).toBeVisible({ timeout: 5000 });
      await expect(serverVersion).toBeVisible({ timeout: 5000 });

      // Should show the actual values
      const localSummary = page.locator('text=My Local Version');
      const remoteSummary = page.locator('text=Server Version').nth(1); // Second occurrence is the value
      await expect(localSummary).toBeVisible();
    });

    test('should show resolution buttons', async ({ page }) => {
      // Create and sync an issue
      await mockJira.createIssue({ summary: 'Button Test', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Create conflict
      await issuesPage.clickIssue('TEST-1');
      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();

      await indexedDb.setOfflineMode();
      await detailPage.editSummary('Button Local');

      // Simulate remote change BEFORE going online (prevents race with auto-sync)
      await page.waitForTimeout(100);
      await mockJira.simulateRemoteChange('TEST-1', { summary: 'Button Remote' });

      await indexedDb.setOnlineMode();

      await detailPage.goBack();
      await issuesPage.waitForLoaded();
      await issuesPage.triggerSync();

      // Open conflict resolver
      const reviewButton = page.locator('button:has-text("Review Now")');
      await reviewButton.click();

      // Should show resolution buttons
      const keepServerButton = page.locator('button:has-text("Keep Server Version")');
      const keepMyButton = page.locator('button:has-text("Keep My Version")');
      await expect(keepServerButton).toBeVisible({ timeout: 5000 });
      await expect(keepMyButton).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Conflict Resolution Actions', () => {
    test('should resolve conflict by keeping local version', async ({ page }) => {
      // Create and sync an issue
      await mockJira.createIssue({ summary: 'Keep Local Test', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Create conflict
      await issuesPage.clickIssue('TEST-1');
      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();

      await indexedDb.setOfflineMode();
      await detailPage.editSummary('Keep This Local');

      // Simulate remote change BEFORE going online (prevents race with auto-sync)
      await page.waitForTimeout(100);
      await mockJira.simulateRemoteChange('TEST-1', { summary: 'Discard This Remote' });

      await indexedDb.setOnlineMode();

      await detailPage.goBack();
      await issuesPage.waitForLoaded();
      await issuesPage.triggerSync();

      // Open conflict resolver and keep local
      const reviewButton = page.locator('button:has-text("Review Now")');
      await reviewButton.click();

      const keepMyButton = page.locator('button:has-text("Keep My Version")');
      await keepMyButton.click();

      // Wait for modal to close
      await expect(page.locator('text=Resolve Conflict')).not.toBeVisible({ timeout: 10000 });

      // Verify local version was kept
      await issuesPage.clickIssue('TEST-1');
      await detailPage.waitForLoaded();

      const summary = await detailPage.getSummary();
      expect(summary).toBe('Keep This Local');

      // Should be synced now
      const syncStatus = await detailPage.getSyncStatus();
      expect(syncStatus).toBe('Synced');
    });

    test('should resolve conflict by keeping server version', async ({ page }) => {
      // Create and sync an issue
      await mockJira.createIssue({ summary: 'Keep Server Test', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Create conflict
      await issuesPage.clickIssue('TEST-1');
      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();

      await indexedDb.setOfflineMode();
      await detailPage.editSummary('Discard This Local');

      // Simulate remote change BEFORE going online (prevents race with auto-sync)
      await page.waitForTimeout(100);
      await mockJira.simulateRemoteChange('TEST-1', { summary: 'Keep This Server' });

      await indexedDb.setOnlineMode();

      await detailPage.goBack();
      await issuesPage.waitForLoaded();
      await issuesPage.triggerSync();

      // Open conflict resolver and keep server
      const reviewButton = page.locator('button:has-text("Review Now")');
      await reviewButton.click();

      const keepServerButton = page.locator('button:has-text("Keep Server Version")');
      await keepServerButton.click();

      // Wait for modal to close
      await expect(page.locator('text=Resolve Conflict')).not.toBeVisible({ timeout: 10000 });

      // Verify server version was kept
      await issuesPage.clickIssue('TEST-1');
      await detailPage.waitForLoaded();

      const summary = await detailPage.getSummary();
      expect(summary).toBe('Keep This Server');

      // Should be synced now
      const syncStatus = await detailPage.getSyncStatus();
      expect(syncStatus).toBe('Synced');
    });

    test('should clear conflict badge after resolution', async ({ page }) => {
      // Create and sync an issue
      await mockJira.createIssue({ summary: 'Clear Badge Test', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Create conflict
      await issuesPage.clickIssue('TEST-1');
      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();

      await indexedDb.setOfflineMode();
      await detailPage.editSummary('Clear Badge Local');

      // Simulate remote change BEFORE going online (prevents race with auto-sync)
      await page.waitForTimeout(100);
      await mockJira.simulateRemoteChange('TEST-1', { summary: 'Clear Badge Remote' });

      await indexedDb.setOnlineMode();

      await detailPage.goBack();
      await issuesPage.waitForLoaded();
      await issuesPage.triggerSync();

      // Verify conflict badge exists
      const conflictBadge = page.locator('text=/\\d+ conflict/i');
      await expect(conflictBadge).toBeVisible({ timeout: 10000 });

      // Resolve conflict
      const reviewButton = page.locator('button:has-text("Review Now")');
      await reviewButton.click();

      const keepMyButton = page.locator('button:has-text("Keep My Version")');
      await keepMyButton.click();

      // Conflict badge should be gone
      await expect(conflictBadge).not.toBeVisible({ timeout: 10000 });
    });

    test('should clear conflict banner after resolution', async ({ page }) => {
      // Create and sync an issue
      await mockJira.createIssue({ summary: 'Clear Banner Test', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Create conflict
      await issuesPage.clickIssue('TEST-1');
      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();

      await indexedDb.setOfflineMode();
      await detailPage.editSummary('Clear Banner Local');

      // Simulate remote change BEFORE going online (prevents race with auto-sync)
      await page.waitForTimeout(100);
      await mockJira.simulateRemoteChange('TEST-1', { summary: 'Clear Banner Remote' });

      await indexedDb.setOnlineMode();

      await detailPage.goBack();
      await issuesPage.waitForLoaded();
      await issuesPage.triggerSync();

      // Verify conflict banner exists
      const conflictBanner = page.locator('text=/issue.*conflict.*resolution/i');
      await expect(conflictBanner).toBeVisible({ timeout: 10000 });

      // Resolve conflict
      const reviewButton = page.locator('button:has-text("Review Now")');
      await reviewButton.click();

      const keepServerButton = page.locator('button:has-text("Keep Server Version")');
      await keepServerButton.click();

      // Conflict banner should be gone
      await expect(conflictBanner).not.toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Multiple Conflicts', () => {
    test('should handle multiple conflicts', async ({ page }) => {
      // Create multiple issues
      await mockJira.createIssue({ summary: 'Multi Conflict 1', status: 'To Do' });
      await mockJira.createIssue({ summary: 'Multi Conflict 2', status: 'In Progress' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Make local changes to both issues while offline
      await indexedDb.setOfflineMode();

      await issuesPage.clickIssue('TEST-1');
      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();
      await detailPage.editSummary('Local Change 1');

      await detailPage.goBack();
      await issuesPage.waitForLoaded();

      await issuesPage.clickIssue('TEST-2');
      await detailPage.waitForLoaded();
      await detailPage.editSummary('Local Change 2');

      // Simulate remote changes BEFORE going online (prevents race with auto-sync)
      await page.waitForTimeout(100);
      await mockJira.simulateRemoteChange('TEST-1', { summary: 'Remote Change 1' });
      await mockJira.simulateRemoteChange('TEST-2', { summary: 'Remote Change 2' });

      await indexedDb.setOnlineMode();

      // Sync to trigger conflicts
      await detailPage.goBack();
      await issuesPage.waitForLoaded();
      await issuesPage.triggerSync();

      // Should show multiple conflicts
      const conflictBadge = page.locator('text=/2 conflicts/i');
      await expect(conflictBadge).toBeVisible({ timeout: 10000 });
    });

    test('should show correct count after resolving one conflict', async ({ page }) => {
      // Create multiple issues
      await mockJira.createIssue({ summary: 'Count Test 1', status: 'To Do' });
      await mockJira.createIssue({ summary: 'Count Test 2', status: 'In Progress' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Make local changes to both issues while offline
      await indexedDb.setOfflineMode();

      await issuesPage.clickIssue('TEST-1');
      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();
      await detailPage.editSummary('Count Local 1');

      await detailPage.goBack();
      await issuesPage.waitForLoaded();

      await issuesPage.clickIssue('TEST-2');
      await detailPage.waitForLoaded();
      await detailPage.editSummary('Count Local 2');

      // Simulate remote changes BEFORE going online (prevents race with auto-sync)
      await page.waitForTimeout(100);
      await mockJira.simulateRemoteChange('TEST-1', { summary: 'Count Remote 1' });
      await mockJira.simulateRemoteChange('TEST-2', { summary: 'Count Remote 2' });

      await indexedDb.setOnlineMode();

      // Sync to trigger conflicts
      await detailPage.goBack();
      await issuesPage.waitForLoaded();
      await issuesPage.triggerSync();

      // Verify 2 conflicts initially
      const twoConflicts = page.locator('text=/2 conflicts/i');
      await expect(twoConflicts).toBeVisible({ timeout: 10000 });

      // Resolve one conflict
      const reviewButton = page.locator('button:has-text("Review Now")');
      await reviewButton.click();

      const keepMyButton = page.locator('button:has-text("Keep My Version")');
      await keepMyButton.click();

      // Should now show 1 conflict
      const oneConflict = page.locator('text=/1 conflict/i');
      await expect(oneConflict).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Conflict State Persistence', () => {
    test('should persist conflict status across page refresh', async ({ page }) => {
      // Create and sync an issue
      await mockJira.createIssue({ summary: 'Persist Conflict Test', status: 'To Do' });

      const issuesPage = new IssuesPage(page);
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);
      await issuesPage.triggerFullSync();

      // Create conflict
      await issuesPage.clickIssue('TEST-1');
      const detailPage = new IssueDetailPage(page);
      await detailPage.waitForLoaded();

      await indexedDb.setOfflineMode();
      await detailPage.editSummary('Persist Local');

      // Simulate remote change BEFORE going online (prevents race with auto-sync)
      await page.waitForTimeout(100);
      await mockJira.simulateRemoteChange('TEST-1', { summary: 'Persist Remote' });

      await indexedDb.setOnlineMode();

      await detailPage.goBack();
      await issuesPage.waitForLoaded();
      await issuesPage.triggerSync();

      // Verify conflict exists
      await issuesPage.clickIssue('TEST-1');
      await detailPage.waitForLoaded();
      expect(await detailPage.getSyncStatus()).toBe('Conflict');

      // Refresh page
      await page.reload();

      // Navigate back to issue
      await issuesPage.goto('/issues');
      await issuesPage.waitForLoaded();
      await issuesPage.selectConnection(MOCK_CONNECTION_NAME);

      await issuesPage.clickIssue('TEST-1');
      await detailPage.waitForLoaded();

      // Conflict should still be present
      expect(await detailPage.getSyncStatus()).toBe('Conflict');
    });
  });
});

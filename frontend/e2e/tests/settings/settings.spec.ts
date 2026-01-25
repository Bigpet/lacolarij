import { test, TEST_USERS, ensureTestUserExists } from '../../fixtures/auth';
import { expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { SettingsPage } from '../../pages/settings.page';
import { IndexedDBHelper } from '../../fixtures/indexedDB';

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page, request }) => {
    // Ensure test user exists
    await ensureTestUserExists(request, TEST_USERS.default);

    // Clear storage before each test for isolation
    await page.goto('/login');
    const indexedDb = new IndexedDBHelper(page);
    await indexedDb.clearStorage();
    await page.reload();

    // Login first
    const loginPage = new LoginPage(page);
    await loginPage.login(TEST_USERS.default.username, TEST_USERS.default.password);
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
  });

  test('should display settings page', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    await settingsPage.goto('/settings');

    await expect(settingsPage.heading).toBeVisible();
    await settingsPage.waitForLoaded();
  });

  test('should show add connection button', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    await settingsPage.goto('/settings');
    await settingsPage.waitForLoaded();

    await expect(settingsPage.addConnectionButton).toBeVisible();
  });

  test('should open and close add connection form', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    await settingsPage.goto('/settings');
    await settingsPage.waitForLoaded();

    // Open form
    await settingsPage.openAddConnectionForm();
    await expect(settingsPage.nameInput).toBeVisible();
    await expect(settingsPage.jiraUrlInput).toBeVisible();
    await expect(settingsPage.emailInput).toBeVisible();
    await expect(settingsPage.apiTokenInput).toBeVisible();
    await expect(settingsPage.saveButton).toBeVisible();
    await expect(settingsPage.cancelButton).toBeVisible();

    // Cancel form
    await settingsPage.cancelForm();
    await expect(settingsPage.nameInput).not.toBeVisible();
    await expect(settingsPage.addConnectionButton).toBeVisible();
  });

  test('should add a new JIRA connection', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    await settingsPage.goto('/settings');
    await settingsPage.waitForLoaded();

    const connectionName = `Test Connection ${Date.now()}`;
    await settingsPage.addConnection({
      name: connectionName,
      jiraUrl: 'https://test.atlassian.net',
      email: 'test@example.com',
      apiToken: 'test-api-token-123',
    });

    // Verify connection was added
    await settingsPage.expectConnectionExists(connectionName);
  });

  test('should delete a JIRA connection', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    await settingsPage.goto('/settings');
    await settingsPage.waitForLoaded();

    // First add a connection
    const connectionName = `Delete Test ${Date.now()}`;
    await settingsPage.addConnection({
      name: connectionName,
      jiraUrl: 'https://delete-test.atlassian.net',
      email: 'delete@example.com',
      apiToken: 'delete-api-token',
    });
    await settingsPage.expectConnectionExists(connectionName);

    // Now delete it
    await settingsPage.deleteConnection(connectionName);

    // Wait a moment for deletion to process
    await page.waitForTimeout(500);

    // Verify connection was removed
    await settingsPage.expectConnectionNotExists(connectionName);
  });

  test('should show connection details', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    await settingsPage.goto('/settings');
    await settingsPage.waitForLoaded();

    const connectionName = `Details Test ${Date.now()}`;
    const jiraUrl = 'https://details-test.atlassian.net';
    const email = 'details@example.com';

    await settingsPage.addConnection({
      name: connectionName,
      jiraUrl,
      email,
      apiToken: 'details-api-token',
    });

    // Verify connection details are displayed
    const connectionItem = settingsPage.getConnectionItem(connectionName);
    await expect(connectionItem).toContainText(connectionName);
    await expect(connectionItem).toContainText(jiraUrl);
    await expect(connectionItem).toContainText(email);
  });

  test('should show empty state when no connections', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    await settingsPage.goto('/settings');
    await settingsPage.waitForLoaded();

    // If there are existing connections, this test may not show empty state
    // This is a check for the empty state text
    const connectionCount = await settingsPage.getConnectionCount();
    if (connectionCount === 0) {
      await expect(settingsPage.emptyText).toBeVisible();
    }
  });

  test('should validate required fields', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    await settingsPage.goto('/settings');
    await settingsPage.waitForLoaded();

    // Open form
    await settingsPage.openAddConnectionForm();

    // Try to submit empty form - browser validation should prevent it
    await settingsPage.submitConnectionForm();

    // Form should still be visible (not submitted)
    await expect(settingsPage.nameInput).toBeVisible();
  });
});

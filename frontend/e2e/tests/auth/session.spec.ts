import { test, TEST_USERS, ensureTestUserExists } from '../../fixtures/auth';
import { expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { IndexedDBHelper } from '../../fixtures/indexedDB';

test.describe('Session Persistence', () => {
  test.beforeEach(async ({ page, request }) => {
    // Ensure test user exists
    await ensureTestUserExists(request, TEST_USERS.default);

    // Clear storage before each test for isolation
    await page.goto('/login');
    const indexedDb = new IndexedDBHelper(page);
    await indexedDb.clearStorage();
    await page.reload();
  });

  test('should persist session across page reloads', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto('/login');

    // Login
    await loginPage.login(TEST_USERS.default.username, TEST_USERS.default.password);
    await expect(page).toHaveURL('/issues', { timeout: 10000 });

    // Reload page
    await page.reload();

    // Should still be on issues page (not redirected to login)
    await expect(page).toHaveURL('/issues');
  });

  test('should persist session when navigating to different pages', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto('/login');

    // Login
    await loginPage.login(TEST_USERS.default.username, TEST_USERS.default.password);
    await expect(page).toHaveURL('/issues', { timeout: 10000 });

    // Navigate to issues page
    await page.goto('/issues');
    await expect(page).toHaveURL('/issues');

    // Navigate to board page
    await page.goto('/board');
    await expect(page).toHaveURL('/board');

    // Navigate to settings page
    await page.goto('/settings');
    await expect(page).toHaveURL('/settings');

    // Should remain authenticated through all navigations
    await expect(page.locator('h1:has-text("Settings")')).toBeVisible();
  });

  test('should clear session on logout', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto('/login');

    // Login
    await loginPage.login(TEST_USERS.default.username, TEST_USERS.default.password);
    await expect(page).toHaveURL('/issues', { timeout: 10000 });

    // Click logout button in header - look for the LogOut icon button
    const logoutButton = page.locator('header').locator('button').filter({
      has: page.locator('svg.lucide-log-out'),
    });

    // If icon button not found, try text-based logout
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    } else {
      // Try finding any logout button
      const anyLogout = page.locator('button:has-text("Logout"), button:has-text("Log out")');
      if (await anyLogout.isVisible()) {
        await anyLogout.click();
      } else {
        // Click the last button in header (typically logout)
        await page.locator('header button').last().click();
      }
    }

    // Should redirect to login page
    await expect(page).toHaveURL('/login', { timeout: 10000 });

    // Reload and verify still logged out
    await page.reload();
    await expect(page).toHaveURL('/login');
  });

  test('should redirect unauthenticated users to login from protected routes', async ({ page }) => {
    // Root shows landing page for unauthenticated users
    await page.goto('/');
    await expect(page).toHaveURL('/');

    // Protected routes should redirect to login
    await page.goto('/issues');
    await expect(page).toHaveURL('/login');

    await page.goto('/board');
    await expect(page).toHaveURL('/login');

    await page.goto('/settings');
    await expect(page).toHaveURL('/login');
  });

  test('should store auth token in localStorage', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto('/login');

    // Login
    await loginPage.login(TEST_USERS.default.username, TEST_USERS.default.password);
    await expect(page).toHaveURL('/issues', { timeout: 10000 });

    // Verify auth token is stored
    const authStorage = await page.evaluate(() => {
      return localStorage.getItem('jiralocal-auth');
    });
    expect(authStorage).not.toBeNull();

    // Parse and verify it contains a token
    const authData = JSON.parse(authStorage!);
    expect(authData.state?.token).toBeTruthy();
  });

  test('should clear localStorage token on logout', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto('/login');

    // Login
    await loginPage.login(TEST_USERS.default.username, TEST_USERS.default.password);
    await expect(page).toHaveURL('/issues', { timeout: 10000 });

    // Verify token exists
    let authStorage = await page.evaluate(() => {
      return localStorage.getItem('jiralocal-auth');
    });
    expect(authStorage).not.toBeNull();

    // Logout - find the logout button
    const logoutButton = page.locator('header').locator('button').filter({
      has: page.locator('svg.lucide-log-out'),
    });

    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    } else {
      await page.locator('header button').last().click();
    }
    await expect(page).toHaveURL('/login', { timeout: 10000 });

    // Verify token is cleared
    authStorage = await page.evaluate(() => {
      return localStorage.getItem('jiralocal-auth');
    });
    if (authStorage) {
      const authData = JSON.parse(authStorage);
      expect(authData.state?.token).toBeNull();
    }
  });
});

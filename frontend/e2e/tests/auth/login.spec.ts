import { test, TEST_USERS, ensureTestUserExists } from '../../fixtures/auth';
import { expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { IndexedDBHelper } from '../../fixtures/indexedDB';

test.describe('Login', () => {
  test.beforeEach(async ({ page, request }) => {
    // Ensure test user exists
    await ensureTestUserExists(request, TEST_USERS.default);

    // Clear storage before each test for isolation
    await page.goto('/login');
    const indexedDb = new IndexedDBHelper(page);
    await indexedDb.clearStorage();
    await page.reload();
  });

  test('should display login form', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto('/login');

    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
    await expect(loginPage.signUpLink).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto('/login');

    await loginPage.login(TEST_USERS.default.username, TEST_USERS.default.password);

    // Should redirect to issues page after successful login
    await expect(page).toHaveURL('/issues', { timeout: 10000 });
  });

  test('should show error for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto('/login');

    await loginPage.login('invalid_user', 'wrong_password');

    await loginPage.expectError();
  });

  test('should show error for empty username', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto('/login');

    await loginPage.passwordInput.fill('somepassword');
    await loginPage.submitButton.click();

    // Form validation should prevent submission
    await expect(page).toHaveURL('/login');
  });

  test('should show error for empty password', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto('/login');

    await loginPage.usernameInput.fill('someuser');
    await loginPage.submitButton.click();

    // Form validation should prevent submission
    await expect(page).toHaveURL('/login');
  });

  test('should navigate to register page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto('/login');

    await loginPage.goToRegister();

    await expect(page).toHaveURL('/register');
  });

  test('should redirect to issues if already logged in', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto('/login');

    // First login
    await loginPage.login(TEST_USERS.default.username, TEST_USERS.default.password);
    await expect(page).toHaveURL('/issues', { timeout: 10000 });

    // Try to go to login page again - should redirect
    await page.goto('/login');
    await expect(page).toHaveURL('/issues', { timeout: 5000 });
  });
});

import { test, TEST_USERS, ensureTestUserExists } from '../../fixtures/auth';
import { expect } from '@playwright/test';
import { RegisterPage } from '../../pages/register.page';
import { IndexedDBHelper } from '../../fixtures/indexedDB';

test.describe('Registration', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage before each test for isolation
    await page.goto('/register');
    const indexedDb = new IndexedDBHelper(page);
    await indexedDb.clearStorage();
    await page.reload();
  });

  test('should display registration form', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto('/register');

    await expect(registerPage.usernameInput).toBeVisible();
    await expect(registerPage.passwordInput).toBeVisible();
    await expect(registerPage.confirmPasswordInput).toBeVisible();
    await expect(registerPage.submitButton).toBeVisible();
    await expect(registerPage.signInLink).toBeVisible();
  });

  test('should register a new user', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto('/register');

    // Use unique username to avoid conflicts with existing users
    const uniqueUsername = `e2e_new_user_${Date.now()}`;
    await registerPage.register(uniqueUsername, 'SecurePassword123!');

    // Should redirect to dashboard page after successful registration
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
  });

  test('should show error for mismatched passwords', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto('/register');

    await registerPage.register('test_user', 'Password123!', 'DifferentPassword!');

    // Should show error and stay on register page
    await registerPage.expectError('Passwords do not match');
    await expect(page).toHaveURL('/register');
  });

  test('should show error for existing username', async ({ page, request }) => {
    // First ensure the test user exists (so we can test duplicate registration)
    await ensureTestUserExists(request, TEST_USERS.default);

    const registerPage = new RegisterPage(page);
    await registerPage.goto('/register');

    // Try to register with existing test user
    await registerPage.register(TEST_USERS.default.username, TEST_USERS.default.password);

    await registerPage.expectError();
    await expect(page).toHaveURL('/register');
  });

  test('should show error for short password', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto('/register');

    await registerPage.register('test_user', 'short', 'short');

    // Should show error for short password
    await registerPage.expectError('Password must be at least 8 characters');
    await expect(page).toHaveURL('/register');
  });

  test('should show error for empty fields', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto('/register');

    await registerPage.submitButton.click();

    // Form validation should prevent submission
    await expect(page).toHaveURL('/register');
  });

  test('should navigate to login page', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto('/register');

    await registerPage.goToLogin();

    await expect(page).toHaveURL('/login');
  });

  test('should redirect to dashboard if already logged in', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto('/register');

    // First register to get logged in
    const uniqueUsername = `e2e_redirect_test_${Date.now()}`;
    await registerPage.register(uniqueUsername, 'SecurePassword123!');
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });

    // Try to go to register page again - should redirect
    await page.goto('/register');
    await expect(page).toHaveURL('/dashboard', { timeout: 5000 });
  });
});

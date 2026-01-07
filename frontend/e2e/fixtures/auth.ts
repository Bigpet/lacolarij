import { test as base, Page, APIRequestContext } from '@playwright/test';

export interface TestUser {
  username: string;
  password: string;
  email: string;
}

// Test users (will be created automatically if they don't exist)
export const TEST_USERS: Record<string, TestUser> = {
  default: {
    username: 'e2e_test_user',
    password: 'TestPassword123!',
    email: 'e2e@example.com',
  },
  admin: {
    username: 'e2e_admin',
    password: 'AdminPassword123!',
    email: 'admin@example.com',
  },
};

const BACKEND_URL = 'http://localhost:8000';

/**
 * Ensures a test user exists by attempting to register them.
 * If the user already exists (409 conflict), that's okay.
 */
export async function ensureTestUserExists(
  request: APIRequestContext,
  user: TestUser
): Promise<void> {
  const response = await request.post(`${BACKEND_URL}/api/auth/register`, {
    data: {
      username: user.username,
      password: user.password,
    },
  });

  // 201 = user created, 409 = user already exists (both are fine)
  if (response.status() !== 201 && response.status() !== 409) {
    throw new Error(`Failed to ensure test user exists: ${response.status()}`);
  }
}

/**
 * Logs in a user and returns the auth token.
 */
export async function loginViaAPI(
  request: APIRequestContext,
  user: TestUser
): Promise<string> {
  const response = await request.post(`${BACKEND_URL}/api/auth/login`, {
    form: {
      username: user.username,
      password: user.password,
    },
  });

  if (!response.ok()) {
    throw new Error(`Failed to login: ${response.status()}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Sets up authenticated state in the browser's localStorage.
 */
export async function setAuthStateInBrowser(
  page: Page,
  token: string,
  username: string
): Promise<void> {
  await page.evaluate(
    ({ token, username }) => {
      const authState = {
        state: {
          token,
          user: { username },
          isLoading: false,
          error: null,
        },
        version: 0,
      };
      localStorage.setItem('jiralocal-auth', JSON.stringify(authState));
    },
    { token, username }
  );
}

export const test = base.extend<{
  mockJiraUrl: string;
  authenticatedPage: Page;
  testUser: TestUser;
}>({
  mockJiraUrl: async ({}, use) => {
    // Use demo://local for mock JIRA
    await use('demo://local');
  },

  testUser: async ({}, use) => {
    await use(TEST_USERS.default);
  },

  /**
   * Provides a page that is already authenticated with the default test user.
   * The test user is created if it doesn't exist.
   */
  authenticatedPage: async ({ page, request }, use) => {
    // Ensure the test user exists
    await ensureTestUserExists(request, TEST_USERS.default);

    // Get auth token via API
    const token = await loginViaAPI(request, TEST_USERS.default);

    // Navigate to app first (needed for localStorage access)
    await page.goto('/login');

    // Set auth state in browser
    await setAuthStateInBrowser(page, token, TEST_USERS.default.username);

    // Reload to pick up auth state
    await page.goto('/');

    await use(page);
  },
});

export { expect } from '@playwright/test';

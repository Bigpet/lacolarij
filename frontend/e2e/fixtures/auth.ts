import { test as base } from '@playwright/test';

export interface TestUser {
  username: string;
  password: string;
  email: string;
}

// Test users (created via API before tests run)
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

export const test = base.extend<{
  mockJiraUrl: string;
}>({
  mockJiraUrl: async ({}, use) => {
    // Use demo://local for mock JIRA
    await use('demo://local');
  },
});

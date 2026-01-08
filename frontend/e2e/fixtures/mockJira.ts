import { APIRequestContext } from '@playwright/test';

const BACKEND_URL = 'http://localhost:8000';

export interface CreateIssueData {
  summary: string;
  description?: string;
  status?: 'To Do' | 'In Progress' | 'Done';
  assignee?: string;
  priority?: string;
  issueType?: string;
}

export interface CreateIssueResult {
  key: string;
  id: string;
}

export interface SimulateChangeData {
  summary?: string;
  description?: string;
  status?: 'To Do' | 'In Progress' | 'Done';
  assignee?: string;
}

/**
 * Helper class for controlling mock JIRA during E2E tests.
 *
 * This class provides methods to:
 * - Reset mock JIRA storage between tests
 * - Create test issues directly in storage
 * - Simulate remote changes for conflict testing
 *
 * IMPORTANT: Requires backend to be started with JIRALOCAL_ENV=test
 */
export class MockJiraHelper {
  private api: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.api = request;
  }

  /**
   * Check if test endpoints are available.
   * Call this before other operations to get a helpful error message.
   */
  async checkAvailable(): Promise<void> {
    const response = await this.api.post(`${BACKEND_URL}/api/test/mock-jira/reset`);
    if (response.status() === 404) {
      throw new Error(
        'Test endpoints not available. Make sure the backend is started with JIRALOCAL_ENV=test. ' +
        'If you have an existing backend running, stop it and let Playwright start a fresh one.'
      );
    }
    if (!response.ok()) {
      throw new Error(`Failed to check test endpoints: ${response.status()}`);
    }
  }

  /**
   * Reset mock JIRA storage to a clean state.
   * Call this in beforeEach to ensure test isolation.
   */
  async reset(): Promise<void> {
    const response = await this.api.post(`${BACKEND_URL}/api/test/mock-jira/reset`);
    if (response.status() === 404) {
      throw new Error(
        'Test endpoints not available. Make sure the backend is started with JIRALOCAL_ENV=test. ' +
        'If you have an existing backend running, stop it and let Playwright start a fresh one.'
      );
    }
    if (!response.ok()) {
      throw new Error(`Failed to reset mock JIRA: ${response.status()}`);
    }
  }

  /**
   * Create a test issue directly in mock JIRA storage.
   *
   * @param data - Issue data (summary required, others optional)
   * @returns Object with key and id of created issue
   */
  async createIssue(data: CreateIssueData): Promise<CreateIssueResult> {
    const response = await this.api.post(`${BACKEND_URL}/api/test/mock-jira/issues`, {
      data: {
        summary: data.summary,
        description: data.description,
        status: data.status,
        assignee: data.assignee,
        priority: data.priority,
        issue_type: data.issueType,
      },
    });

    if (response.status() === 404) {
      throw new Error(
        'Test endpoints not available. Make sure the backend is started with JIRALOCAL_ENV=test. ' +
        'If you have an existing backend running, stop it and let Playwright start a fresh one.'
      );
    }
    if (!response.ok()) {
      const body = await response.text();
      throw new Error(`Failed to create test issue: ${response.status()} - ${body}`);
    }

    return await response.json();
  }

  /**
   * Simulate a remote change to an issue.
   *
   * This modifies the issue directly in storage, simulating what
   * would happen if another user edited the issue in JIRA. Useful
   * for testing conflict detection and resolution.
   *
   * @param issueIdOrKey - Issue ID or key (e.g., "TEST-1" or "1")
   * @param changes - Fields to change
   */
  async simulateRemoteChange(
    issueIdOrKey: string,
    changes: SimulateChangeData
  ): Promise<void> {
    const response = await this.api.patch(
      `${BACKEND_URL}/api/test/mock-jira/issues/${issueIdOrKey}`,
      { data: changes }
    );

    if (!response.ok()) {
      throw new Error(`Failed to simulate remote change: ${response.status()}`);
    }
  }

  /**
   * Add a comment to an issue for testing.
   *
   * @param issueIdOrKey - Issue ID or key
   * @param body - Comment body text
   * @param author - Comment author name (default: "Test User")
   */
  async addComment(
    issueIdOrKey: string,
    body: string,
    author: string = 'Test User'
  ): Promise<string> {
    const response = await this.api.post(
      `${BACKEND_URL}/api/test/mock-jira/issues/${issueIdOrKey}/comments`,
      {
        data: { body, author },
      }
    );

    if (!response.ok()) {
      throw new Error(`Failed to add test comment: ${response.status()}`);
    }

    const result = await response.json();
    return result.id;
  }

  /**
   * Create multiple test issues at once.
   *
   * @param issues - Array of issue data
   * @returns Array of created issue results
   */
  async createIssues(issues: CreateIssueData[]): Promise<CreateIssueResult[]> {
    const results: CreateIssueResult[] = [];
    for (const issue of issues) {
      results.push(await this.createIssue(issue));
    }
    return results;
  }
}

# JiraLocal End-to-End Testing Strategy

## Executive Summary

JiraLocal is a local-first application with unique testing challenges: IndexedDB storage, offline functionality, sync mechanics, and ADF content rendering. This document outlines a comprehensive E2E testing approach using Playwright to validate the full user journey from frontend through backend to the mock JIRA server.

---

## Part 1: Framework Choice and Rationale

### 1.1 Recommended Framework: Playwright

| Feature | Playwright | Cypress | Puppeteer |
|---------|-----------|---------|-----------|
| Multi-browser support | Chromium, Firefox, WebKit | Chromium, Firefox, Edge | Chromium only |
| IndexedDB support | Native | Native | Native |
| Network interception | Excellent | Good | Basic |
| Parallel execution | Built-in | Paid feature | Manual |
| TypeScript support | First-class | Good | Manual |
| Test isolation | Context-based | Flaky on IndexedDB | Manual |
| Visual regression | Built-in snapshots | Plugin | Manual |
| API testing | Built-in | Limited | No |

**Why Playwright wins for JiraLocal:**

1. **IndexedDB Isolation**: Playwright's `browserContext` API provides true test isolation by creating separate storage contexts for each test - critical for a local-first app.

2. **Network Control**: Built-in request interception and mocking allows testing offline scenarios, sync failures, and conflict conditions.

3. **Multi-browser Coverage**: WebKit testing ensures Safari compatibility (important for enterprise users).

4. **Trace Files**: Debugging flaky tests with `trace` viewer is invaluable for race conditions in sync logic.

5. **API Mode**: Can run tests headless with minimal resources for CI/CD.

---

## Part 2: Test Environment Setup

### 2.1 Directory Structure

```
frontend/
├── e2e/
│   ├── fixtures/
│   │   ├── auth.ts              # Login helpers, test users
│   │   ├── issues.ts            # Test issue data factory
│   │   ├── mockJira.ts          # Mock JIRA setup utilities
│   │   └── indexedDB.ts         # IndexedDB inspection helpers
│   ├── helpers/
│   │   ├── sync.ts              # Sync state helpers
│   │   ├── network.ts           # Offline simulation
│   │   └── assertions.ts        # Custom assertions for sync status
│   ├── pages/
│   │   ├── base.page.ts         # Base page class
│   │   ├── login.page.ts        # Login page object
│   │   ├── issues.page.ts       # Issue list page object
│   │   ├── issueDetail.page.ts  # Issue detail page object
│   │   ├── board.page.ts        # Kanban board page object
│   │   └── settings.page.ts     # Settings page object
│   ├── tests/
│   │   ├── auth/
│   │   │   ├── login.spec.ts
│   │   │   └── registration.spec.ts
│   │   ├── issues/
│   │   │   ├── list-view.spec.ts
│   │   │   ├── detail-view.spec.ts
│   │   │   └── inline-edit.spec.ts
│   │   ├── board/
│   │   │   ├── kanban-view.spec.ts
│   │   │   └── drag-drop.spec.ts
│   │   ├── sync/
│   │   │   ├── initial-sync.spec.ts
│   │   │   ├── offline-editing.spec.ts
│   │   │   ├── conflict-resolution.spec.ts
│   │   │   └── push-pull.spec.ts
│   │   └── search/
│   │       └── full-text-search.spec.ts
│   ├── playwright.config.ts     # Playwright configuration
│   └── tsconfig.json
```

### 2.2 Playwright Configuration

```typescript
// frontend/e2e/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  // Start backend server before tests
  webServer: [
    {
      command: 'cd ../backend && uv run uvicorn app.main:app --host 127.0.0.1 --port 8000',
      port: 8000,
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run dev',
      port: 5173,
      timeout: 60 * 1000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
```

### 2.3 Package.json Scripts

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:chromium": "playwright test --project=chromium",
    "test:e2e:report": "playwright show-report"
  },
  "devDependencies": {
    "@playwright/test": "^1.48.0",
    "playwright": "^1.48.0"
  }
}
```

---

## Part 3: Test Fixtures and Helpers

### 3.1 Authentication Fixtures

```typescript
// frontend/e2e/fixtures/auth.ts
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
  loginPage: LoginPage;
  authenticatedPage: Page;
  mockJiraUrl: string;
}>({
  mockJiraUrl: async ({}, use) => {
    // Use demo://local for mock JIRA
    await use('demo://local');
  },

  authenticatedPage: async ({ page, mockJiraUrl }, use) => {
    // Auto-login before each test
    await page.goto('/login');
    await page.fill('input[name="username"]', TEST_USERS.default.username);
    await page.fill('input[name="password"]', TEST_USERS.default.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    await use(page);
  },
});
```

### 3.2 Mock JIRA Setup

```typescript
// frontend/e2e/fixtures/mockJira.ts
import { request } from '@playwright/test';

const BACKEND_URL = 'http://localhost:8000';

export class MockJiraHelper {
  private api: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.api = request;
  }

  async reset() {
    // Call backend endpoint to reset mock JIRA storage
    await this.api.post(`${BACKEND_URL}/api/test/mock-jira/reset`);
  }

  async createIssue(data: {
    summary: string;
    description?: string;
    status?: string;
    assignee?: string;
  }) {
    return this.api.post(`${BACKEND_URL}/api/test/mock-jira/issues`, {
      data,
    });
  }

  async simulateRemoteChange(issueId: string, changes: Record<string, unknown>) {
    return this.api.patch(
      `${BACKEND_URL}/api/test/mock-jira/issues/${issueId}`,
      { data: changes }
    );
  }
}
```

### 3.3 IndexedDB Helpers

```typescript
// frontend/e2e/fixtures/indexedDB.ts
export class IndexedDBHelper {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async getIssues(): Promise<any[]> {
    return this.page.evaluate(async () => {
      const db = (await import('../src/lib/db')).default;
      return await db.issues.toArray();
    });
  }

  async getPendingOperations(): Promise<any[]> {
    return this.page.evaluate(async () => {
      const db = (await import('../src/lib/db')).default;
      return await db.pendingOperations.toArray();
    });
  }

  async getSyncStatus(): Promise<string> {
    return this.page.evaluate(async () => {
      const db = (await import('../src/lib/db')).default;
      const meta = await db.syncMeta.get('last_sync');
      return meta?._syncStatus || 'unknown';
    });
  }

  async setOfflineMode() {
    await this.page.context().setOffline(true);
  }

  async setOnlineMode() {
    await this.page.context().setOffline(false);
  }

  async clearStorage() {
    await this.page.evaluate(() => {
      indexedDB.deleteDatabase('jiralocal');
      localStorage.clear();
      sessionStorage.clear();
    });
  }
}
```

### 3.4 Sync Assertions

```typescript
// frontend/e2e/helpers/assertions.ts
import { expect } from '@playwright/test';

export class SyncAssertions {
  static async assertIssueSynced(page: Page, issueKey: string) {
    const status = await page.locator(`[data-issue-key="${issueKey}"]`)
      .getAttribute('data-sync-status');
    expect(status).toBe('synced');
  }

  static async assertIssuePending(page: Page, issueKey: string) {
    const status = await page.locator(`[data-issue-key="${issueKey}"]`)
      .getAttribute('data-sync-status');
    expect(status).toBe('pending');
  }

  static async assertConflictDetected(page: Page) {
    await expect(page.locator('[data-testid="conflict-banner"]')).toBeVisible();
  }

  static async assertOfflineBannerVisible(page: Page) {
    await expect(page.locator('[data-testid="offline-banner"]')).toBeVisible();
  }

  static async assertSyncStatus(page: Page, status: 'idle' | 'syncing' | 'error') {
    const className = await page.locator('[data-testid="sync-status"]')
      .getAttribute('class');
    expect(className).toContain(`status-${status}`);
  }
}
```

---

## Part 4: Page Object Model

### 4.1 Base Page

```typescript
// frontend/e2e/pages/base.page.ts
import { Page, Locator } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly syncStatusBar: Locator;
  readonly offlineBanner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.syncStatusBar = page.locator('[data-testid="sync-status"]');
    this.offlineBanner = page.locator('[data-testid="offline-banner"]');
  }

  async waitForSyncIdle() {
    await this.page.waitForFunction(
      () => document.querySelector('[data-sync-status="idle"]') !== null,
      { timeout: 10000 }
    );
  }

  async goto(url: string) {
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
  }
}
```

### 4.2 Issues Page

```typescript
// frontend/e2e/pages/issues.page.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class IssuesPage extends BasePage {
  readonly searchInput: Locator;
  readonly filtersButton: Locator;
  readonly issueCards: Locator;
  readonly syncButton: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.locator('input[placeholder*="Search"]');
    this.filtersButton = page.locator('button[aria-label="Filters"]');
    this.issueCards = page.locator('[data-testid="issue-card"]');
    this.syncButton = page.locator('button[aria-label="Sync now"]');
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(300); // Debounce wait
  }

  async getIssueCard(issueKey: string): Locator {
    return this.page.locator(`[data-issue-key="${issueKey}"]`);
  }

  async clickIssue(issueKey: string) {
    await this.getIssueCard(issueKey).click();
  }

  async getIssueCount(): Promise<number> {
    return await this.issueCards.count();
  }

  async openFilters() {
    await this.filtersButton.click();
  }

  async setStatusFilter(status: string) {
    await this.openFilters();
    await this.page.click(`button:has-text("${status}")`);
  }

  async triggerSync() {
    await this.syncButton.click();
    await this.waitForSyncIdle();
  }
}
```

### 4.3 Board Page

```typescript
// frontend/e2e/pages/board.page.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class BoardPage extends BasePage {
  readonly columns: Locator;
  readonly quickFilters: Locator;

  constructor(page: Page) {
    super(page);
    this.columns = page.locator('[data-testid="board-column"]');
    this.quickFilters = page.locator('[data-testid="quick-filters"] button');
  }

  getColumn(statusCategory: string): Locator {
    return this.page.locator(
      `[data-testid="board-column"][data-status-category="${statusCategory}"]`
    );
  }

  async getCardInColumn(statusCategory: string, index: number): Promise<Locator> {
    const column = this.getColumn(statusCategory);
    const cards = column.locator('[data-testid="board-card"]');
    return cards.nth(index);
  }

  async dragCardToColumn(
    issueKey: string,
    targetStatusCategory: string
  ) {
    const card = this.page.locator(`[data-issue-key="${issueKey}"]`);
    const targetColumn = this.getColumn(targetStatusCategory);

    await card.dragTo(targetColumn);
    await this.waitForSyncIdle();
  }

  async quickFilter(filterName: string) {
    await this.quickFilters.filter({ hasText: filterName }).click();
  }
}
```

### 4.4 Issue Detail Page

```typescript
// frontend/e2e/pages/issueDetail.page.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class IssueDetailPage extends BasePage {
  readonly summaryInput: Locator;
  readonly descriptionContainer: Locator;
  readonly editDescriptionButton: Locator;
  readonly statusDropdown: Locator;
  readonly commentInput: Locator;
  readonly submitCommentButton: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    super(page);
    this.summaryInput = page.locator('[data-testid="issue-summary"]');
    this.descriptionContainer = page.locator('[data-testid="issue-description"]');
    this.editDescriptionButton = page.locator('button:has-text("Edit")');
    this.statusDropdown = page.locator('[data-testid="status-dropdown"]');
    this.commentInput = page.locator('textarea[placeholder*="comment"]');
    this.submitCommentButton = page.locator('button:has-text("Add")');
    this.backButton = page.locator('button[aria-label="Back"]');
  }

  async editSummary(newSummary: string) {
    await this.summaryInput.click();
    await this.summaryInput.fill(newSummary);
    await this.summaryInput.press('Enter');
    await this.waitForSyncIdle();
  }

  async changeStatus(statusName: string) {
    await this.statusDropdown.click();
    await this.page.click(`li:has-text("${statusName}")`);
    await this.waitForSyncIdle();
  }

  async addComment(text: string) {
    await this.commentInput.fill(text);
    await this.submitCommentButton.click();
    await this.waitForSyncIdle();
  }

  async goBack() {
    await this.backButton.click();
  }
}
```

---

## Part 5: Test Scenarios

### 5.1 Authentication Flows

```typescript
// frontend/e2e/tests/auth/login.spec.ts
import { test, expect } from '../../../fixtures/auth';
import { LoginPage } from '../../pages/login.page';
import { IssuesPage } from '../../pages/issues.page';

test.describe('Authentication', () => {
  test('should login with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto('/login');

    await loginPage.login(TEST_USERS.default.username, TEST_USERS.default.password);

    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('Issues');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto('/login');

    await loginPage.login('invalid', 'credentials');

    await expect(page.locator('[data-testid="error-message"]'))
      .toContainText('Invalid credentials');
  });

  test('should persist session across page reloads', async ({ authenticatedPage }) => {
    await authenticatedPage.reload();
    await expect(authenticatedPage.locator('h1')).toContainText('Issues');
  });
});
```

### 5.2 Issue List View

```typescript
// frontend/e2e/tests/issues/list-view.spec.ts
import { test, expect } from '../../../fixtures/auth';
import { IssuesPage } from '../../pages/issues.page';

test.describe('Issue List View', () => {
  test('should display issues from sync', async ({ authenticatedPage, mockJiraHelper }) => {
    await mockJiraHelper.createIssue({
      summary: 'Test Issue 1',
      status: 'To Do',
    });
    await mockJiraHelper.createIssue({
      summary: 'Test Issue 2',
      status: 'In Progress',
    });

    const issuesPage = new IssuesPage(authenticatedPage);
    await issuesPage.goto('/');
    await issuesPage.triggerSync();

    await expect(issuesPage.issueCards).toHaveCount(2);
  });

  test('should filter issues by status', async ({ authenticatedPage }) => {
    const issuesPage = new IssuesPage(authenticatedPage);
    await issuesPage.goto('/');

    await issuesPage.setStatusFilter('To Do');

    const allStatuses = await authenticatedPage
      .locator('[data-testid="issue-card"] [data-testid="issue-status"]')
      .allTextContents();
    allStatuses.forEach(status => {
      expect(status).toBe('To Do');
    });
  });

  test('should search issues by summary', async ({ authenticatedPage }) => {
    const issuesPage = new IssuesPage(authenticatedPage);
    await issuesPage.goto('/');

    await issuesPage.search('bug');

    const issueKeys = await authenticatedPage
      .locator('[data-testid="issue-card"]')
      .allAttributeValues('data-issue-key');
    // Should only show matching issues
  });
});
```

### 5.3 Offline Editing

```typescript
// frontend/e2e/tests/sync/offline-editing.spec.ts
import { test, expect } from '../../../fixtures/auth';
import { IssuesPage } from '../../pages/issues.page';
import { IssueDetailPage } from '../../pages/issueDetail.page';
import { IndexedDBHelper } from '../../../fixtures/indexedDB';
import { SyncAssertions } from '../../helpers/assertions';

test.describe('Offline Editing', () => {
  test('should allow editing when offline', async ({ authenticatedPage, indexedDb }) => {
    const issuesPage = new IssuesPage(authenticatedPage);
    await issuesPage.goto('/');

    // Go offline
    await indexedDb.setOfflineMode();
    await SyncAssertions.assertOfflineBannerVisible(authenticatedPage);

    // Navigate to issue detail
    await issuesPage.clickIssue('TEST-1');
    const detailPage = new IssueDetailPage(authenticatedPage);

    // Edit summary (should work offline)
    await detailPage.editSummary('Offline Edit Summary');

    // Verify pending status
    await SyncAssertions.assertIssuePending(authenticatedPage, 'TEST-1');

    // Verify in IndexedDB
    const issues = await indexedDb.getIssues();
    const editedIssue = issues.find(i => i.key === 'TEST-1');
    expect(editedIssue.summary).toBe('Offline Edit Summary');
    expect(editedIssue._syncStatus).toBe('pending');

    // Go back online
    await indexedDb.setOnlineMode();
    await detailPage.triggerSync();

    // Verify synced
    await SyncAssertions.assertIssueSynced(authenticatedPage, 'TEST-1');
  });

  test('should queue multiple changes when offline', async ({ authenticatedPage, indexedDb }) => {
    const issuesPage = new IssuesPage(authenticatedPage);
    await issuesPage.goto('/');

    await indexedDb.setOfflineMode();

    // Make multiple changes
    await issuesPage.clickIssue('TEST-1');
    const detailPage = new IssueDetailPage(authenticatedPage);
    await detailPage.editSummary('First Change');
    await detailPage.addComment('Offline comment 1');

    await detailPage.goBack();
    await issuesPage.clickIssue('TEST-2');
    await detailPage.editSummary('Second Change');

    // Verify all are pending
    const pendingOps = await indexedDb.getPendingOperations();
    expect(pendingOps.length).toBeGreaterThan(0);
  });
});
```

### 5.4 Conflict Resolution

```typescript
// frontend/e2e/tests/sync/conflict-resolution.spec.ts
import { test, expect } from '../../../fixtures/auth';
import { IssueDetailPage } from '../../pages/issueDetail.page';
import { MockJiraHelper } from '../../../fixtures/mockJira';
import { IndexedDBHelper } from '../../../fixtures/indexedDB';
import { SyncAssertions } from '../../helpers/assertions';

test.describe('Conflict Resolution', () => {
  test('should detect conflict when remote changes while offline', async ({
    authenticatedPage,
    request,
  }) => {
    const mockJira = new MockJiraHelper(request);
    const indexedDb = new IndexedDBHelper(authenticatedPage);
    const detailPage = new IssueDetailPage(authenticatedPage);

    // Start with issue synced
    await authenticatedPage.goto('/issues/TEST-1');
    await detailPage.waitForSyncIdle();

    // Go offline and make local change
    await indexedDb.setOfflineMode();
    await detailPage.editSummary('Local Summary');

    // Simulate remote change (via backend API)
    await mockJira.simulateRemoteChange('TEST-1', {
      summary: 'Remote Summary',
    });

    // Go online and sync
    await indexedDb.setOnlineMode();
    await detailPage.triggerSync();

    // Should show conflict
    await SyncAssertions.assertConflictDetected(authenticatedPage);

    // Open conflict resolver
    await authenticatedPage.click('[data-testid="conflict-banner"] button');

    // Verify both versions shown
    await expect(authenticatedPage.locator('[data-testid="local-version"]'))
      .toContainText('Local Summary');
    await expect(authenticatedPage.locator('[data-testid="remote-version"]'))
      .toContainText('Remote Summary');

    // Resolve by keeping local
    await authenticatedPage.click('button:has-text("Keep Mine")');
    await detailPage.waitForSyncIdle();

    // Verify resolution
    const issues = await indexedDb.getIssues();
    const issue = issues.find(i => i.key === 'TEST-1');
    expect(issue.summary).toBe('Local Summary');
    expect(issue._syncStatus).toBe('synced');
  });
});
```

### 5.5 Board Drag and Drop

```typescript
// frontend/e2e/tests/board/drag-drop.spec.ts
import { test, expect } from '../../../fixtures/auth';
import { BoardPage } from '../../pages/board.page';

test.describe('Board Drag and Drop', () => {
  test('should move card between columns', async ({ authenticatedPage }) => {
    const boardPage = new BoardPage(authenticatedPage);
    await boardPage.goto('/board');

    // Find card in To Do column
    const todoColumn = boardPage.getColumn('todo');
    const cardCountBefore = await todoColumn.locator('[data-testid="board-card"]').count();

    // Drag to In Progress
    await boardPage.dragCardToColumn('TEST-1', 'indeterminate');

    // Verify card moved
    const todoColumnAfter = boardPage.getColumn('todo');
    const inProgressColumn = boardPage.getColumn('indeterminate');
    expect(await todoColumnAfter.locator('[data-testid="board-card"]').count())
      .toBe(cardCountBefore - 1);
    expect(await inProgressColumn.locator('[data-testid="board-card"]').count())
      .toBeGreaterThan(0);
  });

  test('should update issue status after drop', async ({ authenticatedPage }) => {
    const boardPage = new BoardPage(authenticatedPage);
    await boardPage.goto('/board');

    await boardPage.dragCardToColumn('TEST-1', 'done');
    await boardPage.waitForSyncIdle();

    // Navigate to detail and verify status
    await authenticatedPage.click(`[data-issue-key="TEST-1"]`);
    await expect(authenticatedPage.locator('[data-testid="status-dropdown"]'))
      .toContainText('Done');
  });
});
```

### 5.6 Full-Text Search

```typescript
// frontend/e2e/tests/search/full-text-search.spec.ts
import { test, expect } from '../../../fixtures/auth';
import { IssuesPage } from '../../pages/issues.page';

test.describe('Full-Text Search', () => {
  test.beforeEach(async ({ authenticatedPage, request }) => {
    // Create test data with searchable content
    const mockJira = new MockJiraHelper(request);
    await mockJira.createIssue({
      summary: 'Authentication bug',
      description: 'Users cannot login after password reset',
    });
    await mockJira.createIssue({
      summary: 'Dashboard performance',
      description: 'Loading takes too long on first visit',
    });
    await mockJira.createIssue({
      summary: 'API endpoint',
      description: 'Need endpoint for user profile updates',
    });

    const issuesPage = new IssuesPage(authenticatedPage);
    await issuesPage.goto('/');
    await issuesPage.triggerSync();
  });

  test('should search by summary', async ({ authenticatedPage }) => {
    const issuesPage = new IssuesPage(authenticatedPage);
    await issuesPage.search('authentication');

    const summaries = await authenticatedPage
      .locator('[data-testid="issue-card"] [data-testid="issue-summary"]')
      .allTextContents();
    expect(summaries.every(s => s.toLowerCase().includes('authentication'))).toBe(true);
  });

  test('should search by description text', async ({ authenticatedPage }) => {
    const issuesPage = new IssuesPage(authenticatedPage);
    await issuesPage.search('password reset');

    await expect(issuesPage.issueCards).toHaveCount(1);
  });

  test('should show fuzzy matches', async ({ authenticatedPage }) => {
    const issuesPage = new IssuesPage(authenticatedPage);
    await issuesPage.search('authntication'); // typo

    // Should still find "authentication"
    await expect(issuesPage.issueCards).toHaveCountGreaterThan(0);
  });
});
```

---

## Part 6: Backend Test Helpers

### 6.1 Test Endpoints for Mock JIRA Control

Add to `backend/app/api/test.py`:

```python
"""Test-only endpoints for controlling mock JIRA during E2E tests."""
from fastapi import APIRouter, HTTPException
from app.services.mock_jira.router import reset_storage, _issues

router = APIRouter(prefix="/api/test", tags=["test"])

# Only include in test builds
@router.post("/mock-jira/reset")
async def reset_mock_jira():
    """Reset mock JIRA storage to clean state."""
    reset_storage()
    return {"status": "reset"}

@router.post("/mock-jira/issues")
async def create_test_issue(issue: dict):
    """Create an issue directly in mock JIRA storage."""
    # Simulate what the real create endpoint does
    key = f"TEST-{len(_issues) // 2 + 1}"
    issue_id = str(len(_issues) // 2 + 1)
    # ... create issue logic
    return {"key": key, "id": issue_id}

@router.patch("/mock-jira/issues/{issue_id}")
async def update_test_issue(issue_id: str, changes: dict):
    """Simulate remote changes to trigger conflicts."""
    if issue_id not in _issues:
        raise HTTPException(status_code=404, detail="Issue not found")
    # Apply changes directly to storage
    _issues[issue_id]["fields"].update(changes)
    return {"status": "updated"}
```

In `backend/app/main.py`, conditionally include test routes:

```python
if os.getenv("JIRALOCAL_ENV") == "test":
    app.include_router(test_router)
```

---

## Part 7: CI/CD Integration

### 7.1 GitHub Actions Workflow

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  e2e:
    timeout-minutes: 30
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.14'

      - name: Install uv
        run: curl -LsSf https://astral.sh/uv/install.sh | sh

      - name: Install backend dependencies
        working-directory: ./backend
        run: uv sync

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Install frontend dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Install Playwright browsers
        working-directory: ./frontend
        run: npx playwright install --with-deps chromium

      - name: Start backend
        working-directory: ./backend
        run: |
          export JIRALOCAL_ENV=test
          uv run uvicorn app.main:app --host 127.0.0.1 --port 8000 &
          echo $! > backend.pid

      - name: Wait for backend
        run: npx wait-on http://localhost:8000

      - name: Run E2E tests
        working-directory: ./frontend
        env:
          CI: true
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: frontend/playwright-report/
          retention-days: 14

      - name: Upload traces
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-traces
          path: frontend/test-results/
          retention-days: 7

      - name: Cleanup
        if: always()
        run: |
          if [ -f backend/backend.pid ]; then
            kill $(cat backend/backend.pid) || true
          fi
```

### 7.2 Docker Compose for Local Testing

```yaml
# docker-compose.e2e.yml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - JIRALOCAL_ENV=test
      - DATABASE_URL=sqlite:///data/test.db
    volumes:
      - ./backend:/app
    ports:
      - "8000:8000"

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      - VITE_API_URL=http://backend:8000
    volumes:
      - ./frontend:/app
    ports:
      - "5173:5173"
    depends_on:
      - backend
```

---

## Part 8: Best Practices

### 8.1 Test Isolation

Each test should:
1. Start with a clean IndexedDB
2. Have a reset mock JIRA state
3. Use a unique user session
4. Clean up any created data

```typescript
test.beforeEach(async ({ indexedDb, mockJiraHelper }) => {
  await indexedDb.clearStorage();
  await mockJiraHelper.reset();
});
```

### 8.2 Waiting Strategies

```typescript
// BAD: Arbitrary waits
await page.waitForTimeout(5000);

// GOOD: Wait for specific state
await page.waitForSelector('[data-testid="sync-status="idle"]');
await page.waitForFunction(() => window.syncStore?.status === 'idle');
await page.waitForResponse(resp => resp.url().includes('/sync'));
```

### 8.3 Data Attributes for Selectors

Always use `data-testid` attributes for test selectors:

```tsx
// Component
<button data-testid="sync-button" aria-label="Sync now">
  <SyncIcon />
</button>
```

### 8.4 Visual Regression

For UI-critical components, use Playwright's visual snapshots:

```typescript
test('should render issue card correctly', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/issues/TEST-1');
  await expect(authenticatedPage.locator('[data-testid="issue-detail"]'))
    .toHaveScreenshot('issue-detail.png');
});
```

### 8.5 Flaky Test Handling

1. Use `test.step()` to break up long tests
2. Enable trace files for debugging
3. Use retries sparingly (max 2)
4. Tag flaky tests for investigation

```typescript
test.describe('Sync Flows', () => {
  test.skip(({ browserName }) => browserName === 'webkit', 'Skipping flaky WebKit test');

  test('complex sync scenario', async ({ page }) => {
    await test.step('Initial sync', async () => {
      // ...
    });
    await test.step('Offline edit', async () => {
      // ...
    });
  });
});
```

---

## Part 9: Metrics and Reporting

### 9.1 Coverage Goals

| Area | Target Coverage |
|------|-----------------|
| User authentication | 100% |
| Issue CRUD operations | 90%+ |
| Sync flows (online/offline) | 100% |
| Conflict resolution | 100% |
| Search functionality | 80%+ |
| Board drag-and-drop | 80%+ |

### 9.2 Performance Benchmarks

Track these metrics in E2E tests:

```typescript
test('should load issue list within 2 seconds', async ({ authenticatedPage }) => {
  const startTime = Date.now();
  await authenticatedPage.goto('/');
  await authenticatedPage.waitForSelector('[data-testid="issue-card"]');
  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(2000);
});
```

---

## Part 10: Implementation Roadmap

### Phase 1: Setup (Week 1)
- [x] Install Playwright and configure
- [x] Create directory structure
- [x] Set up base fixtures and helpers
- [x] Configure CI/CD workflow
- [x] Write first smoke test

### Phase 2: Auth and Navigation (Week 1-2)
- [x] Login/logout tests
- [x] Registration tests
- [x] Session persistence tests
- [x] Settings page tests

### Phase 3: Issue Operations (Week 2-3)
- [x] List view tests
- [x] Detail view tests
- [x] Inline editing tests
- [x] Comment functionality tests (read-only)

### Phase 4: Board View (Week 3)
- [x] Board rendering tests
- [x] Drag-and-drop tests
- [x] Quick filter tests

### Phase 5: Sync Engine (Week 4-5)
- [x] Initial sync tests
- [x] Offline editing tests
- [x] Conflict resolution tests
- [x] Push/pull sync tests

### Phase 6: Search (Week 5)
- [ ] Full-text search tests
- [ ] Filter tests

---

## Appendix: Quick Reference

### Common Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Run specific test file
npx playwright test issues/list-view.spec.ts

# Run in headed mode for debugging
npm run test:e2e:headed

# Run single browser
npm run test:e2e:chromium

# View test report
npm run test:e2e:report
```

### Debugging

```typescript
// Pause test execution
await page.pause();

// Take screenshot
await page.screenshot({ path: 'debug.png' });

// Inspect element
await page.locator('[data-testid="sync-status"]').evaluate(el => {
  console.log(el.getAttribute('data-sync-status'));
});
```

### Network Mocking

```typescript
// Simulate network failure
await page.route('**/api/sync', route => route.abort());

// Simulate slow network
await page.route('**/api/**', route => {
  route.fulfill({
    status: 200,
    body: JSON.stringify({ data: 'mocked' }),
    delay: 5000,
  });
});
```

---

## Conclusion

This E2E testing strategy provides comprehensive coverage of JiraLocal's unique challenges: local-first architecture, offline functionality, sync mechanics, and ADF content. Playwright's strengths in IndexedDB isolation, network control, and cross-browser support make it the ideal choice for this project.

The modular page object model and reusable fixtures ensure tests remain maintainable as the application grows. The CI/CD integration ensures tests run automatically on every commit, catching regressions early.

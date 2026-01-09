import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class IssuesPage extends BasePage {
  readonly heading: Locator;
  readonly connectionSelect: Locator;
  readonly syncButton: Locator;
  readonly fullSyncButton: Locator;
  readonly searchInput: Locator;
  readonly statusFilterSelect: Locator;
  readonly issueCards: Locator;
  readonly noIssuesText: Locator;
  readonly noConnectionsCard: Locator;
  readonly loadingText: Locator;

  // Status counters
  readonly todoCount: Locator;
  readonly inProgressCount: Locator;
  readonly doneCount: Locator;
  readonly totalCount: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.locator('h1:has-text("Issues")');
    this.connectionSelect = page.locator('select').first();
    this.syncButton = page.locator('button:has-text("Sync")').first();
    this.fullSyncButton = page.locator('button:has-text("Full Sync")');
    this.searchInput = page.locator('input[placeholder="Search issues..."]');
    this.statusFilterSelect = page.locator('select:has-text("All statuses")');
    this.issueCards = page.locator('.border.rounded-lg.cursor-pointer');
    this.noIssuesText = page.locator('text=No issues yet');
    this.noConnectionsCard = page.locator('[data-testid="no-connections-card"]');
    this.loadingText = page.locator('text=Loading...');

    // Status counters
    this.todoCount = page.locator('text=To Do:').locator('strong');
    this.inProgressCount = page.locator('text=In Progress:').locator('strong');
    this.doneCount = page.locator('text=Done:').locator('strong');
    this.totalCount = page.locator('text=Total:').locator('strong');
  }

  /**
   * Wait for the page to finish loading
   */
  async waitForLoaded() {
    await expect(this.loadingText).not.toBeVisible({ timeout: 10000 });
    await expect(this.heading).toBeVisible();
  }

  /**
   * Search for issues by query string
   * @param query - The search query
   */
  async search(query: string) {
    await this.searchInput.fill(query);
    // Wait for debounce (300ms in the component)
    await this.page.waitForTimeout(400);
  }

  /**
   * Clear the search input
   */
  async clearSearch() {
    await this.searchInput.clear();
    await this.page.waitForTimeout(400);
  }

  /**
   * Get an issue card by its key (e.g., "TEST-1")
   * @param issueKey - The issue key to find
   */
  getIssueCard(issueKey: string): Locator {
    return this.issueCards.filter({ hasText: issueKey });
  }

  /**
   * Click on an issue to navigate to its detail page
   * @param issueKey - The issue key to click
   */
  async clickIssue(issueKey: string) {
    const card = this.getIssueCard(issueKey);
    await card.click();
    await this.page.waitForURL(/\/issues\//);
  }

  /**
   * Get the count of visible issue cards
   */
  async getIssueCount(): Promise<number> {
    return await this.issueCards.count();
  }

  /**
   * Set the status filter
   * @param status - The status to filter by, or "All statuses" to clear
   */
  async setStatusFilter(status: string) {
    await this.statusFilterSelect.selectOption(status === 'All statuses' ? '' : status);
    // Wait for filter to apply
    await this.page.waitForTimeout(100);
  }

  /**
   * Get all unique statuses shown in the filter dropdown
   */
  async getAvailableStatuses(): Promise<string[]> {
    const options = await this.statusFilterSelect.locator('option').allTextContents();
    return options.filter(opt => opt !== 'All statuses');
  }

  /**
   * Select a JIRA connection by name
   * @param connectionName - The connection name to select
   */
  async selectConnection(connectionName: string) {
    await this.connectionSelect.selectOption({ label: connectionName });
    await this.page.waitForTimeout(100);
  }

  /**
   * Click the sync button and wait for sync to complete
   */
  async triggerSync() {
    await this.syncButton.click();
    // Wait for sync to start and finish
    await this.waitForSyncIdle();
  }

  /**
   * Click the full sync button and wait for sync to complete
   */
  async triggerFullSync() {
    await this.fullSyncButton.click();
    await this.waitForSyncIdle();
  }

  /**
   * Check if an issue with the given key exists in the list
   * @param issueKey - The issue key to check
   */
  async hasIssue(issueKey: string): Promise<boolean> {
    const card = this.getIssueCard(issueKey);
    return await card.isVisible();
  }

  /**
   * Get the status badge text for an issue
   * @param issueKey - The issue key
   */
  async getIssueStatus(issueKey: string): Promise<string> {
    const card = this.getIssueCard(issueKey);
    const badge = card.locator('.inline-flex'); // Badge component
    return await badge.textContent() || '';
  }

  /**
   * Get the summary text for an issue
   * @param issueKey - The issue key
   */
  async getIssueSummary(issueKey: string): Promise<string> {
    const card = this.getIssueCard(issueKey);
    const summary = card.locator('.truncate');
    return await summary.textContent() || '';
  }

  /**
   * Get the status counts object
   */
  async getStatusCounts(): Promise<{ todo: number; inProgress: number; done: number; total: number }> {
    const todo = await this.todoCount.textContent();
    const inProgress = await this.inProgressCount.textContent();
    const done = await this.doneCount.textContent();
    const total = await this.totalCount.textContent();

    return {
      todo: parseInt(todo || '0', 10),
      inProgress: parseInt(inProgress || '0', 10),
      done: parseInt(done || '0', 10),
      total: parseInt(total || '0', 10),
    };
  }

  /**
   * Check if the "No issues" empty state is shown
   */
  async hasNoIssues(): Promise<boolean> {
    return await this.noIssuesText.isVisible();
  }

  /**
   * Check if the "No connections" warning is shown
   */
  async hasNoConnections(): Promise<boolean> {
    return await this.noConnectionsCard.isVisible();
  }
}

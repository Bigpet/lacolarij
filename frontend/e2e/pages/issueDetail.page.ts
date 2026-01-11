import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class IssueDetailPage extends BasePage {
  // Navigation
  readonly backButton: Locator;
  readonly openInJiraLink: Locator;

  // Issue identification
  readonly issueKey: Locator;
  readonly summary: Locator;
  readonly summaryInput: Locator;
  readonly summarySaveButton: Locator;
  readonly summaryCancelButton: Locator;

  // Sync status
  readonly syncStatusBadge: Locator;

  // Metadata
  readonly statusBadge: Locator;
  readonly statusSelect: Locator;
  readonly issueType: Locator;
  readonly priority: Locator;
  readonly assignee: Locator;
  readonly reporter: Locator;

  // Description
  readonly descriptionCard: Locator;
  readonly editDescriptionButton: Locator;
  readonly descriptionContent: Locator;
  readonly descriptionTextarea: Locator;
  readonly descriptionSaveButton: Locator;
  readonly descriptionCancelButton: Locator;

  // Comments
  readonly commentsCard: Locator;
  readonly commentsTitle: Locator;
  readonly commentItems: Locator;
  readonly noCommentsText: Locator;

  // Loading/Error states
  readonly issueNotFoundText: Locator;

  constructor(page: Page) {
    super(page);

    // Navigation
    this.backButton = page.locator('button:has-text("Back")');
    this.openInJiraLink = page.locator('a:has-text("Open in JIRA")');

    // Issue identification - summary heading is clickable to edit
    this.issueKey = page.locator('h1.font-mono');
    this.summary = page.locator('h2.text-2xl.font-bold');
    this.summaryInput = page.locator('input.text-xl.font-bold');
    this.summarySaveButton = page.locator('button').filter({ has: page.locator('svg.lucide-save') }).first();
    this.summaryCancelButton = page.locator('button').filter({ has: page.locator('svg.lucide-x') }).first();

    // Sync status - uses data-testid for unambiguous selection
    this.syncStatusBadge = page.locator('[data-testid="sync-status-badge"]');

    // Metadata
    this.statusBadge = page.locator('[data-testid="status-badge"]');
    this.statusSelect = page.locator('[data-testid="status-select"]');
    this.issueType = page.locator('[data-testid="issue-type"]');
    this.priority = page.locator('text=Priority:').locator('..').locator('text=Medium');
    this.assignee = page.locator('text=Assignee:').locator('..');
    this.reporter = page.locator('text=Reporter:').locator('..');

    // Description card
    this.descriptionCard = page.locator('.rounded-xl.border').filter({ hasText: 'Description' });
    this.editDescriptionButton = this.descriptionCard.locator('button:has-text("Edit")');
    this.descriptionContent = this.descriptionCard.locator('.prose, .whitespace-pre-wrap, .text-muted-foreground.italic');
    this.descriptionTextarea = this.descriptionCard.locator('textarea');
    this.descriptionSaveButton = this.descriptionCard.locator('button:has-text("Save")');
    this.descriptionCancelButton = this.descriptionCard.locator('button:has-text("Cancel")');

    // Comments card
    this.commentsCard = page.locator('.rounded-xl.border').filter({ hasText: 'Comments' });
    this.commentsTitle = this.commentsCard.locator('h3, [class*="CardTitle"]');
    this.commentItems = this.commentsCard.locator('.border-b');
    this.noCommentsText = this.commentsCard.locator('text=No comments yet');

    // Loading/Error
    this.issueNotFoundText = page.locator('text=Issue not found');
  }

  /**
   * Wait for the detail page to load
   */
  async waitForLoaded() {
    await expect(this.issueKey).toBeVisible({ timeout: 10000 });
  }

  /**
   * Go back to the issues list
   */
  async goBack() {
    await this.backButton.click();
    await this.page.waitForURL('/issues');
  }

  /**
   * Get the issue key text
   */
  async getIssueKey(): Promise<string> {
    return await this.issueKey.textContent() || '';
  }

  /**
   * Get the summary text
   */
  async getSummary(): Promise<string> {
    // Check if we're in edit mode
    if (await this.summaryInput.isVisible()) {
      return await this.summaryInput.inputValue();
    }
    return await this.summary.textContent() || '';
  }

  /**
   * Start editing the summary by clicking on it
   */
  async startEditSummary() {
    await this.summary.click();
    await expect(this.summaryInput).toBeVisible();
  }

  /**
   * Edit the summary and save with Enter key
   * @param newSummary - The new summary text
   */
  async editSummary(newSummary: string) {
    await this.startEditSummary();
    await this.summaryInput.fill(newSummary);
    await this.summaryInput.press('Enter');
    await expect(this.summaryInput).not.toBeVisible({ timeout: 5000 });
  }

  /**
   * Edit the summary and save with save button
   * @param newSummary - The new summary text
   */
  async editSummaryWithButton(newSummary: string) {
    await this.startEditSummary();
    await this.summaryInput.fill(newSummary);
    await this.summarySaveButton.click();
    await expect(this.summaryInput).not.toBeVisible({ timeout: 5000 });
  }

  /**
   * Cancel summary editing with Escape key
   */
  async cancelSummaryEditWithEscape() {
    await this.summaryInput.press('Escape');
    await expect(this.summaryInput).not.toBeVisible();
  }

  /**
   * Cancel summary editing with cancel button
   */
  async cancelSummaryEditWithButton() {
    await this.summaryCancelButton.click();
    await expect(this.summaryInput).not.toBeVisible();
  }

  /**
   * Get the sync status text
   */
  async getSyncStatus(): Promise<'Synced' | 'Pending' | 'Conflict' | null> {
    const text = await this.syncStatusBadge.textContent();
    if (text?.includes('Synced')) return 'Synced';
    if (text?.includes('Pending')) return 'Pending';
    if (text?.includes('Conflict')) return 'Conflict';
    return null;
  }

  /**
   * Start editing the description
   */
  async startEditDescription() {
    await this.editDescriptionButton.click();
    await expect(this.descriptionTextarea).toBeVisible();
  }

  /**
   * Edit the description and save
   * @param newDescription - The new description text
   */
  async editDescription(newDescription: string) {
    await this.startEditDescription();
    await this.descriptionTextarea.fill(newDescription);
    await this.descriptionSaveButton.click();
    await expect(this.descriptionTextarea).not.toBeVisible({ timeout: 5000 });
  }

  /**
   * Cancel description editing
   */
  async cancelDescriptionEdit() {
    await this.descriptionCancelButton.click();
    await expect(this.descriptionTextarea).not.toBeVisible();
  }

  /**
   * Get the description content
   */
  async getDescription(): Promise<string> {
    // If editing, get textarea value
    if (await this.descriptionTextarea.isVisible()) {
      return await this.descriptionTextarea.inputValue();
    }
    // Otherwise get the displayed content
    return await this.descriptionContent.textContent() || '';
  }

  /**
   * Change the issue status via dropdown
   * @param statusName - The name of the transition/status to select
   */
  async changeStatus(statusName: string) {
    // The status dropdown shows transitions, not current status
    await this.statusSelect.selectOption({ label: statusName });
    await this.waitForSyncIdle();
  }

  /**
   * Get the current status text
   */
  async getStatus(): Promise<string> {
    // Try the Select first - the placeholder option (value="", disabled) shows the status
    const selectLocator = this.page.locator('[data-testid="status-select"]');
    const selectCount = await selectLocator.count();

    if (selectCount > 0) {
      const selectText = await selectLocator.locator('option[value=""]').textContent();
      if (selectText) return selectText.trim();
    }

    // Fallback to Badge - wait for it to be visible first
    const badgeLocator = this.page.locator('[data-testid="status-badge"]');
    const badgeCount = await badgeLocator.count();

    if (badgeCount > 0) {
      // Wait for badge to be visible before getting text
      await badgeLocator.waitFor({ state: 'visible', timeout: 5000 });
      const badgeText = await badgeLocator.textContent();
      return badgeText?.trim() || '';
    }

    return '';
  }


  /**
   * Get the count of comments
   */
  async getCommentCount(): Promise<number> {
    // Try to extract from title like "Comments (3)"
    const title = await this.commentsTitle.textContent();
    const match = title?.match(/\((\d+)\)/);
    if (match) return parseInt(match[1], 10);

    // Otherwise count comment items
    if (await this.noCommentsText.isVisible()) return 0;
    return await this.commentItems.count();
  }

  /**
   * Check if comments are displayed
   */
  async hasComments(): Promise<boolean> {
    return !(await this.noCommentsText.isVisible());
  }

  /**
   * Get comment text by index (0-based)
   * @param index - The comment index
   */
  async getCommentText(index: number): Promise<string> {
    const comment = this.commentItems.nth(index);
    return await comment.locator('.text-sm').last().textContent() || '';
  }

  /**
   * Get comment author by index (0-based)
   * @param index - The comment index
   */
  async getCommentAuthor(index: number): Promise<string> {
    const comment = this.commentItems.nth(index);
    return await comment.locator('.font-medium').textContent() || '';
  }

  /**
   * Get the assignee text
   */
  async getAssignee(): Promise<string> {
    const text = await this.assignee.textContent();
    // Extract just the assignee name after "Assignee:"
    const match = text?.match(/Assignee:\s*(.+)/);
    return match ? match[1].trim() : 'Unassigned';
  }

  /**
   * Get the reporter text
   */
  async getReporter(): Promise<string> {
    const text = await this.reporter.textContent();
    // Extract just the reporter name after "Reporter:"
    const match = text?.match(/Reporter:\s*(.+)/);
    return match ? match[1].trim() : '';
  }

  /**
   * Check if the issue was not found
   */
  async isNotFound(): Promise<boolean> {
    return await this.issueNotFoundText.isVisible();
  }
}
